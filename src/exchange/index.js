const Orderbook = require('gdax-l2-orderbook');
const {AuthenticatedClient, WebsocketClient} = require('gdax');
const {
  GDAX_SANDBOX_WEBSOCKET_URL, 
  GDAX_PRODUCTION_WEBSOCKET_URL,
  GDAX_SANDBOX_CLIENT_URL,
  GDAX_PRODUCTION_CLIENT_URL,
  PLACED,
  REJECTED,
  CANCELLED,
  BUY,
  SELL
} = require('../constants');

/**
 * A class representing the main exchange for trading on Coinbase
 * @class
 */
class Exchange {
  /**
   * A constructor to build exchange instances
   * @constructor
   * @public
   * @memberof Exchange
   * @param {object} options - Options for constructing an exchange
   * @param {object} options.credentials - The api credentials needed for authenticated rewquests
   * @param {boolean} options.sandbox - Switch to use sandbox or production environment on Coinbase Pro 
   */
  constructor({
    credentials=null,
    sandbox=true
  }) {
    const {key, secret, passphrase} = credentials;
    this.sandbox = sandbox;
    this.executor = new AuthenticatedClient(
      key,
      secret,
      passphrase,
      sandbox ? GDAX_SANDBOX_CLIENT_URL : GDAX_PRODUCTION_CLIENT_URL
    );
    this.orderbooks = {};
    this.websocket = null;
    return this;
  }

  /**
   * A private method to initialize the websocket
   * @intsance
   * @private
   * @memberof Exchange
   * @param {object} options - An options hash
   * @param {object[]} options._handlers - An array of socket event handlers to bind on connect
   * @param {string[]} options.products - An array of product id strings
   * @returns {void}
   */
  _initSocket({products, _handlers=null}) {
    this.websocket = new WebsocketClient(
      products,
      this.sandbox ?
        GDAX_SANDBOX_WEBSOCKET_URL : GDAX_PRODUCTION_WEBSOCKET_URL,
      {
        key: this.executor.key,
        secret: this.executor.secret,
        passphrase: this.executor.passphrase
      },
      { channels: ['user'] }
    );
    if (_handlers) {
      Object.entries(_handlers).forEach(([type, handler]) => {
        if (Array.isArray(handler)) {
          handler.forEach(fn => {
            this.websocket.on(type, fn);
          });
        } else {
          this.websocket.on(type, handler);
        }
      });
    } else {
      this.websocket.on('error', (err) => {
        this.emit('error', err);
        this._resetWebsocket(products);
      });
    }
  }

  /**
   * A private method to reset the socket connection in the case of connection failure
   * @instance
   * @private
   * @memberof Exchange
   * @param {string[]} products - A list of product ids for socket initialization
   * @returns {void}
   */
  _resetWebsocket(products) {
    if (this.websocket) {
      const _handlers = { ...this.websocket._events };
      this.websocket.removeAllListeners();
      this.websocket.socket && this.websocket.socket.close();
      this.websocket = null;
      this._initSocket({_handlers, products});
    }
  }

  /**
   * Instance method to run the exchange after instantiation.  This will spin up
   * the feed and get it ready for realtime orderbook monitoring
   * @instance
   * @public
   * @memberof Exchange
   * @returns {Promise<Exchange>} - A promise to signal the successful connetion of the exchange
   */
  run() {
    return new Promise((resolve, reject) => {
      this.getProducts()
      .then((products) => {
        return products.map(product => product.id);
      })
      .catch((err) => {
        reject(err);
      })
      .then((products) => {
        this._initSocket({products});
        resolve(this);
      })
      .catch((err) => {
        reject(err);
      });
    });
  }

  /**
   * An instance method to retrieve an orderbook for a specified product
   * @instance
   * @public
   * @memberof Exchange
   * @param {string} product - The product id signature of the product orderbook to be retrieved
   * @returns {Orderbook} - The orderbook for the product id specified
   */
  getOrderbook(product) {
    if (!product || typeof product !== 'string') {
      throw new TypeError('Exchange.getOrderbook(): Invalid product id specified');
    }
    if (!this.orderbooks[product]) {
      const newOrderbook =
      new Orderbook({
        product,
        sandbox: this.sandbox
      });
      newOrderbook.start();
      this.orderbooks[product] = newOrderbook;
    }
    return this.orderbooks[product];
  }

  /**
   * Instance method that will fetch all supported products on the upstream exchange
   * @instance
   * @public
   * @memberof Exchange
   * @returns {Promise<object[]>} - A resolved promise with all the product signature strings
   */
  getProducts() {
    return new Promise((resolve, reject) => {
      this.executor.getProducts((err, res, data) => {
        if (err) {
          return reject(err);
        }
        return resolve(data);
      });
    });
  }

  /**
   * Instance method that will place an order on the exchange
   * @instance
   * @public
   * @memberof Exchange
   * @param {Order} order - A valid order object
   * @returns {Promise<Order>} - A resolved promise with the updated placed order object
   */
  placeOrder(order) {
    if (!order) {
      throw new TypeError('A valid order must be supplied');
    }
    const validSides = [BUY, SELL];
    if (validSides.indexOf(order.side) === -1) {
      throw new TypeError('Exchange.placeOrder(): A valid side must be specified on the order');
    }
    const {side, price, size, product_id} = order;
    return new Promise((resolve, reject) => {
      this.executor.placeOrder({
        side,
        price,
        size,
        product_id,
        post_only: true
      }, (err, res, data) => {
        if (err) {
          return reject(err);
        }
        order.setId(data.id);
        order.setStatus(data.status !== REJECTED ? PLACED : REJECTED);
        return resolve(order);
      })
    });
  }

  /**
   * An instance method to cancel an order on the exchange
   * @instance
   * @public
   * @memberof Exchange
   * @param {Order} order - The order to cancel on the exchange
   * @returns {Promise<Order>} - A resolved promise with the order that was cancelled
   */
  cancelOrder(order) {
    if (!order) {
      throw new TypeError('Exchange.cancelOrder(): A valid order must be passed');
    }
    const {id} = order;
    return new Promise((resolve, reject) => {
      this.executor.cancelOrder(id, (err, res, data) => {
        if (err) {
          return reject(err);
        }
        order.setStatus(CANCELLED);
        return resolve(order);
      });
    });
  }
}

module.exports = Exchange;