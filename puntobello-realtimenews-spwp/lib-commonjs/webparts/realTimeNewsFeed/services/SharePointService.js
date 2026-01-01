"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
// SPFx Core Libraries
var sp_core_library_1 = require("@microsoft/sp-core-library");
var sp_page_context_1 = require("@microsoft/sp-page-context");
// PnP SP Libraries
require("@pnp/sp/webs");
require("@pnp/sp/site-users/web");
require("@pnp/sp/lists");
require("@pnp/sp/items");
require("@pnp/sp/profiles");
require("@pnp/sp/regional-settings/web");
var sp_1 = require("@pnp/sp");
var core_1 = require("@pnp/core");
// IItemAddResult has been removed in PnP v4, using built-in types
// import { IItemAddResult } from "@pnp/sp/items";
// PnP Graph Libraries for taxonomy
require("@pnp/graph/taxonomy");
var graph_1 = require("@pnp/graph");
// IOrderedTermInfo interface may have changed in PnP v4
// Using any[] for now to preserve functionality
// import { IOrderedTermInfo } from "@pnp/graph/taxonomy";
var sp_http_1 = require("@microsoft/sp-http");
// Utility Libraries
var utils_1 = require("../utils");
var lcid = tslib_1.__importStar(require("lcid"));
/**
 * SharePointService class provides methods to interact with SharePoint data, including channels, user subscriptions,
 * news items, and language settings. It implements the ISharePointService interface.
 */
var SharePointService = /** @class */ (function () {
    /**
     * Initializes a new instance of the SharePointService class.
     * @param {ServiceScope} serviceScope - The service scope used to resolve dependencies.
     */
    function SharePointService(serviceScope) {
        var _this = this;
        /**
         * Retrieves the page context for a specific list item in SharePoint.
         * This method is used to determine the language settings for the page, specifically when running in a multilingual setup.
         * If we are not running in a multilingual setup, it will automatically throw an error (ODATA__ fields not present) which should be caught and handled by the caller.
         * @param {string} listId - The ID of the SharePoint list.
         * @param {number} listItemId - The ID of the list item.
         * @returns {Promise<IPageContext>} A promise that resolves with the page context of the specified list item.
         */
        this.getPageContext = function (listId, listItemId) { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            var context;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.sp.web.lists.getById(listId)
                            .items
                            .getById(listItemId)
                            .select('OData__SPIsTranslation', 'OData__SPTranslationLanguage', 'OData__SPTranslationSourceItemId')()];
                    case 1:
                        context = _a.sent();
                        return [2 /*return*/, context];
                }
            });
        }); };
        /**
         * Calculates the language settings for a SharePoint page based on its context.
         * @param {string} listId - The ID of the SharePoint list.
         * @param {number} listItemId - The ID of the list item.
         * @param {number} defaultLanguage - The default language LCID (Locale ID).
         * @returns {Promise<ILanguageRepresentation>} A promise that resolves with the language representation.
         */
        this.calculateLanguage = function (listId, listItemId, defaultLanguage) { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            var pageContext, languageData, error_1;
            var _a, _b;
            return tslib_1.__generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        pageContext = null;
                        languageData = {
                            lcid: 0,
                            Language: '',
                            LanguageLC: '',
                            LanguageDashed: '',
                            LanguageDashedLC: '',
                        };
                        _c.label = 1;
                    case 1:
                        _c.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.getPageContext(listId, listItemId)];
                    case 2:
                        pageContext = _c.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        error_1 = _c.sent();
                        this.logger.info("calculateLanguage, getPageContext returned an error, probably not running in a multilingual setup, defaulting to web language", error_1);
                        return [3 /*break*/, 4];
                    case 4:
                        if (!pageContext || !pageContext.OData__SPIsTranslation || !pageContext.OData__SPTranslationLanguage) {
                            // Not running in a multilingual setup
                            // Get language from web
                            languageData.lcid = defaultLanguage;
                            languageData.Language = (_a = lcid.from(defaultLanguage)) !== null && _a !== void 0 ? _a : '';
                            languageData.LanguageLC = languageData.Language.toLowerCase();
                            languageData.LanguageDashed = languageData.Language.replace('_', '-');
                            languageData.LanguageDashedLC = languageData.LanguageLC.replace('_', '-');
                            return [2 /*return*/, languageData];
                        }
                        // Page is a translation
                        // Get language from page property
                        languageData.Language = pageContext.OData__SPTranslationLanguage.replace("-", "_").toLowerCase().replace(/(^\w{2})/, function (match) { return match.toLowerCase(); }).replace(/(_\w{2})$/, function (match) { return match.toUpperCase(); });
                        languageData.lcid = (_b = lcid.to(languageData.Language)) !== null && _b !== void 0 ? _b : 0;
                        languageData.LanguageLC = languageData.Language.toLowerCase();
                        languageData.LanguageDashed = languageData.Language.replace('_', '-');
                        languageData.LanguageDashedLC = languageData.LanguageLC.replace('_', '-');
                        return [2 /*return*/, languageData];
                }
            });
        }); };
        this.logger = utils_1.Logger.getInstance();
        serviceScope.whenFinished(function () {
            _this.pageContext = serviceScope.consume(sp_page_context_1.PageContext.serviceKey);
            _this.storage = new core_1.PnPClientStorage();
            _this.rootEnv = (0, utils_1.getRootEnv)();
            // Note: SP instance will be initialized later with the full context via setContext()
            // Initialize Graph API for termStore access
            var aadTokenProviderFactory = serviceScope.consume(sp_http_1.AadTokenProviderFactory.serviceKey);
            _this.graph = (0, graph_1.graphfi)().using((0, graph_1.SPFx)({ aadTokenProviderFactory: aadTokenProviderFactory }));
        });
    }
    /**
     * Sets the SPFx context and initializes the PnP SP instance.
     * This must be called before using any SP operations.
     * @param {any} context - The full SPFx context (e.g., WebPartContext)
     */
    SharePointService.prototype.setContext = function (context) {
        this.spfxContext = context;
        // In PnP v4, SPFx behavior factory expects the full context object
        this.sp = (0, sp_1.spfi)().using((0, sp_1.SPFx)(context));
    };
    /**
     * Retrieves and caches all available channels from the SharePoint Term Store.
     * Termstore guids are fix for PuntoBello
     * @returns {Promise<IOrderedTermInfo[]>} A promise that resolves with an array of ordered term information.
     */
    SharePointService.prototype.getAndCacheAllChannels = function () {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var termStoreGuid4Channels;
            var _this = this;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        termStoreGuid4Channels = (0, utils_1.getRootEnv)().config.spfxTermstoreChannelGuid;
                        return [4 /*yield*/, this.storage.local.getOrPut("pb_channels_".concat(termStoreGuid4Channels), function () {
                                return _this.graph.termStore.sets.getById("".concat(termStoreGuid4Channels)).getAllChildrenAsTree();
                            }, (0, core_1.dateAdd)(new Date(), 'hour', 12))];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /**
     * Gets the subscribed channels for the current user from SharePoint.
     * @returns {Promise<IChannels2SubsItem[]>} A promise that resolves with an array of subscribed channels.
     */
    SharePointService.prototype.getSubscribedChannels4CurrentUser = function () {
        var _a;
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            return tslib_1.__generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this.sp.web.lists.getByTitle((_a = this.rootEnv.config.spfxSubscribedChannelsListTitle) !== null && _a !== void 0 ? _a : '').items
                            .filter("pb_Subscriber eq '" + this.pageContext.legacyPageContext.userId + "'")
                            .select("Id", "pb_Channels").top(1)()];
                    case 1: return [2 /*return*/, _b.sent()];
                }
            });
        });
    };
    /**
     * Adds a new subscribed channels entry for the current user in SharePoint.
     * @returns {Promise<IItemAddResult>} A promise that resolves with the result of the item addition.
     */
    SharePointService.prototype.addSubscribedChannels4CurrentUser = function () {
        var _a;
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            return tslib_1.__generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this.sp.web.lists.getByTitle((_a = this.rootEnv.config.spfxSubscribedChannelsListTitle) !== null && _a !== void 0 ? _a : '').items.add({
                            Title: this.pageContext.legacyPageContext.DisplayName,
                            pb_SubscriberId: this.pageContext.legacyPageContext.userId
                        })];
                    case 1: return [2 /*return*/, _b.sent()];
                }
            });
        });
    };
    /**
     * Retrieves news items for the specified channel or channels in SharePoint.
     * @param {string} newsChannelCurrent - The current news channel.
     * @param {string} newsGuid - The GUID of the news.
     * @param {IChannels2SubscriptionItem[]} newsChannels - An array of subscription items for the news channels.
     * @param {ILanguageRepresentation} pageLanguage - The language representation for the page.
     * @param {number} newsCount - The number of news items to retrieve.
     * @returns {Promise<INewsItemsResult>} A promise that resolves with the news items result.
     */
    SharePointService.prototype.getNewsItems = function (newsChannelCurrent, newsGuid, newsChannels, pageLanguage, newsCount) {
        var _this = this;
        var p = new Promise(function (resolve, reject) {
            var _a;
            var newsResult = {
                newsItemData: [],
                sticky: false
            };
            // build filter for channels
            var channelFilter;
            if (newsChannelCurrent === newsGuid) {
                channelFilter = _this.filterBuilder("pb_Channels", newsChannels
                    .filter(function (channel) { if (channel.Subscribed && channel.TermGuid != newsGuid)
                    return channel; })
                    .map(function (channel) { return channel.TermGuid; }), false);
            }
            else {
                channelFilter = _this.filterBuilder("pb_Channels", Array.from(new Set([newsChannelCurrent])), false);
            }
            var currDate = _this.toISOStringWithTimezone(new Date());
            var publishingDatesFilter = "pb_PublishedFrom le datetime'".concat(currDate, "' and (pb_PublishedTo ge datetime'").concat(currDate, "' or pb_PublishedTo eq null)");
            var filterQuery = channelFilter + " and (pb_Language eq '" + pageLanguage.LanguageDashedLC + "' or pb_Language eq '" + pageLanguage.lcid + "') and " + publishingDatesFilter;
            var filterQuerySocket = channelFilter + " and (pb_Language eq '" + pageLanguage.LanguageDashedLC + "' or pb_Language eq '" + pageLanguage.lcid + "') and ";
            _this.filterQuery4Socket = filterQuerySocket;
            // Check if we have a sticky news which sticky date has been reached
            newsResult.sticky = false;
            var filterQuerySticky = filterQuery + " and (pb_Sticky eq 1 and pb_StickyDate le datetime'".concat(currDate, "')");
            var filterQueryWithoutSticky = filterQuery + " and ((pb_Sticky eq 0 or pb_Sticky eq null) or (pb_Sticky eq 1 and pb_StickyDate ge datetime'".concat(currDate, "'))");
            _this.sp.web.lists.getById((_a = _this.rootEnv.config.spfxRealtimenewsListId) !== null && _a !== void 0 ? _a : '').items.filter(filterQuerySticky).top(1)().then(function (item) {
                var _a;
                if (item.length > 0) {
                    newsResult.sticky = true;
                    newsResult.newsItemData.push(item[0]);
                }
                else {
                    newsResult.sticky = false;
                }
                _this.sp.web.lists.getById((_a = _this.rootEnv.config.spfxRealtimenewsListId) !== null && _a !== void 0 ? _a : '').items.filter(filterQueryWithoutSticky).orderBy("pb_PublishedFrom", false).top(newsCount)().then(function (items) {
                    var _a;
                    (_a = newsResult.newsItemData).push.apply(_a, items);
                    resolve(newsResult);
                }).catch(function (error) {
                    _this.logger.error('GET_NEWS_WITH_STICKY', error);
                    reject(error);
                });
            });
        });
        return p;
    };
    /**
     * Checks if a news item is valid based on its ID.
     * @param {number} id - The ID of the news item.
     * @returns {Promise<boolean>} A promise that resolves with a boolean indicating whether the news item is valid.
     */
    SharePointService.prototype.checkValidNewsItem = function (id) {
        var _a;
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var currDate, publishingDatesFilter, currentFilter, item;
            return tslib_1.__generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        currDate = this.toISOStringWithTimezone(new Date());
                        publishingDatesFilter = "pb_PublishedFrom le datetime'".concat(currDate, "' and (pb_PublishedTo ge datetime'").concat(currDate, "' or pb_PublishedTo eq null)");
                        currentFilter = this.filterQuery4Socket + publishingDatesFilter + ' and (Id eq ' + id.toString() + ')';
                        return [4 /*yield*/, this.sp.web.lists.getById((_a = this.rootEnv.config.spfxRealtimenewsListId) !== null && _a !== void 0 ? _a : '').items.filter(currentFilter).top(1)()];
                    case 1:
                        item = _b.sent();
                        if (item)
                            return [2 /*return*/, true];
                        return [2 /*return*/, false];
                }
            });
        });
    };
    /**
     * Updates multiple metadata fields for a SharePoint list item.
     * @param {any[]} terms - An array of terms representing the metadata to update.
     * @param {string} listName - The name of the SharePoint list.
     * @param {string} fieldName - The name of the metadata field to update.
     * @param {number} itemId - The ID of the list item to update.
     * @returns {Promise<any>} A promise that resolves with the result of the update operation.
     */
    SharePointService.prototype.updateMultiMeta = function (terms, listName, fieldName, itemId) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var list, termsString, updateValue;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.sp.web.lists.getByTitle(listName)];
                    case 1:
                        list = _a.sent();
                        termsString = '';
                        terms.forEach(function (term) {
                            termsString += "".concat(term.termName, "|").concat(term.termGUID, ";");
                        });
                        updateValue = { FieldName: fieldName, FieldValue: termsString };
                        return [4 /*yield*/, list.items.getById(itemId).validateUpdateListItem([updateValue])];
                    case 2: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /**
     * Builds a filter query string for SharePoint list items.
     * @param {string} fieldName - The name of the field to filter by.
     * @param {string[]} guids - An array of GUIDs to include in the filter.
     * @param {boolean} truncate - Whether to truncate the GUIDs before building the filter.
     * @returns {string} A filter query string.
     */
    SharePointService.prototype.filterBuilder = function (fieldName, guids, truncate) {
        var retVal;
        if (truncate) {
            guids.forEach(function (guid, i) {
                guids[i] = guids[i].split('-')[0];
            });
        }
        if (guids.length === 1) {
            return "substringof('" + guids[0] + "'," + fieldName + ")";
        }
        else {
            retVal = guids.join("'," + fieldName + ") or substringof('");
            return "(substringof('" + retVal + "'," + fieldName + "))";
        }
    };
    /**
     * Converts a date to an ISO string with timezone information.
     * @param {Date} date - The date to convert.
     * @returns {string} An ISO string representing the date with timezone information.
     */
    SharePointService.prototype.toISOStringWithTimezone = function (date) {
        var tzOffset = -date.getTimezoneOffset();
        var diff = tzOffset >= 0 ? '+' : '-';
        var pad = function (n) {
            var str = "".concat(Math.floor(Math.abs(n)));
            return str.length < 2 ? '0' + str : str;
        };
        return date.getFullYear() +
            '-' + pad(date.getMonth() + 1) +
            '-' + pad(date.getDate()) +
            'T' + pad(date.getHours()) +
            ':' + pad(date.getMinutes()) +
            ':' + pad(date.getSeconds()) +
            diff + pad(tzOffset / 60) +
            ':' + pad(tzOffset % 60);
    };
    SharePointService.serviceKey = sp_core_library_1.ServiceKey.create('SPFx:SharePointService', SharePointService);
    return SharePointService;
}());
exports.default = SharePointService;
//# sourceMappingURL=SharePointService.js.map