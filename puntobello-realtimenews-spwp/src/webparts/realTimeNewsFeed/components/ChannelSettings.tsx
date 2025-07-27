import * as React from 'react';

// Fluent UI components and utilities
import { Modal, IconButton, Checkbox, Stack } from '@fluentui/react';
import { getId } from '@fluentui/react/lib/Utilities';

// Context
import { useAppContext } from '../contexts/AppContext';

// Models
import { IChannels2SubscriptionItem, IChannelSettingsProps } from '../models';

// Utilities
import { Utility } from '../utils/utils';

// Styles
import { 
    cancelIcon, 
    contentStyles, 
    iconButtonStyles, 
    customCheckboxStyles, 
    stackTokens, 
    fadeInKeyframes 
} from '../styles/channelsettings';

/**
 * `ChannelSettings` is a React functional component that renders a modal dialog for managing user subscriptions to news channels.
 * It allows users to select or deselect channels to subscribe to, and reflects changes immediately in the UI.
 * 
 * @param {IChannelSettingsProps} props - The properties passed to this component.
 * @param {string} props.myNewsGuid - The GUID representing the user's personalized news channel.
 * @param {IChannels2SubscriptionItem[]} props.channelsConfig - Array of channels available for subscription.
 * @param {string} props.modalSettingsTitle - The title displayed at the top of the modal dialog.
 * @param {boolean} props.modalVisible - A boolean indicating whether the modal dialog is visible.
 * @param {() => void} props.closeModal - Callback function to close the modal dialog.
 * @param {(item: IChannels2SubscriptionItem, ev: React.FormEvent<HTMLElement>, isChecked: boolean) => void} props.changeChannelSettings - Callback function to handle channel subscription changes.
 * 
 * @returns {JSX.Element | null} - Returns a JSX element representing the modal dialog, or `null` if the modal is not visible.
 */
export function ChannelSettings(props: IChannelSettingsProps) {
    const {
        myNewsGuid,
        channelsConfig,
        modalSettingsTitle,
        modalVisible,
        closeModal,
        changeChannelSettings,
    } = props;
    const { pageLanguage } = useAppContext();

    // State to control the visibility of the modal
    const [isVisible, setIsVisible] = React.useState(modalVisible);

    // Effect to insert custom CSS keyframes for modal animations on initial render
    React.useEffect(() => {
        const styleSheet = document.styleSheets[0];
        styleSheet.insertRule(fadeInKeyframes, styleSheet.cssRules.length);
    }, []);

    // Effect to synchronize the modal's visibility state with the prop `modalVisible`
    React.useEffect(() => {
        if (modalVisible) {
            setIsVisible(true);
        } else {
            setIsVisible(false);
        }
    }, [modalVisible]);

    // Function to handle closing the modal dialog
    function closeModalDialog() {
        closeModal();
    }

    // If the modal is not visible, return null to avoid rendering it
    if (!isVisible) {
        return null;
    }

    /**
     * Function to handle changes in channel subscription checkboxes.
     * 
     * @param {IChannels2SubscriptionItem} item - The channel item whose subscription status changed.
     * @param {React.FormEvent<HTMLElement>} ev - The event object associated with the change.
     * @param {boolean} isChecked - The new checked status of the checkbox.
     */
    function channelCheckboxChanged(item: IChannels2SubscriptionItem, ev: React.FormEvent<HTMLElement>, isChecked: boolean) {
        changeChannelSettings(item, ev, isChecked);
    }

    return (
        <Modal
            titleAriaId={getId('title')}
            isOpen={modalVisible}
            onDismiss={closeModalDialog}
            isModeless={false}
            isBlocking={true}
            containerClassName={`${contentStyles.container} ${'modalFadeIn'}`}>
            <div className={contentStyles.header}>
                <span id={getId('title')}>{modalSettingsTitle}</span>
                <IconButton
                    styles={iconButtonStyles}
                    iconProps={cancelIcon}
                    ariaLabel={Utility.getStringTranslation4Locale('ariaCloseChannelSettings', pageLanguage.Language)}
                    onClick={closeModal}
                />
            </div>
            <div className={contentStyles.body}>
                <Stack tokens={stackTokens}>
                    {channelsConfig.map((item) => {
                        if (myNewsGuid != item.TermGuid) {
                            return (
                                <Checkbox
                                    key={item.TermGuid}
                                    label={Utility.getChannelText(pageLanguage, item)}
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
