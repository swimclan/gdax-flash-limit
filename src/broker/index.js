const {
  PLACED,
  READY,
  CANCELLED,
  PARTIAL,
  CREATED,
  FILLED
} = require('../constants');

/**
 * A class representing an exchange broker
 * @class
 */
class Broker {
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
    this.exchange = exchange;
    this.queues = {};
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
      this.exchange.getOrderbook(product_id)
        .on('change', this._generateHandler(product_id));
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
      this.queues[product_id].forEach(order => {
        const bestLimit = +orderbook[order.side === 'buy' ? 'bids' : 'asks'].value[0];
        switch(order.status) {
          case CREATED:
            order.setPrice(bestLimit);
            order.setStatus(READY);
            this.exchange.placeOrder(order)
            .then((placedOrder) => {
              console.log(placedOrder);
              order.setId(placedOrder.id);
              order.setStatus(placedOrder.status);
            })
            .catch((err) => {
              console.log(err);
            });
            break;

          case PLACED:
            if (bestLimit !== order.price) {
              this.exchange.cancelOrder(order)
              .then((cancelledOrder) => {
                order.setStatus(cancelledOrder.status);
                order.setPrice(bestLimit);
                return this.exchange.placeOrder(order)
              })
              .catch((err) => {
                console.log(err);
              })
              .then((placedOrder) => {
                order.setId(placedOrder.id);
                order.setStatus(placedOrder.status);
              })
              .catch((err) => {
                console.log(err);
              });
            }
            break;

          case CANCELLED:
            order.setPrice(bestLimit);
            this.exchange.placeOrder(order)
            .then((placedOrder) => {
              order.setId(placedOrder.id);
              order.setStatus(placedOrder.status);
            })
            .catch((err) => {
              console.log(err);
            });
            break;

          case PARTIAL:
            break;

          case FILLED:
            break;
        }
      });
    }
    return handler.bind(this);
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