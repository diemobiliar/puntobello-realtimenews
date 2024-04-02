// Must corresponds to the SharePoint site column internal names for a news item
interface INewsItemData {
    REDN_NewsTitle: string;
    Id: number;
    REDN_NewsHeader: string;
    REDN_ImageUrl: any;
    REDN_Channels?: string;
    REDN_PubFrom: string;
    REDN_PubTo: string;
    Author: string;
    REDN_ViewNumber: number;
    REDN_LikeNumber: number;
    REDN_CommentsNumber: number;
    REDN_NewsUrl: any;
    REDN_LangCd: string;
    REDN_PageLayout: string;
    REDN_Sticky: boolean;
    REDN_StickyDate: Date;
    REDN_IsGANL: boolean;
    REDN_GANLWeek: string;
    REDN_GANLYear: string;
}

export default INewsItemData;