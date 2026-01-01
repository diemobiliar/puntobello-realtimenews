"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SystemMessage = void 0;
var tslib_1 = require("tslib");
var React = tslib_1.__importStar(require("react"));
var react_1 = require("@fluentui/react");
var utils_1 = require("../utils/utils");
var AppContext_1 = require("../contexts/AppContext");
var RealTimeNewsFeed_module_scss_1 = tslib_1.__importDefault(require("../RealTimeNewsFeed.module.scss"));
/**
 * `SystemMessage` is a functional React component that displays a system message card with an icon,
 * title, and a button. The button triggers a callback function when clicked, allowing the user
 * to update news or perform any other action defined in the parent component.
 *
 * @param {ISystemMessage} props - The properties passed to this component.
 * @param {string} props.Title - The title text to display in the system message card.
 * @param {() => void} props.buttonUpdateNewsClicked - A callback function that is invoked when the
 *                                                     update news button is clicked.
 *
 * @returns {JSX.Element} A `DocumentCard` element styled as a system message, including an icon, title,
 *                        and an action button.
 *
 * @example
 * <SystemMessage
 *   Title="New updates available!"
 *   buttonUpdateNewsClicked={handleUpdateClick}
 * />
 */
function SystemMessage(props) {
    var Title = props.Title, buttonUpdateNewsClicked = props.buttonUpdateNewsClicked;
    var pageLanguage = (0, AppContext_1.useAppContext)().pageLanguage;
    return (React.createElement(react_1.DocumentCard, { className: RealTimeNewsFeed_module_scss_1.default.systemMessage },
        React.createElement(react_1.DocumentCardDetails, { className: RealTimeNewsFeed_module_scss_1.default.details },
            React.createElement(react_1.FontIcon, { iconName: "RingerActive", className: RealTimeNewsFeed_module_scss_1.default.icon }),
            React.createElement(react_1.DocumentCardTitle, { className: RealTimeNewsFeed_module_scss_1.default.title, title: Title }),
            React.createElement(react_1.DefaultButton, { className: RealTimeNewsFeed_module_scss_1.default.button, onClick: function () { buttonUpdateNewsClicked(); } }, utils_1.Utility.getStringTranslation4Locale('SystemMessageLabel', pageLanguage.Language)))));
}
exports.SystemMessage = SystemMessage;
//# sourceMappingURL=SystemMessage.js.map