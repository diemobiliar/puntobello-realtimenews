"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NewsItem = void 0;
var tslib_1 = require("tslib");
// React Imports
var React = tslib_1.__importStar(require("react"));
// Fluent UI Components
var react_1 = require("@fluentui/react");
// Styles
var RealTimeNewsFeed_module_scss_1 = tslib_1.__importDefault(require("../RealTimeNewsFeed.module.scss"));
// Utility Functions
var ui_1 = require("../utils/ui");
/**
 * A React component that renders a news item as a clickable document card.
 * This component is used to display individual news items with an image, title, header, and published date.
 *
 * @param {INewsItem} props - The properties object that contains the news item data.
 * @param {string} props.NewsUrl - The URL of the news item.
 * @param {string} props.ImageUrl - The URL of the image associated with the news item.
 * @param {string} props.NewsTitle - The title of the news item.
 * @param {string} props.PublishedFrom - The date the news item was published.
 * @param {string} props.NewsHeader - A brief description or header of the news item.
 *
 * @returns {JSX.Element} The JSX element representing the news item as a document card.
 *
 * @example
 * <NewsItem
 *   NewsUrl="https://example.com/news/123"
 *   ImageUrl="https://example.com/image.jpg"
 *   NewsTitle="Breaking News"
 *   PublishedFrom="2024-08-12"
 *   NewsHeader="This is a brief description of the news item."
 * />
 */
function NewsItem(props) {
    var NewsUrl = props.NewsUrl, ImageUrl = props.ImageUrl, NewsTitle = props.NewsTitle, PublishedFrom = props.PublishedFrom, NewsHeader = props.NewsHeader;
    return (React.createElement("a", { href: NewsUrl, className: RealTimeNewsFeed_module_scss_1.default.linkNewsItem, "data-interception": "off" },
        React.createElement(react_1.DocumentCard, { className: RealTimeNewsFeed_module_scss_1.default.card },
            React.createElement("div", { className: RealTimeNewsFeed_module_scss_1.default.imageWrapper }, React.createElement(react_1.DocumentCardPreview, tslib_1.__assign({ styles: (0, ui_1.getNewsImageInnerStyles)() }, (0, ui_1.getImage)(ImageUrl)))),
            React.createElement(react_1.DocumentCardDetails, { className: RealTimeNewsFeed_module_scss_1.default.details },
                React.createElement(react_1.DocumentCardTitle, { className: RealTimeNewsFeed_module_scss_1.default.title, title: NewsTitle }),
                React.createElement(react_1.Text, { block: true, className: RealTimeNewsFeed_module_scss_1.default.text }, NewsHeader),
                React.createElement("div", { className: RealTimeNewsFeed_module_scss_1.default.metaBarContainer },
                    React.createElement("div", { className: RealTimeNewsFeed_module_scss_1.default.metaBar },
                        React.createElement(react_1.Text, { block: true, nowrap: true }, PublishedFrom)))))));
}
exports.NewsItem = NewsItem;
//# sourceMappingURL=NewsItem.js.map