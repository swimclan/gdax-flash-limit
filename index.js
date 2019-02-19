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

new Exchange({
  sandbox: false,
  credentials
})
.run()
.then((exchange) => {
  exchange.websocket.on('message', (message) => console.log(message.type));
  exchange.websocket.on('error', (error) => console.log(error));
});


