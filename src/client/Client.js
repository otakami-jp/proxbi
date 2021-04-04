'use strict';

const { EventEmitter } = require('events');
const net = require('net');

// Structure
const Request = require('./../structures/Request');
const Response = require('./../structures/Response');
const Duplex = require('./../structures/Duplex');

class Client extends EventEmitter {
  constructor() {
    super();

    this.controller = new AbortController();
  };
  createProxy() {
    this.proxy = new net.createServer({allowHalfOpen: false, pauseOnConnect: false}, (socket) => {
      const userData = {
          url: 'none',
          status: 'Receiving necessery data',
          method: 'none',
          hasError: false,
          request: {
            protocol: 'none',
            header: [],
            get finalHeader() {
              const base = this.header.shift();
              base.concat(this.header);
              return base;
            },
            bytesRead: 0,
            bytesWritten: 0,
            data: [],
            errors: [],
          },
          response: {
            protocol: 'none',
            header: [],
            get finalHeader() {
              const base = this.header.shift();
              base.concat(this.header);
              return base;
            },
            responseCode: {
              code: 'n/a',
              message: 'none',
            },
            bytesRead: 0,
            bytesWritten: 0,
            data: [],
            errors: [],
          },
          logs: [],
          set addLog(log) {
            this.logs.push(`[${new Date()}] ${log}`);
          },
      };

      userData.addLog = 'Client connected !';
      
      const duplexServer = new Duplex();

      socket.on('error', (err) => {
        userData.addLog = `Client error (${err.message})`;
        userData.request.errors.push(err);
      });

      socket.on('close', (hadError) => {
        userData.addLog = 'Socket close with error?: ' + hadError;
        
        userData.hadError = hadError;

        userData.request.bytesRead = socket.bytesRead;
        userData.request.bytesWritten = socket.bytesWritten;

        this.emit('request', userData);
      });

      let client;

      socket.once('data', (chunk) => {
        const firstContentr = Request.deconstruct(chunk.toString('utf8'));

        userData.url = firstContentr.path;
        userData.method = firstContentr.method;
        userData.request.protocol = firstContentr.version;
        userData.request.header = firstContentr.headers;

        duplexServer.on('data', (_chunk) => userData.request.data.push(_chunk));

        duplexServer.write(chunk);

       let once = false;
       socket.on('data', (_chunk) => once ? duplexServer.write(chunk) : once = !once);

        const {port, hostname} = new URL(firstContentr.path);

        client = net.createConnection({
          port: port || 80,
          host: hostname,
        }, async (err, _socket) => {
          if (err) {
            userData.response.errors.push(err);
            return client.end();
          };
          userData.addLog = 'Connected to server !';

          userData.status = 'Exchanging data';

          do {
            const data = duplexServer.readWithClear();
            if (data) client.write(data);
            else await new Promise((resolve) => setTimeout(resolve, 250));
          } while (!duplexServer.finish && (duplexServer.data.length > 0));

          client.end();
        });

        client.once('data', (_chunk) => {
          const firstContents = Response.deconstruct(_chunk.toString('utf8'));

          userData.response.protocol = firstContents.version;
          userData.response.header = firstContents.headers;
          userData.response.responseCode.code = firstContents.code;
          userData.response.responseCode.message = firstContents.message;

          socket.write(_chunk);
          userData.response.data.push(_chunk);

          let once = false;
          client.on('data', (__chunk) => once ? socket.write(__chunk) : once = !once);
        });

        client.on('drain', () => {
          userData.response.data = [];
          userData.addLog = 'Data response drained !';
          userData.request.errors.push(new Error('Data drained'));
        });

        client.on('timeout', () => {
          userData.addLog = 'Client time out';
          client.end();
        });

        client.on('end', () => {
          userData.addLog = 'Disconnected from server !';
          duplexServer.end();
          socket.end();

          userData.response.bytesRead = client.bytesRead;
          userData.response.bytesWritten = client.bytesWritten;
        });

        client.unref();
      });

      socket.on('drain', () => {
          userData.request.data = [];
          userData.addLog = 'Data request drained !';
          userData.request.errors.push(new Error('Data drained'));
      });

      socket.on('timeout', () => {
        userData.addLog = 'Socket time out !';
        if (client) client.end();

        userData.response.errors.push(new Error('Socket request timeout'));
      });

      socket.on('end', () => {
        //console.log('Client disconnected !');
        if (client) client.end();
      });
    });

    this.proxy.ref();
    
    this.proxy.on('error', (err) => {
      throw err;
    });

    this.proxy.once('close', () => {
      console.log('Server closed');      
      
      this.proxy = this.createNet();
    });

    this.proxy.once('listening', () => {
      this.emit('ready');
    });

    this.proxy.listen({
      port: 8124,
      host: '0.0.0.0',
      backlog: 511,
      signal: this.controller.signal,
    }, () => {
      console.log('Server bound');
    });
  };
};

module.exports = Client;