import { Logger } from '../utils/logger';
import { Utility } from '../utils/utils';
import { getRootEnv } from './envConfig';

export async function processSocketEvent(data, spo, numberOfNewNewsRef, setSystemMessageVisible, processSocketAddEvent, processSocketErrorEvent) {
  if (spo.filterQuery4Socket === undefined || spo.filterQuery4Socket.length == 0) {
    return;
  }
  const eventType = Object.keys(data)[0];
  const eventId = Number(Object.values(data)[0]);

  const validItem = await spo.checkValidNewsItem(eventId);
  if (validItem) {
    switch (eventType) {
      case 'A':
        processSocketAddEvent(numberOfNewNewsRef, setSystemMessageVisible);
        break;
      case 'Z':
        processSocketErrorEvent(eventId);
        break;
    }
  }
}

export function processSocketAddEvent(numberOfNewNewsRef, setSystemMessageVisible) {
  setSystemMessageVisible(false);
  numberOfNewNewsRef.current++;
  setSystemMessageVisible(true);
}

export function processSocketErrorEvent(eventId) {
  Logger.getInstance().error("Undefined event-type has been received from socket webapp", eventId);
}

export async function getAllData(spo, newsChannelCurrentRef, myNewsGuidRef, newsChannelsRef, pageLanguage, newsCount, setLoading, newsItemsRef, stickyRef, channelsubItemIdRef) {
  setLoading(true);
  try {
    await getChannelsAndSubscriptions(spo, myNewsGuidRef, newsChannelsRef, pageLanguage, channelsubItemIdRef);
    const responsenews = await spo.getNewsItems(newsChannelCurrentRef.current, myNewsGuidRef.current, newsChannelsRef.current, pageLanguage, newsCount);
    newsItemsRef.current = responsenews.newsItemData;
    stickyRef.current = responsenews.sticky;
  } catch (error) {
    Logger.getInstance().error('RealTimeNewsFeed.tsx, getAllData', error);
    newsItemsRef.current = [];
  }
  setLoading(false);
}

export async function getChannelsAndSubscriptions(spo, myNewsGuidRef, newsChannelsRef, pageLanguage, channelsubItemIdRef) {
  const currNewsChannels = [];
  const newsChannelConfig = [];
  const allCachedChannels = await spo.getAndCacheAllChannels();
  const channels2subItem = await spo.getSubscribedChannels4CurrentUser();

  if (channels2subItem.length > 0) {
    channels2subItem[0].pb_Channels.forEach(channel => {
      const newChan = { Channel: [], TermGuid: channel.TermGuid, Subscribed: true, Visible: true, SortOrder: 0 };
      newsChannelConfig.push(newChan);
    });
    channelsubItemIdRef.current = channels2subItem[0].Id;
  } else {
    const newSubItem = await spo.addSubscribedChannels4CurrentUser();
    channelsubItemIdRef.current = newSubItem.data.ID;
  }

  currNewsChannels.push({
    Channel: [{ Language: pageLanguage.Language, Text: Utility.getStringTranslation4Locale('myNewsLabel', pageLanguage.Language) }],
    TermGuid: myNewsGuidRef.current, Subscribed: false, Visible: true, SortOrder: 0
  });

  allCachedChannels.forEach(channel => {
    if (!channel.isDeprecated) {
      const channelLanguages = channel.labels.map(label => ({ Language: label.languageTag, Text: label.name }));
      const currentNewsChannel = newsChannelConfig.find(newsChannel => newsChannel.TermGuid === channel.id);
      if (currentNewsChannel || newsChannelConfig.length == 0) {
        currNewsChannels.push({ Channel: channelLanguages, TermGuid: channel.id, Subscribed: true, Visible: true, SortOrder: 0 });
      } else {
        currNewsChannels.push({ Channel: channelLanguages, TermGuid: channel.id, Subscribed: false, Visible: true, SortOrder: 0 });
      }
    }
  });
  newsChannelsRef.current = currNewsChannels;
}

export function changeChannelSettings(spo, newsChannelsRef, item, isChecked, channelsubItemIdRef) {
  const channels = [];
  if (isChecked) {
    newsChannelsRef.current.forEach(channel => {
      if (channel.Subscribed) {
        channels.push({ termName: channel.Channel[0].Text, termGUID: channel.TermGuid });
      } else {
        if (channel.TermGuid === item.TermGuid) {
          channel.Subscribed = true;
          channels.push({ termName: channel.Channel[0].Text, termGUID: channel.TermGuid });
        }
      }
    });
  } else {
    newsChannelsRef.current.forEach(channel => {
      if (channel.Subscribed) {
        if (channel.TermGuid != item.TermGuid) {
          channels.push({ termName: channel.Channel[0].Text, termGUID: channel.TermGuid });
        } else {
          channel.Subscribed = false;
        }
      }
    });
  }
  spo.updateMultiMeta(channels, getRootEnv().config.spfxRealtimenewsListId, 'pb_Channels', channelsubItemIdRef.current).then().catch((error) => {
    Logger.getInstance().error('CHANGE_CHANNEL_SETTINGS', error);
  });
}

export async function getAvailableItems(spo, newsChannelCurrentRef, myNewsGuidRef, newsChannelsRef, pageLanguage, newsCount, newsItemsRef, stickyRef, setLoading, logger) {
  setLoading(true);
  try {
    const responsenews = await spo.getNewsItems(newsChannelCurrentRef.current, myNewsGuidRef.current, newsChannelsRef.current, pageLanguage, newsCount);
    logger.info('getNewsiItems from getAvailableItems is', responsenews);
    newsItemsRef.current = responsenews.newsItemData;
    stickyRef.current = responsenews.sticky;
  } catch (error) {
    Logger.getInstance().error('GET_NEWS_GENERIC', error);
    newsItemsRef.current = [];
  }
  setLoading(false);
}

export function getChannelDD(newsChannelsRef, myNewsGuidRef, Utility, pageLanguage) {
  const retVal = [];
  const currNewsChannels = newsChannelsRef.current;
  currNewsChannels.map((newschannel) => {
    if (newschannel.TermGuid == myNewsGuidRef.current || newschannel.Subscribed) {
      retVal.push({ key: newschannel.TermGuid, text: Utility.getChannelText(pageLanguage, newschannel) });
    }
  });
  return retVal;
}
