//#region #Imports
import * as React from 'react';
import {
    Modal,
    getTheme,
    mergeStyleSets,
    FontWeights,
    IconButton,
    IIconProps,
} from 'office-ui-fabric-react';
import { getId } from 'office-ui-fabric-react/lib/Utilities';
import { Checkbox } from 'office-ui-fabric-react/lib/Checkbox';
import { Stack } from 'office-ui-fabric-react/lib/Stack';
import { IChannels2SubscriptionItem } from '../models/IRedNetNewsFeed';
import "@pnp/sp/fields";
import IChannelSettingsModalProps from '../models/IChannelSettings';
import { getChannelText, getStringTranslation } from '../../../utils/localize';

//#region 

//#region #Styles
const cancelIcon: IIconProps = { iconName: 'Cancel' };

const theme = getTheme();
const contentStyles = mergeStyleSets({
    container: {
        display: 'flex',
        flexFlow: 'column nowrap',
        alignItems: 'stretch',
    },
    header: [
        theme.fonts.xLarge,
        {
            flex: '1 1 auto',
            borderTop: `4px solid #da2323`,
            color: '#da2323',
            display: 'flex',
            alignItems: 'center',
            fontWeight: FontWeights.semibold,
            padding: '12px 12px 14px 24px',
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
        color: '#da2323',
        marginLeft: 'auto',
        marginTop: '4px',
        marginRight: '2px',
    },
    rootHovered: {
        color: '#000000',
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
                    ariaLabel={getStringTranslation('ariaCloseChannelSettings', props.locale)}
                    onClick={closeModal}
                />
            </div>

            {<div className={contentStyles.body}>
                <Stack tokens={stackTokens}>
                    {props.channelsConfig.map((item) => {
                        if (props.myNewsGuid != item.TermGuid) {
                            return <Checkbox label={getChannelText(props.wpLang, item)}
                                disabled={item.Mandatory ? true : false}
                                defaultChecked={item.Subscribed || item.Mandatory ? true : false}
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

