// React and ReactDOM imports for building and rendering components
import * as React from 'react';
import * as ReactDom from 'react-dom';

// SPFx component base and web part imports for theming and client-side web part functionalities
import { ThemeProvider, ThemeChangedEventArgs, IReadonlyTheme } from '@microsoft/sp-component-base';
import { BaseClientSideWebPart } from "@microsoft/sp-webpart-base";
import { Version } from '@microsoft/sp-core-library';
import { IPropertyPaneConfiguration } from "@microsoft/sp-property-pane";

// PnP SPFx property control for number inputs in the property pane
import { PropertyFieldNumber } from '@pnp/spfx-property-controls/lib/PropertyFieldNumber';

// Importing localization strings and lodash utility library
import * as strings from 'realTimeNewsFeedStrings';
import * as __ from 'lodash';

// Component imports for the RealTimeNewsFeed and context management
import { RealTimeNewsFeed } from './components/RealTimeNewsFeed';
import { AppContext, AppContextProvider } from './contexts/AppContext';

// Service and utility imports for logging and SharePoint interactions
import { Logger } from './utils/logger';
import SharePointService from './services/SharePointService';

// Model imports for defining types and interfaces
import { ILanguageRepresentation } from './models';


export interface IRealTimeNewsFeedWebPartProps {
  newsCount: number;
}

export default class RealTimeNewsFeedWebPart extends BaseClientSideWebPart<IRealTimeNewsFeedWebPartProps> {
  private logger: Logger;
  private pageLanguage: ILanguageRepresentation;
  private themeProvider: ThemeProvider;
  private themeVariant: IReadonlyTheme | undefined;
  private initialized: boolean = false;

  private _handleThemeChangedEvent(args: ThemeChangedEventArgs): void {
    this.themeVariant = args.theme;
    this.render();
  }

  protected async onInit(): Promise<void> {
    this.logger = Logger.getInstance();
    this.logger.setContextInfo(this.context.manifest.alias + " with id " + this.context.manifest.id);
    this.logger.info('Logger initialized');

    try {
      // Make wp theme aware
      this.themeProvider = this.context.serviceScope.consume(ThemeProvider.serviceKey);
      this.themeVariant = this.themeProvider.tryGetTheme();
      this.themeProvider.themeChangedEvent.add(this, this._handleThemeChangedEvent);
      const listId = this.context.pageContext.list.id.toString();
      const listItemId = this.context.pageContext.listItem.id;
      const language = this.context.pageContext.web.language;

      await super.onInit();

      const spo = this.context.serviceScope.consume(SharePointService.serviceKey);

      // Set the full SPFx context on the SharePoint service
      // This is required for PnP v4 to work correctly with authentication
      spo.setContext(this.context);

      this.pageLanguage = await spo.calculateLanguage(listId, listItemId, language);
      this.initialized = true;

    } catch (error) {
      this.logger.error("Error in onInit Webpart: ", error);
    }
  }

  public render(): void {
    if(this.initialized) {
      const appContext = new AppContext(
        this.context,
        this.logger,
        this.pageLanguage,
        this.themeVariant,
        this.properties.newsCount
      );
  
      const element: React.ReactElement = React.createElement(
        AppContextProvider,
        { appContext },
        React.createElement(RealTimeNewsFeed)
      );
      ReactDom.render(element, this.domElement);
  
    }
  }

  protected get dataVersion(): Version {
    return Version.parse('1.0');
  }

  protected get disableReactivePropertyChanges(): boolean {
    return true;
  }

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    return {
      pages: [
        {
          header: {
            description: strings.PropertyPaneDescription
          },
          groups: [
            {
              groupName: strings.BasicGroupName,
              groupFields: [
                PropertyFieldNumber("newsCount", {
                  key: "newsCount",
                  label: strings.newsCountLabel,
                  description: strings.newsCountDesc,
                  value: this.properties.newsCount,
                  maxValue: 24,
                  minValue: 1,
                  disabled: false
                })
              ]
            }
          ]
        }
      ]
    };
  }
}

