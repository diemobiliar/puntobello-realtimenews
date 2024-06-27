import * as moment from 'moment';
import * as __ from 'lodash';
import { ICommandBarItemProps, ICommandBarStyles, IDocumentCardPreviewProps, IImageStyles, ImageFit } from "@fluentui/react";
import { Utility } from './utils';

export function getEditedDate(pubdate: string): string {
    return moment(pubdate).format('DD.MM.YYYY');
}

export function getImage(imageUrl: any): IDocumentCardPreviewProps {
    const currImage =
    {
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

export function getStickyImageInnerStyles(): Partial<IImageStyles> {
    return ({
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
    });
}

export function getStickyCommandBarInnerStyles(): Partial<ICommandBarStyles> {
    return ({
        root: {
            paddingRight: 0,
            backgroundColor: 'transparent',
            selectors: {
                '.ms-Icon': {
                    color: `${process.env.SPFX_THEME_COLOR_UI_WHITE}`,
                    marginRight: 4,
                    marginBottom: -1,
                    transition: '0.15s linear color',
                },
                '.ms-Button': {
                    backgroundColor: 'transparent',
                    color: `${process.env.SPFX_THEME_COLOR_UI_WHITE}`,
                    transition: '0.15s linear color',
                },
                '.ms-Button:hover, .ms-Button:active': {
                    backgroundColor: 'transparent',
                    color: `${process.env.SPFX_THEME_COLOR_UI_WHITE}`,
                    selectors: {
                        '.ms-Icon': {
                            color: `${process.env.SPFX_THEME_COLOR_UI_WHITE}`,
                        },
                    },
                },
            },
        },
        primarySet: {
            justifyContent: 'flex-end',
        },
    });
}


export function getNewsImageInnerStyles(): Partial<IImageStyles> {
    return ({
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
    });
}

export function getNewsCommandBarInnerStyles(): Partial<ICommandBarStyles> {
    return ({
        root: {
            paddingRight: 0,
            selectors: {
                '.ms-Icon': {
                    color: `${process.env.SPFX_THEME_COLOR_UI_DARK_GREY}`,
                    marginRight: 4,
                    marginBottom: -1,
                    transition: '0.15s linear color',
                },
                '.ms-Button': {
                    color: `${process.env.SPFX_THEME_COLOR_UI_DARK_GREY}`,
                    transition: '0.15s linear color',
                },
                '.ms-Button:hover, .ms-Button:active': {
                    backgroundColor: 'transparent',
                    color: `${process.env.SPFX_THEME_COLOR_UI_BLACK}`,
                    selectors: {
                        '.ms-Icon': {
                            color: `${process.env.SPFX_THEME_COLOR_UI_BLACK}`,
                        },
                    },
                },
            },
        },
        primarySet: {
            justifyContent: 'flex-end',
        },
    });
}
