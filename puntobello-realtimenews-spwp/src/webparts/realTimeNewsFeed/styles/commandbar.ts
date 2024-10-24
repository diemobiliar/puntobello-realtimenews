import { IButtonStyles, IDropdownStyles } from '@fluentui/react';
import { getRootEnv } from '../utils/envconfig';

const rootEnv = getRootEnv();

export const dropdownStyles: Partial<IDropdownStyles> = {
  dropdownItem: {
    '& body, & p, & h1, & h2, & h3, & h4, & h5, & h6, & li, & a, & span, & div': {
      fontFamily: `${rootEnv.css['--spfx_font_family']} !important`,
    },
  },
  title: {
    fontSize: rootEnv.css['--spfx_font_size_generic'],
    height: '40px',
    lineHeight: '37px',
    padding: '0 30px 0 12px',
    borderRadius: '3px',
    borderColor: rootEnv.css['--spfx_color_text'],
    color: rootEnv.css['--spfx_color_text'],
  },
  dropdown: {
    selectors: {
      '&:hover .ms-Dropdown-title': {
        borderColor: rootEnv.css['--spfx_color_text'],
        color: rootEnv.css['--spfx_color_text'],
      },
      '&:focus::after': {
        borderRadius: rootEnv.css['--spfx_border_radius'],
        borderColor: rootEnv.css['--spfx_color_primary'],
      },
    },
  },
  dropdownOptionText: {
    fontSize: rootEnv.css['--spfx_theme_generic_font_size'],
    color: rootEnv.css['--spfx_color_text'],
    lineHeight: '1.25',
  },
  caretDownWrapper: {
    right: '12px',
    height: '40px',
    lineHeight: '40px',
  },
  caretDown: {
    fontSize: rootEnv.css['--spfx_theme_generic_font_size'],
    color: rootEnv.css['--spfx_color_text'],
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

