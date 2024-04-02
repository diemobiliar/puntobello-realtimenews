import { WebPartContext } from "@microsoft/sp-webpart-base";
import { IReadonlyTheme } from '@microsoft/sp-component-base';

interface IRealTimeNewsFeedWP {
    themeVariant: IReadonlyTheme | undefined;
    context: WebPartContext;
    newsCount:number;
}

export default IRealTimeNewsFeedWP;
