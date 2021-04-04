'use strict';

const {EventEmitter} = require('events');

class Duplex extends EventEmitter {
  constructor() {
    super();
    this.data = [];

    this.finish = false;
  };

  write(chunk) {
    if (!chunk || this.finish) return this;
    this.data.push(chunk);
    
    this.emit('data', chunk);

    return this;
  };

  readWithClear() {
    return this.data.shift();
  };

  *read() {
    for (let i = 0; i < this.data.length; i++) {
      yield this.data[i];
    };
  };

  end(cb) {
    this.finish = true;
    
    this.emit('end');

    if (cb) cb(this.data);

    return this;
  };

  drain() {
    this.data = [];

    this.emit('drain');

    return this;
  };
};

module.exports = Duplex;