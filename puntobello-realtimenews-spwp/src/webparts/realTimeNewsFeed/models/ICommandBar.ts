import {
    IDropdownOption,
} from '@fluentui/react';

export interface ICommandBar {
    channelDropdown: IDropdownOption[];
    channelDropdownChanged: any;
    channelSettingsModalClicked: any;
    selectedKey: string;
}