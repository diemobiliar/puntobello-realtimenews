export class Utility {

  private static getTenantName(urlString: string): string {
    const url = new URL(urlString);
    const hostname = url.hostname; // Gets 'tenantname.sharepoint.com'
    return hostname.split('.')[0]; // Splits the hostname and takes the first part
  }

  static getPBConfigUrl(relative: boolean): string {
    if (relative) {
      return "/sites/pb_config";
    } else {
      return this.getTenantName(window.location.href) + ".sharepoint.com/sites/pb_config";
    }
  }

  static getUserAppsUrl(): string {
    return "/Lists/pb_userapps";
  }

  static getAllAppsUrl(): string {
    return "/Lists/pb_apps";
  }

  static getManagementAppsUrl(): string {
    return "/SitePages/userapps.aspx";
  }

  static getStringTranslation = (language: string, stringName: string): string => {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const translatedString = require(`../loc/${language.toLowerCase().replace('_','-')}.js`);
    return translatedString[stringName];
  }
}