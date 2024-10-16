import { IChannels2SubscriptionItem, ILanguageRepresentation } from "../models";
import { Logger } from "./logger";

export class Utility {
  
  /**
   * Retrieves a translated string for the specified locale.
   * 
   * @param {string} stringName - The name of the string to be translated.
   * @param {string} locale - The locale to use for the translation (e.g., 'en-US', 'de-DE').
   * @returns {string} The translated string, or an error message if the translation file is missing.
   * 
   * @remarks
   * This method first attempts to load the translation file corresponding to the provided locale.
   * If the file is not found, it attempts to load a default language file.
   * If both files are missing, an error is logged, and a fallback error message is returned.
   */
  static getStringTranslation4Locale(stringName: string, locale: string): string {
    try {
      const translatedString = require(`../loc/${locale}.js`);
      return translatedString[stringName];
    } catch (error) {
      try {
        const defaultString = require(`../loc/default.js`);
        return defaultString[stringName];
      } catch (defaultError) {
        Logger.getInstance().error('Failed to load default language file', defaultError);
        return `Error: Missing translation file for ${locale} and default locale`;
      }
    }
  }
  
  /**
   * Retrieves the appropriate channel text for a given locale from a subscription item.
   * 
   * @param {ILanguageRepresentation} locale - The language representation object containing the language information.
   * @param {IChannels2SubscriptionItem} item - The subscription item containing channel information.
   * @returns {string} The channel text corresponding to the specified locale. If the text for the locale is not found,
   * it returns the text in the first language available in the termstore.
   * 
   * @remarks
   * This method searches for the channel text that matches the provided locale. If no match is found, 
   * it defaults to the first available language in the termstore for that channel.
   */
  static getChannelText(locale: ILanguageRepresentation, item: IChannels2SubscriptionItem): string {
    const channel = item.Channel.find(channellang => channellang.Language === locale.LanguageDashed);
    // Return found text, otherwise default to first language in termstore
    return channel ? channel.Text : item.Channel[0].Text;
  }  
}
