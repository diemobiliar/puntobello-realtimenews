import {
    IDropdownOption,
} from '@fluentui/react';

interface ICommandBarData {
    channelDropdown: IDropdownOption[];
    archivLinkUrl: string;
    channelDropdownChanged: any;
    channelSettingsModalClicked: any;
    selectedKey: string;
}

export default ICommandBarData;
