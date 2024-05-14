import * as React from 'react';
import styles from '../RealTimeNewsFeed.module.scss';
import {
    Text,
    DocumentCard,
    DocumentCardPreview,
    DocumentCardDetails,
    DocumentCardTitle,
    CommandBar,
} from '@fluentui/react';
import INewsItem from '../../../models/INewsItem';
import { getCommandBarItems, getImage, getStickyCommandBarInnerStyles, getStickyImageInnerStyles } from '../../../utils/ui';
import { AppContext, AppContextProps } from '../../../common/AppContext';

export function StickyItem(props: INewsItem) {
    const context = React.useContext<AppContextProps | undefined>(AppContext);
    const contextRef = React.useRef<AppContextProps | undefined>(context);

    return (
        <DocumentCard className={`${styles.card} ${styles.cardHighlight}`} onClickHref={props.NewsUrl}>
            <div className={styles.imageWrapper}>
                {<DocumentCardPreview styles={getStickyImageInnerStyles()} {...getImage(props.ImageUrl)} />}
            </div>
            <DocumentCardDetails className={styles.details}>
                <DocumentCardTitle className={styles.title} title={props.NewsTitle} />
                {props.PubFrom && (
                    <DocumentCardTitle
                        className={styles.subtitle}
                        title={props.PubFrom}
                        showAsSecondaryTitle
                    />
                )}
                <Text block className={styles.text}>
                    {props.NewsHeader}
                </Text>
                <div className={styles.metaBarContainer}>
                    <div className={styles.metaBar}>
                        <CommandBar
                            className={styles.commandBar}
                            styles={getStickyCommandBarInnerStyles()}
                            items={getCommandBarItems(contextRef.current.pageLanguage, props.comments, props.likes)}
                        />
                    </div>
                </div>
            </DocumentCardDetails>
        </DocumentCard>
    );
}

