import {
    IDropdownOption,
} from 'office-ui-fabric-react';

interface ICommandBarData {
    channelDropdown: IDropdownOption[];
    wpLang: string;
    archivLinkUrl: string;
    channelDropdownChanged: any;
    channelSettingsModalClicked: any;
    selectedKey: string;
}

export default ICommandBarData;
