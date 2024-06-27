import * as React from 'react';
import styles from '../RealTimeNewsFeed.module.scss';
import ISystemMessageProps from '../../../models/ISystemMessage';
import {
    DefaultButton,
    DocumentCard,
    DocumentCardDetails,
    DocumentCardTitle,
} from '@fluentui/react';
import { Utility } from '../../../utils/utils';

export function SystemMessage(props: ISystemMessageProps) {
    return (
        <DocumentCard className={styles.systemMessage}>
            <DocumentCardDetails className={styles.details}>
                <svg width="32" height="32" viewBox="0 0 32 32" className={styles.icon}>
                    <path
                        fill="currentColor"
                        d="M5.344 25.719h21.313v-1.594q0-0.219-0.156-0.375t-0.375-0.156q-1.094 0-1.875-0.781t-0.781-1.875v-5.875q0-1.25-0.406-2.406t-1.125-2.109-1.719-1.641-2.219-1.031q-0.469-0.125-0.984-0.203t-1.016-0.078-1 0.078-1 0.203q-1.188 0.313-2.188 1-1.031 0.719-1.75 1.656t-1.125 2.094q-0.406 1.188-0.406 2.438v5.875q0 0.438-0.141 0.844t-0.391 0.75h14.406v1.063h-16.531q-0.219 0-0.375 0.156t-0.156 0.375v1.594zM14.938 26.813q0 0.438 0.313 0.75t0.75 0.313 0.75-0.313 0.313-0.75h-2.125zM12.844 6q0.188-1.125 1.078-1.891t2.078-0.766 2.078 0.766 1.078 1.891q1.438 0.5 2.625 1.375 1.188 0.906 2.031 2.094t1.313 2.625q0.469 1.406 0.469 2.969v5.875q0 0.219 0.156 0.375t0.375 0.156q1.125 0 1.906 0.781t0.781 1.875v1.594q0 0.906-0.625 1.531t-1.531 0.625h-7.625q-0.344 0.938-1.172 1.531t-1.859 0.594-1.859-0.594-1.172-1.531h-7.625q-0.906 0-1.531-0.625t-0.625-1.531v-1.594q0-1.094 0.781-1.875t1.906-0.781q0.219 0 0.375-0.156t0.156-0.375v-5.875q0-1.563 0.469-2.969 0.469-1.438 1.313-2.625t2.031-2.094q1.188-0.875 2.625-1.375v0zM14.938 6.594q0.25-0.031 0.516-0.047t0.547-0.016 0.547 0.016 0.516 0.047v-0.063q0-0.438-0.313-0.75t-0.75-0.313-0.75 0.313-0.313 0.75v0.063zM10.656 15.063h-1.063q0-1.313 0.5-2.5 0.5-1.156 1.375-2.016t2.031-1.391q1.188-0.5 2.5-0.5v1.063q-2.219 0-3.781 1.563t-1.563 3.781v0z"
                    />
                </svg>
                {
                    <DocumentCardTitle className={styles.title} title={props.Title} />
                }
                <DefaultButton className={styles.button} onClick={() => { props.buttonUpdateNewsClicked(); }}>{Utility.getStringTranslation4Locale('SystemMessageLabel', props.pageLanguage)}</DefaultButton>
            </DocumentCardDetails>
        </DocumentCard>
    );
}

