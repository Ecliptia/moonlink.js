'use strict'
const fs = require('fs')
const path = require('path')
class MoonlinkDB {
  data = {};
  constructor() {
  }
  set(key, value) {

    const keys = key.split('.')
    const obj = (data, key_s) => {
      if (key_s.length === 1) data[key_s[0]] = value
      else {
        if (typeof data[key_s[0]] !== 'object') data[key_s[0]] = {};

        data[key_s[0]] = { ...data[key_s[0]] };
        obj(data[key_s[0]], key_s.slice(1))
      }
    }
    obj(this.data, keys)

    return this.get(keys[0])
  }

  get(key) {
    const data = key.split('.').reduce((acc, curr) => acc?.[curr], this.data);
    return data
  }
  push(key, value) {
    const oldArray = this.get(key) ?? [];
    if (!(Array.isArray(oldArray)) && oldArray !== undefined) throw new TypeError('The value of the provided key must be an array');
    oldArray.push(value);
    this.set(key, oldArray);
    return this.get(key.split('.')[0]);
  }

  delete(key) {
    const data = this.get(key)
    key.split('.').reduce((o, curr, i, arr) => {
      if (i === arr.length - 1) delete o?.[curr];
      else return o?.[curr];
    }, this.data);
  }
}
module.exports = MoonlinkDB;