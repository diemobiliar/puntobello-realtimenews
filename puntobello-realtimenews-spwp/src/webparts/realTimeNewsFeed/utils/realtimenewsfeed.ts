import { Logger, Utility, getRootEnv } from '../utils';

/**
 * Processes a socket event by determining its type and validating the associated news item.
 * Based on the event type, it calls the appropriate handler to update the UI or log an error.
 * Currently it only processes Add (A).
 *
 * @param {object} data - The data received from the socket event, where the key represents the event type and the value is the event ID.
 * @param {object} spo - The SharePoint service instance for interacting with the backend.
 * @param {React.MutableRefObject<number>} numberOfNewNewsRef - A ref that keeps track of the number of new news items.
 * @param {Function} setSystemMessageVisible - Function to set the visibility of the system message.
 * @param {Function} processSocketAddEvent - Function to handle the addition of a new news item.
 * @param {Function} processSocketErrorEvent - Function to handle errors from the socket event.
 *
 * @returns {Promise<void>}
 */
export async function processSocketEvent(data, spo, numberOfNewNewsRef, setSystemMessageVisible, processSocketAddEvent, processSocketErrorEvent) {
  if (spo.filterQuery4Socket === undefined || spo.filterQuery4Socket.length == 0) {
    return;
  }
  // Extract the event type and ID from the data object
  // The event id is the id of the list item in the news list
  const eventType = Object.keys(data)[0];
  const eventId = Number(Object.values(data)[0]);

  // Check if the news item is valid / existing
  const validItem = await spo.checkValidNewsItem(eventId);
  if (validItem) {
    switch (eventType) {
      case 'A':
        processSocketAddEvent(numberOfNewNewsRef, setSystemMessageVisible);
        break;
      default:
        processSocketErrorEvent(eventId);
        break;
    }
  }
}

/**
* Handles the addition of a new news item by updating the count of new news items
* and setting the system message to be visible.
*
* @param {React.MutableRefObject<number>} numberOfNewNewsRef - A ref that keeps track of the number of new news items.
* @param {Function} setSystemMessageVisible - Function to set the visibility of the system message.
*/
export function processSocketAddEvent(numberOfNewNewsRef, setSystemMessageVisible) {
  setSystemMessageVisible(false);
  // Increase the number of new news items which are not yet displayed and shown in the system message
  numberOfNewNewsRef.current++;
  setSystemMessageVisible(true);
}

/**
* Logs an error when an undefined event type is received from the socket.
*
* @param {number} eventId - The ID of the event that triggered the error.
*/
export function processSocketErrorEvent(eventId) {
  Logger.getInstance().error("Undefined event-type has been received from socket webapp", eventId);
}

/**
* Fetches all necessary data for the news feed, including channels, subscriptions, and news items.
* Updates various refs and sets the loading state accordingly.
*
* @param {object} spo - The SharePoint service instance for interacting with the backend.
* @param {React.MutableRefObject<string>} newsChannelCurrentRef - Ref holding the current news channel GUID.
* @param {React.MutableRefObject<string>} myNewsGuidRef - Ref holding the GUID of the user's news channel.
* @param {React.MutableRefObject<Array>} newsChannelsRef - Ref holding the array of news channels.
* @param {object} pageLanguage - The language representation object for the current page.
* @param {number} newsCount - The number of news items to fetch.
* @param {Function} setLoading - Function to set the loading state.
* @param {React.MutableRefObject<Array>} newsItemsRef - Ref holding the array of news items.
* @param {React.MutableRefObject<boolean>} stickyRef - Ref indicating whether there is a sticky news item.
* @param {React.MutableRefObject<number>} channelsubItemIdRef - Ref holding the item ID of the channel subscription.
*
* @returns {Promise<void>}
*/
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

/**
* Retrieves all channels and subscriptions for the current user, then updates the relevant refs with this data.
*
* @param {object} spo - The SharePoint service instance for interacting with the backend.
* @param {React.MutableRefObject<string>} myNewsGuidRef - Ref holding the GUID of the user's news channel.
* @param {React.MutableRefObject<Array>} newsChannelsRef - Ref holding the array of news channels.
* @param {object} pageLanguage - The language representation object for the current page.
* @param {React.MutableRefObject<number>} channelsubItemIdRef - Ref holding the item ID of the channel subscription.
*
* @returns {Promise<void>}
*/
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
    // Set the id of the channel subscription item for the current user
    channelsubItemIdRef.current = channels2subItem[0].Id;
  } else {
    // The user has no subscriptions yet, so we create a new subscription item
    const newSubItem = await spo.addSubscribedChannels4CurrentUser();
    // and save this id in the ref
    channelsubItemIdRef.current = newSubItem.data.ID;
  }

  // The myNews channel is always available and visible, it shows all news for the channels subscribed by the user
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
  // Update the ref with all available channels
  newsChannelsRef.current = currNewsChannels;
}

/**
* Updates the channel settings based on user interaction with the channel subscription interface.
* It modifies the current state of channels (subscribed/unsubscribed) and updates this information in SharePoint.
*
* @param {object} spo - The SharePoint service instance for interacting with the backend.
* @param {React.MutableRefObject<Array>} newsChannelsRef - Ref holding the array of news channels.
* @param {object} item - The news channel item being modified.
* @param {boolean} isChecked - Whether the channel is now checked (subscribed) or unchecked (unsubscribed).
* @param {React.MutableRefObject<number>} channelsubItemIdRef - Ref holding the item ID of the channel subscription.
*/
export function changeChannelSettings(spo, newsChannelsRef, item, isChecked, channelsubItemIdRef) {
  const channels = [];
  // Recreate the channel settings based on the user's interaction
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
  // Update the channel settings for the current user
  spo.updateMultiMeta(channels, getRootEnv().config.spfxSubscribedChannelsListTitle, 'pb_Channels', channelsubItemIdRef.current).then().catch((error) => {
    Logger.getInstance().error('CHANGE_CHANNEL_SETTINGS', error);
  });
}

/**
* Fetches available news items based on the current channel selection and updates the component's state.
*
* @param {object} spo - The SharePoint service instance for interacting with the backend.
* @param {React.MutableRefObject<string>} newsChannelCurrentRef - Ref holding the current news channel GUID.
* @param {React.MutableRefObject<string>} myNewsGuidRef - Ref holding the GUID of the user's news channel.
* @param {React.MutableRefObject<Array>} newsChannelsRef - Ref holding the array of news channels.
* @param {object} pageLanguage - The language representation object for the current page.
* @param {number} newsCount - The number of news items to fetch.
* @param {React.MutableRefObject<Array>} newsItemsRef - Ref holding the array of news items.
* @param {React.MutableRefObject<boolean>} stickyRef - Ref indicating whether there is a sticky news item.
* @param {Function} setLoading - Function to set the loading state.
* @param {object} logger - Logger instance for logging information and errors.
*
* @returns {Promise<void>}
*/
export async function getAvailableItems(spo, newsChannelCurrentRef, myNewsGuidRef, newsChannelsRef, pageLanguage, newsCount, newsItemsRef, stickyRef, setLoading, logger) {
  setLoading(true);
  try {
    const responsenews = await spo.getNewsItems(newsChannelCurrentRef.current, myNewsGuidRef.current, newsChannelsRef.current, pageLanguage, newsCount);
    logger.info('getNewsiItems from getAvailableItems is', responsenews);
    newsItemsRef.current = responsenews.newsItemData;
    stickyRef.current = responsenews.sticky;
  } catch (error) {
    logger.getInstance().error('GET_NEWS_GENERIC', error);
    newsItemsRef.current = [];
  }
  setLoading(false);
}

/**
* Generates the dropdown options for selecting a news channel, based on the user's current subscriptions.
*
* @param {React.MutableRefObject<Array>} newsChannelsRef - Ref holding the array of news channels.
* @param {React.MutableRefObject<string>} myNewsGuidRef - Ref holding the GUID of the user's news channel.
* @param {object} pageLanguage - The language representation object for the current page.
*
* @returns {Array} An array of dropdown options for selecting a news channel.
*/
export function getChannelDD(newsChannelsRef, myNewsGuidRef, pageLanguage) {
  const retVal = [];
  const currNewsChannels = newsChannelsRef.current;
  currNewsChannels.map((newschannel) => {
    if (newschannel.TermGuid == myNewsGuidRef.current || newschannel.Subscribed) {
      retVal.push({ key: newschannel.TermGuid, text: Utility.getChannelText(pageLanguage, newschannel) });
    }
  });
  return retVal;
}

