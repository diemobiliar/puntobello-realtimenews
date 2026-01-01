"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fadeInKeyframes = exports.stackTokens = exports.customCheckboxStyles = exports.iconButtonStyles = exports.contentStyles = exports.cancelIcon = void 0;
var react_1 = require("@fluentui/react");
var envconfig_1 = require("../utils/envconfig");
var theme = (0, react_1.getTheme)();
var rootEnv = (0, envconfig_1.getRootEnv)();
exports.cancelIcon = { iconName: 'Cancel' };
exports.contentStyles = (0, react_1.mergeStyleSets)({
    container: {
        display: 'flex',
        flexFlow: 'column nowrap',
        alignItems: 'stretch',
        borderRadius: "12px solid ".concat(rootEnv.css['--spfx_color_primary']),
        minHeight: '300px',
        minWidth: '360px',
        animationName: 'modalFadeIn',
        animationDuration: '0.6s',
        animationTimingFunction: 'ease-out',
        '& body, & p, & h1, & h2, & h3, & h4, & h5, & h6, & li, & a, & span, & div': {
            fontFamily: "".concat(rootEnv.css['--spfx_font_family'], "!important"),
        },
    },
    header: [
        theme.fonts.xLarge,
        {
            flex: '1 1 auto',
            borderTop: "12px solid ".concat(rootEnv.css['--spfx_color_primary']),
            color: rootEnv.css['--spfx_color_primary'],
            display: 'flex',
            alignItems: 'center',
            fontWeight: react_1.FontWeights.semibold,
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
exports.iconButtonStyles = {
    root: {
        color: rootEnv.css['--spfx_color_primary'],
        marginLeft: 'auto',
        marginTop: '4px',
        marginRight: '2px',
    },
    rootHovered: {
        color: rootEnv.css['--spfx_color_text'],
    },
};
exports.customCheckboxStyles = {
    root: {
        selectors: {
            ':hover': {
                backgroundColor: 'transparent !important',
            },
            '.is-checked': {
                backgroundColor: 'transparent !important',
            },
        },
    },
    checkbox: {
        border: "2px solid ".concat(rootEnv.css['--spfx_color_primary'], " !important"),
        borderRadius: rootEnv.css['--spfx_border_radius'],
        backgroundColor: 'transparent !important',
    },
    checkmark: {
        color: rootEnv.css['--spfx_color_primary'],
        fontWeight: react_1.FontWeights.semibold,
        selectors: {
            ':hover': {
                color: rootEnv.css['--spfx_color_text'],
            },
        },
    },
    label: {
        selectors: {
            ':hover': {
                backgroundColor: 'transparent !important',
            },
        },
    },
    text: {
        color: rootEnv.css['--spfx_color_text'],
    },
};
exports.stackTokens = { childrenGap: 15 };
// Keyframe animations as strings
exports.fadeInKeyframes = "\n  @keyframes modalFadeIn {\n    from {\n      opacity: 0;\n      transform: translateY(-20px);\n    }\n    to {\n      opacity: 1;\n      transform: translateY(0);\n    }\n  }\n";
//# sourceMappingURL=channelsettings.js.map