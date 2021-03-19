'use strict';

const Util = require('./../util/Util');
const authentificator = require('./authentificator');
const fs = require('fs');
const path = require('path');

function directive(type) {
  const userData = {
    uuid: Util.generateUuid(),
    timestamp: new Date(),
    credential: {
      token: null,
      typeToken: null,
      rawToken: null,
    },
    request: {
      headers: null,
      dataLength: 0,
      status: {
        code: null,
        message: null,
      },
      httpVersion: null,
      url: null,
      method: null,
    },
    response: {
      headers: null,
      dataLength: 0,
      status: {
        code: null,
        message: null,
      },
      httpVersion: null,
      url: null,
      method: null,
    },
    error: [],
    custom: {},
    type,
  };


  if (type == 'app') {
    return function (request, response) {
      response.setHeader('Proxy-agent', this.proxyAgent);
    
      if (request.url == '/proxy.pac') {
        return fs.readFile(path.resolve(this.pac), {encoding: 'utf8'}, (err, data) => {
          if (err) throw err;
    
          const know = [
            ['PROXYIP', this.proxyIP],
            ['PORT', this.port],
          ];
    
          for (const [key, value] of know) {
            data = data.replace(new RegExp(`{{${key}}}`, 'g'), value);
          };
    
          response.writeHead(200, { 'Content-Type': 'application/x-ns-proxy-autoconfig' });
    
          response.write(data);
          response.end();
        });
      };
    
      if (request.url.startsWith('/')) return response.end('OK');

      return authentificator.call(
        this,
        type,
        request,
        response,
        userData,
        (...args) => this.app.call(this, ...args),
      );
    };
  } else if (type == 'connect') {
    return function (request, socket, head) {
      socket.on('error', (err) => {
        if (err.code == 'ECONNRESET') return;
        if (err.code == 'ECONNABORTED') return;

        console.error(err);
        userData.error.push(err);
      });

      return authentificator.call(
        this,
        type,
        request,
        socket,
        head,
        userData,
        (...args) => this.connect.call(this, ...args),
      );
    };
  } else if (type == 'upgrade') {
    return function (request, socket, head) {
      socket.on('error', (err) => {
        if (err.code == 'ECONNRESET') return;
        if (err.code == 'ECONNABORTED') return;

        console.error(err);
        userData.error.push(err);
      });

      return authentificator.call(
        this,
        type,
        request,
        socket,
        head,
        userData,
        (...args) => this.upgrade.call(this, ...args),
      );
    };
  };
};

module.exports = directive;
