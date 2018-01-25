'use strict';

const request = require('request-promise');
const { StatusCodeError, RequestError } = require('request-promise/errors');

const URL = 'https://dispatch.homeaway.com/dragomanadapter/hsapi';
const VERSION = '10';
const ENDSYSTEM = 'V12';

class HsApi {

  constructor(config = {}) {

    this.jwt = null;
    this.id = config.id || process.env.HSAPI_ID;
    this.secret = config.secret || process.env.HSAPI_SECRET;
    this.coid = config.coid || process.env.HOMEAWAY_COID;

    const version = config.version || process.env.HSAPI_VERSION || VERSION;
    const endsystem = config.endsystem || process.env.HSAPI_ENDSYSTEM || ENDSYSTEM;

    this.req = request.defaults({
      baseUrl: URL,
      auth: { bearer: () => this.jwt },
      headers: {
        'x-homeaway-hasp-api-version': version,
        'x-homeaway-hasp-api-endsystem': endsystem,
      },
      json: true,
    });
  }

  /**
   * Authenticate the Client
   *
   * @async
   * @function auth
   * @param {object} config - object containing the id & secret
   * @return {Promise<object>} - response body
   */
  async auth(config = {}) {

    config.id && (this.id = config.id);
    config.secret && (this.secret = config.secret);

    const body = await request({
      method: 'GET',
      baseUrl: URL,
      url: '/auth/token',
      auth: {
        user: this.id,
        secret: this.secret,
      },
      json: true,
    });

    this.jwt = body.encodedId;

    return body;
  }

  async request(config) {
    try {
      return await this.req(config);
    } catch (reason) {
      // Automatically re-authenticate when JWT expires.
      if ('401' === '' + reason.statusCode) {
        await this.auth();
        return await this.req(config);
      }
      throw reason;
    }
  }

  async listPropertyManagementCompanies() {
    return await this.request({
      url: '/ListPmcs',
    });
  }


}

exports = module.exports = HsApi;