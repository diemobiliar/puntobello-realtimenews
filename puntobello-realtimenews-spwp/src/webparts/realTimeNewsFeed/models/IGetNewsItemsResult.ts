import INewsItemData from "./INewsItemData";

interface IGetNewsItemsResult {
    newsItemData: INewsItemData[];
    sticky: boolean;
}

export default IGetNewsItemsResult;