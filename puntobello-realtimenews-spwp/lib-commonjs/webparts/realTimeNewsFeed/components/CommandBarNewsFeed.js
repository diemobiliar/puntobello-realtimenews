"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommandBarNewsFeed = void 0;
var tslib_1 = require("tslib");
var React = tslib_1.__importStar(require("react"));
// Importing styles
var RealTimeNewsFeed_module_scss_1 = tslib_1.__importDefault(require("../RealTimeNewsFeed.module.scss"));
var commandbar_1 = require("../styles/commandbar");
// Fluent UI components
var react_1 = require("@fluentui/react");
// Utility functions and context
var utils_1 = require("../utils/utils");
var AppContext_1 = require("../contexts/AppContext");
/**
 * CommandBarNewsFeed component renders a command bar for the news feed,
 * including a dropdown for channel selection and an overflow set for additional actions.
 *
 * @param {ICommandBar} props - The properties passed to the component.
 * @param {Array} props.channelDropdown - The options to display in the channel selection dropdown.
 * @param {function} props.channelDropdownChanged - Callback function to handle the event when the dropdown selection changes.
 * @param {function} props.channelSettingsModalClicked - Callback function to handle the event when the channel settings modal is clicked.
 * @param {string} props.selectedKey - The key of the currently selected dropdown option.
 *
 * @returns {JSX.Element} The rendered CommandBarNewsFeed component.
 */
function CommandBarNewsFeed(props) {
    var channelDropdown = props.channelDropdown, channelDropdownChanged = props.channelDropdownChanged, channelSettingsModalClicked = props.channelSettingsModalClicked, selectedKey = props.selectedKey;
    var pageLanguage = (0, AppContext_1.useAppContext)().pageLanguage;
    /**
     * Renders an item in the OverflowSet as a link.
     *
     * @param {IOverflowSetItemProps} item - The overflow set item to render.
     * @returns {JSX.Element} The rendered link element for the overflow item.
     */
    function onRenderOverflowItem(item) {
        return (React.createElement(react_1.Link, { role: "menuitem", className: RealTimeNewsFeed_module_scss_1.default.overflowSetLink, onClick: item.onClick }, item.name));
    }
    /**
     * Renders the overflow button for the OverflowSet.
     * This method is required by the Fluent UI OverflowSet component but is not used in this implementation.
     * The overflow button is hidden unless there are items to display in the overflow set.
     *
     * @param {any[]} overflowItems - The items to display in the overflow menu.
     * @returns {JSX.Element} The rendered overflow button element.
     */
    function onRenderOverflowButton(overflowItems) {
        return (React.createElement(react_1.IconButton, { role: "menuitem", title: "Mehr Optionen", styles: commandbar_1.buttonStyles, menuIconProps: { iconName: 'More' }, menuProps: { items: overflowItems } }));
    }
    return (React.createElement("div", { className: RealTimeNewsFeed_module_scss_1.default.filterBar },
        React.createElement("div", { className: RealTimeNewsFeed_module_scss_1.default.filterBarItem },
            React.createElement(react_1.Dropdown, { options: channelDropdown, styles: commandbar_1.dropdownStyles, className: RealTimeNewsFeed_module_scss_1.default.dropdown, selectedKey: selectedKey, onChange: function (event, option) {
                    channelDropdownChanged(option === null || option === void 0 ? void 0 : option.key);
                } })),
        React.createElement("div", { className: RealTimeNewsFeed_module_scss_1.default.filterBarItem },
            React.createElement(react_1.OverflowSet, { role: "menubar", items: [
                    {
                        key: 'channelsettingsmodal',
                        name: utils_1.Utility.getStringTranslation4Locale('modalSettingsLink', pageLanguage.Language),
                        onClick: function () { channelSettingsModalClicked(); },
                    }
                ], onRenderOverflowButton: onRenderOverflowButton, onRenderItem: onRenderOverflowItem, className: RealTimeNewsFeed_module_scss_1.default.overflowSet }))));
}
exports.CommandBarNewsFeed = CommandBarNewsFeed;
//# sourceMappingURL=CommandBarNewsFeed.js.map