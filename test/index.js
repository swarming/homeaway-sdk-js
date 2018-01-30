'use strict';

const { expect, assert } = require('chai').use(require('chai-json-schema-ajv'));
const moment = require('moment');
const { HsApi, IsiLink } = require('../dist');

describe('HomeAway SDK', function () {

  it('should have environment variables', function () {
    assert(process.env.HSAPI_ID);
    assert(process.env.HSAPI_SECRET);
    assert(process.env.ISILINK_USERID);
    assert(process.env.ISILINK_PASSWORD);
    assert(process.env.HOMEAWAY_COID || process.env.HOMEAWAY_PMCID);
  });

  describe('HS API', function () {

    describe('.auth', function () {

      it('should return with 200 and set the JWT', async () => {

        const hs = new HsApi();
        await hs.auth();
        assert(hs.authToken);

      });

    });

    describe('.listPropertyManagementCompanies()', function () {

      it('should return a list of property management companies', async () => {

        const hs = new HsApi();
        const response = await hs.listPropertyManagementCompanies();
        expect(response).to.be.jsonSchema({
          title: 'List Property Management Companies',
          type: 'array',
          items: {
            type: 'object',
            properties: {
              '$id': { type: 'string' },
              'endSystem': { type: 'string' },
              'pmcid': { type: 'string' },
              'name': { type: 'string' },
              'address': { type: 'object' },
              'email': { type: 'object' },
              'logoURL': { type: 'string' },
              'phone': { type: 'object' },
              'url': { type: 'string' },
            },
          },
          required: ['$id', 'pmcid', 'name'],
        });

      });

    });

    describe.skip('.getUnitById()', function () {

      it('should return a unit by id', async () => {

        const hs = new HsApi();
        const response = await hs.getUnitById({ id: '1' });
        console.log(response);

      });

    });

    describe.skip('.getUnitNonAvailability()', function () {

      it('should return a date range', async () => {

        const hs = new HsApi();
        const response = await hs.getUnitNonAvailability({
          startDate: new Date('2018-01-01'),
          endDate: new Date('2018-06-01'),
        });
        expect(response).to.be.jsonSchema({
          title: 'Unit Non-Availability',
          type: 'array',
        });

      });

    });


  });

});
