import {
    IDropdownOption,
} from '@fluentui/react';

interface ICommandBarData {
    channelDropdown: IDropdownOption[];
    channelDropdownChanged: any;
    channelSettingsModalClicked: any;
    selectedKey: string;
    pageLanguage: string;
}

export default ICommandBarData;
