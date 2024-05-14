interface INewsItem {
    NewsUrl: string;
    ImageUrl: any;
    NewsTitle: string;
    PubFrom: string;
    NewsHeader: string;
    metaText: string;
    comments: number;
    likes: number;
    isSticky: boolean;
}

export default INewsItem;