'use strict';

const http = require('http');
const https = require('https');
const { EventEmitter } = require('events');
const { clientOptions } = require('./../util/constant');
const os = require('os');

// Handler
const app = require('./../handler/app');
const connect = require('./../handler/connect');
const upgrade = require('./../handler/upgrade');

// Controller
const directive = require('../controllers/directive');

/**
 * @typedef ClientOptions
 * 
 * @property {string} [hostname='0.0.0.0']
 * @property {string} [proxyIP='127.0.0.1']
 * @property {number} [port=1337]
 * @property {'http' | 'https'} [protocol=http]
 * @property {any} [httpOptions=null]
 * @property {boolean} [production=false]
 * @property {boolean} [anonyme=true]
 * @property {'Basic' | 'Bearer' | 'Digest' | 'HOBA' | 'Mutual' | 'Negotiate' | 'OAuth' | 'SCRAM-SHA-1' | 'SCRAM-SHA-256' | 'vapid'} [credentialType='Basic']
 * @property {string} [realmMsg='For use proxy']
 */

class Client extends EventEmitter {
  #serverOn = false;
  /**
   * @param {ClientOptions} options 
   */
  constructor(options = clientOptions) {
    super();

    if (!options.proxyIP) {
      const ni = os.networkInterfaces();

      if (!!ni.Ethernet) {
        options.proxyIP = ni.Ethernet.find((network) => ((network.family == 'IPv4') && (!network.internal)));
        if (!!options.proxyIP) options.proxyIP = options.proxyIP.address;
      };

      if (!options.proxyIP && !!ni['Wi-Fi']) {
        options.proxyIP = ni['Wi-Fi'].find((network) => ((network.family == 'IPv4') && (!network.internal)));
        if (!!options.proxyIP) options.proxyIP = options.proxyIP.address;
      };

      if (!options.proxyIP) {
        for (const ninterface of Object.values(ni)) {
          let exit = false;
          for (const network of ninterface) {
            if (network.family != 'IPv4' || network.internal) continue;
            options.proxyIP = network.address;
            exit = true;
            break;
          };
          if (exit) break;
        };
      };
    };

    options = Object.assign(clientOptions, options);

    /**
     * @type {string}
     */
    this.hostname = options.hostname;
    /**
     * @type {string}
     */
    this.proxyIP = options.proxyIP;
    /**
     * @type {number}
     */
    this.port = options.port;
    /**
     * @type {string}
     */
    this.protocol = options.protocol;
    /**
     * @type {any}
     */
    this.httpOptions = options.httpsOptions;
    /**
     * @type {boolean}
     */
    this.production = options.production;
    /**
     * @type {boolean}
     */
    this.anonyme = options.anonyme;
    /**
     * @type {string}
     */
    this.proxyAgent = options.proxyAgent;
    /**
     * @type {string}
     */
    this.credentialType = options.credentialType;
    /**
     * @type {string}
     */
    this.realmMsg = options.realmMsg;

    /**
     * @type {http.Server || null}
     */
    this.proxy;

    /**
     * @type {boolean}
     */
    this.#serverOn = false;

    // Handler

    /**
     * @type {Function}
     */
    this.app = app;
    /**
     * @type {Function}
     */
    this.connect = connect;
    /**
     * @type {Function}
     */
    this.upgrade = upgrade;

    // View

    /**
     * @type {string}
     */
    this.baseView = './src/view';
    /**
     * @type {string}
     */
    this.viewUnauthorize = 'unauthorize.html';

    /**
     * @type {string}
     */
    this.pac = './src/lib/proxy.pac';

    /**
     * @type {Function}
     */
    this.authorize = () => true;

    /**
     * @type {Map<string, Function>}
     */
    this.middlewares = new Map();

    /**
     * @type {}
     */
  };

  /**
   * @return {Boolean}
   */
  get serverOn() {
    return this.#serverOn;
  };

  /**
   * @param {Function} _app 
   * @returns {this}
   */
  setApp(_app) {
    if (this.#serverOn) throw Error('You can not change handler after server created');

    this.app = _app;

    return this;
  };

  /**
   * @param {Function} _connect 
   * @returns {this}
   */
  setConnect(_connect) {
    if (this.#serverOn) throw Error('You can not change handler after server created');

    this.connect = _connect;

    return this;
  };

  /**
   * @param {Function} _upgrade 
   * @returns {this}
   */
  setUpgrade(_upgrade) {
    if (this.#serverOn) throw Error('You can not change handler after server created');

    this.upgrade = _upgrade;

    return this;
  };

  /**
   * @param {string} path
   * @returns {this}
   */
  setPac(path) {
    this.pac = path;

    return this;
  };

  /**
   * @param {Function}
   * @return {this}
   */
  setAuthorize(fn) {
    this.authorize = fn;

    return this;
  };

  /**
   * @param {string} name 
   * @param {Fn} fn 
   * @param {'request' | 'response'} entry
   * 
   * @return {this}
   */
  setMiddleware(name, fn, entry = 'response') {
    this.middlewares.set(name, {fn: fn.bind(this), entry});

    return this;
  };

  /**
   * @returns {this}
   */
  createProxy() {
    this.proxy = (this.protocol && this.protocol == 'https' ? https : http)
      .createServer(this.httpOptions, (...args) => directive('app').call(this, ...args));

    this.proxy.on('connect', (...args) => directive('connect').call(this, ...args));
    this.proxy.on('upgrade', (...args) => directive('upgrade').call(this, ...args));
    this.proxy.on('clientError', (err, socket) => {
      console.error('clientError', err);
      if (err.code === 'ECONNRESET' || !socket.writable) {
        return;
      }
      socket.end('HTTP/1.1 400 Bad Request\r\n' +
      'Proxy-agent: ' + this.proxyAgent + '\r\n' +
      '\r\n');
    });

    this.proxy.listen(this.port, this.hostname, 0, () => {
      this.#serverOn = true;
      this.emit('ready', this.hostname, this.proxyIP, this.port, this.protocol);
    });

    return this;
  };
};

module.exports = Client;