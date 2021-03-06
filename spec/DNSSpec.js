'use strict';

const expect = require('chai').expect;
const nock = require('nock');
const DNS = require('../lib/DNS');

const VALID_RESOURCE_UPDATE_RESP =
{"ERRORARRAY": [], "DATA": {"ResourceID": 28536}, "ACTION": "domain.resource.update"};

const VALID_RESOURCE = {
  "ERRORARRAY": [],
  "ACTION": "domain.resource.list",
  "DATA": [
    {
      "PROTOCOL": "",
      "TTL_SEC": 0,
      "PRIORITY": 0,
      "TYPE": "A",
      "TARGET": "75.127.96.245",
      "WEIGHT": 0,
      "RESOURCEID": 28536,
      "PORT": 0,
      "DOMAINID": 5093,
      "NAME": "www"
    },
    {
      "PROTOCOL": "",
      "TTL_SEC": 0,
      "PRIORITY": 0,
      "TYPE": "A",
      "TARGET": "75.127.96.245",
      "WEIGHT": 0,
      "RESOURCEID": 28537,
      "PORT": 0,
      "DOMAINID": 5093,
      "NAME": "mail"
    }
  ]
};

const VALID_DOMAIN_LIST_RESP =
{
  "ERRORARRAY": [],
  "ACTION": "domain.list",
  "DATA": [
    {
      "DOMAINID": 5093,
      "DESCRIPTION": "",
      "TYPE": "master",
      "STATUS": 1,
      "SOA_EMAIL": "dns@example.com",
      "DOMAIN": "linode.com",
      "RETRY_SEC": 0,
      "MASTER_IPS": "",
      "EXPIRE_SEC": 0,
      "REFRESH_SEC": 0,
      "TTL_SEC": 0
    },
    {
      "DOMAINID": 5125,
      "DESCRIPTION": "",
      "TYPE": "slave",
      "STATUS": 1,
      "SOA_EMAIL": "",
      "DOMAIN": "nodefs.com",
      "RETRY_SEC": 0,
      "MASTER_IPS": "1.3.5.7;2.4.6.8;",
      "EXPIRE_SEC": 0,
      "REFRESH_SEC": 0,
      "TTL_SEC": 0
    }
  ]
};

require('blanket')({
  pattern: function (filename) {
    return !/node_modules/.test(filename);
  }
});

const rejectErrors = function rejectErrors(err) {
  console.error("This error handler shouldn't have been called: " + err);
  throw new Error(err);
};

describe('DNS', () => {
  describe('#Constructor', () => {
    it('Asserts mandatory parameters', () => {
      expect(() => DNS.create()).to.throw(Error, 'apiKey is required');
    });
  });

  describe('#findDomain', () => {
    it('should return a domain definition', () => {
      const lookupParams = {api_key: 'abc', api_action: 'domain.list'};
      const lookup = nock('https://api.linode.com/').get('/').query(lookupParams).reply(200, VALID_DOMAIN_LIST_RESP);

      DNS.create('abc').findDomain('linode.com').then((domain) => {
        expect(domain).to.deep.equal(VALID_DOMAIN_LIST_RESP.DATA.filter((i) => {
          return i.DOMAIN === 'linode.com'
        }));
        expect(lookup.isDone()).to.be.true;
      }).catch(rejectErrors);
    });

    it('should return an empty object when the domain is not found', () => {
      const lookupParams = {api_key: 'abc', api_action: 'domain.list'};
      const lookup = nock('https://api.linode.com/').get('/').query(lookupParams).reply(200, VALID_DOMAIN_LIST_RESP);

      DNS.create('abc').findDomain('linode.com').then((domain) => {
        expect(domain).to.be.undefined;
        expect(lookup.isDone()).to.be.true;
      }).catch(rejectErrors);
    });
  });

  describe('#getDomain', () => {
    it('should return the definition of a given domain', () => {
      const params = {api_key: 'abc', api_action: 'domain.resource.list', DomainId: '123456'};
      const scope = nock('https://api.linode.com')
        .get('/')
        .query(params).reply(200, VALID_RESOURCE);

      const resource = DNS.create('abc').getDomain('123456');
      return resource.then((resource) => {
        expect(resource).to.deep.equal(VALID_RESOURCE);
        expect(scope.isDone()).to.be.true;
      }).catch(rejectErrors);

    });
  });

  describe('#list', () => {
    it('should return a non empty list of domains', () => {
      const params = {api_key: 'abc', api_action: 'domain.list'};
      const lookup = nock('https://api.linode.com/').get('/').query(params).reply(200, VALID_DOMAIN_LIST_RESP);
      return DNS.create('abc').list().then((domainJson) => {
        expect(domainJson).to.deep.equal(VALID_DOMAIN_LIST_RESP);
        expect(lookup.isDone()).to.be.true;
      }).catch(rejectErrors)
    });
  });

  describe('#findAndUpdateSubDomain', () => {
    it('should update the host and return a successful response', () => {
      const getDomainsParams = {api_key: 'abc', api_action: 'domain.list'};
      const getDomainsScope = nock('https://api.linode.com/').get('/').query(getDomainsParams).reply(200, VALID_DOMAIN_LIST_RESP);

      const domainParam = {api_key: 'abc', api_action: 'domain.resource.list', DomainId: '5093'};
      const domainScope = nock('https://api.linode.com')
        .get('/')
        .query(domainParam).reply(200, VALID_RESOURCE);

      const updateParams = {
        api_key: 'abc',
        api_action: 'domain.resource.update',
        ResourceId: '28536',
        DomainId: '5093',
        Target: '123.123.123.123'
      };
      const updateScope = nock('https://api.linode.com')
        .get('/')
        .query(updateParams).reply(200, VALID_RESOURCE_UPDATE_RESP);

      return DNS.create('abc')
        .findAndUpdateSubDomain('linode.com', 'www', '123.123.123.123').then((update) => {
          expect(update).to.deep.equal(VALID_RESOURCE_UPDATE_RESP);
          expect(getDomainsScope.isDone()).to.be.true;
          expect(domainScope.isDone()).to.be.true;
          expect(updateScope.isDone()).to.be.true;
        });
    });
  });

  describe('#updateDomain', () => {
    it('should call the Linode API', () => {
      const params =
      {
        api_key: 'abc', api_action: 'domain.resource.update', ResourceId: '28536', DomainId: '123',
        Target: 'test.hostname'
      };

      const updateScope = nock('https://api.linode.com')
        .get('/')
        .query(params).reply(200, VALID_RESOURCE_UPDATE_RESP);

      return DNS.create('abc')
        .updateDomain('123', '28536', 'test.hostname').then((update) => {
          expect(update).to.deep.equal(VALID_RESOURCE_UPDATE_RESP);
          expect(updateScope.isDone()).to.be.true;
        });
    });
  });
});