# PuntoBello Realtime News webpart

## Summary
This webpart shows news from a custom list and gets actions from a socket server. User preferences regarding subscriptions are managed through this webpart.

### Features
Please enhance testnd
The news are queried with various parameters :
1. Language code, the webpart shows only news according to the language code set up in the webpart property
2. Channels/Location. A news may belong to multiple channels and adress specific locations. Additionally the channels & locations can be targeted hierarchically. The webpart takes care of showing the relevant news
3. Publishing datetime from / to

### _Note_
* Uses PnP-Js library for fetching all rest interactions with sharepoint.

### Parameters
You can configure all the parameters in the corresponding files located in the `env` directory. Once set, build the solution accordingly.

| Parameter                              | Description                                                              |
|----------------------------------------|--------------------------------------------------------------------------|
| SPFX_URL_SOCKET                        | URL for the socket connection used for real-time communication.          |
| SPFX_TIMEOUT_IN_MS_SOCKET              | Timeout setting in milliseconds for socket connections.                  |
| SPFX_LIST_TITLE_SUBSCRIBEDCHANNELS      | Title of the list containing subscribed channels.                        |
| SPFX_LIST_ID_REALTIMENEWSLIST          | ID of the list used for real-time news.                                   |
| SPFX_PATH_REALTIMENEWSLIST             | Path to the real-time news list.                                          |
| SPFX_TERMSTORE_CHANNEL_GUID            | GUID for the term store channel.                                          |
| SPFX_COLOR_TEXT                        | The primary color used for text throughout the application.              |
| SPFX_COLOR_TEXT_BRIGHTNESS_DARK        | Darker brightness adjustment for the text color. Should be less than 1.  |
| SPFX_COLOR_STICKY_TEXT                 | Color used for text in sticky elements.                                   |
| SPFX_COLOR_PRIMARY                     | The primary color used throughout the application.                       |
| SPFX_COLOR_PRIMARY_BRIGHTNESS_DARK     | Darker brightness adjustment for the primary color. Should be less than 1.|
| SPFX_BORDER_RADIUS                     | Radius for rounding the corners of elements.                             |
| SPFX_FONT_FAMILY                       | The font family used across the application.                             |
| SPFX_FONT_SIZE_GENERIC                 | The standard font size used for general text.                            |
| SPFX_FONT_SIZE_TITLE                   | The font size used specifically for titles and headings.                 |
| SPFX_CARD_BOX_SHADOW                   | Box shadow styling for card elements.                                     |
| SPFX_CARD_BOX_SHADOW_HOVER             | Box shadow styling for card elements when hovered.                        |
| SPFX_SYSTEM_MESSAGE_BOX_SHADOW         | Box shadow styling for system message elements.                           |


## Used SharePoint Framework Version
![SPFx 1.18.2](https://img.shields.io/badge/SPFx-1.18.2-green.svg)
![Node.js v18.19.1](https://img.shields.io/badge/Node.js-%20v18.19.1-green.svg) 
![SharePoint Online](https://img.shields.io/badge/SharePoint-Online-green.svg)
![Teams N/A: Untested with Microsoft Teams](https://img.shields.io/badge/Teams-N%2FA-lightgrey.svg "Untested with Microsoft Teams") 
![Workbench Hosted](https://img.shields.io/badge/Workbench-Hosted-green.svg)


### Building the code

```bash or zsh
git clone the repo
npm i
npm run mobiship
```

This package produces the following:

* lib/* - intermediate-stage commonjs build artifacts
* dist/* - the bundled script, along with other resources
* deploy/* - all resources which should be uploaded to a CDN.

## Solution

Solution|Author(s)
--------|---------
puntobello-realtimenews-spwp | Nello D'Andrea die Mobiliar

## Version history

Version|Date|Comments
-------|----|--------
July 1 2024  |Initial release

## Copyright
**THIS CODE BELONGS TO "DIE MOBILIAR" AND IS NOT OPEN-SOURCED. IT IS NOT INTENDED TO BE USED OUTSIDE OF THE ORGANIZATION "DIE MOBILIAR" WITHOUT ANY PRIOR WRITTEN CONSENT.ONLY SWISS LAWS APPLY.**

## Minimal Path to Awesome

- Clone this repository
- in the command line run:
  - `npm install`
  - `npm run mobiship`
- Add the .sppkg file to the app catalog and add the web part to the page.

#### Local Mode
This solution doesn't work on local mode.