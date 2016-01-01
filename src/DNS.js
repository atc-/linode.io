'use strict';
var request = require('request');

var getOrThrow = (obj, name) => {
  if (obj) {
    return obj;
  }
  throw new Error(name + " is required");
};

var get = (url, params) => {
  return new Promise((respond, reject) => {
    request({url:url, qs:params}, function(err, response, body) {
      if(err) { reject(err); return; }
      respond(body);
    });
  });
};

var lookupIPAndUpdateDomain = (domain, subdomain) => {
  return this.getExternalIP().then((ip) => { l.findAndUpdateDomain(domain, subdomain, ip) });
};

const getExternalIP = () => {
  return get('http://' + this.lookupService).then((ipStr) => {
    return ipStr.trim()
  });
};

class DomainService {
  constructor(apiKey, options) {
    this.apiKey = getOrThrow(apiKey, "apiKey");
    this.lookupService =
      options && options.lookupServiceURL != '' && options.lookupServiceURL ? options.lookupServiceURL : 'www.icanhazip.com';
  }

  getDomains() {
    return get('https://api.linode.com/', {api_key: this.apiKey, api_action: 'domain.list'}).then(JSON.parse);
  }

  getDomain(domainId) {
    return get("https://api.linode.com/", {
      api_key: this.apiKey, api_action: 'domain.resource.list',
      DomainId: domainId
    }).then(JSON.parse).catch((err) => {
      console.error("Couldn't parse JSON from linode API: " + err.message);
      throw err;
    });
  }

  findAndUpdateDomain(domain, subdomain, ip) {
    return this.findDomain(domain)
      .then((d) => { return this.getDomain(d.DOMAINID).then((domain) => { return {domainId: d.DOMAINID, domains: domain}}) })
      .then((dom) => { return {domainId: dom.domainId, sub: dom.domains.DATA.filter((i) => { return i.NAME === subdomain })[0] } })
      .then((subDef) => { return this.updateDomain(subDef.domainId, subDef.sub.RESOURCEID, ip) });
  }

  updateDomain(domainId, resourceId, value) {
    return get('https://api.linode.com', {
      Target: value, api_key: this.apiKey, api_action: 'domain.resource.update', DomainId: domainId, ResourceId: resourceId
    }).then(JSON.parse);
  }

  findDomain(domain) {
    return this.getDomains().then((d) => { return d.DATA.filter((i) => { return i.DOMAIN === domain })[0]});
  }
}

module.exports = {
  create: (apiKey) => { return new DomainService(apiKey) },
  getExternalIP: getExternalIP
};
