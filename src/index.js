'use strict';

module.exports = {
  // Client
  Client: require('./client/Client'),

  // Handler
  app: require('./handler/app'),
  connect: require('./handler/connect'),
  upgrade: require('./handler/upgrade'),

  package: require('./../package.json'),
};