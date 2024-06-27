declare interface IRealTimeNewsFeedStrings {
  PropertyPaneDescription: string;
  BasicGroupName: string;
  newsCountLabel: string;
  newsCountDesc: string;
  SystemMessageLabel: string;
  NewNewsAvailableLabel: string;
}

declare module 'realTimeNewsFeedStrings' {
  const strings: IRealTimeNewsFeedStrings;
  export = strings;
}