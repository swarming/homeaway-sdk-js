'use strict';

const { expect, assert } = require('chai').use(require('chai-json-schema-ajv'));
const moment = require('moment');
const { HsApi, IsiLink } = require('../dist');

describe('HomeAway SDK', function () {



  describe('HS API', function () {

    it('should have HSAPI Environment Variables', function () {
      assert(process.env.HSAPI_ID);
      assert(process.env.HSAPI_SECRET);
      assert(process.env.HSAPI_PMCID);
    });

    describe('.auth()', function () {

      it('should return an encodedId and set it as the Auth Token', async () => {

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

  describe('ISILink', function () {

    it('should have ISILink Environment Variables', function () {
      assert(process.env.ISILINK_USERID);
      assert(process.env.ISILINK_PASSWORD);
      assert(process.env.ISILINK_COID);
    });

    describe('.describe()', function () {

      it('should return all methods availability via the soap client', async () => {

        const isilink = new IsiLink();
        const result = await isilink.describe();
        expect(result).to.be.jsonSchema({
          title: 'ISILink Soap API Definition',
          type: 'object',
        });
      });

    });

    describe('.getChangeLogInfo()', function () {

      it('should return all the changes since specified time', async () => {

        const isilink = new IsiLink();
        const result = await isilink.getChangeLogInfo({
          minutes: 60 * 24 * 30, // 1 year
          changeLogOption: 'AVAILABILITY',
        });

        assert.isArray(result);
        result.forEach(item => {
          assert(item);
          assert(item.attributes);
          assert.isString(item.strPropId);
          assert.isString(item.strChangeLog);
          // assert.instanceOf(item.dtChangedOn, Date);
          // assert.instanceOf(item.dtStartDate, Date);
          // assert.instanceOf(item.dtEndDate, Date);
        });

      });

    });


  });

});
