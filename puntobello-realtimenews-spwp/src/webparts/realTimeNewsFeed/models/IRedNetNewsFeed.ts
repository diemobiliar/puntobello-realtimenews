import ILanguage from "./ILanguage";
import { IItem } from '@pnp/sp/items';

export interface IChannels2SubscriptionItem {
  Channel: ILanguage[];
  TermGuid: string;
  Subscribed: boolean;
  Mandatory: boolean;
  Visible: boolean;
  SortOrder: number;
}

export interface IRednetTermData {
  Label: string;
  TermGuid: string;
}

export interface IRedNetChannels2LocItem extends IItem {
  REDN_Channels: IRednetTermData;
  REDN_Locations: IRednetTermData[];
}

export interface IRedNetChannels2SubsItem extends IItem {
  REDN_Channels: IRednetTermData[];
  Id: number;
}

export interface IChannels2LocItem {
  Id: number;
  REDN_Channels: any;
  REDN_Locations: any;
}

