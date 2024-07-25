//#region #Imports
import * as React from 'react';
import * as ReactDom from 'react-dom';

import { ThemeProvider, ThemeChangedEventArgs, IReadonlyTheme } from '@microsoft/sp-component-base';
import { BaseClientSideWebPart } from "@microsoft/sp-webpart-base";
import { Version } from '@microsoft/sp-core-library';
import { IPropertyPaneConfiguration } from "@microsoft/sp-property-pane";

import { PropertyFieldNumber } from '@pnp/spfx-property-controls/lib/PropertyFieldNumber';

import * as strings from 'realTimeNewsFeedStrings';
import * as __ from 'lodash';

import IRealTimeNewsFeedWP from './models/IRealTimeNewsFeedWP';
import { RealTimeNewsFeed } from './components/RealTimeNewsFeed';
import { Logger } from './utils/logger';
import SharePointService, { ISharePointService } from './services/SharePointService';
import ILanguageRepresentation from './models/ILanguageRepresentation';

export default class RealTimeNewsFeedWebPart extends BaseClientSideWebPart<IRealTimeNewsFeedWP> {
  private logger: Logger;
  private pageLanguage: ILanguageRepresentation;
  private themeProvider: ThemeProvider;
  private themeVariant: IReadonlyTheme | undefined;
  private spo: ISharePointService;
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
      const listId = this.context.pageContext.list ? this.context.pageContext.list.id.toString() : 'a3427855-c59b-4a06-aa6c-ce85bcabf087'; // add here your list id when working in the hosted workbench
      const listItemId = this.context.pageContext.listItem ? this.context.pageContext.listItem.id : 1; // add here your listitem id when working in the hosted workbench
      const language = this.context.pageContext.web.language;
      
      await super.onInit();
      this.spo = this.context.serviceScope.consume(SharePointService.serviceKey);
      this.pageLanguage = await this.spo.calculateLanguage(listId, listItemId, language);
      this.initialized = true;

    } catch (error) {
      this.logger.error("Error in onInit Webpart: ", error);
    }
  }

  public render(): void {
    if(this.initialized) {
      ReactDom.render(React.createElement(RealTimeNewsFeed, {
        pageLanguage: this.pageLanguage,
        newsCount: this.properties.newsCount,
        themeVariant: this.themeVariant,
        spo: this.spo
      }), this.domElement);
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

