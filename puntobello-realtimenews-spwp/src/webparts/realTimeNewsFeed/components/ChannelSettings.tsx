import * as React from 'react';
import {
    Modal,
    IconButton,
    Checkbox,
    Stack,
} from '@fluentui/react';
import { getId } from '@fluentui/react/lib/Utilities';
import { IChannels2SubscriptionItem } from '../../../models/INewsFeed';
import IChannelSettingsModalProps from '../../../models/IChannelSettings';
import { Utility } from '../../../utils/utils';
import {
    cancelIcon,
    contentStyles,
    iconButtonStyles,
    customCheckboxStyles,
    stackTokens,
    fadeInKeyframes,
} from '../../../styles/channelsettings';

export function ChannelSettings(props: IChannelSettingsModalProps) {
    const [isVisible, setIsVisible] = React.useState(props.modalVisible);

    React.useEffect(() => {
        const styleSheet = document.styleSheets[0];
        styleSheet.insertRule(fadeInKeyframes, styleSheet.cssRules.length);
    }, []);

    React.useEffect(() => {
        if (props.modalVisible) {
            setIsVisible(true);
        } else {
            setIsVisible(false);
        }
    }, [props.modalVisible]);

    function closeModal() {
        props.closeModal();
    }

    if (!isVisible) {
        return null;
    }

    function channelCheckboxChanged(item: IChannels2SubscriptionItem, ev: React.FormEvent<HTMLElement>, isChecked: boolean) {
        props.changeChannelSettings(item, ev, isChecked);
    }

    return (
        <Modal
            titleAriaId={getId('title')}
            isOpen={props.modalVisible}
            onDismiss={closeModal}
            isModeless={false}
            isBlocking={true}
            containerClassName={`${contentStyles.container} ${'modalFadeIn'}`}
        >
            <div className={contentStyles.header}>
                <span id={getId('title')}>{props.modalSettingsTitle}</span>
                <IconButton
                    styles={iconButtonStyles}
                    iconProps={cancelIcon}
                    ariaLabel={Utility.getStringTranslation4Locale('ariaCloseChannelSettings', props.pageLanguage.Language)}
                    onClick={closeModal}
                />
            </div>

            <div className={contentStyles.body}>
                <Stack tokens={stackTokens}>
                    {props.channelsConfig.map((item) => {
                        if (props.myNewsGuid != item.TermGuid) {
                            return (
                                <Checkbox
                                    label={Utility.getChannelText(props.pageLanguage, item)}
                                    defaultChecked={item.Subscribed}
                                    onChange={channelCheckboxChanged.bind(this, item)}
                                    styles={customCheckboxStyles}
                                />
                            );
                        }
                    })}
                </Stack>
            </div>
        </Modal>
    );
}
