'use strict';

const http = require('http');
const https = require('https');
const { URL } = require('url');

/**
 * @async
 * @param {require('http').IncomingMessage} request 
 * @param {require('http').ServerResponse} response 
 */
async function app(request, response, userData) {
  const data = [];

  request.on('data', (chunk) => {
    data.push(chunk)
  });
  
  request.on('end', async () => {
    userData.request.status.code = request.statusCode;
    userData.request.status.message = request.statusMessage;
    userData.request.dataLength = 0;
    if (data.map((v) => v.length).length > 0) {
      userData.request.dataLength = data.map((v) => v.length).reduce((a, b) => a + b);
    };

    const { protocol, hostname, port, pathname: path } = new URL(request.url);
  
    const options = { hostname, port, path, method: request.method, headers: request.headers};
    
    let __req;

    const req = (protocol == 'https' ? https : http).request(options, (res) => {
      const _data = [];

      res.on('data', (chunk) => {
        _data.push(chunk);
        userData.response.dataLength += chunk.length;
        response.write(chunk);
      });

      
      res.on('end', async () => {
        Object.assign(req, __req);
        for (const [, middleware] of this.middlewares) {
          if (middleware.entry == 'request') {
            middleware.fn(req, response, data, userData);
          };
        };
        response.end();
        this.emit('request', userData);
      });
    });
  
    req.on('error', (e) => {
      console.error(`problem with request: ${e.message}`);
    });

    req.on('response', (_req) => {
      __req = _req;
      userData.response.headers = _req.headers;
      userData.response.status.code = _req.statusCode;
      userData.response.status.message = _req.statusMessage;
      userData.response.httpVersion = _req.httpVersion;
      userData.response.url = _req.url;
      userData.response.method = _req.method;

      for (const [key, value] of Object.entries(_req.headers)) {
        response.setHeader(key, value);
      };
    });

    for (const chunk of data) {
      req.write(chunk);
    };

    for (const [, middleware] of this.middlewares) {
      if (middleware.entry.includes('response')) {
        await new Promise((next) => middleware.fn(req, response, next, userData));
      };
    };

    req.end();
  });
};

module.exports = app;