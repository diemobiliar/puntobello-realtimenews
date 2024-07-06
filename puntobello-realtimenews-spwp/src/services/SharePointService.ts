import { ServiceKey, ServiceScope } from "@microsoft/sp-core-library";
import { PageContext } from "@microsoft/sp-page-context";
import IPageContext from "../models/IPageContext";
import "@pnp/sp/webs";
import "@pnp/sp/site-users/web";
import "@pnp/sp/lists";
import "@pnp/sp/items";
import "@pnp/sp/profiles";
import "@pnp/sp/taxonomy";
import { SPFI, spfi, SPFx } from "@pnp/sp";
import "@pnp/sp/regional-settings/web";
import { dateAdd, PnPClientStorage } from "@pnp/common";
import { IItemAddResult, Web } from "@pnp/sp/presets/all";
import { IOrderedTermInfo } from "@pnp/sp/taxonomy";

import { Logger } from '../utils/logger';
import * as lcid from "lcid";
import { IChannels2SubsItem, IChannels2SubscriptionItem } from "../models/INewsFeed";
import IGetNewsItemsResult from "../models/IGetNewsItemsResult";
import INewsItemData from "../models/INewsItemData";
import ILanguageRepresentation from "../models/ILanguageRepresentation";

export interface ISharePointService {
    getAndCacheAllChannels(): Promise<IOrderedTermInfo[]>;
    getSubscribedChannels4CurrentUser(): Promise<IChannels2SubsItem[]>;
    getPageContext(listId: string, listItemId: number): Promise<IPageContext>;
    addSubscribedChannels4CurrentUser(): Promise<IItemAddResult>;
    getNewsItems(newsChannelCurrent: string, newsGuid: string, newsChannels: IChannels2SubscriptionItem[], pageLanguage: ILanguageRepresentation, newsCount: number): Promise<IGetNewsItemsResult>;
    checkValidNewsItem(id: number): Promise<boolean>;
    updateMultiMeta(terms: any[], listName: string, fieldName: string, itemId: number): Promise<any>;
    calculateLanguage(listId: string, listItemId: number, defaultLanguage: number): Promise<ILanguageRepresentation>;
    filterQuery4Socket: string;
    sp: SPFI;
}

export default class SharePointService implements ISharePointService {
    public static readonly serviceKey: ServiceKey<ISharePointService> =
        ServiceKey.create<ISharePointService>('SPFx:SharePointService', SharePointService);
    
    private storage: PnPClientStorage;
    private pageContext: PageContext;
    private logger: Logger;
    public filterQuery4Socket: string;
    public sp: SPFI;

    constructor(serviceScope: ServiceScope) {
        this.logger = Logger.getInstance();

        serviceScope.whenFinished(() => {

            this.pageContext = serviceScope.consume(PageContext.serviceKey);
            this.storage = new PnPClientStorage();

            this.sp = spfi().using(SPFx({ pageContext: this.pageContext }));
        });
    }

    public getPageContext = async (listId: string, listItemId: number): Promise<IPageContext> => {
        // Check if we are in a multilingual setup
        const fields = await this.sp.web.lists.getById(listId).fields();
        const requiredFields = ['OData__SPIsTranslation', 'OData__SPTranslationLanguage'];

        // Check if all required fields exist
        const fieldNames = fields.map(field => field.InternalName);
        const allFieldsExist = requiredFields.every(field => fieldNames.includes(field));
        if (!allFieldsExist) {
            return null;
        } else {
            const context = await this.sp.web.lists.getById(listId)
                .items
                .getById(listItemId)
                .select(
                    'OData__SPIsTranslation',
                    'OData__SPTranslationLanguage')();
            return context;
        }
    }

    public async getAndCacheAllChannels(): Promise<IOrderedTermInfo[]> {
        return await this.storage.local.getOrPut<IOrderedTermInfo[]>('pb_channels_56cd37c6-8b8f-4108-9264-5b2e9fb3c8be', () => {
            return this.sp.termStore.sets.getById("56cd37c6-8b8f-4108-9264-5b2e9fb3c8be").getAllChildrenAsOrderedTree();
        }, dateAdd(new Date(), 'hour', 12));
    }

    public async getSubscribedChannels4CurrentUser(): Promise<IChannels2SubsItem[]> {
        return await this.sp.web.lists.getByTitle(`${process.env.SPFX_SUBSCRIBEDCHANNELS_LIST_TITLE}`).items
            .filter("pb_Subscriber eq '" + this.pageContext.legacyPageContext.userId + "'")
            .select("Id", "pb_Channels").top(1)();
    }

    public async addSubscribedChannels4CurrentUser(): Promise<IItemAddResult> {
        return await this.sp.web.lists.getByTitle(`${process.env.SPFX_SUBSCRIBEDCHANNELS_LIST_TITLE}`).items.add({
            Title: this.pageContext.legacyPageContext.DisplayName,
            pb_SubscriberId: this.pageContext.legacyPageContext.userId
        });
    }

    // Reads the news for all the subscribed channels or for a specific channel
    public getNewsItems(newsChannelCurrent: string, newsGuid: string, newsChannels: IChannels2SubscriptionItem[], pageLanguage: ILanguageRepresentation, newsCount: number): Promise<IGetNewsItemsResult> {
        const p = new Promise<IGetNewsItemsResult>((resolve, reject) => {
            const newsResult: IGetNewsItemsResult = {
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

            // pageLanguage is not enough, you need the lcid...
            const filterQuery = channelFilter + " and (pb_Language eq '" + pageLanguage.Language + "' or pb_Language eq '" + pageLanguage.lcid + "') and " + publishingDatesFilter;
            const filterQuerySocket = channelFilter + " and (pb_Language eq '" + pageLanguage + "' or pb_Language eq '" + pageLanguage.lcid + "') and ";
            this.filterQuery4Socket = filterQuerySocket;
            // Check if we have a sticky news which sticky date is not reached
            newsResult.sticky = false;
            const filterQuerySticky = filterQuery + ` and (pb_Sticky eq 1 and pb_StickyDate ge datetime'${currDate}')`;
            const filterQueryWithoutSticky = filterQuery + ` and ((pb_Sticky eq 0 or pb_Sticky eq null) or (pb_Sticky eq 1 and pb_StickyDate le datetime'${currDate}'))`;
            //const allNews: INewsItemData[] = [];
            this.sp.web.lists.getById(`${process.env.SPFX_REALTIMENEWSLIST_ID}`).items.filter(filterQuerySticky).top(1)().then((item) => {
                if (item.length > 0) {
                    newsResult.sticky = true;
                    newsResult.newsItemData.push(item[0] as INewsItemData);
                } else {
                    newsResult.sticky = false;
                }
                this.sp.web.lists.getById(`${process.env.SPFX_REALTIMENEWSLIST_ID}`).items.filter(filterQueryWithoutSticky).orderBy("pb_PublishedFrom", false).top(newsCount)().then((items) => {
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

    // Reads the news for all the subscribed channels or for a specific channel
    public async checkValidNewsItem(id: number): Promise<boolean> {
        const currDate = this.toISOStringWithTimezone(new Date());
        const publishingDatesFilter = `pb_PublishedFrom le datetime'${currDate}' and (pb_PublishedTo ge datetime'${currDate}' or pb_PublishedTo eq null)`;

        const currentFilter = this.filterQuery4Socket + publishingDatesFilter + ' and (Id eq ' + id.toString() + ')';
        const item = await this.sp.web.lists.getById(`${process.env.SPFX_REALTIMENEWSLIST_ID}`).items.filter(currentFilter).top(1)();
        if (item) return true;
        return false;
    }

    public async updateMultiMeta(terms: any[], listName: string, fieldName: string, itemId: number): Promise<any> {
        const list = await this.sp.web.lists.getByTitle(listName);
        let termsString: string = '';
        terms.forEach(term => {
            termsString += `${term.termName}|${term.termGUID};`;
        });
        const updateValue = { FieldName: fieldName, FieldValue: termsString };

        return await list.items.getById(itemId).validateUpdateListItem([updateValue]);
    }


    // Generate this pattern
    // "substringof('" + guids[1] + "',fieldName) or substringof('" + guids[2] + "',fieldName) ..."
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
        languageData.lcid = lcid.to(pageContext.OData__SPTranslationLanguage);
        languageData.Language = pageContext.OData__SPTranslationLanguage;
        languageData.LanguageLC = languageData.Language.toLowerCase();
        languageData.LanguageDashed = languageData.Language.replace('_','-');
        languageData.LanguageDashedLC = languageData.LanguageLC.replace('_','-');
        return languageData;
    }
}
