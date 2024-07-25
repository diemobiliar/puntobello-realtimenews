import * as React from 'react';
import styles from '../RealTimeNewsFeed.module.scss';
import {
    Text,
    DocumentCard,
    DocumentCardPreview,
    DocumentCardDetails,
    DocumentCardTitle
} from '@fluentui/react';
import INewsItem from '../models/INewsItem';
import { getImage, getStickyImageInnerStyles } from '../utils/ui';

export function StickyItem(props: INewsItem) {
    const {
        NewsUrl,
        ImageUrl,
        NewsTitle,
        PublishedFrom,
        NewsHeader
      } = props;

    return (
        <DocumentCard className={`${styles.card} ${styles.cardHighlight}`} onClickHref={NewsUrl}>
            <div className={styles.imageWrapper}>
                {<DocumentCardPreview styles={getStickyImageInnerStyles()} {...getImage(ImageUrl)} />}
            </div>
            <DocumentCardDetails className={styles.details}>
                <DocumentCardTitle className={styles.title} title={NewsTitle} />
                {PublishedFrom && (
                    <DocumentCardTitle
                        className={styles.subtitle}
                        title={PublishedFrom}
                        showAsSecondaryTitle
                    />
                )}
                <Text block className={styles.text}>
                    {NewsHeader}
                </Text>
            </DocumentCardDetails>
        </DocumentCard>
    );
}

