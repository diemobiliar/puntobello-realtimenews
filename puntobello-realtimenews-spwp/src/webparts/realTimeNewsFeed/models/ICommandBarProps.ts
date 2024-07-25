import {
    IDropdownOption,
} from '@fluentui/react';

interface ICommandBarProps {
    channelDropdown: IDropdownOption[];
    channelDropdownChanged: any;
    channelSettingsModalClicked: any;
    selectedKey: string;
    pageLanguage: string;
}

export default ICommandBarProps;
