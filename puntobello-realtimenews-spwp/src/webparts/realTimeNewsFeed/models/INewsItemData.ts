// Must corresponds to the SharePoint site column internal names for a news item
interface INewsItemData {
    Title: string;
    Id: number;
    Author: string;
    pb_Header: string;
    pb_ImageUrl: any;
    pb_Channels?: string;
    pb_PublishedFrom: string;
    pb_PublishedTo: string;
    pb_NewsUrl: any;
    pb_Language: string;
    pb_Sticky: boolean;
    pb_StickyDate: Date;
}

export default INewsItemData;