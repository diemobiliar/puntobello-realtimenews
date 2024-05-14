import * as React from 'react';
import styles from '../RealTimeNewsFeed.module.scss';
import {
    DocumentCard,
    DocumentCardPreview,
    DocumentCardDetails,
    DocumentCardTitle,
    Text,
    CommandBar,
    ICommandBarItemProps,
} from '@fluentui/react';
import INewsItem from '../../../models/INewsItem';
import { getCommandBarItems, getImage, getNewsCommandBarInnerStyles, getNewsImageInnerStyles } from '../../../utils/ui';
import { AppContext, AppContextProps } from '../../../common/AppContext';

export function NewsItem(props: INewsItem) {
    const context = React.useContext<AppContextProps | undefined>(AppContext);
    const contextRef = React.useRef<AppContextProps | undefined>(context);

    const [commandBarItems, setCommandBarItems] = React.useState<ICommandBarItemProps[]>();

    React.useEffect(() => {
      async function getCBItems() {
        const cbItems = await getCommandBarItems(contextRef.current.pageLanguage, props.comments, props.likes);
        setCommandBarItems(cbItems);
      }  
      getCBItems();
    }, []);

  
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
                            {props.PubFrom}
                        </Text>
                        <CommandBar
                            className={styles.commandBar}
                            styles={getNewsCommandBarInnerStyles()}
                            items={commandBarItems}
                        />
                    </div>
                </div>
            </DocumentCardDetails>
        </DocumentCard>
        </a>
    );
}