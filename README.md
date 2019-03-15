# GDAX Flash Limit

## Synopsis

GDAX Flash Limit is a module to manage limit orders on Coinbase (formerly known as GDAX).  The primary function of the GDAX Flash Limit module is to ensure that limit orders that it places on the exchange stay on the best bid/ask while the price fluctuates so that the order is executed as efficiently as possible.  The module uses an Order -> Broker -> Exchange execution pattern.

The user of the module instantiates an Exchange and a Broker, passes the Exchange instance to the Broker and runs the Broker and Exchange.  From there all interaction is with the Broker for order execution.  The user creates an Order instance and queues it up with the Broker.  The Broker manages the order lifecycle while its live on the exchange and tries to get it filled as quickly as possible and as close to what the market value was at the moment the order was originally sent in.  

In other words, this module attempts to get orders filled as close to market order execution as possible to help users avoid market-taker fees.                                                                  

## Code Example

Installation and instantiation is very easy to get started.  Here is a basic usage example:

```js

const {Order, Broker, Exchange} = require('gdax-flash-limit');

// Coinbase Pro (fake) API Credentials
const credentials = {
  key: '82b308v2384bv230897bv208347bv28345bv',
  secret: '802be8vy23089ybv24038vbqeuibv8429y5ybvyueqrhovy248v40734vbu103uvb938v/3v1==',
  passphrase: 'las84iuadf'
};

// Get an Exchange instance
const exchange = new Exchange({
  sandbox: false, // Will use the production Coinbase Pro exchange
  credentials
});

// Get a Broker instance, inject the exchange and listen to the lifecycle events
const broker = new Broker({ exchange });
broker.on('placed', (placedOrder) => console.log(placedOrder));
broker.on('canceled', (cancelledOrder) => console.log(cancelledOrder));
broker.on('fill', (filledOrder) => console.log(filledOrder));
broker.on('rejected', (rejectedOrder) => console.log(rejectedOrder));
broker.on('error', (error) => console.log(error));

// Create an Order
const order = new Order({
  product_id: 'ETH-USD',
  side: 'sell',
  size: 0.01
});

// Run the exchange (async) and broker then queue up the order 
(async function main() {
  await exchange.run(); // need to wait for the websockets to connect
  broker.run(); // starts broker listening for order fills
  broker.queueOrder(order); // starts the process and executes the orders
})();

/*
Order {
  product_id: 'ETH-USD',
  side: 'sell',
  size: 0.01,
  status: 'placed',
  id: '0f16077c-6af9-46d9-ad43-ca92ed90d796',
  price: 144.61 }
Order {
  product_id: 'ETH-USD',
  side: 'sell',
  size: 0.01,
  status: 'cancelled',
  id: '0f16077c-6af9-46d9-ad43-ca92ed90d796',
  price: 144.61 }
Order {
  product_id: 'ETH-USD',
  side: 'sell',
  size: 0.01,
  status: 'placed',
  id: '7a042f50-bee8-46aa-bfe6-6373dbf344b1',
  price: 144.6 }
Order {
  product_id: 'ETH-USD',
  side: 'sell',
  size: 0.01,
  status: 'cancelled',
  id: '7a042f50-bee8-46aa-bfe6-6373dbf344b1',
  price: 144.6 }
Order {
  product_id: 'ETH-USD',
  side: 'sell',
  size: 0.01,
  status: 'placed',
  id: '5e7f1c1f-9460-49ad-bb2d-2b89c49c7897',
  price: 144.55 }
Order {
  product_id: 'ETH-USD',
  side: 'sell',
  size: 0,
  status: 'filled',
  id: '80400eb0-c749-490f-bd19-26188074f60b',
  price: 144.55 }
*/
```

## Motivation

This module was created to help cryptocurrency traders execute efficient automated limit orders to avoid costly market-taker fees on Coinbase Pro.  It manages the order lifecycle for you so that you can focus entirely on implementing your quantatative trading strategies.  There are other tools out there like this but this one should be one of the easier to implement becuase it focuses soley on just limit order execution. 

## Installation

Installation into a Node project is as simple as:

```shell
npm i gdax-flash-limit --save
```

## API Reference

See code example above.

## Tests

Will be implementing a testing framework when the module reaches a high level of popularity on npm

## Contributors

Contributors are welcome to send pull requests on the project.  Please write a short synopsis of any enhancements or defect fixing is being proposed in the PR.

## License

This software is made public by way of the ISC (Internet Software Consortium).  No warranties are given and software is made available "as-is."