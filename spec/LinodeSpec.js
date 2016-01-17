'use strict';

const Linode  = require('../Linode');
const Util = require('../lib/Util')

describe('Linode', () => {

  describe('#util', () => {
    it('Should return the Util class', () => {
      expect(new Linode('').util()).to.equal(Util);
    });
  });
});
