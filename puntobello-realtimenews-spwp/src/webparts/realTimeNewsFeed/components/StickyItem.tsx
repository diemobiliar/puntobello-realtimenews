import * as React from 'react';
import styles from '../RealTimeNewsFeed.module.scss';
import {
    Text,
    DocumentCard,
    DocumentCardPreview,
    DocumentCardDetails,
    DocumentCardTitle
} from '@fluentui/react';
import INewsItem from '../../../models/INewsItem';
import { getImage, getStickyImageInnerStyles } from '../../../utils/ui';

export function StickyItem(props: INewsItem) {
    return (
        <DocumentCard className={`${styles.card} ${styles.cardHighlight}`} onClickHref={props.NewsUrl}>
            <div className={styles.imageWrapper}>
                {<DocumentCardPreview styles={getStickyImageInnerStyles()} {...getImage(props.ImageUrl)} />}
            </div>
            <DocumentCardDetails className={styles.details}>
                <DocumentCardTitle className={styles.title} title={props.NewsTitle} />
                {props.PublishedFrom && (
                    <DocumentCardTitle
                        className={styles.subtitle}
                        title={props.PublishedFrom}
                        showAsSecondaryTitle
                    />
                )}
                <Text block className={styles.text}>
                    {props.NewsHeader}
                </Text>
            </DocumentCardDetails>
        </DocumentCard>
    );
}

