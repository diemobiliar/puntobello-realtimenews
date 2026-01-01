"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getChannelDD = exports.getAvailableItems = exports.changeChannelSettings = exports.getChannelsAndSubscriptions = exports.getAllData = exports.processSocketErrorEvent = exports.processSocketAddEvent = exports.processSocketEvent = void 0;
var tslib_1 = require("tslib");
var utils_1 = require("../utils");
/**
 * Helper function to calculate random delay for distributing SharePoint API load.
 *
 * @param {number} maxDelay - Maximum delay in milliseconds (default: 30000ms = 30 seconds)
 * @returns {number} Random delay between 0 and maxDelay
 */
function getRandomDelay(maxDelay) {
    if (maxDelay === void 0) { maxDelay = 30000; }
    return Math.random() * maxDelay;
}
/**
 * Processes a socket event by determining its type and validating the associated news item.
 * Based on the event type, it calls the appropriate handler to update the UI or log an error.
 *
 * All event types are processed with a random delay (0-30s) to distribute SharePoint API load
 * and prevent HTTP 503 Service Unavailable errors when many users receive events simultaneously.
 *
 * @param {object} data - The data received from the socket event, where the key represents the event type and the value is the event ID.
 * @param {object} spo - The SharePoint service instance for interacting with the backend.
 * @param {React.MutableRefObject<number>} numberOfNewNewsRef - A ref that keeps track of the number of new news items.
 * @param {Function} setSystemMessageVisible - Function to set the visibility of the system message.
 * @param {React.MutableRefObject<Map<string, NodeJS.Timeout>>} pendingTimeoutsRef - Ref to track pending timeouts for cleanup.
 * @param {Function} processSocketAddEvent - Function to handle the addition of a new news item.
 * @param {Function} processSocketErrorEvent - Function to handle errors from the socket event.
 * @param {Function} updateNews - Function to reload the news from the list.
 *
 * @returns {void}
 */
function processSocketEvent(data, spo, numberOfNewNewsRef, setSystemMessageVisible, pendingTimeoutsRef, processSocketAddEvent, processSocketErrorEvent, updateNews) {
    var _this = this;
    if (spo.filterQuery4Socket === undefined || spo.filterQuery4Socket.length == 0) {
        return;
    }
    // Extract the event type and ID from the data object
    // The event id is the id of the list item in the news list
    var eventType = Object.keys(data)[0];
    var eventId = Number(Object.keys(data).map(function (k) { return data[k]; })[0]);
    // Apply random delay to distribute SharePoint API load (prevent 503 errors)
    var delay = getRandomDelay();
    var timeoutKey = "".concat(eventType, "_").concat(eventId);
    var timeout = setTimeout(function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
        var validItem, error_1;
        return tslib_1.__generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, spo.checkValidNewsItem(eventId)];
                case 1:
                    validItem = _a.sent();
                    if (validItem) {
                        switch (eventType) {
                            case 'A':
                                processSocketAddEvent(numberOfNewNewsRef, setSystemMessageVisible);
                                break;
                            case 'U':
                                processSocketUpdateEvent(updateNews);
                                break;
                            default:
                                processSocketErrorEvent(eventId);
                                break;
                        }
                    }
                    return [3 /*break*/, 3];
                case 2:
                    error_1 = _a.sent();
                    utils_1.Logger.getInstance().error('RealTimeNewsFeed, processSocketEvent', error_1);
                    return [3 /*break*/, 3];
                case 3:
                    // Clean up timeout from map after execution
                    pendingTimeoutsRef.current.delete(timeoutKey);
                    return [2 /*return*/];
            }
        });
    }); }, delay);
    // Track timeout for cleanup
    pendingTimeoutsRef.current.set(timeoutKey, timeout);
}
exports.processSocketEvent = processSocketEvent;
/**
* Handles the addition of a new news item by updating the count of new news items
* and setting the system message to be visible.
*
* @param {React.MutableRefObject<number>} numberOfNewNewsRef - A ref that keeps track of the number of new news items.
* @param {Function} setSystemMessageVisible - Function to set the visibility of the system message.
*/
function processSocketAddEvent(numberOfNewNewsRef, setSystemMessageVisible) {
    setSystemMessageVisible(false);
    // Increase the number of new news items which are not yet displayed and shown in the system message
    numberOfNewNewsRef.current++;
    setSystemMessageVisible(true);
}
exports.processSocketAddEvent = processSocketAddEvent;
/**
 * Handles the update of a news item by triggering an update of the news feed.
 * Note: Random delay is already applied in processSocketEvent to distribute load.
 *
 * @param {Function} updateNews - Function that triggers the update of the news feed.
 */
function processSocketUpdateEvent(updateNews) {
    updateNews();
}
/**
* Logs an error when an undefined event type is received from the socket.
*
* @param {number} eventId - The ID of the event that triggered the error.
*/
function processSocketErrorEvent(eventId) {
    utils_1.Logger.getInstance().error("Undefined event-type has been received from socket webapp", eventId);
}
exports.processSocketErrorEvent = processSocketErrorEvent;
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
function getAllData(spo, newsChannelCurrentRef, myNewsGuidRef, newsChannelsRef, pageLanguage, newsCount, setLoading, newsItemsRef, stickyRef, channelsubItemIdRef) {
    return tslib_1.__awaiter(this, void 0, void 0, function () {
        var responsenews, error_2;
        return tslib_1.__generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    setLoading(true);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 4, , 5]);
                    return [4 /*yield*/, getChannelsAndSubscriptions(spo, myNewsGuidRef, newsChannelsRef, pageLanguage, channelsubItemIdRef)];
                case 2:
                    _a.sent();
                    return [4 /*yield*/, spo.getNewsItems(newsChannelCurrentRef.current, myNewsGuidRef.current, newsChannelsRef.current, pageLanguage, newsCount)];
                case 3:
                    responsenews = _a.sent();
                    newsItemsRef.current = responsenews.newsItemData;
                    stickyRef.current = responsenews.sticky;
                    return [3 /*break*/, 5];
                case 4:
                    error_2 = _a.sent();
                    utils_1.Logger.getInstance().error('RealTimeNewsFeed.tsx, getAllData', error_2);
                    newsItemsRef.current = [];
                    return [3 /*break*/, 5];
                case 5:
                    setLoading(false);
                    return [2 /*return*/];
            }
        });
    });
}
exports.getAllData = getAllData;
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
function getChannelsAndSubscriptions(spo, myNewsGuidRef, newsChannelsRef, pageLanguage, channelsubItemIdRef) {
    return tslib_1.__awaiter(this, void 0, void 0, function () {
        var currNewsChannels, newsChannelConfig, allCachedChannels, channels2subItem, newSubItem;
        return tslib_1.__generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    currNewsChannels = [];
                    newsChannelConfig = [];
                    return [4 /*yield*/, spo.getAndCacheAllChannels()];
                case 1:
                    allCachedChannels = _a.sent();
                    return [4 /*yield*/, spo.getSubscribedChannels4CurrentUser()];
                case 2:
                    channels2subItem = _a.sent();
                    if (!(channels2subItem.length > 0)) return [3 /*break*/, 3];
                    channels2subItem[0].pb_Channels.forEach(function (channel) {
                        var newChan = { Channel: [], TermGuid: channel.TermGuid, Subscribed: true, Visible: true, SortOrder: 0 };
                        newsChannelConfig.push(newChan);
                    });
                    // Set the id of the channel subscription item for the current user
                    channelsubItemIdRef.current = channels2subItem[0].Id;
                    return [3 /*break*/, 5];
                case 3: return [4 /*yield*/, spo.addSubscribedChannels4CurrentUser()];
                case 4:
                    newSubItem = _a.sent();
                    // and save this id in the ref
                    channelsubItemIdRef.current = newSubItem.ID;
                    _a.label = 5;
                case 5:
                    // The myNews channel is always available and visible, it shows all news for the channels subscribed by the user
                    currNewsChannels.push({
                        Channel: [{ Language: pageLanguage.Language, Text: utils_1.Utility.getStringTranslation4Locale('myNewsLabel', pageLanguage.Language) }],
                        TermGuid: myNewsGuidRef.current, Subscribed: false, Visible: true, SortOrder: 0
                    });
                    allCachedChannels.forEach(function (channel) {
                        if (!channel.isDeprecated) {
                            var channelLanguages = channel.labels.map(function (label) { return ({ Language: label.languageTag, Text: label.name }); });
                            var currentNewsChannel = newsChannelConfig.find(function (newsChannel) { return newsChannel.TermGuid === channel.id; });
                            if (currentNewsChannel || newsChannelConfig.length == 0) {
                                currNewsChannels.push({ Channel: channelLanguages, TermGuid: channel.id, Subscribed: true, Visible: true, SortOrder: 0 });
                            }
                            else {
                                currNewsChannels.push({ Channel: channelLanguages, TermGuid: channel.id, Subscribed: false, Visible: true, SortOrder: 0 });
                            }
                        }
                    });
                    // Update the ref with all available channels
                    newsChannelsRef.current = currNewsChannels;
                    return [2 /*return*/];
            }
        });
    });
}
exports.getChannelsAndSubscriptions = getChannelsAndSubscriptions;
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
function changeChannelSettings(spo, newsChannelsRef, item, isChecked, channelsubItemIdRef) {
    var channels = [];
    // Recreate the channel settings based on the user's interaction
    if (isChecked) {
        newsChannelsRef.current.forEach(function (channel) {
            if (channel.Subscribed) {
                channels.push({ termName: channel.Channel[0].Text, termGUID: channel.TermGuid });
            }
            else {
                if (channel.TermGuid === item.TermGuid) {
                    channel.Subscribed = true;
                    channels.push({ termName: channel.Channel[0].Text, termGUID: channel.TermGuid });
                }
            }
        });
    }
    else {
        newsChannelsRef.current.forEach(function (channel) {
            if (channel.Subscribed) {
                if (channel.TermGuid != item.TermGuid) {
                    channels.push({ termName: channel.Channel[0].Text, termGUID: channel.TermGuid });
                }
                else {
                    channel.Subscribed = false;
                }
            }
        });
    }
    // Update the channel settings for the current user
    spo.updateMultiMeta(channels, (0, utils_1.getRootEnv)().config.spfxSubscribedChannelsListTitle, 'pb_Channels', channelsubItemIdRef.current).then().catch(function (error) {
        utils_1.Logger.getInstance().error('CHANGE_CHANNEL_SETTINGS', error);
    });
}
exports.changeChannelSettings = changeChannelSettings;
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
function getAvailableItems(spo, newsChannelCurrentRef, myNewsGuidRef, newsChannelsRef, pageLanguage, newsCount, newsItemsRef, stickyRef, setLoading, logger) {
    return tslib_1.__awaiter(this, void 0, void 0, function () {
        var responsenews, error_3;
        return tslib_1.__generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    setLoading(true);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, spo.getNewsItems(newsChannelCurrentRef.current, myNewsGuidRef.current, newsChannelsRef.current, pageLanguage, newsCount)];
                case 2:
                    responsenews = _a.sent();
                    newsItemsRef.current = responsenews.newsItemData;
                    stickyRef.current = responsenews.sticky;
                    return [3 /*break*/, 4];
                case 3:
                    error_3 = _a.sent();
                    logger.getInstance().error('GET_NEWS_GENERIC', error_3);
                    newsItemsRef.current = [];
                    return [3 /*break*/, 4];
                case 4:
                    setLoading(false);
                    return [2 /*return*/];
            }
        });
    });
}
exports.getAvailableItems = getAvailableItems;
/**
* Generates the dropdown options for selecting a news channel, based on the user's current subscriptions.
*
* @param {React.MutableRefObject<Array>} newsChannelsRef - Ref holding the array of news channels.
* @param {React.MutableRefObject<string>} myNewsGuidRef - Ref holding the GUID of the user's news channel.
* @param {object} pageLanguage - The language representation object for the current page.
*
* @returns {Array} An array of dropdown options for selecting a news channel.
*/
function getChannelDD(newsChannelsRef, myNewsGuidRef, pageLanguage) {
    var retVal = [];
    var currNewsChannels = newsChannelsRef.current;
    currNewsChannels.map(function (newschannel) {
        if (newschannel.TermGuid == myNewsGuidRef.current || newschannel.Subscribed) {
            retVal.push({ key: newschannel.TermGuid, text: utils_1.Utility.getChannelText(pageLanguage, newschannel) });
        }
    });
    return retVal;
}
exports.getChannelDD = getChannelDD;
//# sourceMappingURL=realtimenewsfeed.js.map