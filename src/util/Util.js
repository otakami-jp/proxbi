'use strict';

class Util {
  static generateUuid() {
    const schema = [8, 4, 4, 4, 12];
    const values = '0123456789abcdefABCDEF';
    return schema.map((i) => {
      let id = '';
      for (let _i = 0; _i < i; _i++) id += values[Math.floor(Math.random() * values.length)];
      return id;
    }).join('-');
  };
};

module.exports = Util;