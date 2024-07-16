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