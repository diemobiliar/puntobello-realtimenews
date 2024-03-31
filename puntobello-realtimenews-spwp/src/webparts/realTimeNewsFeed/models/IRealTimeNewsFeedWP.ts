import { ITelemetryService } from "../../../services";
import { WebPartContext } from "@microsoft/sp-webpart-base";
import { IReadonlyTheme } from '@microsoft/sp-component-base';

interface IRealTimeNewsFeedWP {
    themeVariant: IReadonlyTheme | undefined;
    context: WebPartContext;
    list: string;
    language: string;
    newsCount:number;
    archivTargetUrl:string;
    telemetryService: ITelemetryService;
}

export default IRealTimeNewsFeedWP;
