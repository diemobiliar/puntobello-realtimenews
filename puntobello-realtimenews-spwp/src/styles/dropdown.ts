import { IDropdownStyles } from '@fluentui/react';

export const dropdownStyles: Partial<IDropdownStyles> = {
  title: {
    fontSize: '18px',
    height: '40px',
    lineHeight: '37px',
    padding: '0 30px 0 12px',
    borderRadius: '6px',
    borderColor: `${process.env.SPFX_THEME_COLOR_UI_DARK_GREY}`,
    color: `${process.env.SPFX_THEME_COLOR_UI_BLACK}`,
  },
  dropdown: {
    selectors: {
      '&:hover .ms-Dropdown-title': {
        borderColor: `${process.env.SPFX_THEME_COLOR_UI_DARK_GREY}`,
        color: `${process.env.SPFX_THEME_COLOR_UI_BLACK}`,
      },
      '&:focus::after': {
        borderRadius: '6px',
        borderColor: `${process.env.SPFX_THEME_COLOR_UI_PRIMARY}`,
      },
    },
  },
  dropdownOptionText: {
    fontSize: '18px',
    color: `${process.env.SPFX_THEME_COLOR_UI_BLACK}`,
    lineHeight: '1.25',
  },
  caretDownWrapper: {
    right: '12px',
    height: '40px',
    lineHeight: '40px',
  },
  caretDown: {
    fontSize: '18px',
    color: `${process.env.SPFX_THEME_COLOR_UI_BLACK}`,
  },
  label: {
    position: 'absolute',
    overflow: 'hidden',
    clip: 'rect(0, 0, 0, 0)',
    width: '1px',
    height: '1px',
    whiteSpace: 'nowrap',
  },
};
