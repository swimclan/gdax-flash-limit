const {EventEmitter} = require('events');
const {
  PLACED,
  REJECTED,
  READY,
  CREATED,
  FILLED,
  MATCH
} = require('../constants');

/**
 * A class representing an exchange broker
 * @class
 * @extends EventEmitter
 */
class Broker extends EventEmitter {
  /**
   * A constructor for building broker instances
   * @constructor
   * @public
   * @memberof Broker
   * @param {object} options - Options for instantiating Broker instances
   * @param {Excahnge} options.exchange - An instance of an exchange
   */
  constructor({
    exchange
  }) {
    super();
    this.exchange = exchange;
    this.queues = {};
    this.active = false;
  }

  /**
   * A run method to start the broker
   * @instance
   * @public
   * @memberof Broker
   * @returns {void}
   */
  run() {
    !this.active && (this.active = true);
    this._dispatchFilledOrderHandler();
  }

  /**
   * An instance method to queue a new order for execution
   * @instance
   * @public
   * @memberof Broker
   * @param {Order} order - Instance of an order to place in the broker's queue for execution
   * @returns {void} - Returns nothing
   */
  queueOrder(order) {
    if (!order) {
      throw new TypeError('Broker.queueOrder(): A valid order instance must be supplied');
    }
    const {product_id} = order;
    if (!this.queues[product_id]) {
      this.queues[product_id] = new OrderQueue({order});
      const orderbook = this.exchange.getOrderbook(product_id);
      orderbook.on('change', this._generateHandler(product_id));
      orderbook.on('error', (error) => {
        const message = `gdax-flash-limit - ${typeof error === 'object' ? JSON.stringify(error) : error}`;
        this.emit('error', message);
      });
    } else {
      this.queues[product_id].add(order);
    }
  }

  /**
   * A private instance method to generate an orderbook chage event handler for a product id
   * @instance
   * @private
   * @memberof Broker
   * @param {string} product_id - A product id signature for the product being handled
   * @returns {Function} - A handler function
   */
  _generateHandler(product_id) {
    const handler = function(orderbook) {
      if (!this.active) return;
      this.queues[product_id].forEach(order => {
        const bestLimit = +orderbook[order.side === 'buy' ? 'bids' : 'asks'].value[0];
        switch(order.status) {
          case CREATED:
            order.setPrice(bestLimit);
            order.setStatus(READY);
            this.exchange.placeOrder(order)
            .then((placedOrder) => {
              placedOrder.status === PLACED && this.emit('placed', placedOrder);
              if (placedOrder.status === REJECTED) {
                this.emit('rejected', placedOrder);
                order.setStatus(CREATED);
              }
            })
            .catch((err) => {
              order.setStatus(CREATED);
              this.emit('error', err.message || err);
            });
            break;

          case PLACED:
            if (bestLimit !== order.price) {
              order.setStatus(READY);
              this.exchange.cancelOrder(order)
              .then((cancelledOrder) => {
                this.emit('cancelled', cancelledOrder) && this.emit('canceled', cancelledOrder);
                order.setPrice(bestLimit);
                return this.exchange.placeOrder(order)
              })
              .catch((err) => {
                const errorMessage = err.message || err;
                const isBadRequest = errorMessage.match(/HTTP\s400/);
                const replaceOrder = order.remaining >= +this.exchange.products[product_id].base_min_size && !isBadRequest;
                order.setStatus(replaceOrder ? PLACED : FILLED);
                this.emit('error', `Cancel failed.  Order status set to: ${order.status}.  Error message:  ${err.message || err}`);
                return null;
              })
              .then((placedOrder) => {
                if (placedOrder == null) return;
                placedOrder.status === PLACED && this.emit('placed', placedOrder);
                if (placedOrder.status === REJECTED) {
                  this.emit('rejected', placedOrder);
                  order.setStatus(CREATED);
                }
              })
              .catch((err) => {
                order.setStatus(CREATED);
                this.emit('error', err.message || err);
              });
            }
            break;
        }
      });
    }
    return handler.bind(this);
  }

  /**
   * A private instance method for handling the user order match events to check for fills
   * @instance
   * @private
   * @memberof Broker
   * @returns {void}
   */
  _dispatchFilledOrderHandler() {
    this.exchange.websocket.on('message', (message) => {
      const wasActive = this.active;
      this.active = false;
      if (message.type === MATCH) {
        const {maker_order_id, size, product_id} = message;
        if (!product_id || !this.queues[product_id]) return;
        this.queues[product_id].forEach(order => {
          if (order.id === maker_order_id) {
            const remaining = parseFloat((order.remaining - +size).toFixed(8));
            order.setStatus(remaining >= +this.exchange.products[product_id].base_min_size ? PLACED : FILLED);
            order.setRemaining(remaining);
            this.emit('fill', order);
          }
        });
      }
      this.active = wasActive;
    });

    this.exchange.websocket.on('error',
      (error) => {
        const message = `gdax-flash-limit - ${typeof error === 'object' ? JSON.stringify(error) : error}`;
        console.log(message);
        this.emit('error', message);
      }
    );
  }
}

/**
 * @class
 * A class representing an order queue
 */
class OrderQueue {
  /**
   * A constructor to build instances of the OrderQueue
   * @public
   * @memberof OrderQueue
   * @param {object} options - A hash of options for instances of OrderQueue
   * @param {Order} [options.order=null] - An optional order to construct the instance with
   * @param {Function} [options.handler=null] - A handler function for orderbook changes and order processing 
   */
  constructor({order=null, handler=null}) {
    this.orders = order ? [order] : []
    this.handler = handler;
  }

  /**
   * An instance method to add orders to the order collection
   * @instance
   * @public
   * @memberof OrderQueue
   * @param {Order} order - An order to push onto the instance orders collection 
   */
  add(order) {
    this.orders.push(order);
  }

  forEach(cb) {
    for (const order of this.orders) {
      cb(order);
    }
  }
}

module.exports = Broker;