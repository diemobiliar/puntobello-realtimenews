import { IChannels2SubscriptionItem } from "../webparts/realTimeNewsFeed/models/IRedNetNewsFeed";

export function getLanguageLocale(language: string) {
  let retVal: string;
  switch (language) {
    case 'de':
      retVal = 'de-de';
      break;
    case 'fr':
      retVal = 'fr-fr';
      break;
    case 'it':
      retVal = 'it-it';
      break;
    case 'en':
      retVal = 'en-us';
      break;
    default:
      retVal = 'de-de';
  }
  return retVal;
}


export function getStringTranslation4Lang(stringName: string, locale: string) {
  const translatedString = require(`../webparts/realTimeNewsFeed/loc/${locale}.js`);
  return translatedString[stringName];
}

export function getStringTranslation(stringName: string, locale:string) {
  const translatedString = require(`../webparts/realTimeNewsFeed/loc/${locale}.js`);
  return translatedString[stringName];
}


export function getChannelText(lang: string, item: IChannels2SubscriptionItem): string {
  let retVal: string;

  switch (lang) {
    case 'de':
      item.Channel.forEach(channellang => { if (channellang.Language === 'de-DE') retVal = channellang.Text; });
      break;
    case 'fr':
      item.Channel.forEach(channellang => { if (channellang.Language === 'fr-FR') retVal = channellang.Text; });
      break;
    case 'it':
      item.Channel.forEach(channellang => { if (channellang.Language === 'it-IT') retVal = channellang.Text; });
      break;
    case 'en':
      item.Channel.forEach(channellang => { if (channellang.Language === 'en-US') retVal = channellang.Text; });
      break;
    default:
      item.Channel.forEach(channellang => { if (channellang.Language === 'de-DE') retVal = channellang.Text; });
  }
  return retVal;
}
