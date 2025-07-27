// React imports for building components and handling state, refs, and effects
import * as React from 'react';
import { useRef, useState, useEffect } from 'react';

// Fluent UI components and styles for the UI layout and spinner
import { Spinner, Stack } from '@fluentui/react';

// Socket.IO client for real-time communication
import io from 'socket.io-client';

// Component-specific styles
import styles from '../RealTimeNewsFeed.module.scss';

// Component imports for various parts of the RealTimeNewsFeed feature
import { CommandBarNewsFeed } from './CommandBarNewsFeed';
import { StickyItem } from './StickyItem';
import { ChannelSettings } from './ChannelSettings';
import { NewsItem } from './NewsItem';
import { SystemMessage } from './SystemMessage';

// Utility functions for UI and environment configuration
import { getEditedDate, getRootEnv, Utility } from '../utils';

// Utility functions for real-time news feed processing and interactions
import {
  processSocketEvent,
  processSocketAddEvent,
  processSocketErrorEvent,  
  getAllData,
  changeChannelSettings,
  getAvailableItems,
  getChannelDD
} from '../utils';

// SharePoint service for interacting with SharePoint APIs
import SharePointService from '../services/SharePointService';

// Context for managing and accessing application-wide state
import { useAppContext } from '../contexts/AppContext';

/**
 * The `RealTimeNewsFeed` component is responsible for rendering a real-time news feed in a SharePoint web part.
 * It connects to a WebSocket server, listens for updates, and manages the state and display of news items.
 * 
 * This component leverages the SharePoint Framework (SPFx) and Fluent UI for styling and UI components.
 * It also makes use of context to access necessary services and settings, such as logging and theming.
 */
export function RealTimeNewsFeed() {
  // Destructuring context values using the custom hook
  const { context, logger, pageLanguage, newsCount, themeVariant } = useAppContext();

  // Consume the SharePoint service from the service scope
  const spo = context.serviceScope.consume(SharePointService.serviceKey);

  // Retrieve environment settings
  const rootEnv = getRootEnv();

  // Refs to maintain stateful values between renders without causing re-renders
  // Holds the fake GUID for the my news channel which shows all news for the channels subscribed by the user
  const myNewsGuidRef = useRef("00000000-0000-0000-0000-000000000000");
  // Holds the current selected news channel, is initialzed with my News
  const newsChannelCurrentRef = useRef(myNewsGuidRef.current);
  // Holds all available news channels
  const newsChannelsRef = useRef([]);
  // List item with the channel configuration for the current user
  const channelsubItemIdRef = useRef<number>();
  // Sticky news present or not
  const stickyRef = useRef(false);
  // All news items to be showed
  const newsItemsRef = useRef([]);
  // Number of new news items which are not yet displayed and shown in the system message
  const numberOfNewNewsRef = useRef<number>(0);

  // State variables to manage loading, modal visibility, and system message visibility
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [systemMessageVisible, setSystemMessageVisible] = useState(false);
  const [timeoutId, setTimeoutId] = React.useState(null);

  // Combined styles incorporating theming and environment-specific styles
  const combinedStyles = Object.assign(
    {
      backgroundColor: themeVariant.semanticColors.bodyBackground,
      color: themeVariant.semanticColors.bodyText
    },
    getRootEnv().css
  );

  // useEffect hook to handle socket connections and data fetching on component mount
  useEffect(() => {
    // Establish a WebSocket connection
    const socket = io(rootEnv.config.spfxSocketUrl, { transports: ["websocket"], timeout: +getRootEnv().config.spfxSocketTimeoutInMs });

    // Event listeners for WebSocket connection lifecycle and data events
    socket.on("connect", () => {
      logger.info('Socket Connect, SocketId:' + socket.id);
    });

    // Process socket event received from the webapp server
    socket.on("nd", (data) => {
      processSocketEvent(data, spo, numberOfNewNewsRef, setSystemMessageVisible, setTimeoutId, processSocketAddEvent, processSocketErrorEvent, updateNews);
    });

    socket.on("disconnect", () => {
      logger.info('Socket Disconnect, SocketId:' + socket.id);
    });

    socket.on("connect_error", (socketerr) => {
      logger.warn('Socket_error SocketId' + socket.id + 'error ' + socketerr);
    });

    // Fetch initial data for the news feed
    getAllData(spo, newsChannelCurrentRef, myNewsGuidRef, newsChannelsRef, pageLanguage, newsCount, setLoading, newsItemsRef, stickyRef, channelsubItemIdRef);

    // Clean up the socket connection when the component unmounts
    return () => {
      socket.off();
    };
  }, []);

  // Function to update the news feed when new items are available
  function updateNews() {
    setSystemMessageVisible(false);
    numberOfNewNewsRef.current = 0;
    getAvailableItems(spo, newsChannelCurrentRef, myNewsGuidRef, newsChannelsRef, pageLanguage, newsCount, newsItemsRef, stickyRef, setLoading, logger);
  }

  // Function to handle channel changes and update the displayed news items
  function channelChange(ddKey) {
    newsChannelCurrentRef.current = ddKey;
    getAvailableItems(spo, newsChannelCurrentRef, myNewsGuidRef, newsChannelsRef, pageLanguage, newsCount, newsItemsRef, stickyRef, setLoading, logger);
  }

  // Function to show the channel settings modal
  function showChannelSettings() {
    setModalVisible(true);
  }

  // Function to hide the channel settings modal and refresh the news items
  function hideChannelSettings() {
    getAvailableItems(spo, newsChannelCurrentRef, myNewsGuidRef, newsChannelsRef, pageLanguage, newsCount, newsItemsRef, stickyRef, setLoading, logger);
    setModalVisible(false);
  }

  return (
    <>
      {/* Show a loading spinner while data is being fetched */}
      {loading && <Spinner label={Utility.getStringTranslation4Locale('loading', pageLanguage.Language)} />}
      
      {/* Display the news feed once loading is complete */}
      {!loading &&
        <div className={styles.newsFeed} style={combinedStyles}>
          {/* Display a system message if new news items are available */}
          {systemMessageVisible && <SystemMessage Title={Utility.getStringTranslation4Locale('NewNewsAvailableLabel', pageLanguage.Language)} buttonUpdateNewsClicked={updateNews} />}
          
          {/* Highlight the first news item if it is marked as "sticky" */}
          {stickyRef.current &&
            <div className={styles.highlightContainer}>
              <StickyItem NewsUrl={newsItemsRef.current[0].pb_NewsUrl.Url} ImageUrl={newsItemsRef.current[0].pb_ImageUrl} NewsTitle={newsItemsRef.current[0].Title} PublishedFrom={getEditedDate(newsItemsRef.current[0].pb_PublishedFrom)} NewsHeader={newsItemsRef.current[0].pb_Header}/>
            </div>
          }
          
          {/* Render the channel settings and command bar */}
          <ChannelSettings myNewsGuid={myNewsGuidRef.current} channelsConfig={newsChannelsRef.current} modalVisible={modalVisible} modalSettingsTitle={Utility.getStringTranslation4Locale('modalSettingsTitle', pageLanguage.Language)} closeModal={hideChannelSettings} changeChannelSettings={(item, ev, isChecked) => changeChannelSettings(spo, newsChannelsRef, item, isChecked, channelsubItemIdRef)} />
          <CommandBarNewsFeed channelDropdown={getChannelDD(newsChannelsRef, myNewsGuidRef, pageLanguage)} selectedKey={newsChannelCurrentRef.current} channelDropdownChanged={channelChange} channelSettingsModalClicked={showChannelSettings}/>
          
          {/* Display the list of news items, or a message if no items are available */}
          {newsItemsRef.current.length > 0 ?
            <Stack tokens={{ childrenGap: 14 }} className={styles.newsletterList}>
              {newsItemsRef.current.map((currnews, index) => (
                (index == 0 && stickyRef.current) ? <React.Fragment key={currnews.Id || index} /> :
                  <NewsItem key={currnews.Id || index} NewsUrl={currnews.pb_NewsUrl.Url} ImageUrl={currnews.pb_ImageUrl} NewsTitle={currnews.Title} PublishedFrom={getEditedDate(currnews.pb_PublishedFrom)} NewsHeader={currnews.pb_Header}/>
              ))}
            </Stack>
            : <h2>{Utility.getStringTranslation4Locale('noNewsText', pageLanguage.Language)}</h2>}
        </div >
      }
    </>
  );
}

