declare interface IRealTimeNewsFeedStrings {
  PropertyPaneDescription: string;
  BasicGroupName: string;
  ListTitleFieldLabel: string;
  archivTargetEmpty: string;
  archivTargetInvalidUrl: string;
  newsCountLabel: string;
  newsCountDesc: string;
  archivTargetLabel: string;
  SystemMessageLabel: string;
  NewNewsAvailableLabel: string;
}

declare module 'realTimeNewsFeedStrings' {
  const strings: IRealTimeNewsFeedStrings;
  export = strings;
}