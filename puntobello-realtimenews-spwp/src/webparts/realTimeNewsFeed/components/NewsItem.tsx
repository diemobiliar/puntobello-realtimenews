// React Imports
import * as React from 'react';

// Fluent UI Components
import {
    DocumentCard,
    DocumentCardPreview,
    DocumentCardDetails,
    DocumentCardTitle,
    Text
} from '@fluentui/react';

// Styles
import styles from '../RealTimeNewsFeed.module.scss';

// Models
import { INewsItem } from '../models';

// Utility Functions
import { getImage, getNewsImageInnerStyles } from '../utils/ui';

/**
 * A React component that renders a news item as a clickable document card.
 * This component is used to display individual news items with an image, title, header, and published date.
 * 
 * @param {INewsItem} props - The properties object that contains the news item data.
 * @param {string} props.NewsUrl - The URL of the news item.
 * @param {string} props.ImageUrl - The URL of the image associated with the news item.
 * @param {string} props.NewsTitle - The title of the news item.
 * @param {string} props.PublishedFrom - The date the news item was published.
 * @param {string} props.NewsHeader - A brief description or header of the news item.
 * 
 * @returns {JSX.Element} The JSX element representing the news item as a document card.
 * 
 * @example
 * <NewsItem 
 *   NewsUrl="https://example.com/news/123"
 *   ImageUrl="https://example.com/image.jpg"
 *   NewsTitle="Breaking News"
 *   PublishedFrom="2024-08-12"
 *   NewsHeader="This is a brief description of the news item."
 * />
 */
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
