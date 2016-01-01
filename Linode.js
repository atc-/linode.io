const DNS = require('./lib/DNS');

class Linode {
  constructor(apiKey) {
    this.apiKey = apiKey;
  }

  dns () {
    return DNS.create(apiKey);
  }
}

module.exports = Linode;