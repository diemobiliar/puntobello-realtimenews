import ILanguageRepresentation from "./ILanguageRepresentation";
import { IChannels2SubscriptionItem } from "./INewsFeed";

interface IChannelSettingsModalProps {
    myNewsGuid: string;
    channelsubItemId: number;
    channelsConfig: IChannels2SubscriptionItem[];
    pageLanguage: ILanguageRepresentation;
    modalSettingsTitle: string;
    modalVisible: boolean;
    closeModal: any;
    changeChannelSettings: any;
}

export default IChannelSettingsModalProps;