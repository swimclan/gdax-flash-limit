// Matt's account (Sandbox)
// const credentials = {
//   key: 'd835bed0b0ad7a6c0bf1ac86960c3d35',
//   secret: 'nSnnfAsX4pFmjU1UwMGjn9sHoQf1Rp59maoX7YpdGnXF2NXS2XuRe418TMfjiMexDdVReHMJILwj0wRQaf/yTg==',
//   passphrase: 'qgoe83jsw47'
// };

//Matt's Account (Prod)
const credentials = {
  key: '78cb17aed5b80f90e5c7375604d0a0fe',
  secret: 'r83EYg2KAmmQuClEdcwhb1xyjZ3KfHalnmK9GEALknFxHqiGOrdzfE2IcUo8ITrAIwU0kUJxIepL/rCe1X0P+w==',
  passphrase: 'shdc0n0m6v'
};

const Exchange = require('./src/exchange');
const Broker = require('./src/broker');
const Order = require('./src/order');

const order1 = new Order({
  product_id: 'ETH-USD',
  side: 'sell',
  size: 0.01
});

const order2 = new Order({
  product_id: 'ETH-USD',
  side: 'buy',
  size: 0.01
});

const exchange = new Exchange({
  sandbox: false,
  credentials
});

const broker = new Broker({ exchange });
broker.on('placed', (placedOrder) => console.log(placedOrder));
broker.on('cancelled', (cancelledOrder) => console.log(cancelledOrder));
broker.on('fill', (filledOrder) => console.log(filledOrder));
broker.on('error', (error) => console.log(error));

async function main() {
  await exchange.run(); // need to wait for the websockets to connect
  broker.run(); // starts broker listening for order fills
  broker.queueOrder(order1);
  broker.queueOrder(order2);
}

main();



