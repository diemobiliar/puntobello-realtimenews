// External libraries
import * as moment from 'moment';
import * as __ from 'lodash';

// Fluent UI components and styles
import { ICommandBarStyles, IDocumentCardPreviewProps, IImageStyles, ImageFit } from "@fluentui/react";

// Project-specific utilities and configurations
import { getRootEnv } from './envconfig';

/**
 * Formats the provided publication date string into a 'DD.MM.YYYY' format.
 *
 * @param {string} pubdate - The publication date as a string.
 * @returns {string} The formatted date string in 'DD.MM.YYYY' format.
 */
export function getEditedDate(pubdate: string): string {
    return moment(pubdate).format('DD.MM.YYYY');
}

/**
 * Generates the configuration for a document card preview image.
 *
 * @param {any} imageUrl - The URL of the image to be used. If not provided, a placeholder image will be used.
 * @returns {IDocumentCardPreviewProps} The configuration object for the document card preview.
 */
export function getImage(imageUrl: any): IDocumentCardPreviewProps {
    const currImage = {
        previewImages: [
            {
                previewImageSrc: imageUrl ? imageUrl.Url + "&resolution=6" : 'https://via.placeholder.com/570x460',
                imageFit: ImageFit.cover,
                width: 285,
            },
        ],
    };
    return currImage;
}

/**
 * Generates custom styles for the inner image of a sticky news item.
 *
 * @returns {Partial<IImageStyles>} The custom styles for the sticky image.
 */
export function getStickyImageInnerStyles(): Partial<IImageStyles> {
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

/**
 * Generates custom styles for the command bar within a sticky news item.
 *
 * @returns {Partial<ICommandBarStyles>} The custom styles for the sticky command bar.
 */
export function getStickyCommandBarInnerStyles(): Partial<ICommandBarStyles> {
    const rootEnv = getRootEnv();
    return {
        root: {
            paddingRight: 0,
            backgroundColor: 'transparent',
            selectors: {
                '.ms-Icon': {
                    color: rootEnv.css['--spfx_theme_color_ui_white'],
                    marginRight: 4,
                    marginBottom: -1,
                    transition: '0.15s linear color',
                },
                '.ms-Button': {
                    backgroundColor: 'transparent',
                    color: rootEnv.css['--spfx_theme_color_ui_white'],
                    transition: '0.15s linear color',
                },
                '.ms-Button:hover, .ms-Button:active': {
                    backgroundColor: 'transparent',
                    color: rootEnv.css['--spfx_theme_color_ui_white'],
                    selectors: {
                        '.ms-Icon': {
                            color: rootEnv.css['--spfx_theme_color_ui_white'],
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

/**
 * Generates custom styles for the inner image of a news item.
 *
 * @returns {Partial<IImageStyles>} The custom styles for the news image.
 */
export function getNewsImageInnerStyles(): Partial<IImageStyles> {
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
                    maxHeight:'267px',
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

/**
 * Generates custom styles for the command bar within a news item.
 *
 * @returns {Partial<ICommandBarStyles>} The custom styles for the news command bar.
 */
export function getNewsCommandBarInnerStyles(): Partial<ICommandBarStyles> {
    const rootEnv = getRootEnv();
    return {
        root: {
            paddingRight: 0,
            selectors: {
                '.ms-Icon': {
                    color: rootEnv.css['--spfx_theme_color_ui_dark_grey'],
                    marginRight: 4,
                    marginBottom: -1,
                    transition: '0.15s linear color',
                },
                '.ms-Button': {
                    color: rootEnv.css['--spfx_theme_color_ui_dark_grey'],
                    transition: '0.15s linear color',
                },
                '.ms-Button:hover, .ms-Button:active': {
                    backgroundColor: 'transparent',
                    color: rootEnv.css['--spfx_theme_color_ui_black'],
                    selectors: {
                        '.ms-Icon': {
                            color: rootEnv.css['--spfx_theme_color_ui_black'],
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

