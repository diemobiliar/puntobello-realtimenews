import { ServiceKey, ServiceScope } from "@microsoft/sp-core-library";
import { PageContext } from "@microsoft/sp-page-context";
import IAppsItem from "../models/IAppsItem";
import IPageContext from "../models/IPageContext";
import { SPFI, spfi, SPFx } from "@pnp/sp";
import { Web } from "@pnp/sp/presets/all";

import { Utility } from "../utils/utils";
import { Logger } from '../utils/logger';
import * as lcid from "lcid";
import IUserApps from "../models/IUserApps";

export interface ISharePointService {
    getAllApps(): Promise<IAppsItem[]>;
    getUserAppsIds(userId: string, loginName: string, allApps: IAppsItem[]): Promise<string[]>;
    updateUserApps(userObjectId: string, loginName: string, orderedItems: string[]): Promise<void>;
    getPageContext(listId: string, listItemId: number): Promise<IPageContext>;
    calculateLanguage(pageIsTranslation: boolean, pageTranslatedLanguage: string, defaultLanguage: number): string;
}

export default class SharePointService {
    public static readonly serviceKey: ServiceKey<ISharePointService> =
        ServiceKey.create<ISharePointService>('SPFx:SharePointService', SharePointService);
    private appsSiteUrl: string;
    private userAppsRelativeUrl: string;
    private allAppsRelativeUrl: string;
    private sp: SPFI;
    private logger: Logger;

    constructor(serviceScope: ServiceScope) {
        this.logger = Logger.getInstance();

        serviceScope.whenFinished(() => {

            const pageContext = serviceScope.consume(PageContext.serviceKey);

            this.allAppsRelativeUrl = Utility.getPBConfigUrl(true) + Utility.getAllAppsUrl();
            this.userAppsRelativeUrl = Utility.getPBConfigUrl(true) + Utility.getUserAppsUrl();
            this.appsSiteUrl = "https://" + Utility.getPBConfigUrl(false);

            this.sp = spfi().using(SPFx({ pageContext: pageContext }));
        });
    }

    public getPageContext = async (listId: string, listItemId: number): Promise<IPageContext> => {
        const context: IPageContext = await this.sp.web.lists.getById(listId)
            .items
            .getById(listItemId)
            .select(
                'OData__SPIsTranslation',
                'OData__SPTranslationLanguage')();
        return context;
    }

    public calculateLanguage = (pageIsTranslation: boolean, pageTranslatedLanguage: string, defaultLanguage: number): string => {
        if (!pageIsTranslation) {
            // Page is not a translation
            // Get language from web and search for correct label according to web language
            return lcid.from(defaultLanguage);
        }
        // Page is a translation
        // Get language from page property
        return lcid.from(lcid.to(pageTranslatedLanguage));
    }

    public getAllApps = async (): Promise<IAppsItem[]> => {
        let userMUI = '';

        try {
            const profile = await this.sp.profiles.myProperties.select('AccountName')();
            const muiCultures = await this.sp.profiles.getUserProfilePropertyFor(profile.AccountName, "SPS-MUILanguages");
            userMUI = !muiCultures ? '' : muiCultures.split(',')[0];
        } catch (error) {
            this.logger.error("Error in getting user profile property SPS-MUILanguage:", error);
        }

        const queryFilter = userMUI.length > 0 ?
            "pb_MUILanguage eq '" + userMUI + "' or pb_MUILanguage eq 'Default'" :
            "pb_MUILanguage eq 'default'";

        const allApps = await Web([this.sp.web, this.appsSiteUrl]).getList(this.allAppsRelativeUrl).items.filter(queryFilter)();
        // Sort so that user's language comes first, then default
        allApps.sort((a, b) => {
            if (a.pb_MUILanguage === userMUI && b.pb_MUILanguage !== userMUI) {
                return -1; 
            } else if (a.pb_MUILanguage !== userMUI && b.pb_MUILanguage === userMUI) {
                return 1; 
            }
            return 0; 
        });

        // Remove duplicates based on pb_AppId
        const seenIds = new Set();
        const filteredApps = allApps.filter((app) => {
            if (!seenIds.has(app.pb_AppId)) {
                seenIds.add(app.pb_AppId);
                return true;
            }
            return false; // duplicate
        });

        // Map to IAppsItem
        return filteredApps.map((app: IUserApps) => ({
            id: app.pb_AppId,
            name: app.Title,
            description: app.pb_Description,
            url: app.pb_LinkUrl,
            order: app.pb_SortOrder
        })) as IAppsItem[];
    }

    public getUserAppsIds = async (userId: string, loginName: string, allApps: IAppsItem[]): Promise<string[]> => {

        const web = Web([this.sp.web, this.appsSiteUrl]);
        const user = await web.ensureUser(loginName);
        const listItem = await web
            .getList(this.userAppsRelativeUrl)
            .items
            .select('pb_UserApps')
            .filter(`pb_User eq '${user.data.Id}'`)
            .top(1)();

        if (listItem.length === 1 && listItem[0].pb_UserApps) {
            const myAppIds: string[] = listItem[0].pb_UserApps.split(';');
            // check if app has been removed from list and update / handle accordingly
            const filteredAppIds = myAppIds.filter((myAppId: string) => {
                return allApps.find(allApp => allApp.id === myAppId);
            });

            if (myAppIds.length !== filteredAppIds.length) {
                await this.updateUserApps(userId, loginName, filteredAppIds);
            }

            return filteredAppIds;
        }
        return [];
    }

    public updateUserApps = async (userId: string, loginName: string, orderedItems: string[]): Promise<void> => {
        const list = Web([this.sp.web, this.appsSiteUrl]).getList(this.userAppsRelativeUrl);

        const listItem = await list
            .items
            .select('Id')
            .filter(`pb_User eq '${userId}'`)
            .top(1)();

        if (listItem.length === 1) {
            await list.items.getById(listItem[0].Id).update({
                pb_UserApps: orderedItems.join(';'),
            });
        } else if (listItem.length === 0) {
            const user = await Web([this.sp.web, this.appsSiteUrl]).ensureUser(loginName);

            await list.items.add({
                pb_UserId: user.data.Id,
                pb_UserApps: orderedItems.join(';'),
            });
        }
    }
}
