interface INewsItem {
    NewsUrl: string;
    ImageUrl: any;
    NewsTitle: string;
    PubFrom: string;
    NewsHeader: string;
    metaText: string;
    comments: number;
    likes: number;
    wpLang: string;
    isSticky: boolean;
    isGANL: boolean;
    GANLWW?: string;
    GANLYY?: string;
}

export default INewsItem;