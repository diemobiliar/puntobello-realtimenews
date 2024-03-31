import { IOrderedTermInfo } from "@pnp/sp/taxonomy";
import ILanguage from "../webparts/realTimeNewsFeed/models/ILanguage";
import * as moment from 'moment';
import * as __ from 'lodash';
import { getStringTranslation } from "./localize";
import { ICommandBarItemProps, ICommandBarStyles, IDocumentCardPreviewProps, IImageStyles, ImageFit } from "office-ui-fabric-react";

export function getGANLWeek(GANLWeek: IOrderedTermInfo[], isGANL: boolean, termid: string, language: string): string {
    let retVal: string = 'KWNF';
    let currTermId: string = '';
    if (!isGANL) return retVal;

    if (__.endsWith(termid, ';')) {
        currTermId = termid.substring(0, termid.length - 1);
    } else {
        currTermId = termid;
    }
    // lodash foreach to break in loop
    __.forEach(GANLWeek, currentTerm => {
        if (currentTerm.id == currTermId) {
            const termLanguages: ILanguage[] = currentTerm.labels.map((label): ILanguage => {
                return { Language: label.languageTag, Text: label.name };
            });
            __.forEach(termLanguages, currLang => {
                if (currLang.Language.substring(0, 2) == language) {
                    retVal = currLang.Text.replace(' ', '');
                    // exits loop
                    return false;
                }
            });
            // exits loop
            return false;
        }
    });
    return retVal;
}

export function getEditedDate(pubdate: string): string {
    return moment(pubdate).format('DD.MM.YYYY');
}

export function getSystemMessageTitle(numberOfNewNews: number, locale: string) {
    return numberOfNewNews.toString() + " " + getStringTranslation('NewNewsAvailableLabel', locale);
}

export function getCommandBarItems(language: string, comments: number, likes: number) {
    const commandBarItems: ICommandBarItemProps[] = [];
    const cbComments: ICommandBarItemProps = {
        key: 'comment',
        text: comments.toString(),
        ariaLabel: getStringTranslation('ariaLabelPictoNewsComments', language),
        iconProps: {
            iconName: 'Comment',
        }
    };
    const cbLikes: ICommandBarItemProps = {
        key: 'like',
        text: likes.toString(),
        ariaLabel: getStringTranslation('ariaLabelPictoNewsLikes', language),
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
                height: 230,
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
    },});
}


export function getNewsImageInnerStyles(): Partial<IImageStyles> {
    return ({
    root: {
        position: 'static',
        borderBottom: 'none',
        selectors: {
            '.ms-Image': {
                position: 'static',
                height: 'auto !important',
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
    },});
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
    },});
}