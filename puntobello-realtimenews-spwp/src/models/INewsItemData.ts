// Must corresponds to the SharePoint site column internal names for a news item
interface INewsItemData {
    pb_NewsTitle: string;
    Id: number;
    pb_NewsHeader: string;
    pb_ImageUrl: any;
    pb_Channels?: string;
    pb_PubFrom: string;
    pb_PubTo: string;
    Author: string;
    pb_LikeNumber: number;
    pb_CommentsNumber: number;
    pb_NewsUrl: any;
    pb_LangCd: string;
    pbN_Sticky: boolean;
    pb_StickyDate: Date;
}

export default INewsItemData;