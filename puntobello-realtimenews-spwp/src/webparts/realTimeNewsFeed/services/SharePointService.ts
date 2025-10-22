// SPFx Core Libraries
import { ServiceKey, ServiceScope } from "@microsoft/sp-core-library";
import { PageContext } from "@microsoft/sp-page-context";

// PnP SP Libraries
import "@pnp/sp/webs";
import "@pnp/sp/site-users/web";
import "@pnp/sp/lists";
import "@pnp/sp/items";
import "@pnp/sp/profiles";
import "@pnp/sp/regional-settings/web";
import { SPFI, spfi, SPFx } from "@pnp/sp";
import { dateAdd, PnPClientStorage } from "@pnp/core";
// IItemAddResult has been removed in PnP v4, using built-in types
// import { IItemAddResult } from "@pnp/sp/items";

// PnP Graph Libraries for taxonomy
import "@pnp/graph/taxonomy";
import { graphfi, GraphFI, SPFx as GraphSPFx } from "@pnp/graph";
// IOrderedTermInfo interface may have changed in PnP v4
// Using any[] for now to preserve functionality
// import { IOrderedTermInfo } from "@pnp/graph/taxonomy";
import { AadTokenProviderFactory } from "@microsoft/sp-http";

// Utility Libraries
import { Logger, getRootEnv } from '../utils';
import * as lcid from "lcid";

// Models and Interfaces
import { 
    INewsItemsResult, 
    INewsItemData, 
    ILanguageRepresentation, 
    IPageContext, 
    IRootEnv, 
    IChannels2SubsItem, 
    IChannels2SubscriptionItem 
} from "../models";
import { log } from "console";

/**
 * Interface representing the SharePoint Service.
 * This interface defines methods for interacting with SharePoint data, such as retrieving and caching channels,
 * getting news items, managing user subscriptions, and handling multilingual support.
 */
export interface ISharePointService {
    /**
     * Sets the SPFx context and initializes the PnP SP instance.
     * @param {any} context - The full SPFx context (e.g., WebPartContext)
     */
    setContext(context: any): void;

    /**
     * Retrieves and caches all available channels from SharePoint Term Store.
     * @returns {Promise<IOrderedTermInfo[]>} A promise that resolves with an array of ordered term information.
     */
    getAndCacheAllChannels(): Promise<any[]>;

    /**
     * Gets the subscribed channels for the current user from SharePoint.
     * @returns {Promise<IChannels2SubsItem[]>} A promise that resolves with an array of subscribed channels.
     */
    getSubscribedChannels4CurrentUser(): Promise<IChannels2SubsItem[]>;

    /**
     * Retrieves the page context for a specific list item in SharePoint.
     * This method is used to determine the language settings for the page, specifically when running in a multilingual setup.
     * If we are not running in a multilingual setup, it will automatically throw an error (ODATA__ fields not present) which should be caught and handled by the caller.
     * @param {string} listId - The ID of the SharePoint list.
     * @param {number} listItemId - The ID of the list item.
     * @returns {Promise<IPageContext>} A promise that resolves with the page context of the specified list item.
     */
    getPageContext(listId: string, listItemId: number): Promise<IPageContext>;

    /**
     * Adds a new subscribed channels entry for the current user in SharePoint.
     * @returns {Promise<IItemAddResult>} A promise that resolves with the result of the item addition.
     */
    addSubscribedChannels4CurrentUser(): Promise<any>;

    /**
     * Retrieves news items for the specified channel or channels in SharePoint.
     * @param {string} newsChannelCurrent - The current news channel.
     * @param {string} newsGuid - The GUID of the news.
     * @param {IChannels2SubscriptionItem[]} newsChannels - An array of subscription items for the news channels.
     * @param {ILanguageRepresentation} pageLanguage - The language representation for the page.
     * @param {number} newsCount - The number of news items to retrieve.
     * @returns {Promise<INewsItemsResult>} A promise that resolves with the news items result.
     */
    getNewsItems(newsChannelCurrent: string, newsGuid: string, newsChannels: IChannels2SubscriptionItem[], pageLanguage: ILanguageRepresentation, newsCount: number): Promise<INewsItemsResult>;

    /**
     * Checks if a news item is valid based on its ID.
     * @param {number} id - The ID of the news item.
     * @returns {Promise<boolean>} A promise that resolves with a boolean indicating whether the news item is valid.
     */
    checkValidNewsItem(id: number): Promise<boolean>;

    /**
     * Updates multiple metadata fields for a SharePoint list item.
     * @param {any[]} terms - An array of terms representing the metadata to update.
     * @param {string} listName - The name of the SharePoint list.
     * @param {string} fieldName - The name of the metadata field to update.
     * @param {number} itemId - The ID of the list item to update.
     * @returns {Promise<any>} A promise that resolves with the result of the update operation.
     */
    updateMultiMeta(terms: any[], listName: string, fieldName: string, itemId: number): Promise<any>;

    /**
     * Calculates the language settings for a SharePoint page based on its context.
     * @param {string} listId - The ID of the SharePoint list.
     * @param {number} listItemId - The ID of the list item.
     * @param {number} defaultLanguage - The default language LCID (Locale ID).
     * @returns {Promise<ILanguageRepresentation>} A promise that resolves with the language representation.
     */
    calculateLanguage(listId: string, listItemId: number, defaultLanguage: number): Promise<ILanguageRepresentation>;

    /** 
     * A filter query string used for socket operations.
     * @type {string}
     */
    filterQuery4Socket: string;

    /** 
     * The SharePoint Framework Interface instance.
     * @type {SPFI}
     */
    sp: SPFI;
}

/**
 * SharePointService class provides methods to interact with SharePoint data, including channels, user subscriptions,
 * news items, and language settings. It implements the ISharePointService interface.
 */
export default class SharePointService implements ISharePointService {
    public static readonly serviceKey: ServiceKey<ISharePointService> =
        ServiceKey.create<ISharePointService>('SPFx:SharePointService', SharePointService);

    private storage: PnPClientStorage;
    private pageContext: PageContext;
    private logger: Logger;
    private rootEnv: IRootEnv;
    public filterQuery4Socket: string;
    public sp: SPFI;
    private graph: GraphFI;
    private spfxContext: any; // Store the full SPFx context

    /**
     * Initializes a new instance of the SharePointService class.
     * @param {ServiceScope} serviceScope - The service scope used to resolve dependencies.
     */
    constructor(serviceScope: ServiceScope) {
        this.logger = Logger.getInstance();

        serviceScope.whenFinished(() => {
            this.pageContext = serviceScope.consume(PageContext.serviceKey);
            this.storage = new PnPClientStorage();
            this.rootEnv = getRootEnv();

            // Note: SP instance will be initialized later with the full context via setContext()
            // Initialize Graph API for termStore access
            const aadTokenProviderFactory = serviceScope.consume(AadTokenProviderFactory.serviceKey);
            this.graph = graphfi().using(GraphSPFx({aadTokenProviderFactory: aadTokenProviderFactory}));
        });
    }

    /**
     * Sets the SPFx context and initializes the PnP SP instance.
     * This must be called before using any SP operations.
     * @param {any} context - The full SPFx context (e.g., WebPartContext)
     */
    public setContext(context: any): void {
        this.spfxContext = context;
        // In PnP v4, SPFx behavior factory expects the full context object
        this.sp = spfi().using(SPFx(context));
    }

    /**
     * Retrieves the page context for a specific list item in SharePoint.
     * This method is used to determine the language settings for the page, specifically when running in a multilingual setup.
     * If we are not running in a multilingual setup, it will automatically throw an error (ODATA__ fields not present) which should be caught and handled by the caller.
     * @param {string} listId - The ID of the SharePoint list.
     * @param {number} listItemId - The ID of the list item.
     * @returns {Promise<IPageContext>} A promise that resolves with the page context of the specified list item.
     */
    public getPageContext = async (listId: string, listItemId: number): Promise<IPageContext> => {
        const context: IPageContext = await this.sp.web.lists.getById(listId)
            .items
            .getById(listItemId)
            .select(
                'OData__SPIsTranslation',
                'OData__SPTranslationLanguage',
                'OData__SPTranslationSourceItemId')();
        return context;
    }

    /**
     * Retrieves and caches all available channels from the SharePoint Term Store.
     * Termstore guids are fix for PuntoBello
     * @returns {Promise<IOrderedTermInfo[]>} A promise that resolves with an array of ordered term information.
     */
    public async getAndCacheAllChannels(): Promise<any[]> {
        const termStoreGuid4Channels = getRootEnv().config.spfxTermstoreChannelGuid;
        return await this.storage.local.getOrPut<any[]>(`pb_channels_${termStoreGuid4Channels}`, () => {
            return this.graph.termStore.sets.getById(`${termStoreGuid4Channels}`).getAllChildrenAsTree();
        }, dateAdd(new Date(), 'hour', 12));
    }

    /**
     * Gets the subscribed channels for the current user from SharePoint.
     * @returns {Promise<IChannels2SubsItem[]>} A promise that resolves with an array of subscribed channels.
     */
    public async getSubscribedChannels4CurrentUser(): Promise<IChannels2SubsItem[]> {
        return await this.sp.web.lists.getByTitle(this.rootEnv.config.spfxSubscribedChannelsListTitle).items
            .filter("pb_Subscriber eq '" + this.pageContext.legacyPageContext.userId + "'")
            .select("Id", "pb_Channels").top(1)();
    }

    /**
     * Adds a new subscribed channels entry for the current user in SharePoint.
     * @returns {Promise<IItemAddResult>} A promise that resolves with the result of the item addition.
     */
    public async addSubscribedChannels4CurrentUser(): Promise<any> {
        return await this.sp.web.lists.getByTitle(this.rootEnv.config.spfxSubscribedChannelsListTitle).items.add({
            Title: this.pageContext.legacyPageContext.DisplayName,
            pb_SubscriberId: this.pageContext.legacyPageContext.userId
        });
    }

    /**
     * Retrieves news items for the specified channel or channels in SharePoint.
     * @param {string} newsChannelCurrent - The current news channel.
     * @param {string} newsGuid - The GUID of the news.
     * @param {IChannels2SubscriptionItem[]} newsChannels - An array of subscription items for the news channels.
     * @param {ILanguageRepresentation} pageLanguage - The language representation for the page.
     * @param {number} newsCount - The number of news items to retrieve.
     * @returns {Promise<INewsItemsResult>} A promise that resolves with the news items result.
     */
    public getNewsItems(newsChannelCurrent: string, newsGuid: string, newsChannels: IChannels2SubscriptionItem[], pageLanguage: ILanguageRepresentation, newsCount: number): Promise<INewsItemsResult> {
        const p = new Promise<INewsItemsResult>((resolve, reject) => {
            const newsResult: INewsItemsResult = {
                newsItemData: [],
                sticky: false
            };
            // build filter for channels
            let channelFilter: string;
            if (newsChannelCurrent === newsGuid) {
                channelFilter = this.filterBuilder("pb_Channels",
                    newsChannels
                        .filter((channel: IChannels2SubscriptionItem) => { if (channel.Subscribed && channel.TermGuid != newsGuid) return channel; })
                        .map(channel => channel.TermGuid), false);
            } else {
                channelFilter = this.filterBuilder("pb_Channels", Array.from(new Set([newsChannelCurrent])), false);
            }

            const currDate = this.toISOStringWithTimezone(new Date());
            const publishingDatesFilter = `pb_PublishedFrom le datetime'${currDate}' and (pb_PublishedTo ge datetime'${currDate}' or pb_PublishedTo eq null)`;

            const filterQuery = channelFilter + " and (pb_Language eq '" + pageLanguage.LanguageDashedLC + "' or pb_Language eq '" + pageLanguage.lcid + "') and " + publishingDatesFilter;
            const filterQuerySocket = channelFilter + " and (pb_Language eq '" + pageLanguage.LanguageDashedLC + "' or pb_Language eq '" + pageLanguage.lcid + "') and ";
            this.filterQuery4Socket = filterQuerySocket;

            // Check if we have a sticky news which sticky date is not reached
            newsResult.sticky = false;
            const filterQuerySticky = filterQuery + ` and (pb_Sticky eq 1 and pb_StickyDate ge datetime'${currDate}')`;
            const filterQueryWithoutSticky = filterQuery + ` and ((pb_Sticky eq 0 or pb_Sticky eq null) or (pb_Sticky eq 1 and pb_StickyDate le datetime'${currDate}'))`;
            this.sp.web.lists.getById(this.rootEnv.config.spfxRealtimenewsListId).items.filter(filterQuerySticky).top(1)().then((item) => {
                if (item.length > 0) {
                    newsResult.sticky = true;
                    newsResult.newsItemData.push(item[0] as INewsItemData);
                } else {
                    newsResult.sticky = false;
                }
                this.sp.web.lists.getById(this.rootEnv.config.spfxRealtimenewsListId).items.filter(filterQueryWithoutSticky).orderBy("pb_PublishedFrom", false).top(newsCount)().then((items) => {
                    newsResult.newsItemData.push(...items);
                    resolve(
                        newsResult
                    );
                }).catch((error) => {
                    this.logger.error('GET_NEWS_WITH_STICKY', error);
                    reject(error);
                });
            });
        });
        return p;
    }

    /**
     * Checks if a news item is valid based on its ID.
     * @param {number} id - The ID of the news item.
     * @returns {Promise<boolean>} A promise that resolves with a boolean indicating whether the news item is valid.
     */
    public async checkValidNewsItem(id: number): Promise<boolean> {
        const currDate = this.toISOStringWithTimezone(new Date());
        const publishingDatesFilter = `pb_PublishedFrom le datetime'${currDate}' and (pb_PublishedTo ge datetime'${currDate}' or pb_PublishedTo eq null)`;

        const currentFilter = this.filterQuery4Socket + publishingDatesFilter + ' and (Id eq ' + id.toString() + ')';
        const item = await this.sp.web.lists.getById(this.rootEnv.config.spfxRealtimenewsListId).items.filter(currentFilter).top(1)();
        if (item) return true;
        return false;
    }

    /**
     * Updates multiple metadata fields for a SharePoint list item.
     * @param {any[]} terms - An array of terms representing the metadata to update.
     * @param {string} listName - The name of the SharePoint list.
     * @param {string} fieldName - The name of the metadata field to update.
     * @param {number} itemId - The ID of the list item to update.
     * @returns {Promise<any>} A promise that resolves with the result of the update operation.
     */
    public async updateMultiMeta(terms: any[], listName: string, fieldName: string, itemId: number): Promise<any> {
        const list = await this.sp.web.lists.getByTitle(listName);
        let termsString: string = '';
        terms.forEach(term => {
            termsString += `${term.termName}|${term.termGUID};`;
        });
        const updateValue = { FieldName: fieldName, FieldValue: termsString };

        return await list.items.getById(itemId).validateUpdateListItem([updateValue]);
    }

    /**
     * Builds a filter query string for SharePoint list items.
     * @param {string} fieldName - The name of the field to filter by.
     * @param {string[]} guids - An array of GUIDs to include in the filter.
     * @param {boolean} truncate - Whether to truncate the GUIDs before building the filter.
     * @returns {string} A filter query string.
     */
    private filterBuilder(fieldName: string, guids: string[], truncate: boolean): string {
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

    /**
     * Converts a date to an ISO string with timezone information.
     * @param {Date} date - The date to convert.
     * @returns {string} An ISO string representing the date with timezone information.
     */
    private toISOStringWithTimezone(date: Date): string {
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

    /**
     * Calculates the language settings for a SharePoint page based on its context.
     * @param {string} listId - The ID of the SharePoint list.
     * @param {number} listItemId - The ID of the list item.
     * @param {number} defaultLanguage - The default language LCID (Locale ID).
     * @returns {Promise<ILanguageRepresentation>} A promise that resolves with the language representation.
     */
    public calculateLanguage = async (listId: string, listItemId: number, defaultLanguage: number): Promise<ILanguageRepresentation> => {
        let pageContext = null;
        const languageData: ILanguageRepresentation = {
            lcid: 0, 
            Language: '',
            LanguageLC: '',
            LanguageDashed: '',
            LanguageDashedLC: '',
          };
        try {
            pageContext = await this.getPageContext(listId, listItemId);
        } catch (error) {
            this.logger.info("calculateLanguage, getPageContext returned an error, probably not running in a multilingual setup, defaulting to web language", error);
        }
        if (!pageContext || !pageContext.OData__SPIsTranslation || !pageContext.OData__SPTranslationLanguage) {
            // Not running in a multilingual setup
            // Get language from web
            languageData.lcid = defaultLanguage;
            languageData.Language = lcid.from(defaultLanguage);
            languageData.LanguageLC = languageData.Language.toLowerCase();
            languageData.LanguageDashed = languageData.Language.replace('_','-');
            languageData.LanguageDashedLC = languageData.LanguageLC.replace('_','-');
            return languageData;
        }
        // Page is a translation
        // Get language from page property
        languageData.Language = pageContext.OData__SPTranslationLanguage.replace("-", "_").toLowerCase().replace(/(^\w{2})/, (match) => match.toLowerCase()).replace(/(_\w{2})$/, (match) => match.toUpperCase());
        languageData.lcid = lcid.to(languageData.Language);
        languageData.LanguageLC = languageData.Language.toLowerCase();
        languageData.LanguageDashed = languageData.Language.replace('_','-');
        languageData.LanguageDashedLC = languageData.LanguageLC.replace('_','-');
        return languageData;
    }
}
