'use strict';

const request = require('request');

class Util {
  static getExternalIP(lookupService) {
    lookupService = lookupService != '' && lookupService ? lookupService : 'www.icanhazip.com';
    return Util.get('http://' + lookupService).then((ipStr) => {
      return ipStr.trim()
    });
  }

  static get(url, params) {
    return new Promise((respond, reject) => {
      request({url: url, qs: params}, (err, response, body) => {
        if (err) {
          reject(err);
          return;
        }
        respond(body);
      });
    });
  }

  static isReal(o) {
    return o && o !== "null" && o !== "undefined";
  }

  static updateWithExternalIP(domain, subdomain) {
    return this.getExternalIP().then((ip) => {
      l.findAndUpdateSubDomain(domain, subdomain, ip)
    });
  }
}

module.exports = Util;