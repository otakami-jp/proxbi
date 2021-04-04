'use strict';

const CRLF = '\r\n';

const http = require('http');

class Response {
  constructor(code, message, version = 'HTTP/1.1') {
    this.code = code;
    this.message = message || http.STATUS_CODES[code];
    this.version = version;

    this.headers = [];

    this.body = '';
  };

  addHeader(name, value) {
    this.headers.push([name, value]);

    return this;
  };

  addBody(chunk) {
    this.body += chunk;
    
    return this;
  };

  toString() {
  return this.version + ' ' + this.code + ' ' + this.message + CRLF +
     this.headers.map(([name, value]) => name + ': ' + value).join(CRLF) + CRLF +
     CRLF +
     this.body;
  };
  
  toBuffer() {
    return Buffer.from(this.toString());
  };

  static deconstruct(data) {
    const prepare = data.split(CRLF + CRLF);
    // body
    let [partitions, body] = prepare;

    // head
    partitions = partitions.split(CRLF);
    const [version, code, message] = partitions.shift().split(/ +/g);
    
    // Header
    const headers = partitions || partitions.length != 0 ?
      partitions.map((line) => line.split(/:/gi).map((v) => v.trim())) :
      undefined;

    const response = new Response(code, message, version);

    headers.map(([name, value]) => {
      response.addHeader(name, value);
    });

    response.addBody(body);

    return response;
  };
};

module.exports = Response