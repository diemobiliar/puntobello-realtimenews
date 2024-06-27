import IChannelLanguage from "./IChannelLanguage";
import { IItem } from '@pnp/sp/items';

export interface IChannels2SubscriptionItem {
  Channel: IChannelLanguage[];
  TermGuid: string;
  Subscribed: boolean;
  Visible: boolean;
  SortOrder: number;
}

export interface IPuntoBelloTermData {
  Label: string;
  TermGuid: string;
}

export interface IChannels2SubsItem extends IItem {
  pb_Channels: IPuntoBelloTermData[];
  Id: number;
}

export interface IChannels2LocItem {
  Id: number;
  pb_Channels: any;
  pb_Locations: any;
}

