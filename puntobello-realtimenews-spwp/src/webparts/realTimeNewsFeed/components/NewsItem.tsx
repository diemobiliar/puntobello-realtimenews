import * as React from 'react';
import styles from '../RealTimeNewsFeed.module.scss';
import {
    DocumentCard,
    DocumentCardPreview,
    DocumentCardDetails,
    DocumentCardTitle,
    Text
} from '@fluentui/react';
import INewsItem from '../../../models/INewsItem';
import { getImage, getNewsImageInnerStyles } from '../../../utils/ui';

export function NewsItem(props: INewsItem) {
    return (
        <a href={props.NewsUrl} className={styles.linkNewsItem} data-interception="off">
        <DocumentCard className={styles.card}>
            <div className={styles.imageWrapper}>
                {<DocumentCardPreview styles={getNewsImageInnerStyles()} {...getImage(props.ImageUrl)} />}
            </div>
            <DocumentCardDetails className={styles.details}>
                <DocumentCardTitle className={styles.title} title={props.NewsTitle} />
                <Text block className={styles.text}>
                    {props.NewsHeader}
                </Text>
                <div className={styles.metaBarContainer}>
                    <div className={styles.metaBar}>
                        <Text block nowrap>
                            {props.PublishedFrom}
                        </Text>
                    </div>
                </div>
            </DocumentCardDetails>
        </DocumentCard>
        </a>
    );
}