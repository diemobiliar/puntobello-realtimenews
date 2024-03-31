import { IChannels2SubscriptionItem } from "./IRedNetNewsFeed";

interface IChannelSettingsModalProps {
    myNewsGuid: string;
    channelsubItemId: number;
    channelsConfig: IChannels2SubscriptionItem[];
    wpLang: string;
    locale: string;
    modalSettingsTitle: string;
    modalVisible: boolean;
    closeModal: any;
    changeChannelSettings: any;
}

export default IChannelSettingsModalProps;