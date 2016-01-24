'use strict';

const Util = require('../lib/Util');
const expect = require('chai').expect;
const nock = require('nock');
const validator = require('validator');

describe('Util', () => {

  describe('#real', () => {
    it('Returns true when object is truthy', () => {
      expect(Util.isReal(1)).to.be.true;
      expect(Util.isReal('')).to.be.true;
      expect(Util.isReal(true)).to.be.true;
      expect(Util.isReal({})).to.be.true;
      expect(Util.isReal({a: 'a'}.a)).to.be.true;
    });
  });

  describe('#getExternalIP', () => {
    it('Returns my external IP in a promise', () => {

      const scope = nock('http://www.icanhazip.com').get('/').reply(200, '123.123.123.123');

      return Util.getExternalIP().then((extIP) => {
        expect(validator.isIP(extIP)).to.be.true;
        expect(extIP).to.equal('123.123.123.123');
        expect(scope.isDone()).to.be.true;
      });
    });

    it('Invokes reject when the lookup fails', () => {
      return Util.getExternalIP('127.0.0.1:1234').then((extIP) => {
        console.error("This success handler shouldn't have been called");
        throw new Error("This success handler should not have been called:" + extIP);
      }).catch((err) => {
        expect(err.message).to.equal('connect ECONNREFUSED 127.0.0.1:1234');
      });
    });
  });
});
