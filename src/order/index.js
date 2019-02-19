const {
  CREATED,
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
   * @memberof Order
   * @param {object} options - Options for the order
   * @param {string} options.product - String representing product signature
   * @param {number} options.size - Number representing the size of the order
   * @returns {Order} - The newly instantiated order object
   */
  constructor({
    product,
    size
  }) {
    this.product = product;
    this.size = size;
    this.status = CREATED;
    this.id = null;
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
   * @memberof
   * @param {string} id - A valid order id from the exchange
   */
  setId(id) {
    if (!id) {
      throw new TypeError('Order.setId(): A valid id must be passed in');
    }
  }
}

module.exports = Order;