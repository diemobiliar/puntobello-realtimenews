import * as React from 'react';
import { DefaultButton, DocumentCard, DocumentCardDetails, DocumentCardTitle, FontIcon } from '@fluentui/react';

import { ISystemMessage } from '../models';
import { Utility } from '../utils/utils';
import { useAppContext } from '../contexts/AppContext';

import styles from '../RealTimeNewsFeed.module.scss';

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
export function SystemMessage(props: ISystemMessage) {
    const {
        Title,
        buttonUpdateNewsClicked,
    } = props;
    const { pageLanguage } = useAppContext();

    return (
        <DocumentCard className={styles.systemMessage}>
            <DocumentCardDetails className={styles.details}>
                <FontIcon iconName="RingerActive" className={styles.icon} />
                {
                    <DocumentCardTitle className={styles.title} title={Title} />
                }
                <DefaultButton className={styles.button} onClick={() => { buttonUpdateNewsClicked(); }}>
                    {Utility.getStringTranslation4Locale('SystemMessageLabel', pageLanguage.Language)}
                </DefaultButton>
            </DocumentCardDetails>
        </DocumentCard>
    );
}
