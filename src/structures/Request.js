'use strict';

const CRLF = '\r\n';

class Request {
  constructor(path, method = 'GET', version = 'HTTP/1.1') {
    this.path = path;
    this.method = method;
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
  return this.method + ' ' + this.path + ' ' + this.version + CRLF +
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
    const [method, url, version] = partitions.shift().split(/ +/g);
    
    // Header
    const headers = partitions || partitions.length != 0 ?
      partitions.map((line) => line.split(/:/gi).map((v) => v.trim())) :
      undefined;

    const request = new Request(url, method, version);

    headers.map(([name, value]) => {
      request.addHeader(name, value);
    });

    request.addBody(body);

    return request;
  };
};

module.exports = Request;