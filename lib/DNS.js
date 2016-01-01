'use strict';

const request = require('request');

function getOrThrow(obj, name) {
  if (obj) {
    return obj;
  }
  throw new Error(name + " is required");
}

function get(url, params) {
  return new Promise((respond, reject) => {
    request({url:url, qs:params}, function(err, response, body) {
      if(err) { reject(err); return; }
      respond(body);
    });
  });
}

function updateWithExternalIP(domain, subdomain) => {
  return this.getExternalIP().then((ip) => { l.findAndUpdateSubDomain(domain, subdomain, ip) });
}

const getExternalIP = (lookupService) => {
  lookupService =
    lookupService != '' && lookupService ? lookupService : 'www.icanhazip.com';
  return get('http://' + lookupService).then((ipStr) => {
    return ipStr.trim()
  });
};

class DomainService {
  constructor(apiKey) {
    this.apiKey = getOrThrow(apiKey, "apiKey");
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

  findAndUpdateSubDomain(domain, subDomain, ip) {
    return this.findDomain(domain)
      .then((d) => { return this.getDomain(d.DOMAINID).then((domain) => { return {domainId: d.DOMAINID, domains: domain}}) })
      .then((dom) => { return {domainId: dom.domainId, sub: dom.domains.DATA.filter((i) => { return i.NAME === subDomain })[0] } })
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
  create: (apiKey, options) => { return new DomainService(apiKey, options) },
  getExternalIP: getExternalIP
};
