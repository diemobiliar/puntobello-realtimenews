import { IButtonStyles, IDropdownStyles } from '@fluentui/react';

export const dropdownStyles: Partial<IDropdownStyles> = {
  dropdownItem: {
    '& body, & p, & h1, & h2, & h3, & h4, & h5, & h6, & li, & a, & span, & div': {
      fontFamily: `${process.env.SPFX_FONT_FAMILY} !important`,
    },
  },
  title: {
    fontSize: `${process.env.SPFX_GENERIC_FONT_SIZE}`,
    height: '40px',
    lineHeight: '37px',
    padding: '0 30px 0 12px',
    borderRadius: '3px',
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
        borderRadius: `${process.env.SPFX_BORDER_RADIUS}`,
        borderColor: `${process.env.SPFX_THEME_COLOR_UI_PRIMARY}`,
      },
    },
  },
  dropdownOptionText: {
    fontSize: `${process.env.SPFX_GENERIC_FONT_SIZE}`,
    color: `${process.env.SPFX_THEME_COLOR_UI_BLACK}`,
    lineHeight: '1.25',
  },
  caretDownWrapper: {
    right: '12px',
    height: '40px',
    lineHeight: '40px',
  },
  caretDown: {
    fontSize: `${process.env.SPFX_GENERIC_FONT_SIZE}`,
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

export const buttonStyles: Partial<IButtonStyles> = {
  root: {
    minWidth: 0,
    padding: '0 4px',
    alignSelf: 'stretch',
    height: 'auto',
  },
};

