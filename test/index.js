'use strict';

const { expect, assert } = require('chai').use(require('chai-json-schema-ajv'));
const { HsApi, IsiLink } = require('../dist');

const PROPERTY_ID = 'Meadowlark'; // @NOTE: from DV12 test account.

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

    describe('.getUnitById()', function () {

      it('should return a unit by id', async () => {

        const hs = new HsApi();
        const response = await hs.getUnitById({
          id: PROPERTY_ID,
        });
        // console.log(response);
        expect(response).to.be.jsonSchema({
          title: 'Unit Details',
          type: 'object',
          properties: {
            '$id': { type: ['string', 'number'] },
            unitName: { type: 'string' },
            unitCode: { type: 'string' },
            address: { type: 'object' },
            bedrooms: { type: 'number' },
            bathrooms: { type: 'number' },
            sleeps: { type: 'number' },
            featureGroups: { type: 'array' },
            unitType: { type: 'object' },
            phones: { type: 'array' },
            additionalProperties: { type: 'array' },
            isActive: { type: 'boolean' },
            pmcid: { type: 'string' },
            // ... and a bunch of others.
          },
        });

      });

    });

    describe.skip('.getUnitNonAvailability()', function () {

      it('should return a date range', async () => {

        const hs = new HsApi();
        const response = await hs.getUnitNonAvailability({
          startDate: new Date('2018-01-01'),
          endDate: new Date('2018-06-01'),
        });
        console.log(response);
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
        // console.log(result);
      });

    });

    describe('.getChangeLogInfo()', function () {

      it('should return all the changes since specified time', async () => {

        const isilink = new IsiLink();
        const result = await isilink.getChangeLogInfo({
          minutes: 60 * 24 * 30, // 1 month
          changeLogOption: 'ALL',
        });

        // console.log('.getChangeLogInfo() => ', result);

        assert.isArray(result);
        result.forEach(item => {
          assert(item);
          assert(item.attributes);
          assert.isString(item.strPropId);
          assert.isString(item.strChangeLog);
          assert.instanceOf(item.dtChangedOn, Date);
          assert.instanceOf(item.dtStartdate, Date); // @NOTE: lowercase "d"
          assert.instanceOf(item.dtEndDate, Date); // @NOTE: uppercase "D"
        });

      });

    });

    describe('.getPropertyAvailabilityInfo()', function () {

      it('should return the property availability info', async () => {

        const isilink = new IsiLink();
        const result = await isilink.getPropertyAvailabilityInfo({
          id: PROPERTY_ID,
        });
        // console.log('.getPropertyAvailabilityInfo() => ', result);
        assert.isArray(result);
        result.forEach(item => {
          assert(item);
          assert.instanceOf(item.dtFromDate, Date);
          assert.instanceOf(item.dtToDate, Date);
          assert.isString(item.strStayType);
          assert.isNumber(item.intQuoteNum);
        });

      });

    });

    describe('.getReservationChangeLog()', function () {

      it('should return reservation changes', async () => {

        const isilink = new IsiLink();
        const result = await isilink.getReservationChangeLog({
          id: PROPERTY_ID,
          minutes: 60 * 24 * 30, // 1 month
        });

        // console.log('.getReservationChangeLog() => ', result);

      });

    });

    describe('.getPropertyDesc()', function () {
      this.timeout(9000);

      it('should return property description with non-availability info', async () => {

        const isilink = new IsiLink();
        const result = await isilink.getPropertyDesc({
          id: PROPERTY_ID,
        });

        // console.log('.getPropertyDesc() => ', result);

      });

    });

  });

});
