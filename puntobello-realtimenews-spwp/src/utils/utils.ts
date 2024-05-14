import { IChannels2SubscriptionItem } from "../models/INewsFeed";

export class Utility {

  private static getTenantName(urlString: string): string {
    const url = new URL(urlString);
    const hostname = url.hostname; // Gets 'tenantname.sharepoint.com'
    return hostname.split('.')[0]; // Splits the hostname and takes the first part
  }

  static getPBConfigUrl(relative: boolean): string {
    if (relative) {
      return "/sites/pb_config";
    } else {
      return this.getTenantName(window.location.href) + ".sharepoint.com/sites/pb_config";
    }
  }

  static getRealTimeNewsUrl(): string {
    return "/Lists/pb_realtime_news";
  }

  static getSubscribedChannelsUrl(): string {
    return "/Lists/pb_subscribed_channels";
  }

  static getArchiveNewsUrl(): string {
    return "/sites/pb_home/SitePages/allnews.aspx";
  }

  /*
  static getStringTranslation = (language: string, stringName: string): string => {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const translatedString = require(`../loc/${language.toLowerCase().replace('_','-')}.js`);
    return translatedString[stringName];
  }*/
    
  static async getStringTranslation4Locale(stringName: string, locale: string): Promise<string> {
    try {
      const translatedString = await import(`../webparts/realTimeNewsFeed/loc/${locale}.js`);
      return translatedString[stringName];
    } catch (error) {
      try {
        const defaultString = await import(`../webparts/realTimeNewsFeed/loc/default.js`);
        return defaultString[stringName];
      } catch (defaultError) {
        console.error('Failed to load default language file', defaultError);
        return `Error: Missing translation file for ${locale} and default locale`;
      }
    }
  }
  
  static getChannelText(locale: string, item: IChannels2SubscriptionItem): string | undefined {
    const channel = item.Channel.find(channellang => channellang.Language === locale);
    return channel ? channel.Text : undefined;
  }
  
}