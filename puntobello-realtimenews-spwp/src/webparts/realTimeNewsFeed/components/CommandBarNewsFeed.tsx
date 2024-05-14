import * as React from 'react';
import styles from '../RealTimeNewsFeed.module.scss';
import {
  Dropdown,
  OverflowSet,
  IOverflowSetItemProps,
  Link,
  IButtonStyles,
  IconButton,
} from '@fluentui/react';
import { Navigation } from 'spfx-navigation';

import { dropdownStyles } from '../../../styles/dropdown';
import ICommandBarData from '../../../models/ICommandBarData';
import { AppContext, AppContextProps } from '../../../common/AppContext';
import { Utility } from '../../../utils/utils';

export function CommandBarNewsFeed(props: ICommandBarData) {
  const context = React.useContext<AppContextProps | undefined>(AppContext);
  const contextRef = React.useRef<AppContextProps | undefined>(context);

  function onRenderOverflowItem(item: IOverflowSetItemProps): JSX.Element {
    return (
      <Link role="menuitem" className={styles.overflowSetLink} onClick={item.onClick}>
        {item.name}
      </Link>
    );
  }

  // This method is mandatory for the fluent ui control OverflowSet
  // But we do not show any additional menu, so the strings are not translated
  // => the overflow button will never be shown as long as there are no overflow items in the overflow set
  function onRenderOverflowButton(overflowItems: any[] | undefined): JSX.Element {
    const buttonStyles: Partial<IButtonStyles> = {
      root: {
        minWidth: 0,
        padding: '0 4px',
        alignSelf: 'stretch',
        height: 'auto',
      },
    };
    return (
      <IconButton
        role="menuitem"
        title="Mehr Optionen"
        styles={buttonStyles}
        menuIconProps={{ iconName: 'More' }}
        menuProps={{ items: overflowItems! }}
      />
    );
  }

  return (
    <div className={styles.filterBar}>
      <div className={styles.filterBarItem}>
        <Dropdown
          options={props.channelDropdown}
          styles={dropdownStyles}
          className={styles.dropdown}
          selectedKey={props.selectedKey}
          onChange={(event, option, value) => {
            props.channelDropdownChanged(option.key);
          }}
        />
      </div>
      <div className={styles.filterBarItem}>
        <OverflowSet
          role="menubar"
          items={[
            {
              key: 'channelsettingsmodal',
              name: Utility.getStringTranslation4Locale('modalSettingsLink', contextRef.current.pageLanguage),
              onClick: () => { props.channelSettingsModalClicked(); },
            },
            {
              key: 'puntobellonewssearch',
              name: Utility.getStringTranslation4Locale('archivLink', contextRef.current.pageLanguage),
              onClick: () => { Navigation.navigate(props.archivLinkUrl, true); },
            },
          ]}
          onRenderOverflowButton={onRenderOverflowButton}
          onRenderItem={onRenderOverflowItem}
          className={styles.overflowSet}
        />
      </div>
    </div>
  );
}
