import IRootEnv from "../models/IRootEnv";

let rootEnv: IRootEnv | null = null;

export const getRootEnv = (): IRootEnv => {
    if (!rootEnv) {
        rootEnv = {
            css: {
                '--spfx_theme_color_ui_black': process.env.SPFX_THEME_COLOR_UI_BLACK,
                '--spfx_theme_color_ui_white': process.env.SPFX_THEME_COLOR_UI_WHITE,
                '--spfx_theme_color_ui_primary': process.env.SPFX_THEME_COLOR_UI_PRIMARY,
                '--spfx_theme_color_ui_dark_primary': process.env.SPFX_THEME_COLOR_UI_DARK_PRIMARY,
                '--spfx_theme_color_ui_bright_grey': process.env.SPFX_THEME_COLOR_UI_BRIGHT_GREY,
                '--spfx_theme_color_ui_middle_grey': process.env.SPFX_THEME_COLOR_UI_MIDDLE_GREY,
                '--spfx_theme_color_ui_dark_grey': process.env.SPFX_THEME_COLOR_UI_DARK_GREY,
                '--spfx_border_radius': process.env.SPFX_BORDER_RADIUS,
                '--spfx_card_box_shadow': process.env.SPFX_CARD_BOX_SHADOW,
                '--spfx_card_box_shadow_hover': process.env.SPFX_CARD_BOX_SHADOW_HOVER,
                '--spfx_system_message_box_shadow': process.env.SPFX_SYSTEM_MESSAGE_BOX_SHADOW,
                '--spfx_font_family': process.env.SPFX_FONT_FAMILY,
                '--spfx_generic_font_size': process.env.SPFX_GENERIC_FONT_SIZE,
                '--spfx_title_font_size': process.env.SPFX_TITLE_FONT_SIZE,
            },
            config: {
                spfxSocketUrl: process.env.SPFX_SOCKET_URL,
                spfxSubscribedChannelsListTitle: process.env.SPFX_SUBSCRIBEDCHANNELS_LIST_TITLE,
                spfxRealtimenewsListId: process.env.SPFX_REALTIMENEWSLIST_ID,
                spfxRealtimenewsPath: process.env.SPFX_REALTIMENEWSLIST_PATH,
            }
        };
    }
    return rootEnv;
};
