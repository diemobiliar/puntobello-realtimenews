import ILanguageRepresentation from "../models/ILanguageRepresentation";
import { IChannels2SubscriptionItem } from "../models/INewsFeed";
import { Logger } from "./logger";

export class Utility {
  static getStringTranslation4Locale(stringName: string, locale: string): string {
    try {
      const translatedString = require(`../webparts/realTimeNewsFeed/loc/${locale}.js`);
      return translatedString[stringName];
    } catch (error) {
      try {
        const defaultString = require(`../webparts/realTimeNewsFeed/loc/default.js`);
        return defaultString[stringName];
      } catch (defaultError) {
        Logger.getInstance().error('Failed to load default language file', defaultError);
        return `Error: Missing translation file for ${locale} and default locale`;
      }
    }
  }
  
  static getChannelText(locale: ILanguageRepresentation, item: IChannels2SubscriptionItem): string {
    const channel = item.Channel.find(channellang => channellang.Language === locale.LanguageDashed);
    // Return found text, otherwise default to first language in termstore
    return channel ? channel.Text : item.Channel[0].Text;
  }  
}