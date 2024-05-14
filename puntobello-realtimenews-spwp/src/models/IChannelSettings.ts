import { IChannels2SubscriptionItem } from "./INewsFeed";

interface IChannelSettingsModalProps {
    myNewsGuid: string;
    channelsubItemId: number;
    channelsConfig: IChannels2SubscriptionItem[];
    locale: string;
    modalSettingsTitle: string;
    modalVisible: boolean;
    closeModal: any;
    changeChannelSettings: any;
}

export default IChannelSettingsModalProps;