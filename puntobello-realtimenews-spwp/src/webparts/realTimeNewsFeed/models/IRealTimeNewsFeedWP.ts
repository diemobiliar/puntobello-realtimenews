import { IReadonlyTheme } from '@microsoft/sp-component-base';
import SharePointService from '../services/SharePointService';
import ILanguageRepresentation from './ILanguageRepresentation';

interface IRealTimeNewsFeedWP {
    pageLanguage: ILanguageRepresentation;
    newsCount:number;
    themeVariant: IReadonlyTheme | undefined;
    spo: SharePointService
}

export default IRealTimeNewsFeedWP;
