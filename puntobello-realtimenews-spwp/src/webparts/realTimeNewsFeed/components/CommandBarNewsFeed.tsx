import * as React from 'react';

// Importing styles
import styles from '../RealTimeNewsFeed.module.scss';
import { buttonStyles, dropdownStyles } from '../styles/commandbar';

// Fluent UI components
import {
  Dropdown,
  OverflowSet,
  IOverflowSetItemProps,
  Link,
  IconButton,
} from '@fluentui/react';

// Utility functions and context
import { Utility } from '../utils/utils';
import { useAppContext } from '../contexts/AppContext';

// Models
import { ICommandBar } from '../models';

/**
 * CommandBarNewsFeed component renders a command bar for the news feed, 
 * including a dropdown for channel selection and an overflow set for additional actions.
 * 
 * @param {ICommandBar} props - The properties passed to the component.
 * @param {Array} props.channelDropdown - The options to display in the channel selection dropdown.
 * @param {function} props.channelDropdownChanged - Callback function to handle the event when the dropdown selection changes.
 * @param {function} props.channelSettingsModalClicked - Callback function to handle the event when the channel settings modal is clicked.
 * @param {string} props.selectedKey - The key of the currently selected dropdown option.
 * 
 * @returns {JSX.Element} The rendered CommandBarNewsFeed component.
 */
export function CommandBarNewsFeed(props: ICommandBar): JSX.Element {
  const {
    channelDropdown,
    channelDropdownChanged,
    channelSettingsModalClicked,
    selectedKey,
  } = props;
  const { pageLanguage } = useAppContext();

  /**
   * Renders an item in the OverflowSet as a link.
   * 
   * @param {IOverflowSetItemProps} item - The overflow set item to render.
   * @returns {JSX.Element} The rendered link element for the overflow item.
   */
  function onRenderOverflowItem(item: IOverflowSetItemProps): JSX.Element {
    return (
      <Link role="menuitem" className={styles.overflowSetLink} onClick={item.onClick}>
        {item.name}
      </Link>
    );
  }

  /**
   * Renders the overflow button for the OverflowSet.
   * This method is required by the Fluent UI OverflowSet component but is not used in this implementation.
   * The overflow button is hidden unless there are items to display in the overflow set.
   * 
   * @param {any[]} overflowItems - The items to display in the overflow menu.
   * @returns {JSX.Element} The rendered overflow button element.
   */
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
          options={channelDropdown}
          styles={dropdownStyles}
          className={styles.dropdown}
          selectedKey={selectedKey}
          onChange={(event, option, value) => {
            channelDropdownChanged(option.key);
          }}
        />
      </div>
      <div className={styles.filterBarItem}>
        <OverflowSet
          role="menubar"
          items={[
            {
              key: 'channelsettingsmodal',
              name: Utility.getStringTranslation4Locale('modalSettingsLink', pageLanguage.Language),
              onClick: () => { channelSettingsModalClicked(); },
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
