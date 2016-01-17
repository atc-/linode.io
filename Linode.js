'use strict';

const DNS = require('./lib/DNS');
const Util = require('./lib/Util');

class Linode {
  constructor(apiKey) {
    this.apiKey = apiKey;
  }

  dns () {
    return DNS.create(this.apiKey);
  }

  util () {
    return Util;
  }
}

module.exports = Linode;
