"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getNewsCommandBarInnerStyles = exports.getNewsImageInnerStyles = exports.getStickyCommandBarInnerStyles = exports.getStickyImageInnerStyles = exports.getImage = exports.getEditedDate = void 0;
var tslib_1 = require("tslib");
// External libraries
var moment_1 = tslib_1.__importDefault(require("moment"));
// Fluent UI components and styles
var react_1 = require("@fluentui/react");
// Project-specific utilities and configurations
var envconfig_1 = require("./envconfig");
/**
 * Formats the provided publication date string into a 'DD.MM.YYYY' format.
 *
 * @param {string} pubdate - The publication date as a string.
 * @returns {string} The formatted date string in 'DD.MM.YYYY' format.
 */
function getEditedDate(pubdate) {
    return (0, moment_1.default)(pubdate).format('DD.MM.YYYY');
}
exports.getEditedDate = getEditedDate;
/**
 * Generates the configuration for a document card preview image.
 *
 * @param {any} imageUrl - The URL of the image to be used. If not provided, a placeholder image will be used.
 * @returns {IDocumentCardPreviewProps} The configuration object for the document card preview.
 */
function getImage(imageUrl) {
    var currImage = {
        previewImages: [
            {
                previewImageSrc: imageUrl ? imageUrl.Url + "&resolution=6" : 'https://via.placeholder.com/570x460',
                imageFit: react_1.ImageFit.cover,
                width: 285,
            },
        ],
    };
    return currImage;
}
exports.getImage = getImage;
/**
 * Generates custom styles for the inner image of a sticky news item.
 *
 * @returns {Partial<IImageStyles>} The custom styles for the sticky image.
 */
function getStickyImageInnerStyles() {
    return {
        root: {
            position: 'static',
            borderBottom: 'none',
            height: '100%',
            selectors: {
                '> div': {
                    height: '100%',
                },
                '.ms-Image': {
                    position: 'static',
                    width: '100% !important',
                    height: '100% !important',
                },
            },
            '@media (max-width: 639px)': {
                selectors: {
                    '.ms-Image': {
                        width: '100% !important',
                    },
                    '.ms-Image-image': {
                        position: 'relative',
                        left: 0,
                        top: 0,
                        transform: 'none',
                    },
                },
            },
        },
    };
}
exports.getStickyImageInnerStyles = getStickyImageInnerStyles;
/**
 * Generates custom styles for the command bar within a sticky news item.
 *
 * @returns {Partial<ICommandBarStyles>} The custom styles for the sticky command bar.
 */
function getStickyCommandBarInnerStyles() {
    var rootEnv = (0, envconfig_1.getRootEnv)();
    return {
        root: {
            paddingRight: 0,
            backgroundColor: 'transparent',
            selectors: {
                '.ms-Icon': {
                    color: rootEnv.css['--spfx_color_sticky_text'],
                    marginRight: 4,
                    marginBottom: -1,
                    transition: '0.15s linear color',
                },
                '.ms-Button': {
                    backgroundColor: 'transparent',
                    color: rootEnv.css['--spfx_color_sticky_text'],
                    transition: '0.15s linear color',
                },
                '.ms-Button:hover, .ms-Button:active': {
                    backgroundColor: 'transparent',
                    color: rootEnv.css['--spfx_color_sticky_text'],
                    selectors: {
                        '.ms-Icon': {
                            color: rootEnv.css['--spfx_color_sticky_text'],
                        },
                    },
                },
            },
        },
        primarySet: {
            justifyContent: 'flex-end',
        },
    };
}
exports.getStickyCommandBarInnerStyles = getStickyCommandBarInnerStyles;
/**
 * Generates custom styles for the inner image of a news item.
 *
 * @returns {Partial<IImageStyles>} The custom styles for the news image.
 */
function getNewsImageInnerStyles() {
    return {
        root: {
            height: '100%',
            position: 'static',
            borderBottom: 'none',
            selectors: {
                '> div': {
                    height: '100%',
                },
                '.ms-Image': {
                    position: 'static',
                    height: '100%',
                },
                '.ms-Image-image': {
                    height: '100%',
                    maxHeight: '267px',
                },
            },
            '@media (max-width: 639px)': {
                selectors: {
                    '.ms-Image': {
                        width: '100% !important',
                    },
                    '.ms-Image-image': {
                        position: 'relative',
                        left: 0,
                        top: 0,
                        transform: 'none',
                    },
                },
            },
        },
    };
}
exports.getNewsImageInnerStyles = getNewsImageInnerStyles;
/**
 * Generates custom styles for the command bar within a news item.
 *
 * @returns {Partial<ICommandBarStyles>} The custom styles for the news command bar.
 */
function getNewsCommandBarInnerStyles() {
    var rootEnv = (0, envconfig_1.getRootEnv)();
    return {
        root: {
            paddingRight: 0,
            selectors: {
                '.ms-Icon': {
                    color: rootEnv.css['--spfx_color_text'],
                    filter: "brightness(".concat(rootEnv.css['--spfx_color_text_brightness_dark'], ")"),
                    marginRight: 4,
                    marginBottom: -1,
                    transition: '0.15s linear color',
                },
                '.ms-Button': {
                    color: rootEnv.css['--spfx_color_text'],
                    filter: "brightness(".concat(rootEnv.css['--spfx_color_text_brightness_dark'], ")"),
                    transition: '0.15s linear color',
                },
                '.ms-Button:hover, .ms-Button:active': {
                    backgroundColor: 'transparent',
                    color: rootEnv.css['--spfx_color_text'],
                    selectors: {
                        '.ms-Icon': {
                            color: rootEnv.css['--spfx_color_text'],
                        },
                    },
                },
            },
        },
        primarySet: {
            justifyContent: 'flex-end',
        },
    };
}
exports.getNewsCommandBarInnerStyles = getNewsCommandBarInnerStyles;
//# sourceMappingURL=ui.js.map