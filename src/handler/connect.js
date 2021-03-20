'use strict';

const { URL } = require('url');
const net = require('net');

let i = 0;

/**
 * 
 * @param {require('http').IncomingMessage} request 
 * @param {require('stream').Duplex} clientSocket 
 * @param {Buffer} head 
 */
function connect(request, clientSocket, head, userData) {
  const { port, hostname } = new URL(request._custom ?  request.url : `http://${request.url}`);

  userData.request.url = hostname;

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
    userData.errors.push(err);
    if (err.code == 'ECONNRESET') return;
    console.error(err);
  });

  serverSocket.on('connect', () => {
    console.log('Socket connect !');
  });

  let datas = [];

  serverSocket.on('data', (chunk) => {
    datas.push(chunk.toString('utf8'));
  });
  
  serverSocket.on('lookup', (err, address, family, host) => {
    if (err) userData.errors.push(err);
    console.log(address, family, host);
  });

  serverSocket.on('timeout', () => {
    console.log('Socket timeout !');
  });

  serverSocket.on('close', () => {
    console.log(serverSocket.bytesRead);
    console.log(serverSocket.bytesWritten);
    this.emit('request', userData);
    
    i++;

 
  });
};

module.exports = connect;