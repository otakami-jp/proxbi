'use strict';

const { URL } = require('url');
const net = require('net');

/**
 * 
 * @param {require('http').IncomingMessage} request 
 * @param {require('stream').Duplex} clientSocket 
 * @param {Buffer} head 
 */
function connect(request, clientSocket, head, userData) {
  const { port, hostname } = new URL(request._custom ?  request.url : `http://${request.url}`);

  const serverSocket = net.connect(port || 80, hostname, () => {
    clientSocket.write('HTTP/1.1 200 Connection Established\r\n' +
      'Proxy-agent: ' + this.proxyAgent + '\r\n' +
      '\r\n'
      );

    serverSocket.write(head);
    serverSocket.pipe(clientSocket);
    clientSocket.pipe(serverSocket);
  });

  serverSocket.on('error', (err) => {
    if (err.code == 'ECONNRESET') return;
    console.error(err);
  });

  serverSocket.on('close', () => {
    this.emit('request', userData);
  });
};

module.exports = connect;