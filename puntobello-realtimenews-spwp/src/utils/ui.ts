import * as moment from 'moment';
import * as __ from 'lodash';
import { ICommandBarItemProps, ICommandBarStyles, IDocumentCardPreviewProps, IImageStyles, ImageFit } from "@fluentui/react";
import { Utility } from './utils';

export function getEditedDate(pubdate: string): string {
    return moment(pubdate).format('DD.MM.YYYY');
}

export function getSystemMessageTitle(numberOfNewNews: number, locale: string) {
    return numberOfNewNews.toString() + " " + getStringTranslation4Locale('NewNewsAvailableLabel', locale);
}

export async function getCommandBarItems(language: string, comments: number, likes: number): Promise<ICommandBarItemProps[]> {
    const commandBarItems: ICommandBarItemProps[] = [];
    const cbComments: ICommandBarItemProps = {
        key: 'comment',
        text: comments.toString(),
        ariaLabel: await Utility.getStringTranslation4Locale('ariaLabelPictoNewsComments', language),
        iconProps: {
            iconName: 'Comment',
        }
    };
    const cbLikes: ICommandBarItemProps = {
        key: 'like',
        text: likes.toString(),
        ariaLabel: await Utility.getStringTranslation4Locale('ariaLabelPictoNewsLikes', language),
        iconProps: {
            iconName: 'Like',
        }
    };
    commandBarItems.push(cbComments);
    commandBarItems.push(cbLikes);
    return commandBarItems;
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
                    color: '#fff',
                    marginRight: 4,
                    marginBottom: -1,
                    transition: '0.15s linear color',
                },
                '.ms-Button': {
                    backgroundColor: 'transparent',
                    color: '#fff',
                    transition: '0.15s linear color',
                },
                '.ms-Button:hover, .ms-Button:active': {
                    backgroundColor: 'transparent',
                    color: '#fff',
                    selectors: {
                        '.ms-Icon': {
                            color: '#fff',
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
                    color: '#73777B',
                    marginRight: 4,
                    marginBottom: -1,
                    transition: '0.15s linear color',
                },
                '.ms-Button': {
                    color: '#73777B',
                    transition: '0.15s linear color',
                },
                '.ms-Button:hover, .ms-Button:active': {
                    backgroundColor: 'transparent',
                    color: '#000',
                    selectors: {
                        '.ms-Icon': {
                            color: '#000',
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

function getStringTranslation4Locale(arg0: string, locale: string) {
    throw new Error('Function not implemented.');
}
