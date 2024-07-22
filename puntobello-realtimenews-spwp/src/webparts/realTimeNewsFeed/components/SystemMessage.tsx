import * as React from 'react';
import styles from '../RealTimeNewsFeed.module.scss';
import ISystemMessageProps from '../../../models/ISystemMessage';
import {
    DefaultButton,
    DocumentCard,
    DocumentCardDetails,
    DocumentCardTitle,
    FontIcon,
} from '@fluentui/react';
import { Utility } from '../../../utils/utils';

export function SystemMessage(props: ISystemMessageProps) {
    const {
        Title,
        buttonUpdateNewsClicked,
        pageLanguage
      } = props;
    
    return (
        <DocumentCard className={styles.systemMessage}>
            <DocumentCardDetails className={styles.details}>
                <FontIcon iconName="RingerActive" className={styles.icon} />
                {
                    <DocumentCardTitle className={styles.title} title={Title} />
                }
                <DefaultButton className={styles.button} onClick={() => {buttonUpdateNewsClicked(); }}>{Utility.getStringTranslation4Locale('SystemMessageLabel', pageLanguage)}</DefaultButton>
            </DocumentCardDetails>
        </DocumentCard>
    );
}

