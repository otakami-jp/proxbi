'use strict';

const {Client} = require('../src');
const client = new Client();

client.on('ready', function() {
  const address = this.proxy.address();
  console.log('[*] (%s) %s:%s', address.family, address.address, address.port);
});

client.on('request', (data) => {
  console.log('emited');
  console.log('data', data);
});

client.createProxy();