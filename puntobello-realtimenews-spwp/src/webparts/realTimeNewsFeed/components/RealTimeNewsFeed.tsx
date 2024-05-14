import { useContext, useRef, useState, useEffect } from 'react';
import * as React from 'react';

import { Spinner, IDropdownOption, Stack, IStackTokens } from '@fluentui/react';

import "@pnp/sp/webs";
import "@pnp/sp/site-users/web";
import "@pnp/sp/lists";
import "@pnp/sp/items";
import "@pnp/sp/profiles";
import "@pnp/sp/taxonomy";
import { IOrderedTermInfo } from "@pnp/sp/taxonomy";
import { IItemAddResult } from '@pnp/sp/items';

import io from 'socket.io-client';
import * as __ from 'lodash';

import styles from '../RealTimeNewsFeed.module.scss';
import IRealTimeNewsFeedWP from '../../../models/IRealTimeNewsFeedWP';
import { IChannels2SubscriptionItem, IChannels2SubsItem } from '../../../models/INewsFeed';
import ILanguage from '../../../models/ILanguage';
import INewsItemData from '../../../models/INewsItemData';
import { CommandBarNewsFeed } from './CommandBarNewsFeed';
import { StickyItem } from './StickyItem';
import { ChannelSettings } from './ChannelSettings';
import { NewsItem } from './NewsItem';
import { SystemMessage } from './SystemMessage';
import { getEditedDate, getSystemMessageTitle } from '../../../utils/ui';
import { Utility } from '../../../utils/utils';
import { Logger } from '../../../utils/logger';
import { AppContext, AppContextProps } from '../../../common/AppContext';
//#endregion

const stackTokens: IStackTokens = { childrenGap: 14 };

export function RealTimeNewsFeed(props: IRealTimeNewsFeedWP) {
  const context = useContext<AppContextProps | undefined>(AppContext);
  const logger = Logger.getInstance();
  // Refs
  const contextRef = useRef<AppContextProps | undefined>(context);
  const myNewsGuidRef = useRef("00000000-0000-0000-0000-000000000000");
  const newsChannelCurrentRef = useRef(myNewsGuidRef.current);
  const newsChannelsRef = useRef<IChannels2SubscriptionItem[]>();
  const channelsubItemIdRef = useRef<number>();
  const stickyRef = useRef(false);
  const newsItemsRef = useRef<INewsItemData[]>([]);
  const filterQuery4SocketRef = useRef<string>('');
  const numberOfNewNewsRef = useRef<number>(0);

  // State
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [systemMessageVisible, setSystemMessageVisible] = useState(false);

  async function processSocketEvent(data) {
    // Safeguard if we get in the situation when the webpart is loading and an event has been received
    if (filterQuery4SocketRef.current === undefined || filterQuery4SocketRef.current.length == 0) {
      return;
    }
    const eventType = Object.keys(data)[0];
    const eventId: number = Number(Object.values(data)[0]);

    const validItem = await contextRef.current.spo.checkValidNewsItem(eventId);
    if (validItem) {
      switch (eventType) {
        case 'A':
          processSocketAddEvent(eventId);
          break;
        case 'Z':
          processSocketErrorEvent(eventId);
          break;
      }
    }
  }

  function processSocketAddEvent(id: number) {
    setSystemMessageVisible(false);
    numberOfNewNewsRef.current++;
    setSystemMessageVisible(true);
  }

  function processSocketErrorEvent(id: number) {
    logger.error("Undefined event-type has been received from socket webapp", id)
  }

  function getAllData() {
    setLoading(true);
    // Read news channel subscriptions
    getChannelsAndSubscriptions()
      .then(() => {
        // Now get the news items, which are based on the channels subscription for the user
        contextRef.current.spo.getNewsItems(newsChannelCurrentRef.current, myNewsGuidRef.current, newsChannelsRef.current, contextRef.current.pageLanguage, props.newsCount)
          .then((responsenews) => {
            newsItemsRef.current = responsenews.newsItemData;
            stickyRef.current = responsenews.sticky;
          }).catch((error) => {
            logger.error('RealTimeNewsFeed.tsx, getAllData', error);
            newsItemsRef.current = [];
            setLoading(false);
          });
      }).catch((error) => {
        logger.error('RealTimeNewsFeed.tsx, getChannelsAndSubscription', error);
        newsItemsRef.current = [];
        setLoading(false);
      });
  }

  //Ensure Channel subscription for the current user
  async function getChannelsAndSubscriptions() {
    // First we look if we have some data in the channel2sub list
    const currNewsChannels: IChannels2SubscriptionItem[] = [];
    const newsChannelConfig: IChannels2SubscriptionItem[] = [];

    // Process all channels from termstore
    const allCachedChannels: IOrderedTermInfo[] = await contextRef.current.spo.getAndCacheAllChannels();

    // Get subscribed channels for current user
    const channels2subItem: IChannels2SubsItem[] = await contextRef.current.spo.getSubscribedChannels4CurrentUser();

    if (channels2subItem.length > 0) {
      channels2subItem[0].pb_Channels.forEach(channel => {
        const newChan: IChannels2SubscriptionItem = { Channel: [], TermGuid: channel.TermGuid, Subscribed: true, Visible: true, SortOrder: 0 };
        newsChannelConfig.push(newChan);
      });
      channelsubItemIdRef.current = channels2subItem[0].Id;
    } else {
      // We do not have any subscribed channels, create default subscription item
      const newSubItem: IItemAddResult = await contextRef.current.spo.addSubscribedChannels4CurrentUser();
      channelsubItemIdRef.current = newSubItem.data.ID;
    }

    // Push default "my news" aka all my channels
    contextRef.current.pageLanguage
    currNewsChannels.push({
      Channel: [{ Language: contextRef.current.pageLanguage, Text: await Utility.getStringTranslation4Locale('myNewsLabel', contextRef.current.pageLanguage) }],
      TermGuid: myNewsGuidRef.current, Subscribed: false, Visible: true, SortOrder: 0
    });

    allCachedChannels.forEach(channel => {
      if (!channel.isDeprecated) {
        const channelLanguages: ILanguage[] = channel.labels.map((label): ILanguage => {
          return { Language: label.languageTag, Text: label.name };
        });
        const currentNewsChannel: IChannels2SubscriptionItem = newsChannelConfig.find(newsChannel => newsChannel.TermGuid === channel.id);
        if (currentNewsChannel) {
          currNewsChannels.push({ Channel: channelLanguages, TermGuid: channel.id, Subscribed: true, Visible: true, SortOrder: 0 });
        } else {
          currNewsChannels.push({ Channel: channelLanguages, TermGuid: channel.id, Subscribed: false, Visible: true, SortOrder: 0 });
        }
      }
    });
    newsChannelsRef.current = currNewsChannels;
  }

  // This method refresh the ui when a notification about an update has been shown
  // or when channels have been updated
  function getAvailableItems() {
    setSystemMessageVisible(false);
    setLoading(true);
    contextRef.current.spo.getNewsItems(newsChannelCurrentRef.current, myNewsGuidRef.current, newsChannelsRef.current, contextRef.current.pageLanguage, props.newsCount)
      .then((responsenews) => {
        newsItemsRef.current = responsenews.newsItemData;
        stickyRef.current = responsenews.sticky;
        setLoading(false);
      }).catch((error) => {
        logger.error('GET_NEWS_GENERIC', error);
        newsItemsRef.current = [];
        setLoading(false);
      });
  }

  function changeChannelSettings(item: IChannels2SubscriptionItem, ev: React.FormEvent<HTMLElement>, isChecked: boolean) {
    const channels: any[] = [];
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
    contextRef.current.spo.updateMultiMeta(channels, 'pb_subscribed_channels', 'pb_Channels', channelsubItemIdRef.current).then().catch((error) => {
      logger.error('CHANGE_CHANNEL_SETTINGS', error);
    });
  }

  function updateNews() {
    numberOfNewNewsRef.current = 0;
    // Fetch data
    getAvailableItems();
  }

  function channelChange(ddKey) {
    // Set news channel 
    newsChannelCurrentRef.current = ddKey;
    // Fetch data
    getAvailableItems();
  }

  function showChannelSettings() {
    setModalVisible(true);
  }

  function hideChannelSettings() {
    getAvailableItems();
    setModalVisible(false);
  }

  function getChannelDD(): IDropdownOption[] {
    const retVal: IDropdownOption[] = [];
    const currNewsChannels = newsChannelsRef.current;

    currNewsChannels.map((newschannel) => {
      if (newschannel.TermGuid == myNewsGuidRef.current || newschannel.Subscribed) {
        retVal.push({ key: newschannel.TermGuid, text: Utility.getChannelText(contextRef.current.pageLanguage, newschannel) });
      }
    });
    return retVal;
  }

  useEffect(() => {
    // Socket connection
    const socket = io(process.env.SPFX_SOCKET_URL, { transports: ["websocket"], timeout: 30000 });
    socket.on("connect", () => {
      logger.info('Socket Connect, SocketId:' + socket.id);
    });
    socket.on("nd", (data) => {
      processSocketEvent(data);
    });
    socket.on("disconnect", () => {
      logger.info('Socket Disconnect, SocketId:' + socket.id);
    });
    socket.on("connect_error", (socketerr) => {
      logger.warn('Socket_error SocketId' + + socket.id + 'error ' + socketerr);
    });

    getAllData();

    return () => {
      // before the component is destroyed
      // unbind all event handlers used in this component
      socket.off();
    };
  }, []);

  return (
    <>
      {loading && <Spinner label={Utility.getStringTranslation4Locale('loading', contextRef.current.pageLanguage)} />}
      {!loading &&
        <div className={styles.newsFeed} style={{ backgroundColor: contextRef.current.themeVariant.semanticColors.bodyBackground, color: contextRef.current.themeVariant.semanticColors.bodyText }}>
          {systemMessageVisible && <SystemMessage Title={getSystemMessageTitle(numberOfNewNewsRef.current, contextRef.current.pageLanguage)} buttonUpdateNewsClicked={updateNews} />}
          {stickyRef.current &&
            <div className={styles.highlightContainer}>
              <StickyItem NewsUrl={newsItemsRef.current[0].pb_NewsUrl.Url} ImageUrl={newsItemsRef.current[0].pb_ImageUrl} NewsTitle={newsItemsRef.current[0].pb_NewsTitle} PubFrom={getEditedDate(newsItemsRef.current[0].pb_PubFrom)} NewsHeader={newsItemsRef.current[0].pb_NewsHeader} metaText={getEditedDate(newsItemsRef.current[0].pb_PubFrom)} comments={_newsItems.current[0].pb_CommentsNumber} likes={newsItemsRef.current[0].pb_LikeNumber} isSticky={false} />
            </div>
          }
          {<ChannelSettings myNewsGuid={myNewsGuidRef.current} channelsubItemId={channelsubItemIdRef.current} channelsConfig={newsChannelsRef.current} locale={contextRef.current.pageLanguage} modalVisible={modalVisible} modalSettingsTitle={getStringTranslation('modalSettingsTitle', contextRef.current.pageLanguage.current)} closeModal={hideChannelSettings} changeChannelSettings={changeChannelSettings} />}
          {<CommandBarNewsFeed channelDropdown={getChannelDD()} selectedKey={newsChannelCurrentRef.current} archivLinkUrl={Utility.getArchiveNewsUrl()} channelDropdownChanged={channelChange} channelSettingsModalClicked={showChannelSettings} />}
          {newsItemsRef.current.length > 0 ?
            <Stack tokens={stackTokens} className={styles.newsletterList}>
              {newsItemsRef.current.map((currnews, index) => (
                (index == 0 && stickyRef.current) ? <></> :
                  <NewsItem NewsUrl={currnews.pb_NewsUrl.Url} ImageUrl={currnews.pb_ImageUrl} NewsTitle={currnews.pb_NewsTitle} PubFrom={getEditedDate(currnews.pb_PubFrom)} NewsHeader={currnews.pb_NewsHeader} metaText={getEditedDate(currnews.pb_PubFrom)} comments={currnews.pb_CommentsNumber} likes={currnews.pb_LikeNumber} isSticky={false} />
              ))}
            </Stack>
            : <h2>{getStringTranslation('noNewsText', contextRef.current.pageLanguage)}</h2>}
        </div >
      }
    </>
  );
}