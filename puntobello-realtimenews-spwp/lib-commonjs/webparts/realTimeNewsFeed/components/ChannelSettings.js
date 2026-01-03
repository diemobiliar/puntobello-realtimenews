"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChannelSettings = void 0;
var tslib_1 = require("tslib");
var React = tslib_1.__importStar(require("react"));
// Fluent UI components and utilities
var react_1 = require("@fluentui/react");
var Utilities_1 = require("@fluentui/react/lib/Utilities");
// Context
var AppContext_1 = require("../contexts/AppContext");
// Utilities
var utils_1 = require("../utils/utils");
// Styles
var channelsettings_1 = require("../styles/channelsettings");
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
function ChannelSettings(props) {
    var myNewsGuid = props.myNewsGuid, channelsConfig = props.channelsConfig, modalSettingsTitle = props.modalSettingsTitle, modalVisible = props.modalVisible, closeModal = props.closeModal, changeChannelSettings = props.changeChannelSettings;
    var pageLanguage = (0, AppContext_1.useAppContext)().pageLanguage;
    // State to control the visibility of the modal
    var _a = React.useState(modalVisible), isVisible = _a[0], setIsVisible = _a[1];
    // Effect to insert custom CSS keyframes for modal animations on initial render
    React.useEffect(function () {
        var styleSheet = document.styleSheets[0];
        styleSheet.insertRule(channelsettings_1.fadeInKeyframes, styleSheet.cssRules.length);
    }, []);
    // Effect to synchronize the modal's visibility state with the prop `modalVisible`
    React.useEffect(function () {
        if (modalVisible) {
            setIsVisible(true);
        }
        else {
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
    function channelCheckboxChanged(item, ev, isChecked) {
        changeChannelSettings(item, ev, isChecked !== null && isChecked !== void 0 ? isChecked : false);
    }
    return (React.createElement(react_1.Modal, { titleAriaId: (0, Utilities_1.getId)('title'), isOpen: modalVisible, onDismiss: closeModalDialog, isModeless: false, isBlocking: true, containerClassName: "".concat(channelsettings_1.contentStyles.container, " ").concat('modalFadeIn') },
        React.createElement("div", { className: channelsettings_1.contentStyles.header },
            React.createElement("span", { id: (0, Utilities_1.getId)('title') }, modalSettingsTitle),
            React.createElement(react_1.IconButton, { styles: channelsettings_1.iconButtonStyles, iconProps: channelsettings_1.cancelIcon, ariaLabel: utils_1.Utility.getStringTranslation4Locale('ariaCloseChannelSettings', pageLanguage.Language), onClick: closeModal })),
        React.createElement("div", { className: channelsettings_1.contentStyles.body },
            React.createElement(react_1.Stack, { tokens: channelsettings_1.stackTokens }, channelsConfig.map(function (item) {
                if (myNewsGuid != item.TermGuid) {
                    return (React.createElement(react_1.Checkbox, { key: item.TermGuid, label: utils_1.Utility.getChannelText(pageLanguage, item), defaultChecked: item.Subscribed, onChange: function (ev, isChecked) { return channelCheckboxChanged(item, ev, isChecked); }, styles: channelsettings_1.customCheckboxStyles }));
                }
            })))));
}
exports.ChannelSettings = ChannelSettings;
//# sourceMappingURL=ChannelSettings.js.map