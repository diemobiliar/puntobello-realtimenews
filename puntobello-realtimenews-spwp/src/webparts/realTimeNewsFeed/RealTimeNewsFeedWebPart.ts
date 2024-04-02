//#region #Imports
import * as React from 'react';
import * as ReactDom from 'react-dom';

import { ThemeProvider,  ThemeChangedEventArgs,  IReadonlyTheme} from '@microsoft/sp-component-base';
import { BaseClientSideWebPart } from "@microsoft/sp-webpart-base";
import { Version } from '@microsoft/sp-core-library';
import { IPropertyPaneConfiguration, PropertyPaneDropdown } from "@microsoft/sp-property-pane";

import { PropertyFieldNumber } from '@pnp/spfx-property-controls/lib/PropertyFieldNumber';

import * as strings from 'realTimeNewsFeedStrings';
import * as __ from 'lodash';

import { getSP } from '../../utils/pnpjs-config';

import IRealTimeNewsFeedWP from './models/IRealTimeNewsFeedWP';
import { RealTimeNewsFeed } from './components/RealTimeNewsFeed';
import { Logger } from '../../utils/logger';

export default class RealTimeNewsFeedWebPart extends BaseClientSideWebPart<IRealTimeNewsFeedWP> {
  private logger: Logger;
  private _themeProvider: ThemeProvider;
  private _themeVariant: IReadonlyTheme | undefined;

  private _handleThemeChangedEvent(args: ThemeChangedEventArgs): void {
    this._themeVariant = args.theme;
    this.render();
  }

  protected async onInit(): Promise<void> {
    this.logger = Logger.getInstance();
    this.logger.setContextInfo(this.context.manifest.alias + " with id " + this.context.manifest.id);
    this.logger.info('Logger initialized');

    // Make wp theme aware
    this._themeProvider = this.context.serviceScope.consume(ThemeProvider.serviceKey);
    this._themeVariant = this._themeProvider.tryGetTheme();
    this._themeProvider.themeChangedEvent.add(this, this._handleThemeChangedEvent);

    super.onInit();

    getSP(this.context);
  }

  public render(): void {
    ReactDom.render(React.createElement(RealTimeNewsFeed, {
      themeVariant: this._themeVariant,
      context: this.context,
      newsCount: this.properties.newsCount
    }), this.domElement);
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

