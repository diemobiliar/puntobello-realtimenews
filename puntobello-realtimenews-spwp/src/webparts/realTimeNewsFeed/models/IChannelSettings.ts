import { IChannels2SubscriptionItem } from "./INewsFeed";

export interface IChannelSettingsProps {
    myNewsGuid: string;
    channelsConfig: IChannels2SubscriptionItem[];
    modalSettingsTitle: string;
    modalVisible: boolean;
    closeModal: any;
    changeChannelSettings: any;
}