"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RealTimeNewsFeed = void 0;
var tslib_1 = require("tslib");
// React imports for building components and handling state, refs, and effects
var React = tslib_1.__importStar(require("react"));
var react_1 = require("react");
// Fluent UI components and styles for the UI layout and spinner
var react_2 = require("@fluentui/react");
// Socket.IO client for real-time communication
var socket_io_client_1 = tslib_1.__importDefault(require("socket.io-client"));
// Component-specific styles
var RealTimeNewsFeed_module_scss_1 = tslib_1.__importDefault(require("../RealTimeNewsFeed.module.scss"));
// Component imports for various parts of the RealTimeNewsFeed feature
var CommandBarNewsFeed_1 = require("./CommandBarNewsFeed");
var StickyItem_1 = require("./StickyItem");
var ChannelSettings_1 = require("./ChannelSettings");
var NewsItem_1 = require("./NewsItem");
var SystemMessage_1 = require("./SystemMessage");
// Utility functions for UI and environment configuration
var utils_1 = require("../utils");
// Utility functions for real-time news feed processing and interactions
var utils_2 = require("../utils");
// SharePoint service for interacting with SharePoint APIs
var SharePointService_1 = tslib_1.__importDefault(require("../services/SharePointService"));
// Context for managing and accessing application-wide state
var AppContext_1 = require("../contexts/AppContext");
/**
 * The `RealTimeNewsFeed` component is responsible for rendering a real-time news feed in a SharePoint web part.
 * It connects to a WebSocket server, listens for updates, and manages the state and display of news items.
 *
 * This component leverages the SharePoint Framework (SPFx) and Fluent UI for styling and UI components.
 * It also makes use of context to access necessary services and settings, such as logging and theming.
 */
function RealTimeNewsFeed() {
    var _a, _b;
    // Destructuring context values using the custom hook
    var _c = (0, AppContext_1.useAppContext)(), context = _c.context, logger = _c.logger, pageLanguage = _c.pageLanguage, newsCount = _c.newsCount, themeVariant = _c.themeVariant;
    // Consume the SharePoint service from the service scope
    var spo = context.serviceScope.consume(SharePointService_1.default.serviceKey);
    // Retrieve environment settings
    var rootEnv = (0, utils_1.getRootEnv)();
    // Refs to maintain stateful values between renders without causing re-renders
    // Holds the fake GUID for the my news channel which shows all news for the channels subscribed by the user
    var myNewsGuidRef = (0, react_1.useRef)("00000000-0000-0000-0000-000000000000");
    // Holds the current selected news channel, is initialzed with my News
    var newsChannelCurrentRef = (0, react_1.useRef)(myNewsGuidRef.current);
    // Holds all available news channels
    var newsChannelsRef = (0, react_1.useRef)([]);
    // List item with the channel configuration for the current user
    var channelsubItemIdRef = (0, react_1.useRef)();
    // Sticky news present or not
    var stickyRef = (0, react_1.useRef)(false);
    // All news items to be showed
    var newsItemsRef = (0, react_1.useRef)([]);
    // Number of new news items which are not yet displayed and shown in the system message
    var numberOfNewNewsRef = (0, react_1.useRef)(0);
    // Track pending timeouts for cleanup on unmount (prevents memory leaks and stale callbacks)
    var pendingTimeoutsRef = (0, react_1.useRef)(new Map());
    // State variables to manage loading, modal visibility, and system message visibility
    var _d = (0, react_1.useState)(true), loading = _d[0], setLoading = _d[1];
    var _e = (0, react_1.useState)(false), modalVisible = _e[0], setModalVisible = _e[1];
    var _f = (0, react_1.useState)(false), systemMessageVisible = _f[0], setSystemMessageVisible = _f[1];
    // Combined styles incorporating theming and environment-specific styles
    var combinedStyles = Object.assign({
        backgroundColor: (_a = themeVariant === null || themeVariant === void 0 ? void 0 : themeVariant.semanticColors) === null || _a === void 0 ? void 0 : _a.bodyBackground,
        color: (_b = themeVariant === null || themeVariant === void 0 ? void 0 : themeVariant.semanticColors) === null || _b === void 0 ? void 0 : _b.bodyText
    }, (0, utils_1.getRootEnv)().css);
    // useEffect hook to handle socket connections and data fetching on component mount
    (0, react_1.useEffect)(function () {
        var _a, _b;
        // Establish a WebSocket connection
        var socket = (0, socket_io_client_1.default)((_a = rootEnv.config.spfxSocketUrl) !== null && _a !== void 0 ? _a : '', { transports: ["websocket"], timeout: +((_b = (0, utils_1.getRootEnv)().config.spfxSocketTimeoutInMs) !== null && _b !== void 0 ? _b : 0) });
        // Event listeners for WebSocket connection lifecycle and data events
        socket.on("connect", function () {
            logger.info('Socket Connect, SocketId:' + socket.id);
        });
        // Process socket event received from the webapp server
        socket.on("nd", function (data) {
            (0, utils_2.processSocketEvent)(data, spo, numberOfNewNewsRef, setSystemMessageVisible, pendingTimeoutsRef, utils_2.processSocketAddEvent, utils_2.processSocketErrorEvent, updateNews);
        });
        socket.on("disconnect", function () {
            logger.info('Socket Disconnect, SocketId:' + socket.id);
        });
        socket.on("connect_error", function (socketerr) {
            logger.warn('Socket_error SocketId' + socket.id + 'error ' + socketerr);
        });
        // Fetch initial data for the news feed
        (0, utils_2.getAllData)(spo, newsChannelCurrentRef, myNewsGuidRef, newsChannelsRef, pageLanguage, newsCount, setLoading, newsItemsRef, stickyRef, channelsubItemIdRef);
        // Clean up the socket connection and pending timeouts when the component unmounts
        return function () {
            socket.off();
            // Clear all pending timeouts to prevent memory leaks and stale callbacks
            pendingTimeoutsRef.current.forEach(function (timeout) { return clearTimeout(timeout); });
            pendingTimeoutsRef.current.clear();
        };
    }, []);
    // Function to update the news feed when new items are available
    function updateNews() {
        setSystemMessageVisible(false);
        numberOfNewNewsRef.current = 0;
        (0, utils_2.getAvailableItems)(spo, newsChannelCurrentRef, myNewsGuidRef, newsChannelsRef, pageLanguage, newsCount, newsItemsRef, stickyRef, setLoading, logger);
    }
    // Function to handle channel changes and update the displayed news items
    function channelChange(ddKey) {
        newsChannelCurrentRef.current = String(ddKey !== null && ddKey !== void 0 ? ddKey : '');
        (0, utils_2.getAvailableItems)(spo, newsChannelCurrentRef, myNewsGuidRef, newsChannelsRef, pageLanguage, newsCount, newsItemsRef, stickyRef, setLoading, logger);
    }
    // Function to show the channel settings modal
    function showChannelSettings() {
        setModalVisible(true);
    }
    // Function to hide the channel settings modal and refresh the news items
    function hideChannelSettings() {
        (0, utils_2.getAvailableItems)(spo, newsChannelCurrentRef, myNewsGuidRef, newsChannelsRef, pageLanguage, newsCount, newsItemsRef, stickyRef, setLoading, logger);
        setModalVisible(false);
    }
    return (React.createElement(React.Fragment, null,
        loading && React.createElement(react_2.Spinner, { label: utils_1.Utility.getStringTranslation4Locale('loading', pageLanguage.Language) }),
        !loading &&
            React.createElement("div", { className: RealTimeNewsFeed_module_scss_1.default.newsFeed, style: combinedStyles },
                systemMessageVisible && React.createElement(SystemMessage_1.SystemMessage, { Title: utils_1.Utility.getStringTranslation4Locale('NewNewsAvailableLabel', pageLanguage.Language), buttonUpdateNewsClicked: updateNews }),
                stickyRef.current &&
                    React.createElement("div", { className: RealTimeNewsFeed_module_scss_1.default.highlightContainer },
                        React.createElement(StickyItem_1.StickyItem, { NewsUrl: newsItemsRef.current[0].pb_NewsUrl.Url, ImageUrl: newsItemsRef.current[0].pb_ImageUrl, NewsTitle: newsItemsRef.current[0].Title, PublishedFrom: (0, utils_1.getEditedDate)(newsItemsRef.current[0].pb_PublishedFrom), NewsHeader: newsItemsRef.current[0].pb_Header })),
                React.createElement(ChannelSettings_1.ChannelSettings, { myNewsGuid: myNewsGuidRef.current, channelsConfig: newsChannelsRef.current, modalVisible: modalVisible, modalSettingsTitle: utils_1.Utility.getStringTranslation4Locale('modalSettingsTitle', pageLanguage.Language), closeModal: hideChannelSettings, changeChannelSettings: function (item, ev, isChecked) { return (0, utils_2.changeChannelSettings)(spo, newsChannelsRef, item, isChecked, channelsubItemIdRef); } }),
                React.createElement(CommandBarNewsFeed_1.CommandBarNewsFeed, { channelDropdown: (0, utils_2.getChannelDD)(newsChannelsRef, myNewsGuidRef, pageLanguage), selectedKey: newsChannelCurrentRef.current, channelDropdownChanged: channelChange, channelSettingsModalClicked: showChannelSettings }),
                newsItemsRef.current.length > 0 ?
                    React.createElement(react_2.Stack, { tokens: { childrenGap: 14 }, className: RealTimeNewsFeed_module_scss_1.default.newsletterList }, newsItemsRef.current.map(function (currnews, index) { return ((index == 0 && stickyRef.current) ? React.createElement(React.Fragment, null) :
                        React.createElement(NewsItem_1.NewsItem, { key: currnews.Id || index, NewsUrl: currnews.pb_NewsUrl.Url, ImageUrl: currnews.pb_ImageUrl, NewsTitle: currnews.Title, PublishedFrom: (0, utils_1.getEditedDate)(currnews.pb_PublishedFrom), NewsHeader: currnews.pb_Header })); }))
                    : React.createElement("h2", null, utils_1.Utility.getStringTranslation4Locale('noNewsText', pageLanguage.Language)))));
}
exports.RealTimeNewsFeed = RealTimeNewsFeed;
//# sourceMappingURL=RealTimeNewsFeed.js.map