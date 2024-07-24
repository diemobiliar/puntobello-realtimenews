import ILanguageRepresentation from "./ILanguageRepresentation";
import { IChannels2SubscriptionItem } from "./INewsFeed";

interface IChannelSettingsModalProps {
    myNewsGuid: string;
    channelsConfig: IChannels2SubscriptionItem[];
    pageLanguage: ILanguageRepresentation;
    modalSettingsTitle: string;
    modalVisible: boolean;
    closeModal: any;
    changeChannelSettings: any;
}

export default IChannelSettingsModalProps;