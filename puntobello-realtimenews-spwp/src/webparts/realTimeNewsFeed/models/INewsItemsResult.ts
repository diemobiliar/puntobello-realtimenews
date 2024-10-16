import { INewsItemData } from ".";

export interface INewsItemsResult {
    newsItemData: INewsItemData[];
    sticky: boolean;
}