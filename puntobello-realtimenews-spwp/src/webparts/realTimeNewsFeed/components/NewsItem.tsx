import * as React from 'react';
import styles from '../RealTimeNewsFeed.module.scss';
import {
    DocumentCard,
    DocumentCardPreview,
    DocumentCardDetails,
    DocumentCardTitle,
    Text
} from '@fluentui/react';
import INewsItem from '../models/INewsItem';
import { getImage, getNewsImageInnerStyles } from '../utils/ui';

export function NewsItem(props: INewsItem) {
    const {
        NewsUrl,
        ImageUrl,
        NewsTitle,
        PublishedFrom,
        NewsHeader
      } = props;
    return (
        <a href={NewsUrl} className={styles.linkNewsItem} data-interception="off">
        <DocumentCard className={styles.card}>
            <div className={styles.imageWrapper}>
                {<DocumentCardPreview styles={getNewsImageInnerStyles()} {...getImage(ImageUrl)} />}
            </div>
            <DocumentCardDetails className={styles.details}>
                <DocumentCardTitle className={styles.title} title={NewsTitle} />
                <Text block className={styles.text}>
                    {NewsHeader}
                </Text>
                <div className={styles.metaBarContainer}>
                    <div className={styles.metaBar}>
                        <Text block nowrap>
                            {PublishedFrom}
                        </Text>
                    </div>
                </div>
            </DocumentCardDetails>
        </DocumentCard>
        </a>
    );
}