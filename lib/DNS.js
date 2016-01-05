'use strict';

const Util    = require('./Util');

function getOrThrow(obj, name) {
  if (obj) {
    return obj;
  }
  throw new Error(name + " is required");
}

class DomainService {
  constructor(apiKey) {
    this.apiKey = getOrThrow(apiKey, "apiKey");
  }

  list() {
    return Util.get('https://api.linode.com/', {api_key: this.apiKey, api_action: 'domain.list'}).then(JSON.parse);
  }

  getDomain(domainId) {
    return Util.get("https://api.linode.com/", {
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
    return Util.get('https://api.linode.com', {
      Target: value, api_key: this.apiKey, api_action: 'domain.resource.update', DomainId: domainId, ResourceId: resourceId
    }).then(JSON.parse);
  }

  findDomain(domain) {
    return this.list().then((d) => { return d.DATA.filter((i) => { return i.DOMAIN === domain })[0]});
  }
}

module.exports = {
  create: (apiKey, options) => { return new DomainService(apiKey, options) },
  //getExternalIP: getExternalIP
};
