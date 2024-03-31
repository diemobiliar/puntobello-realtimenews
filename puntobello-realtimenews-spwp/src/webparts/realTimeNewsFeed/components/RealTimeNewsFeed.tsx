//#region #Imports
import * as React from 'react';

import {
  Spinner,
  IDropdownOption,
  Stack,
  IStackTokens,
} from 'office-ui-fabric-react';

import { getSP } from '../../../utils/pnpjs-config';
import "@pnp/sp/webs";
import "@pnp/sp/site-users/web";
import "@pnp/sp/lists";
import "@pnp/sp/items";
import "@pnp/sp/profiles";
import "@pnp/sp/taxonomy";
import { IOrderedTermInfo } from "@pnp/sp/taxonomy";
import { dateAdd, PnPClientStorage } from "@pnp/common";
import { IItemAddResult } from '@pnp/sp/items';

import io from 'socket.io-client';
import * as __ from 'lodash';

import styles from '../RealTimeNewsFeed.module.scss';
import IRealTimeNewsFeedWP from '../models/IRealTimeNewsFeedWP';
import { IChannels2SubscriptionItem, IRedNetChannels2LocItem, IRedNetChannels2SubsItem } from '../models/IRedNetNewsFeed';
import ILanguage from '../models/ILanguage';
import INewsItemData from '../models/INewsItemData';
import { CommandBarNewsFeed } from './CommandBarNewsFeed';
import { StickyItem } from './StickyItem';
import { ChannelSettings } from './ChannelSettings';
import { NewsItem } from './NewsItem';
import { SystemMessage } from './SystemMessage';
import { getChannelText, getLanguageLocale, getStringTranslation, getStringTranslation4Lang } from '../../../utils/localize';
import { getEditedDate, getGANLWeek, getSystemMessageTitle } from '../../../utils/ui';
import { SeverityLevel } from '@microsoft/applicationinsights-web';
import { SPFI } from '@pnp/sp';
//#endregion

const stackTokens: IStackTokens = { childrenGap: 14 };

export function RealTimeNewsFeed(props: IRealTimeNewsFeedWP) {

  // Refs
  const _sp = React.useRef<SPFI>();
  const _myNewsGuid = React.useRef("00000000-0000-0000-0000-000000000000");
  const _newsChannel = React.useRef(_myNewsGuid.current);
  const _currentProfile = React.useRef<any>();
  const _currentUser = React.useRef<any>();
  const _newsChannels = React.useRef<IChannels2SubscriptionItem[]>();
  const _locChannels = React.useRef<string[]>();
  const _channelsubItemId = React.useRef<number>();
  const _store = React.useRef(new PnPClientStorage());
  const _sticky = React.useRef(false);
  const _locale = React.useRef('de-de');
  const _newsItems = React.useRef<INewsItemData[]>([]);
  const _GANLWeek = React.useRef<IOrderedTermInfo[]>([]);
  const _filterQuery4Socket = React.useRef<string>('');
  const _numberOfNewNews = React.useRef<number>(0);

  // State
  const [loading, setLoading] = React.useState(true);
  const [modalVisible, setModalVisible] = React.useState(false);
  const [systemMessageVisible, setSystemMessageVisible] = React.useState(false);

  function processSocketEvent(data) {
    // Safeguard if we get in the situation when the webpart is loading and an event has been received
    if (_filterQuery4Socket.current === undefined || _filterQuery4Socket.current.length == 0) {
      return;
    }
    const eventType = Object.keys(data)[0];
    const eventId: number = Number(Object.values(data)[0]);

    //const currDate = new Date().toISOString();
    const currDate = toISOStringWithTimezone(new Date());
    const publishingDatesFilter = `REDN_PubFrom le datetime'${currDate}' and (REDN_PubTo ge datetime'${currDate}' or REDN_PubTo eq null)`;

    const currentFilter = _filterQuery4Socket.current + publishingDatesFilter + ' and (Id eq ' + eventId.toString() + ')';
    if(eventType == 'X') {
      processSocketUnpublishEvent(eventId);
    } else {
     _sp.current.web.lists.getById(props.list.toString()).items.filter(currentFilter).top(1)().then((item) => {
        if (item.length > 0) {
          switch (eventType) {
            case 'A':
              processSocketAddEvent(eventId);
              break;
            case 'U':
              processSocketUpdateEvent(eventId);
              break;
            case 'R':
              processSocketReloadEvent(eventId);
              break;
            case 'Z':
              processSocketErrorEvent(eventId);
              break;
          }
        }
      }).catch((errorMsg) => {
        props.telemetryService.generateExceptionEvent('RealTimeNews.tsx', 'PROCESS_SOCKET_EVENT', errorMsg);
      });
    }
  }

  function processSocketAddEvent(id: number) {
    setSystemMessageVisible(false);
    _numberOfNewNews.current++;
    setSystemMessageVisible(true);
  }
  function processSocketUpdateEvent(id: number) {
    // No processing at the moment, maybe in the future
  }
  function processSocketUnpublishEvent(id: number) {
    updateNews();
  }
  function processSocketReloadEvent(id: number) {
    // tbd, look look
  }
  function processSocketErrorEvent(id: number) {
    const errorMsg = 'Received Not Defined Event-Type Z from Socket-Service which points to a logic error in the processing logic app';
    props.telemetryService.generateExceptionEvent('RealTimeNewsFeed.tsx', 'PROCESS_SOCKET_ERROR_EVENT', errorMsg);
  }

  function getAllData() {
    setLoading(true);
    // Read news channel subscriptions and mandatory channels configuration
    getChannelsAndSubscriptions()
      .then(() => {
        // Now get the news items, which are based on the channels subscription for the user
        getNewsItems()
          .then((responsenews) => {
            _newsItems.current = responsenews;
            getGANLTerms().then(() => {
              setLoading(false);
            }).catch((errorMsg) => {
              props.telemetryService.generateExceptionEvent('RealTimeNewsFeed.tsx', 'GET_GANLTERMS', errorMsg);
              _newsItems.current = [];
              setLoading(false);
            });
          }).catch((errorMsg) => {
            props.telemetryService.generateExceptionEvent('RealTimeNewsFeed.tsx', 'GET_ALL_DATA_NEWS_ITEMS', errorMsg);
            _newsItems.current = [];
            setLoading(false);
          });
      }).catch((errorMsg) => {
        props.telemetryService.generateExceptionEvent('RealTimeNewsFeed.tsx', 'GET_CHANNELS_AND_SUBSCRIPTION', errorMsg);
        _newsItems.current = [];
        setLoading(false);
      });
  }

  async function getGANLTerms() {
    _GANLWeek.current = await _store.current.local.getOrPut('c5da2e9b-e3a7-4100-a130-2db7f511c377', () => {
      return _sp.current.termStore.sets.getById("c5da2e9b-e3a7-4100-a130-2db7f511c377").getAllChildrenAsOrderedTree();
    }, dateAdd(new Date(), 'hour', 24));
  }

  //Ensure Channel subscription for the current user
  async function getChannelsAndSubscriptions() {
    // First we look if we have some data in the channel2sub list
    // Second read the channels2loc list (mandatory channels for the user loc)
    // Third we read all the channels from the termstore (only active channels and in the correct sort order)
    // Fourth merge the data between the termstore and the channelsloc items in order to check what channels are mandatory for the current user location
    const currNewsChannels: IChannels2SubscriptionItem[] = [];
    const currLocChannels: string[] = [];
    const newsChannelConfig: IChannels2SubscriptionItem[] = [];

    // Retrieve MobiLocation prop from user profile
    let profMobiLoc: string;
    _currentProfile.current.UserProfileProperties.forEach(userprop => {
      if (userprop.Key === 'REDNLocation') profMobiLoc = userprop.Value as string;
    });

    // Read channel2sub for current user
    //const channels2subItem: IRedNetChannels2SubsItem[] = await sp.web.lists.getByTitle("Rednet_ChannelsSubscription").items
    //  .filter("REDN_ChannelSubscriber/Name eq '" + _currentProfile.current.AccountName + "'")
    //  .expand("REDN_ChannelSubscriber")
    //  .select("REDN_Channels", "REDN_ChannelSubscriber/Name", "Id").top(1).get();
    const channels2subItem: IRedNetChannels2SubsItem[] = await _sp.current.web.lists.getByTitle("Rednet_ChannelsSubscription").items
      .filter("REDN_ChannelSubscriber eq '" + props.context.pageContext.legacyPageContext.userId + "'")
      .select("Id", "REDN_Channels").top(1)();

    if (channels2subItem.length > 0) {
      channels2subItem[0].REDN_Channels.forEach(channel => {
        const newChan: IChannels2SubscriptionItem = { Channel: [], TermGuid: channel.TermGuid, Subscribed: true, Mandatory: false, Visible: true, SortOrder: 0 };
        //newsChannelConfig.push({ Channel: [], TermGuid: channel.TermGuid, Subscribed: true, Mandatory: false, Visible: true, SortOrder: 0 });
        newsChannelConfig.push(newChan);
      });
      _channelsubItemId.current = channels2subItem[0].Id;
    } else {
      const newSubItem: IItemAddResult = await _sp.current.web.lists.getByTitle("Rednet_ChannelsSubscription").items.add({
        Title: _currentProfile.current.DisplayName,
        REDN_ChannelSubscriberId: _currentUser.current.Id
      });
      _channelsubItemId.current = newSubItem.data.ID;
    }

    // Read all parent locations for my current location from the termstore
    // PnP v2 doesn't allow retrieval by name (Dec.2020) so we have to scan the structure for the correct location
    // as the location in the user profile is saved as a string, albeit it is a term.
    // First get termset "Standorte" and term "Direktion"
    // Then  for termset "Standorte" and term "Generalagenturen"
    const locationDirektionTermId: string = await getTermId4MobiLoc("8d241df8-b470-4718-b143-ff116f23b651", "13f04495-bd60-4f71-9cc9-5b56a51e1530", profMobiLoc);

    // Search in the GA hierarchy
    let locationGATermId: string;
    if (locationDirektionTermId === undefined) {
      locationGATermId = await getTermId4MobiLoc("8d241df8-b470-4718-b143-ff116f23b651", "e568850e-030f-4200-b9b2-d1884d7a9db6", profMobiLoc);
    }

    // No location found, we have trouble
    if (locationGATermId === undefined && locationDirektionTermId === undefined) {
      props.telemetryService.generateExceptionEvent('RealTimeNewsFeed.tsx', 'NO_LOCATION_FOUND_FOR_USER', 'User:' + _currentUser);
      return;
    }

    const currentTermLocId: string = locationDirektionTermId ? locationDirektionTermId : locationGATermId;

    // Parent & grand parent hardcoded because we already scan top down with fixed guids
    const parentTermId: string = locationDirektionTermId ? "13f04495-bd60-4f71-9cc9-5b56a51e1530" : "e568850e-030f-4200-b9b2-d1884d7a9db6";
    const granParentTermId: string = "0140ed0f-b5c6-451f-b86d-5d8ce0eb1372";

    currLocChannels.push(currentTermLocId);
    currLocChannels.push(parentTermId);
    currLocChannels.push(granParentTermId);
    _locChannels.current = currLocChannels;

    // Read all entries and check mandatory channels
    const channels2locitems: IRedNetChannels2LocItem[] = await _sp.current.web.lists.getByTitle("Rednet_Channels2Loc").items();
    channels2locitems.forEach(c2locitem => {
      // lodash to break foreach
      __.forEach(c2locitem.REDN_Locations, mobiLoc => {
        if (mobiLoc.TermGuid === currentTermLocId || mobiLoc.TermGuid === parentTermId || mobiLoc.TermGuid === granParentTermId) {
          const newChan: IChannels2SubscriptionItem = { Channel: [], TermGuid: c2locitem.REDN_Channels[0].TermGuid, Subscribed: true, Mandatory: true, Visible: true, SortOrder: 0 };
          newsChannelConfig.push(newChan);
          return false;     // Exits the loop.
        }
      });
    });

    // Process all channels from termstore
    // We skip deprecated channels and merge the data within the newsChannels
    const allCachedChannels: IOrderedTermInfo[] = await _store.current.local.getOrPut('d2ded637-78a7-4716-b00b-06f0ff8813bf', () => {
      return _sp.current.termStore.sets.getById("d2ded637-78a7-4716-b00b-06f0ff8813bf").getAllChildrenAsOrderedTree();
    }, dateAdd(new Date(), 'hour', 12));

    // Push default "my news" aka all my channels
    currNewsChannels.push({
      Channel: [{ Language: "de-DE", Text: getStringTranslation4Lang('myNewsLabel', 'de-de') }, { Language: "fr-FR", Text: getStringTranslation4Lang('myNewsLabel', 'fr-fr') }, { Language: "it-IT", Text: getStringTranslation4Lang('myNewsLabel', 'it-it') }, { Language: "en-US", Text: getStringTranslation4Lang('myNewsLabel', 'en-us') }],
      TermGuid: _myNewsGuid.current, Subscribed: false, Mandatory: false, Visible: true, SortOrder: 0
    });

    allCachedChannels.forEach(channel => {
      if (!channel.isDeprecated) {
        const channelLanguages: ILanguage[] = channel.labels.map((label): ILanguage => {
          return { Language: label.languageTag, Text: label.name };
        });
        const currentNewsChannelMand: IChannels2SubscriptionItem = newsChannelConfig.find(newsChannel => newsChannel.TermGuid === channel.id && newsChannel.Mandatory);
        const currentNewsChannelNotMand: IChannels2SubscriptionItem = newsChannelConfig.find(newsChannel => newsChannel.TermGuid === channel.id && !newsChannel.Mandatory);
        if (currentNewsChannelMand) {
          currNewsChannels.push({ Channel: channelLanguages, TermGuid: channel.id, Subscribed: currentNewsChannelMand.Subscribed, Mandatory: true, Visible: currentNewsChannelMand.Visible, SortOrder: 0 });
        } else if (currentNewsChannelNotMand) {
          currNewsChannels.push({ Channel: channelLanguages, TermGuid: channel.id, Subscribed: currentNewsChannelNotMand.Subscribed, Mandatory: false, Visible: currentNewsChannelNotMand.Visible, SortOrder: 0 });
        } else {
          currNewsChannels.push({ Channel: channelLanguages, TermGuid: channel.id, Subscribed: false, Mandatory: false, Visible: false, SortOrder: 0 });
        }
      }
    });
    _newsChannels.current = currNewsChannels;
  }

  // Search for the term id for a given location
  async function getTermId4MobiLoc(termSetId: string, termId: string, mobiLocation) {
    let retVal: string;

    const currentCachedTerm = await _store.current.local.getOrPut(termSetId.toString() + '_' + termId.toString(), () => {
      return _sp.current.termStore.sets.getById(termSetId).getTermById(termId).children();
    }, dateAdd(new Date(), 'hour', 12));

    currentCachedTerm.forEach(term => {
      // Search for the labels array which contains the objects
      term.labels.forEach(label => {
        if (label.name === mobiLocation) retVal = term.id;
      });
    });
    return retVal;
  }

  // Reads the news for all the subscribed channels or for a specific channel
  function getNewsItems(): Promise<INewsItemData[]> {

    const p = new Promise<INewsItemData[]>((resolve, reject) => {
      // build filter for locations
      const locationFilter = filterBuilder("REDN_Locations", _locChannels.current, true);

      // build filter for channels
      let channelFilter: string;
      if (_newsChannel.current === _myNewsGuid.current) {
        channelFilter = filterBuilder("REDN_Channels",
          _newsChannels.current.filter((channel: IChannels2SubscriptionItem) => { if (channel.Subscribed && channel.TermGuid != _myNewsGuid.current) return channel; })
            .map(channel => channel.TermGuid), false);
      } else {
        channelFilter = filterBuilder("REDN_Channels", Array.from(new Set([_newsChannel.current])), false);
      }

      //const currDate = new Date().toISOString();
      const currDate = toISOStringWithTimezone(new Date());
      const publishingDatesFilter = `REDN_PubFrom le datetime'${currDate}' and (REDN_PubTo ge datetime'${currDate}' or REDN_PubTo eq null)`;

      // REDN_Unpublish is removed from query filter, tbd how to do an unpublishing
      //const filterQuery = locationFilter + " and " + channelFilter + " and (REDN_Unpublish eq false) and (REDN_LangCd eq '" + props.language.toUpperCase() + "')";
      const filterQuery = locationFilter + " and " + channelFilter + " and (REDN_Unpublish eq false or REDN_Unpublish eq null) and (REDN_LangCd eq '" + props.language.toUpperCase() + "') and " + publishingDatesFilter;
      const filterQuerySocket = locationFilter + " and " + channelFilter + " and (REDN_Unpublish eq false or REDN_Unpublish eq null) and (REDN_LangCd eq '" + props.language.toUpperCase() + "') and ";
      _filterQuery4Socket.current = filterQuerySocket;

      // Check if we have a sticky news which sticky date is not reached
      _sticky.current = false;
      const filterQuerySticky = filterQuery + ` and (REDN_Sticky eq 1 and REDN_StickyDate ge datetime'${currDate}')`;
      const filterQueryWithoutSticky = filterQuery + ` and (REDN_Sticky eq 0 or REDN_Sticky eq null)`;
      const allNews: INewsItemData[] = [];
      _sp.current.web.lists.getById(props.list.toString()).items.filter(filterQuerySticky).top(1)().then((item) => {
        if (item.length > 0) {
          _sticky.current = true;
          allNews.push(item[0] as INewsItemData);
        } else {
          _sticky.current = false;
        }
        _sp.current.web.lists.getById(props.list.toString()).items.filter(filterQueryWithoutSticky).orderBy("REDN_PubFrom", false).top(props.newsCount)().then((items) => {
          allNews.push(...items);
          resolve(allNews as INewsItemData[]);
        }).catch((errorMsg) => {
          props.telemetryService.generateExceptionEvent('RealTimeNewsFeed.tsx', 'GET_NEWS_WITH_STICKY', errorMsg);
          reject(errorMsg);
        });
      });
    });
    return p;
  }

  // Generate this pattern
  // "substringof('" + guids[1] + "',fieldName) or substringof('" + guids[2] + "',fieldName) ..."
  function filterBuilder(fieldName: string, guids: string[], truncate: boolean): string {
    let retVal: string;
    if (truncate) { 
      guids.forEach((guid, i) => {
        guids[i] = guids[i].split('-')[0];
      });
    }

    if (guids.length === 1) {
      return "substringof('" + guids[0] + "'," + fieldName + ")";
    } else {
      retVal = guids.join("'," + fieldName + ") or substringof('");
      return "(substringof('" + retVal + "'," + fieldName + "))";
    }
  }

  // This method refresh the ui when a notification about an update has been shown
  // or when channels have been updated
  function getAvailableItems() {
    setSystemMessageVisible(false);
    setLoading(true);
    getNewsItems()
      .then((response) => {
        _newsItems.current = response;
        setLoading(false);
      }).catch((errorMsg) => {
        props.telemetryService.generateExceptionEvent('RealTimeNewsFeed.tsx', 'GET_NEWS_GENERIC', errorMsg);
        _newsItems.current = [];
        setLoading(false);
      });
  }

  function changeChannelSettings(item: IChannels2SubscriptionItem, ev: React.FormEvent<HTMLElement>, isChecked: boolean) {
    const channels: any[] = [];
    if (isChecked) {
      _newsChannels.current.forEach(channel => {
        if (channel.Subscribed) {
          channels.push({ termName: channel.Channel.find(channelData => channelData.Language === 'de-DE').Text, termGUID: channel.TermGuid });
        } else {
          if (channel.TermGuid === item.TermGuid) {
            channel.Subscribed = true;
            channels.push({ termName: channel.Channel.find(channelData => channelData.Language === 'de-DE').Text, termGUID: channel.TermGuid });
          }
        }
      });
    } else {
      _newsChannels.current.forEach(channel => {
        if (channel.Subscribed) {
          if (channel.TermGuid != item.TermGuid) {
            channels.push({ termName: channel.Channel.find(channelData => channelData.Language === 'de-DE').Text, termGUID: channel.TermGuid });
          } else {
            channel.Subscribed = false;
          }
        }
      });
    }
    updateMultiMeta(channels, 'Rednet_ChannelsSubscription', 'REDN_Channels', _channelsubItemId.current).then().catch((errorMsg) => {
      props.telemetryService.generateExceptionEvent('RealTimeNewsFeed.tsx', 'CHANGE_CHANNEL_SETTINGS', errorMsg);
    });
  }

  async function updateMultiMeta(terms: any[], listName: string, fieldName: string, itemId: number): Promise<any> {
    const list = await _sp.current.web.lists.getByTitle(listName);

    let termsString: string = '';
    terms.forEach(term => {
      termsString += `${term.termName}|${term.termGUID};`;
    });
    const updateValue = { FieldName: fieldName, FieldValue: termsString };

    return await list.items.getById(itemId).validateUpdateListItem([updateValue]);
  }

  function updateNews() {
    _numberOfNewNews.current = 0;
    // Fetch data
    getAvailableItems();
  }

  function channelChange(ddKey) {
    // Set news channel 
    _newsChannel.current = ddKey;
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
    const currNewsChannels = _newsChannels.current;

    currNewsChannels.map((newschannel) => {
      if (newschannel.TermGuid == _myNewsGuid.current || newschannel.Subscribed) {
        retVal.push({ key: newschannel.TermGuid, text: getChannelText(props.language, newschannel) });
      }
    });
    return retVal;
  }

  function getArchiveUrl(): string {
    let retVal: string = props.archivTargetUrl;

    if(props.language == 'fr' || props.language == 'it') {
      retVal = props.archivTargetUrl.replace('/SitePages/', '/SitePages/fr/');
    }
    return retVal;
  }


  function toISOStringWithTimezone(date:Date): string {
    const tzOffset = -date.getTimezoneOffset();
    const diff = tzOffset >= 0 ? '+' : '-';
    const pad = n => `${Math.floor(Math.abs(n))}`.padStart(2, '0');
    return date.getFullYear() +
      '-' + pad(date.getMonth() + 1) +
      '-' + pad(date.getDate()) +
      'T' + pad(date.getHours()) +
      ':' + pad(date.getMinutes()) +
      ':' + pad(date.getSeconds()) +
      diff + pad(tzOffset / 60) +
      ':' + pad(tzOffset % 60);
  }


  React.useEffect(() => {

    _sp.current = getSP();

    _locale.current = getLanguageLocale(props.language);
    // Socket connection
    const socket = io(process.env.SPFX_SOCKET_URL, { transports: ["websocket"], timeout: 30000 });
    socket.on("connect", () => {
      props.telemetryService.generateTraceEvent('RealTimeNewsFeed.tsx', 'Socket Connect, SocketId:' + socket.id, SeverityLevel.Information);
    });
    socket.on("nd", (data) => {
      processSocketEvent(data);
    });
    socket.on("disconnect", () => {
      props.telemetryService.generateTraceEvent('RealTimeNewsFeed.tsx', 'Socket Disconnect, SocketId:' + socket.id, SeverityLevel.Information);
    });
    socket.on("connect_error", (socketerr) => {
      props.telemetryService.generateExceptionEvent('RealTimeNewsFeed.tsx', 'SOCKET_ERROR', 'SocketId:' + socket.id + 'error ' + socketerr);
    });

    async function getUserData() {
      _currentProfile.current = await _sp.current.profiles.myProperties();
      // Get current user
      _currentUser.current = await _sp.current.web.currentUser();
    }
    // Fetch initial data
    getUserData().then(() => {
      getAllData();
    });

    return () => {
      // before the component is destroyed
      // unbind all event handlers used in this component
      socket.off();
    };
  }, []);


  return (
    <>
      {loading && <Spinner label={getStringTranslation('loading', _locale.current)} />}
      {!loading &&
        <div className={styles.newsFeed} style={{ backgroundColor: props.themeVariant.semanticColors.bodyBackground, color: props.themeVariant.semanticColors.bodyText }}>
          {systemMessageVisible && <SystemMessage Title={getSystemMessageTitle(_numberOfNewNews.current, _locale.current)} wpLang={_locale.current} buttonUpdateNewsClicked={updateNews}/>}
          {_sticky.current &&
            <div className={styles.highlightContainer}>
              <StickyItem NewsUrl={_newsItems.current[0].REDN_NewsUrl.Url} ImageUrl={_newsItems.current[0].REDN_ImageUrl} NewsTitle={_newsItems.current[0].REDN_NewsTitle} PubFrom={getEditedDate(_newsItems.current[0].REDN_PubFrom)} NewsHeader={_newsItems.current[0].REDN_NewsHeader} metaText={getEditedDate(_newsItems.current[0].REDN_PubFrom)} comments={_newsItems.current[0].REDN_CommentsNumber} likes={_newsItems.current[0].REDN_LikeNumber} wpLang={_locale.current} isSticky={false} isGANL={false}/>
            </div>
          }
          {<ChannelSettings myNewsGuid={_myNewsGuid.current} channelsubItemId={_channelsubItemId.current} channelsConfig={_newsChannels.current} wpLang={props.language} locale={_locale.current} modalVisible={modalVisible} modalSettingsTitle={getStringTranslation('modalSettingsTitle', _locale.current)} closeModal={hideChannelSettings} changeChannelSettings={changeChannelSettings} />}
          {<CommandBarNewsFeed channelDropdown={getChannelDD()} wpLang={_locale.current} selectedKey={_newsChannel.current} archivLinkUrl={getArchiveUrl()} channelDropdownChanged={channelChange} channelSettingsModalClicked={showChannelSettings}/>}
          {_newsItems.current.length > 0 ?
            <Stack tokens={stackTokens} className={styles.newsletterList}>
              {_newsItems.current.map((currnews, index) => (
                (index == 0 && _sticky.current) ? <></> :
                  <NewsItem NewsUrl={currnews.REDN_NewsUrl.Url} ImageUrl={currnews.REDN_ImageUrl} NewsTitle={currnews.REDN_NewsTitle} PubFrom={getEditedDate(currnews.REDN_PubFrom)} NewsHeader={currnews.REDN_NewsHeader} metaText={getEditedDate(currnews.REDN_PubFrom)} comments={currnews.REDN_CommentsNumber} likes={currnews.REDN_LikeNumber} wpLang={_locale.current} isSticky={false} isGANL={currnews.REDN_IsGANL} GANLWW={getGANLWeek(_GANLWeek.current, currnews.REDN_IsGANL, currnews.REDN_GANLWeek, props.language)}/>
              ))}
            </Stack>
            : <h2>{getStringTranslation('noNewsText', _locale.current)}</h2>}
        </div >
      }
    </>
  );
}