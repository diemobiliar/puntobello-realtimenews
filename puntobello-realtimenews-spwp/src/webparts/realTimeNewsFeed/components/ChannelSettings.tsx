//#region #Imports
import * as React from 'react';
import {
    Modal,
    getTheme,
    mergeStyleSets,
    FontWeights,
    IconButton,
    IIconProps,
} from '@fluentui/react';
import { getId } from '@fluentui/react/lib/Utilities';
import { Checkbox } from '@fluentui/react/lib/Checkbox';
import { Stack } from '@fluentui/react/lib/Stack';
import { IChannels2SubscriptionItem } from '../../../models/INewsFeed';
import "@pnp/sp/fields";
import IChannelSettingsModalProps from '../../../models/IChannelSettings';
import { Utility } from '../../../utils/utils';

//#region 

//#region #Styles
const cancelIcon: IIconProps = { iconName: 'Cancel' };

const theme = getTheme();
const contentStyles = mergeStyleSets({
    container: {
        display: 'flex',
        flexFlow: 'column nowrap',
        alignItems: 'stretch',
        borderRadius: '16px',
        minHeight: '300px',
        minWidht: '360px'
    },
    header: [
        theme.fonts.xLarge,
        {
            flex: '1 1 auto',
            borderTop: `12px solid ${process.env.SPFX_THEME_COLOR_UI_PRIMARY}`,
            color: `${process.env.SPFX_THEME_COLOR_UI_PRIMARY}`,
            display: 'flex',
            alignItems: 'center',
            fontWeight: FontWeights.semibold,
            padding: '12px 12px 14px 24px'
        },
    ],
    body: {
        flex: '4 4 auto',
        padding: '0 24px 24px 24px',
        overflowY: 'hidden',
        selectors: {
            p: { margin: '14px 0' },
            'p:first-child': { marginTop: 0 },
            'p:last-child': { marginBottom: 0 },
        },
    },
});

const iconButtonStyles = {
    root: {
        color: `${process.env.SPFX_THEME_COLOR_UI_PRIMARY}`,
        marginLeft: 'auto',
        marginTop: '4px',
        marginRight: '2px',
    },
    rootHovered: {
        color: `${process.env.SPFX_THEME_COLOR_UI_BLACK}`,
    },
};

const stackTokens = { childrenGap: 15 };
//#endregion


export function ChannelSettings(props: IChannelSettingsModalProps) {
    function closeModal() {
        props.closeModal();
    }

    function channelCheckboxChanged(item: IChannels2SubscriptionItem, ev: React.FormEvent<HTMLElement>, isChecked: boolean) {
        props.changeChannelSettings(item,ev,isChecked);
    }

    return (
        <Modal
            titleAriaId={getId('title')}
            isOpen={props.modalVisible}
            onDismiss={closeModal}
            isModeless={false}
            isBlocking={true}
            containerClassName={contentStyles.container}
        >
            <div className={contentStyles.header}>
                <span id={getId('title')}>{props.modalSettingsTitle}</span>
                <IconButton
                    styles={iconButtonStyles}
                    iconProps={cancelIcon}
                    ariaLabel={Utility.getStringTranslation4Locale('ariaCloseChannelSettings', props.pageLanguage.Language)}
                    onClick={closeModal}
                />
            </div>

            {<div className={contentStyles.body}>
                <Stack tokens={stackTokens}>
                    {props.channelsConfig.map((item) => {
                        if (props.myNewsGuid != item.TermGuid) {
                            return <Checkbox label={Utility.getChannelText(props.pageLanguage, item)}
                                defaultChecked={item.Subscribed}
                                onChange={channelCheckboxChanged.bind(this, item)}
                            />;
                        }
                    }
                    )}
                </Stack>
            </div>}
        </Modal>
    );
}

