import { useRef, useState, useEffect } from 'react';
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
import IChannelLanguage from '../../../models/IChannelLanguage';
import INewsItemData from '../../../models/INewsItemData';
import { CommandBarNewsFeed } from './CommandBarNewsFeed';
import { StickyItem } from './StickyItem';
import { ChannelSettings } from './ChannelSettings';
import { NewsItem } from './NewsItem';
import { SystemMessage } from './SystemMessage';
import { getEditedDate } from '../../../utils/ui';
import { Utility } from '../../../utils/utils';
import { Logger } from '../../../utils/logger';
//#endregion

const stackTokens: IStackTokens = { childrenGap: 14 };

export function RealTimeNewsFeed(props: IRealTimeNewsFeedWP) {
  const logger = Logger.getInstance();
  // Refs
  const myNewsGuidRef = useRef("00000000-0000-0000-0000-000000000000");
  const newsChannelCurrentRef = useRef(myNewsGuidRef.current);
  const newsChannelsRef = useRef<IChannels2SubscriptionItem[]>();
  const channelsubItemIdRef = useRef<number>();
  const stickyRef = useRef(false);
  const newsItemsRef = useRef<INewsItemData[]>([]);
  const numberOfNewNewsRef = useRef<number>(0);

  // State
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [systemMessageVisible, setSystemMessageVisible] = useState(false);
  const [loadingText, setLoadingText] = React.useState('');
  const [noNewsText, setNoNewsText] = React.useState('');
  const [modalSettingsTitle, setModalSettingsTitle] = React.useState('');

  React.useEffect(() => {
    async function getLoadingText() {
      const translation = await Utility.getStringTranslation4Locale('loading', props.pageLanguage.Language);
      setLoadingText(translation);
    }  
    getLoadingText();
  }, []);

  React.useEffect(() => {
    async function getNoNewsText() {
      const translation = await Utility.getStringTranslation4Locale('noNewsText', props.pageLanguage.Language);
      setNoNewsText(translation);
    }  
    getNoNewsText();
  }, []);

  React.useEffect(() => {
    async function getModalSettingsTitle() {
      const translation = await Utility.getStringTranslation4Locale('modalSettingsTitle', props.pageLanguage.Language);
      setModalSettingsTitle(translation);
    }  
    getModalSettingsTitle();
  }, []);

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


  async function processSocketEvent(data) {
    // Safeguard if we get in the situation when the webpart is loading and an event has been received
    if (props.spo.filterQuery4Socket === undefined || props.spo.filterQuery4Socket.length == 0) {
      return;
    }
    const eventType = Object.keys(data)[0];
    const eventId: number = Number(Object.values(data)[0]);

    const validItem = await props.spo.checkValidNewsItem(eventId);
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
        props.spo.getNewsItems(newsChannelCurrentRef.current, myNewsGuidRef.current, newsChannelsRef.current, props.pageLanguage, props.newsCount)
          .then((responsenews) => {
            newsItemsRef.current = responsenews.newsItemData;
            stickyRef.current = responsenews.sticky;
            setLoading(false);
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
    const allCachedChannels: IOrderedTermInfo[] = await props.spo.getAndCacheAllChannels();

    // Get subscribed channels for current user
    const channels2subItem: IChannels2SubsItem[] = await props.spo.getSubscribedChannels4CurrentUser();

    if (channels2subItem.length > 0) {
      channels2subItem[0].pb_Channels.forEach(channel => {
        const newChan: IChannels2SubscriptionItem = { Channel: [], TermGuid: channel.TermGuid, Subscribed: true, Visible: true, SortOrder: 0 };
        newsChannelConfig.push(newChan);
      });
      channelsubItemIdRef.current = channels2subItem[0].Id;
    } else {
      // We do not have any subscribed channels, create default subscription item
      const newSubItem: IItemAddResult = await props.spo.addSubscribedChannels4CurrentUser();
      channelsubItemIdRef.current = newSubItem.data.ID;
    }

    // Push default "my news" aka all my channels
    currNewsChannels.push({
      Channel: [{ Language: props.pageLanguage.Language, Text: Utility.getStringTranslation4Locale('myNewsLabel', props.pageLanguage.Language) }],
      TermGuid: myNewsGuidRef.current, Subscribed: false, Visible: true, SortOrder: 0
    });

    allCachedChannels.forEach(channel => {
      if (!channel.isDeprecated) {
        const channelLanguages: IChannelLanguage[] = channel.labels.map((label): IChannelLanguage => {
          return { Language: label.languageTag, Text: label.name };
        });
        const currentNewsChannel: IChannels2SubscriptionItem = newsChannelConfig.find(newsChannel => newsChannel.TermGuid === channel.id);
        // Channel found or we do not have any channel config which means all channels are subscribed
        if (currentNewsChannel || newsChannelConfig.length == 0) {
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
    props.spo.getNewsItems(newsChannelCurrentRef.current, myNewsGuidRef.current, newsChannelsRef.current, props.pageLanguage, props.newsCount)
      .then((responsenews) => {
        logger.info('getNewsiItems from getAvailableItems is', responsenews);
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
    props.spo.updateMultiMeta(channels, `${process.env.SPFX_SUBSCRIBEDCHANNELS_LIST_TITLE}`, 'pb_Channels', channelsubItemIdRef.current).then().catch((error) => {
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
        retVal.push({ key: newschannel.TermGuid, text: Utility.getChannelText(props.pageLanguage, newschannel) });
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
      logger.info('>>>>>>>>>>>>>>>>>>>>> processsocket event with data ', data);
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
      {loading && <Spinner label={Utility.getStringTranslation4Locale('loading', props.pageLanguage.Language)} />}
      {!loading &&
        <div className={styles.newsFeed} style={{ backgroundColor: props.themeVariant.semanticColors.bodyBackground, color: props.themeVariant.semanticColors.bodyText }}>
          {systemMessageVisible && <SystemMessage Title={Utility.getStringTranslation4Locale('NewNewsAvailableLabel', props.pageLanguage.Language)} buttonUpdateNewsClicked={updateNews} pageLanguage={props.pageLanguage.Language} />}
          {stickyRef.current &&
            <div className={styles.highlightContainer}>
              <StickyItem NewsUrl={newsItemsRef.current[0].pb_NewsUrl.Url} ImageUrl={newsItemsRef.current[0].pb_ImageUrl} NewsTitle={newsItemsRef.current[0].Title} PublishedFrom={getEditedDate(newsItemsRef.current[0].pb_PublishedFrom)} NewsHeader={newsItemsRef.current[0].pb_Header} metaText={getEditedDate(newsItemsRef.current[0].pb_PublishedFrom)} isSticky={false} />
            </div>
          }
          {<ChannelSettings myNewsGuid={myNewsGuidRef.current} channelsubItemId={channelsubItemIdRef.current} channelsConfig={newsChannelsRef.current} pageLanguage={props.pageLanguage} modalVisible={modalVisible} modalSettingsTitle={Utility.getStringTranslation4Locale('modalSettingsTitle', props.pageLanguage.Language)} closeModal={hideChannelSettings} changeChannelSettings={changeChannelSettings} />}
          {<CommandBarNewsFeed channelDropdown={getChannelDD()} selectedKey={newsChannelCurrentRef.current} channelDropdownChanged={channelChange} channelSettingsModalClicked={showChannelSettings} pageLanguage={props.pageLanguage.Language} />}
          {newsItemsRef.current.length > 0 ?
            <Stack tokens={stackTokens} className={styles.newsletterList}>
              {newsItemsRef.current.map((currnews, index) => (
                (index == 0 && stickyRef.current) ? <></> :
                  <NewsItem NewsUrl={currnews.pb_NewsUrl.Url} ImageUrl={currnews.pb_ImageUrl} NewsTitle={currnews.Title} PublishedFrom={getEditedDate(currnews.pb_PublishedFrom)} NewsHeader={currnews.pb_Header} metaText={getEditedDate(currnews.pb_PublishedFrom)} isSticky={false} />
              ))}
            </Stack>
            : <h2>{Utility.getStringTranslation4Locale('noNewsText', props.pageLanguage.Language)}</h2>}
        </div >
      }
    </>
  );
}