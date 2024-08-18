import * as React from 'react';
import { Text, DocumentCard, DocumentCardPreview, DocumentCardDetails, DocumentCardTitle } from '@fluentui/react';
import styles from '../RealTimeNewsFeed.module.scss';
import { INewsItem } from '../models';
import { getImage, getStickyImageInnerStyles } from '../utils/ui';
/**
 * StickyItem component renders a highlighted news item card with an image, title, subtitle, and header text.
 * This component is designed to visually emphasize the "sticky" news item within a list of news articles.
 * 
 * @param {INewsItem} props - The properties object containing details about the news item.
 * @param {string} props.NewsUrl - The URL that the news item should link to.
 * @param {string} props.ImageUrl - The URL of the image to be displayed in the news item card.
 * @param {string} props.NewsTitle - The title of the news item.
 * @param {string} [props.PublishedFrom] - The publication date of the news item. If provided, it will be displayed as a subtitle.
 * @param {string} props.NewsHeader - The header text of the news item, typically a brief summary or introduction.
 * 
 * @returns {JSX.Element} A JSX element representing the news item card.
 */
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
