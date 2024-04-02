import * as React from 'react';
import styles from '../RealTimeNewsFeed.module.scss';
import {
    DocumentCard,
    DocumentCardPreview,
    DocumentCardDetails,
    DocumentCardTitle,
    Text,
    CommandBar,
} from 'office-ui-fabric-react';
import INewsItem from '../models/INewsItem';
import { getCommandBarItems, getImage, getNewsCommandBarInnerStyles, getNewsImageInnerStyles } from '../../../utils/ui';

export function NewsItem(props: INewsItem) {

    return (
        <a href={props.NewsUrl} className={styles.linkNewsItem} data-interception="off">
        <DocumentCard className={styles.card}>
            <div className={styles.imageWrapper}>
                {<DocumentCardPreview styles={getNewsImageInnerStyles()} {...getImage(props.ImageUrl)} />}
                {props.isGANL && <div className={styles.imageMeta}>{props.GANLWW}</div>}
            </div>
            <DocumentCardDetails className={styles.details}>
                <DocumentCardTitle className={styles.title} title={props.NewsTitle} />
                <Text block className={styles.text}>
                    {props.NewsHeader}
                </Text>
                <div className={styles.metaBarContainer}>
                    <div className={styles.metaBar}>
                        <Text block nowrap>
                            {props.PubFrom}
                        </Text>
                        <CommandBar
                            className={styles.commandBar}
                            styles={getNewsCommandBarInnerStyles()}
                            items={getCommandBarItems(props.wpLang, props.comments, props.likes)}
                        />
                    </div>
                </div>
            </DocumentCardDetails>
        </DocumentCard>
        </a>
    );
}