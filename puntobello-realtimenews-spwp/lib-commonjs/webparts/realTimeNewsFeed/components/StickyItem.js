"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StickyItem = void 0;
var tslib_1 = require("tslib");
var React = tslib_1.__importStar(require("react"));
var react_1 = require("@fluentui/react");
var RealTimeNewsFeed_module_scss_1 = tslib_1.__importDefault(require("../RealTimeNewsFeed.module.scss"));
var ui_1 = require("../utils/ui");
/**
 * StickyItem component renders a highlighted news item card with an image, title, subtitle, and header text.
 * This component is designed to visually emphasize the "sticky" news item within a list of news articles.
 *
 * @param {INewsItem} props - The properties object containing details about the news item.
 * @param {string} props.NewsUrl - The URL that the news item should link to.
 * @param {string} props.ImageUrl - The URL of the image to be displayed in the news item card.
 * @param {string} props.NewsTitle - The title of the news item.
 * @param {string} [props.PublishedFrom] - The publication date of the news item. If provided, it will be displayed as a subtitle.
 * @param {string} props.NewsHeader - The header text of the news item, typically a brief summary or introduction.
 *
 * @returns {JSX.Element} A JSX element representing the news item card.
 */
function StickyItem(props) {
    var NewsUrl = props.NewsUrl, ImageUrl = props.ImageUrl, NewsTitle = props.NewsTitle, PublishedFrom = props.PublishedFrom, NewsHeader = props.NewsHeader;
    return (React.createElement(react_1.DocumentCard, { className: "".concat(RealTimeNewsFeed_module_scss_1.default.card, " ").concat(RealTimeNewsFeed_module_scss_1.default.cardHighlight), onClickHref: NewsUrl },
        React.createElement("div", { className: RealTimeNewsFeed_module_scss_1.default.imageWrapper }, React.createElement(react_1.DocumentCardPreview, tslib_1.__assign({ styles: (0, ui_1.getStickyImageInnerStyles)() }, (0, ui_1.getImage)(ImageUrl)))),
        React.createElement(react_1.DocumentCardDetails, { className: RealTimeNewsFeed_module_scss_1.default.details },
            React.createElement(react_1.DocumentCardTitle, { className: RealTimeNewsFeed_module_scss_1.default.title, title: NewsTitle }),
            PublishedFrom && (React.createElement(react_1.DocumentCardTitle, { className: RealTimeNewsFeed_module_scss_1.default.subtitle, title: PublishedFrom, showAsSecondaryTitle: true })),
            React.createElement(react_1.Text, { block: true, className: RealTimeNewsFeed_module_scss_1.default.text }, NewsHeader))));
}
exports.StickyItem = StickyItem;
//# sourceMappingURL=StickyItem.js.map