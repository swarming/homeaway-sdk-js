'use strict';

import moment = require('moment');
import request = require('request-promise');
import { RequestError, StatusCodeError } from 'request-promise/errors';

const URL = 'https://dispatch.homeaway.com/dragomanadapter/hsapi';
const VERSION = '10';
const ENDSYSTEM = 'V12';

export interface IHsApiOptions {
  id: string;
  secret: string;
  pmcid: string;
  version?: string;
  endsystem?: string;
}

export interface IAuthMethodOptions {
  id: string;
  secret: string;
}

export interface IGetUnitByIdMethodOptions {
  id: string;
}

export interface IGetUnitNonAvailabilityMethodOptions {
  startDate: Date;
  endDate: Date;
  pmcid?: string;
  id?: string;
}

export default class HsApi {

  protected authToken: string | null;
  protected id: string;
  protected secret: string;
  protected pmcid: string;
  protected req: any;

  constructor(config: IHsApiOptions | null) {

    this.authToken = null;

    if (config) {
      this.id = config.id;
      this.secret = config.secret;
      this.pmcid = config.pmcid;
    } else {
      this.id = process.env.HSAPI_ID;
      this.secret = process.env.HSAPI_SECRET;
      this.pmcid = process.env.HSAPI_PMCID;
    }

    if (!this.id) throw new Error('Missing HSAPI ID');
    if (!this.secret) throw new Error('Missing HSAPI Secret');
    if (!this.pmcid) throw new Error('Missing HSAPI PMCID');

    const version: string = (config && config.version) || process.env.HSAPI_VERSION || VERSION;
    const endsystem: string = (config && config.endsystem) || process.env.HSAPI_ENDSYSTEM || ENDSYSTEM;

    this.req = request.defaults({
      baseUrl: URL,
      auth: { bearer: () => this.authToken },
      headers: {
        'x-homeaway-hasp-api-version': version,
        'x-homeaway-hasp-api-endsystem': endsystem,
        'x-homeaway-hasp-api-pmcid': this.pmcid,
      },
      json: true,
    });
  }

  public async auth(config: IAuthMethodOptions | null) {

    if (config) {
      this.id = config.id;
      this.secret = config.secret;
    }

    if (!this.id) throw new Error('Missing HSAPI ID');
    if (!this.secret) throw new Error('Missing HSAPI Secret');

    const body = await request({
      method: 'GET',
      baseUrl: URL,
      url: '/auth/token',
      auth: {
        user: this.id,
        pass: this.secret,
      },
      json: true,
    });

    this.authToken = body.encodedId;

    return body;
  }

  protected async request(config: object) {

    try {
      return await this.req(config);
    } catch (reason) {
      // Automatically re-authenticate when authToken expires.
      if ('401' === '' + reason.statusCode) {
        await this.auth({
          id: this.id,
          secret: this.secret,
        });
        return await this.req(config);
      }
      throw reason;
    }
  }

  public async listPropertyManagementCompanies() {

    return await this.request({
      url: '/ListPmcs',
    });
  }

  public async getUnitById(config: IGetUnitByIdMethodOptions) {

    return await this.request({
      url: '/GetUnitById',
      qs: { id: config.id },
    });
  }

  public async getUnitNonAvailability(config: IGetUnitNonAvailabilityMethodOptions) {

    const { startDate, endDate, ...rest } = config;

    return await this.request({
      method: 'POST',
      url: '/GetUnitNonAvailability',
      body: {
        ...rest,
        dateRange: {
          startDate: moment(startDate).format('YYYY-MM-DD'),
          endDate: moment(endDate).format('YYYY-MM-DD'),
        },
      },
    });
  }


}
