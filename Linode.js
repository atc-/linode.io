'use strict';

const DNS = require('./lib/DNS');

class Linode {
  constructor(apiKey) {
    this.apiKey = apiKey;
  }

  dns () {
    return DNS.create(this.apiKey);
  }
}

module.exports = Linode;
