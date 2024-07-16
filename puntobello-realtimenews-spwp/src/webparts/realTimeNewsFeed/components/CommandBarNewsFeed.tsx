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
import { buttonStyles, dropdownStyles } from '../../../styles/commandbar';
import ICommandBarData from '../../../models/ICommandBarData';
import { Utility } from '../../../utils/utils';

export function CommandBarNewsFeed(props: ICommandBarData) {

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
              name: Utility.getStringTranslation4Locale('modalSettingsLink', props.pageLanguage),
              onClick: () => { props.channelSettingsModalClicked(); },
            }
          ]}
          onRenderOverflowButton={onRenderOverflowButton}
          onRenderItem={onRenderOverflowItem}
          className={styles.overflowSet}
        />
      </div>
    </div>
  );
}
