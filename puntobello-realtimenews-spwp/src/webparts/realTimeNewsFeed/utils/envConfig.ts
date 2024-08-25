import { IRootEnv } from "../models";

let rootEnv: IRootEnv | null = null;

/**
 * Retrieves the root environment configuration settings, including CSS variables and SharePoint configuration.
 * The configuration is lazily initialized and cached for future use.
 * 
 * @returns {IRootEnv} The root environment configuration object containing CSS variables and SharePoint configuration settings.
 * 
 * @example
 * const env = getRootEnv();
 * console.log(env.css['--spfx_color_primary']); // Output: The primary UI color defined in the environment
 */
export const getRootEnv = (): IRootEnv => {
    if (!rootEnv) {
        // Lazily initialize the root environment configuration if it hasn't been initialized yet
        rootEnv = {
            css: {
                '--spfx_color_text': process.env.SPFX_COLOR_TEXT,
                '--spfx_color_sticky_text': process.env.SPFX_COLOR_STICKY_TEXT,
                '--spfx_color_primary': process.env.SPFX_COLOR_PRIMARY,
                '--spfx_color_primary_brightness_dark': process.env.SPFX_COLOR_PRIMARY_BRIGHTNESS_DARK,
                '--spfx_border_radius': process.env.SPFX_BORDER_RADIUS,
                '--spfx_card_box_shadow': process.env.SPFX_CARD_BOX_SHADOW,
                '--spfx_card_box_shadow_hover': process.env.SPFX_CARD_BOX_SHADOW_HOVER,
                '--spfx_system_message_box_shadow': process.env.SPFX_SYSTEM_MESSAGE_BOX_SHADOW,
                '--spfx_font_family': process.env.SPFX_FONT_FAMILY,
                '--spfx_font_size_generic': process.env.SPFX_FONT_SIZE_GENERIC,
                '--spfx_font_size_title': process.env.SPFX_FONT_SIZE_TITLE,
            },
            config: {
                spfxSocketUrl: process.env.SPFX_URL_SOCKET,
                spfxSubscribedChannelsListTitle: process.env.SPFX_LIST_TITLE_SUBSCRIBEDCHANNELS,
                spfxRealtimenewsListId: process.env.SPFX_LIST_ID_REALTIMENEWSLIST,
                spfxRealtimenewsPath: process.env.SPFX_PATH_REALTIMENEWSLIST,
                spfxSocketTimeoutInMs: process.env.SPFX_TIMEOUT_IN_MS_SOCKET,
                spfxTermstoreChannelGuid: process.env.SPFX_TERMSTORE_CHANNEL_GUID,
            }
        };
    }
    return rootEnv;
};
