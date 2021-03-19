'use strict';

const _package = require('./../../package.json');

module.exports.clientOptions = {
  hostname: '0.0.0.0',
  proxyIP: '127.0.0.1',
  port: 1337,
  protocol: 'http',
  httpOptions: null,
  production: false,
  anonyme: true,
  production: process.env.NODE_ENV == 'production',
  proxyAgent: `Proxbi/${_package.version}`,
  credentialType: 'Basic',
  realmMsg: 'For use proxy',
};
