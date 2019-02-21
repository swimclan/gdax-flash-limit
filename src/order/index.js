const {
  CREATED,
  READY,
  PLACED,
  CANCELLED,
  FILLED,
  PARTIAL
} = require('../constants');

/**
 * A class representing an order
 * @class
 */
class Order {
  /**
   * @constructor
   * @public
   * @memberof Order
   * @param {object} options - Options for the order
   * @param {string} options.product_id - String representing product signature
   * @param {number} options.size - Number representing the size of the order
   * @param {string} options.side - The side of the order, either 'buy' or 'sell'
   * @returns {Order} - The newly instantiated order object
   */
  constructor({
    product_id,
    size,
    side
  }) {
    this.product_id = product_id;
    this.side = side;
    this.size = size;
    this.status = CREATED;
    this.id = null;
    this.price = 0;
  }

  /**
   * An instance method for updating the status of the order
   * @instance
   * @public
   * @memberof Order
   * @param {string} status - A valid order status
   */
  setStatus(status) {
    const validStatuses = [
      CREATED,
      READY,
      PLACED,
      CANCELLED,
      FILLED,
      PARTIAL
    ];
    if (validStatuses.indexOf(status) === -1) {
      throw new TypeError('Order.setStatus(): An invalid status was passed in');
    }
    this.status = status;
  }

  /**
   * An instance method for updating the id of an order
   * @instance
   * @public
   * @memberof Order
   * @param {string} id - A valid order id from the exchange
   */
  setId(id) {
    if (!id) {
      throw new TypeError('Order.setId(): A valid id must be passed in');
    }
    this.id = id;
  }

  /**
   * An instance method for updating the id of an order
   * @instance
   * @public
   * @memberof Order
   * @param {number} price - A valid price for the limit order
   */
  setPrice(price) {
    if (!price || typeof price !== 'number') {
      throw new TypeError('Order.setPrice(): A valid price value must be supplied');
    }
    this.price = price;
  }

  /**
   * An instance method for updating the id of an order
   * @instance
   * @public
   * @memberof Order
   * @param {number} size - A valid size for the limit order
   */
  setSize(size) {
    if (size == null || typeof size !== 'number') {
      throw new TypeError('Order.setSize(): A valid size must be supplied');
    }
    this.size = size;
  }
}

module.exports = Order;