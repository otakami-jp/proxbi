'use strict';

const fs = require('fs');
const path = require('path');
const _package = require('../../package.json');

function auth(...args) {
  const type = args.shift();

  if (type == 'app') {
    const [req, res, userData, callback] = args;

    userData.request.headers = req.headers;
    userData.request.httpVersion = req.httpVersion;
    userData.request.url = req.url;
    userData.request.method = req.method;

    if (req.headers['proxy-authorization']) {
      userData.credential.typeToken = req.headers['proxy-authorization'].split(' ')[0];
      userData.credential.rawToken = req.headers['proxy-authorization'].split(' ')[1];
      if (userData.credential.typeToken == 'Basic' && userData.credential.rawToken) {
        userData.credential.token = Buffer.from(userData.credential.rawToken, 'base64')
          .toString('utf8');
      };
    };

    const authorize = this.authorize(req, userData);

    if (!authorize && !this.anonyme) {
      res.writeHead(407, 'Proxy Authentication Required', {
          Date: new Date().toUTCString(),
          'Proxy-agent': this.proxyAgent,
          'Proxy-Authenticate': this.credentialType + ' realm="' + this.realmMsg + '"', 
      });
        
      return res.end();
    };
    return callback(req, res, userData);
};

  if (type == 'connect') {
    const [req, sock, head, userData, callback] = args;

    userData.request.headers = req.headers;
    userData.request.httpVersion = req.httpVersion;
    userData.request.url = req.url;
    userData.request.method = req.method;

    if (req.headers['proxy-authorization']) {
      userData.credential.typeToken = req.headers['proxy-authorization'].split(' ')[0];
      userData.credential.rawToken = req.headers['proxy-authorization'].split(' ')[1];
      if (userData.credential.typeToken == 'Basic' && userData.credential.rawToken) {
        userData.credential.token = Buffer.from(userData.credential.rawToken, 'base64')
          .toString('utf8');
      };
    };

    const authorize = this.authorize(req, userData);

    if (!authorize && !this.anonyme) {
      return sock.end('HTTP/1.1 407 Proxy Authentication Required\r\n' +
        'Date:' + new Date().toUTCString() + '\r\n' +
        'Proxy-agent: ' + this.proxyAgent + '\r\n' +
        'Proxy-Authenticate: ' + this.credentialType + ' realm="' + this.realmMsg + '"\r\n' +
        '\r\n');
      };

    return callback(req, sock, head, userData);
  };

  if (type == 'upgrade') {
    const [, req, sock, head, userData, callback] = args;

    userData.request.headers = req.headers;
    userData.request.httpVersion = req.httpVersion;
    userData.request.url = req.url;
    userData.request.method = req.method;
    
    if (req.headers['proxy-authorization']) {
      userData.credential.typeToken = req.headers['proxy-authorization'].split(' ')[0];
      userData.credential.rawToken = req.headers['proxy-authorization'].split(' ')[1];
      if (userData.credential.typeToken == 'Basic' && userData.credential.rawToken) {
        userData.credential.token = Buffer.from(userData.credential.rawToken, 'base64')
        .toString('utf8');
      };
    };
    
    const authorize = this.authorize(req, userData);
    
    if (!authorize && !this.anonyme) {
      return sock.end('HTTP/1.1 407 Proxy Authentication Required\r\n' +
      'Date:' + new Date().toUTCString() + '\r\n' +
      'Proxy-agent: ' + this.proxyAgent + '\r\n' +
      'Proxy-Authenticate: ' + this.credentialType + ' realm="' + this.realmMsg + '"\r\n' +
      '\r\n');
    };
    
    return callback(req, sock, head, userData);
  };
};

module.exports = auth;
