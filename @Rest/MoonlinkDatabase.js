'use strict'
const fs = require('fs')
const path = require('path')
class MoonlinkDB {
  data = {};
  constructor() { 
  this.fetch()
  }
  set(key, value) {
    this.fetch();
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
    this.save();
    return this.get(keys[0])
  }

  get(key) {
    this.fetch()
    const data = key.split('.').reduce((acc, curr) => acc?.[curr], this.data);
    this.save();
    return data
  }
  push(key, value) {
    this.fetch();
    const oldArray = this.get(key) ?? [];
    if (!(Array.isArray(oldArray)) && oldArray !== undefined) throw new TypeError('The value of the provided key must be an array');
    oldArray.push(value);
    this.set(key, oldArray);
    this.save();
    return this.get(key.split('.')[0]);
  }

  delete(key) {
    this.fetch()
    const data = this.get(key)
    key.split('.').reduce((o, curr, i, arr) => {
      if (i === arr.length - 1) delete o?.[curr];
      else return o?.[curr];
    }, this.data);
    this.save();
  }
  fetch() {
    try {
      let dateTemp = JSON.parse(fs.readFileSync(__dirname + '/database.json'), 'utf8')

      if (!dateTemp) this.data = {};
      this.data = dateTemp
    } catch (err) {
      if (err.code == 'ENOENT') this.data = {};
    }
  }
  save() {
    try {
      fs.writeFileSync(__dirname + '/database.json', JSON.stringify(this.data, null, 2));
      this.fetch();
    } catch (e) {
      console.log(e)
    }
  }

}
module.exports = MoonlinkDB;