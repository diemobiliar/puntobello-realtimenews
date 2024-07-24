// RealTimeNewsFeed.tsx
import { useRef, useState, useEffect } from 'react';
import * as React from 'react';

import { Spinner,  Stack, IStackTokens } from '@fluentui/react';

import io from 'socket.io-client';

import styles from '../RealTimeNewsFeed.module.scss';
import IRealTimeNewsFeedWP from '../../../models/IRealTimeNewsFeedWP';
import { CommandBarNewsFeed } from './CommandBarNewsFeed';
import { StickyItem } from './StickyItem';
import { ChannelSettings } from './ChannelSettings';
import { NewsItem } from './NewsItem';
import { SystemMessage } from './SystemMessage';
import { getEditedDate } from '../../../utils/ui';
import { getRootStyle } from '../../../utils/envConfig';

import {
  processSocketEvent,
  processSocketAddEvent,
  processSocketErrorEvent,  
  getAllData,
  changeChannelSettings,
  getAvailableItems,
  getChannelDD
} from '../../../utils/realtimenewsfeed';
import { Utility } from '../../../utils/utils';

const stackTokens: IStackTokens = { childrenGap: 14 };

export function RealTimeNewsFeed(props: IRealTimeNewsFeedWP) {
  const {
    pageLanguage,
    newsCount,
    themeVariant,
    spo
  } = props;

  // Refs
  const myNewsGuidRef = useRef("00000000-0000-0000-0000-000000000000");
  const newsChannelCurrentRef = useRef(myNewsGuidRef.current);
  const newsChannelsRef = useRef([]);
  const channelsubItemIdRef = useRef<number>();
  const stickyRef = useRef(false);
  const newsItemsRef = useRef([]);
  const numberOfNewNewsRef = useRef<number>(0);

  // State
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [systemMessageVisible, setSystemMessageVisible] = useState(false);

  const combinedStyles = Object.assign(
    {
      backgroundColor: themeVariant.semanticColors.bodyBackground,
      color: themeVariant.semanticColors.bodyText
    },
    getRootStyle()
  );

  useEffect(() => {
    // Socket connection
    const socket = io(process.env.SPFX_SOCKET_URL, { transports: ["websocket"], timeout: 30000 });
    socket.on("connect", () => {
      console.info('Socket Connect, SocketId:' + socket.id);
    });
    socket.on("nd", (data) => {
      processSocketEvent(data, spo, numberOfNewNewsRef, setSystemMessageVisible, processSocketAddEvent, processSocketErrorEvent);
    });
    socket.on("disconnect", () => {
      console.info('Socket Disconnect, SocketId:' + socket.id);
    });
    socket.on("connect_error", (socketerr) => {
      console.warn('Socket_error SocketId' + socket.id + 'error ' + socketerr);
    });

    getAllData(spo, newsChannelCurrentRef, myNewsGuidRef, newsChannelsRef, pageLanguage, newsCount, setLoading, newsItemsRef, stickyRef, channelsubItemIdRef);

    return () => {
      socket.off();
    };
  }, []);

  function updateNews() {
    numberOfNewNewsRef.current = 0;
    getAvailableItems(spo, newsChannelCurrentRef, myNewsGuidRef, newsChannelsRef, pageLanguage, newsCount, newsItemsRef, stickyRef, setLoading, console);
  }

  function channelChange(ddKey) {
    newsChannelCurrentRef.current = ddKey;
    getAvailableItems(spo, newsChannelCurrentRef, myNewsGuidRef, newsChannelsRef, pageLanguage, newsCount, newsItemsRef, stickyRef, setLoading, console);
  }

  function showChannelSettings() {
    setModalVisible(true);
  }

  function hideChannelSettings() {
    getAvailableItems(spo, newsChannelCurrentRef, myNewsGuidRef, newsChannelsRef, pageLanguage, newsCount, newsItemsRef, stickyRef, setLoading, console);
    setModalVisible(false);
  }

  return (
    <>
      {loading && <Spinner label={Utility.getStringTranslation4Locale('loading', pageLanguage.Language)} />}
      {!loading &&
        <div className={styles.newsFeed} style={combinedStyles}>
          {systemMessageVisible && <SystemMessage Title={Utility.getStringTranslation4Locale('NewNewsAvailableLabel', pageLanguage.Language)} buttonUpdateNewsClicked={updateNews} pageLanguage={pageLanguage.Language} />}
          {stickyRef.current &&
            <div className={styles.highlightContainer}>
              <StickyItem NewsUrl={newsItemsRef.current[0].pb_NewsUrl.Url} ImageUrl={newsItemsRef.current[0].pb_ImageUrl} NewsTitle={newsItemsRef.current[0].Title} PublishedFrom={getEditedDate(newsItemsRef.current[0].pb_PublishedFrom)} NewsHeader={newsItemsRef.current[0].pb_Header}/>
            </div>
          }
          <ChannelSettings myNewsGuid={myNewsGuidRef.current} channelsConfig={newsChannelsRef.current} pageLanguage={pageLanguage} modalVisible={modalVisible} modalSettingsTitle={Utility.getStringTranslation4Locale('modalSettingsTitle', pageLanguage.Language)} closeModal={hideChannelSettings} changeChannelSettings={(item, ev, isChecked) => changeChannelSettings(spo, newsChannelsRef, item, isChecked, channelsubItemIdRef)} />
          <CommandBarNewsFeed channelDropdown={getChannelDD(newsChannelsRef, myNewsGuidRef, Utility, pageLanguage)} selectedKey={newsChannelCurrentRef.current} channelDropdownChanged={channelChange} channelSettingsModalClicked={showChannelSettings} pageLanguage={pageLanguage.Language} />
          {newsItemsRef.current.length > 0 ?
            <Stack tokens={stackTokens} className={styles.newsletterList}>
              {newsItemsRef.current.map((currnews, index) => (
                (index == 0 && stickyRef.current) ? <></> :
                  <NewsItem NewsUrl={currnews.pb_NewsUrl.Url} ImageUrl={currnews.pb_ImageUrl} NewsTitle={currnews.Title} PublishedFrom={getEditedDate(currnews.pb_PublishedFrom)} NewsHeader={currnews.pb_Header}/>
              ))}
            </Stack>
            : <h2>{Utility.getStringTranslation4Locale('noNewsText', pageLanguage.Language)}</h2>}
        </div >
      }
    </>
  );
}
