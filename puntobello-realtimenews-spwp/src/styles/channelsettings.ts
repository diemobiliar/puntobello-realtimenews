import { getTheme, FontWeights, mergeStyleSets, IIconProps, ICheckboxStyles } from '@fluentui/react';

const theme = getTheme();

export const cancelIcon: IIconProps = { iconName: 'Cancel' };

export const contentStyles = mergeStyleSets({
  container: {
    display: 'flex',
    flexFlow: 'column nowrap',
    alignItems: 'stretch',
    borderRadius: `12px solid ${process.env.SPFX_BORDER_RADIUS}`,
    minHeight: '300px',
    minWidth: '360px',
    animationName: 'modalFadeIn',
    animationDuration: '0.6s',
    animationTimingFunction: 'ease-out',
    '& body, & p, & h1, & h2, & h3, & h4, & h5, & h6, & li, & a, & span, & div': {
      fontFamily: `${process.env.SPFX_FONT_FAMILY} !important`,
    },
  },
  header: [
    theme.fonts.xLarge,
    {
      flex: '1 1 auto',
      borderTop: `12px solid ${process.env.SPFX_THEME_COLOR_UI_PRIMARY}`,
      color: `${process.env.SPFX_THEME_COLOR_UI_PRIMARY}`,
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
    color: `${process.env.SPFX_THEME_COLOR_UI_PRIMARY}`,
    marginLeft: 'auto',
    marginTop: '4px',
    marginRight: '2px',
  },
  rootHovered: {
    color: `${process.env.SPFX_THEME_COLOR_UI_BLACK}`,
  },
};

export const customCheckboxStyles: Partial<ICheckboxStyles> = {
  checkbox: {
    border: `2px solid ${process.env.SPFX_THEME_COLOR_UI_MIDDLE_GREY} !important`,
    borderRadius: `${process.env.SPFX_BORDER_RADIUS}`,
    backgroundColor: `${process.env.SPFX_THEME_COLOR_UI_PRIMARY}`,
  },
  checkmark: {
    color: process.env.SPFX_THEME_COLOR_UI_WHITE,
    fontWeight: FontWeights.semibold,
  },
  text: {
    color: process.env.SPFX_THEME_COLOR_UI_BLACK,
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

