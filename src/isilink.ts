'use strict';

import soap = require('soap');

const URL = 'https://secure.instantsoftwareonline.com/StayUSA/ChannelPartners/wsWeblinkPlusAPI.asmx?wsdl';

export interface IIsiLinkOptions {
  userid: string;
  password: string;
  coid: string;
}

export enum ChangeLogOption {
  All = 'ALL',
  Availability = 'AVAILABILITY',
  Pricing = 'PRICING',
  Property = 'PROPERTY',
  Review = 'REVIEW',
}

export interface IGetChangeLogInfoArgs {
  minutes: number;
  changeLogOption?: ChangeLogOption;
}

export interface IChangeLogInfo {
  strPropId: string;
  dtChangedOn: string;
  dtStartDate: string;
  dtEndDate: string;
  strChangeLog: string;
}

export interface IGetPropertyAvailabilityInfoArgs {
  id: string; // property id
}

export interface IGetReservationChangeLogArgs {
  id: string; // property id
  minutes: number;
}

export interface IGetPropertyDescArgs {
  id: string; // property id
}


export default class IsiLink {

  protected $client: Promise<soap.Client>;
  protected userid: string;
  protected password: string;
  protected coid: string;

  constructor(config: IIsiLinkOptions | null) {

    if (config) {
      this.userid = config.userid;
      this.password = config.password;
      this.coid = config.coid;
    } else {
      this.userid = process.env.ISILINK_USERID;
      this.password = process.env.ISILINK_PASSWORD;
      this.coid = process.env.ISILINK_COID;
    }

    if (!this.userid) throw new Error('Missing ISILink UserId');
    if (!this.password) throw new Error('Missing ISILink Password');
    if (!this.coid) throw new Error('Missing ISILink COID');

    // @ts-ignore
    this.$client = soap.createClientAsync(URL);
  }

  public async describe() {
    const client = await this.$client;
    return client.describe();
  }

  public async getChangeLogInfo(args: IGetChangeLogInfoArgs): Promise<IChangeLogInfo[]> {

    const client = await this.$client;
    // @ts-ignore
    const result = await client.getChangeLogInfoAsync({
      strCOID: this.coid,
      strCoId: this.coid,
      strUserId: this.userid,
      strPassword: this.password,
      intMinutes: args.minutes,
      strChangeLogOption: args.changeLogOption || ChangeLogOption.All,
    });

    return get(result, 'getChangeLogInfoResult.anyType', []);
  }

  public async getPropertyAvailabilityInfo(args: IGetPropertyAvailabilityInfoArgs) {

    const client = await this.$client;
    // @ts-ignore
    const result = await client.getPropertyAvailabilityInfoAsync({
      strCOID: this.coid,
      strUserId: this.userid,
      strPassword: this.password,
      strPropID: args.id,
    });

    return get(result, 'getPropertyAvailabilityInfoResult.clsNonAvailDates', []);
  }

  public async getReservationChangeLog(args: IGetReservationChangeLogArgs) {

    const client = await this.$client;
    // @ts-ignore
    const result = await client.getReservationChangeLogAsync({
      strCOID: this.coid,
      strUserId: this.userid,
      strPassword: this.password,
      strPropID: args.id,
      intMinutes: args.minutes,
      strOptions: 'ALL',
      intMaxRows: 500,
    });

    return get(result, 'getReservationChangeLogResult.clsResChangeLogInfo', []);
  }

  public async getPropertyDesc(args: IGetPropertyDescArgs) {

    const client = await this.$client;
    // @ts-ignore
    const result = await client.getPropertyDescAsync({
      strCOID: this.coid,
      strUserId: this.userid,
      strPassword: this.password,
      strPropId: args.id,
      blnSendNonAvail: false,
    });

    return get(result, 'getPropertyDescResult.clsProperty[0]');
  }

  public async getPropertyIndexes() {

    const client = await this.$client;
    // @ts-ignore
    const result = await client.getPropertyIndexesAsync({
      strCOID: this.coid,
      strUserId: this.userid,
      strPassword: this.password,
    });

    return get(result, 'getPropertyIndexesResult.clsPropIndex');
  }


}

// ----------------
// Helper Functions

function get(obj: object, path: string, def?: any) {

  const fullPath = path
    .replace(/\[/g, '.')
    .replace(/]/g, '')
    .split('.')
    .filter(Boolean);

  // @ts-ignore
  return fullPath.every((step: string) => (!(step && (obj = obj[step]) === undefined)))
    ? obj
    : def;

}
