import { getTheme, FontWeights, mergeStyleSets, IIconProps, ICheckboxStyles } from '@fluentui/react';
import { getRootEnv } from '../utils/envConfig';

const theme = getTheme();
const rootEnv = getRootEnv();

export const cancelIcon: IIconProps = { iconName: 'Cancel' };

export const contentStyles = mergeStyleSets({
  container: {
    display: 'flex',
    flexFlow: 'column nowrap',
    alignItems: 'stretch',
    borderRadius: `12px solid ${rootEnv.css['--spfx_theme_color_ui_bright_grey']}`,
    minHeight: '300px',
    minWidth: '360px',
    animationName: 'modalFadeIn',
    animationDuration: '0.6s',
    animationTimingFunction: 'ease-out',
    '& body, & p, & h1, & h2, & h3, & h4, & h5, & h6, & li, & a, & span, & div': {
      fontFamily: `${rootEnv.css['--spfx_font_family']}!important`,
    },
  },
  header: [
    theme.fonts.xLarge,
    {
      flex: '1 1 auto',
      borderTop: `12px solid ${rootEnv.css['--spfx_theme_color_ui_primary']}`,
      color: rootEnv.css['--spfx_theme_color_ui_primary'],
      display: 'flex',
      alignItems: 'center',
      fontWeight: FontWeights.semibold,
      padding: '12px 12px 14px 24px',
    },
  ],
  body: {
    flex: '4 4 auto',
    padding: '0 24px 24px 24px',
    overflowY: 'hidden',
    selectors: {
      p: { margin: '14px 0' },
      'p:first-child': { marginTop: 0 },
      'p:last-child': { marginBottom: 0 },
    },
  },
});

export const iconButtonStyles = {
  root: {
    color: rootEnv.css['--spfx_theme_color_ui_primary'],
    marginLeft: 'auto',
    marginTop: '4px',
    marginRight: '2px',
  },
  rootHovered: {
    color: rootEnv.css['--spfx_theme_color_ui_black'],
  },
};

export const customCheckboxStyles: Partial<ICheckboxStyles> = {
  checkbox: {
    border: `2px solid ${rootEnv.css['--spfx_theme_color_ui_middle_grey']} !important`,
    borderRadius: rootEnv.css['--spfx_border_radius'],
    backgroundColor: rootEnv.css['--spfx_theme_color_ui_primary'],
  },
  checkmark: {
    color: rootEnv.css['--spfx_theme_color_ui_white'],
    fontWeight: FontWeights.semibold,
  },
  text: {
    color: rootEnv.css['--spfx_theme_color_ui_black'],
  },
};

export const stackTokens = { childrenGap: 15 };

// Keyframe animations as strings
export const fadeInKeyframes = `
  @keyframes modalFadeIn {
    from {
      opacity: 0;
      transform: translateY(-20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

