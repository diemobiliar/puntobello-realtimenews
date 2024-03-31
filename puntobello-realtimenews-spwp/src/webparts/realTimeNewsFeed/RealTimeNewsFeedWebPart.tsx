//#region #Imports
import * as React from 'react';
import * as ReactDom from 'react-dom';

import {
  ThemeProvider,
  ThemeChangedEventArgs,
  IReadonlyTheme,
} from '@microsoft/sp-component-base';

import { BaseClientSideWebPart } from "@microsoft/sp-webpart-base";
import { IPropertyPaneConfiguration, PropertyPaneTextField, PropertyPaneDropdown } from "@microsoft/sp-property-pane";
import { PropertyFieldNumber } from '@pnp/spfx-property-controls/lib/PropertyFieldNumber';
import { Version } from '@microsoft/sp-core-library';
import { PropertyFieldListPicker, PropertyFieldListPickerOrderBy } from '@pnp/spfx-property-controls/lib/PropertyFieldListPicker';

import * as strings from 'realTimeNewsFeedStrings';
import * as __ from 'lodash';

import { TelemetryService, ITelemetryService } from "../../services";


import { getSP } from '../../utils/pnpjs-config';

import PnPTelemetry from "@pnp/telemetry-js";
import IRealTimeNewsFeedWP from './models/IRealTimeNewsFeedWP';
import { RealTimeNewsFeed } from './components/RealTimeNewsFeed';
import { SeverityLevel } from '@microsoft/applicationinsights-web';

export interface IList {
  Title: string;
}

export default class RealTimeNewsFeedWebPart extends BaseClientSideWebPart<IRealTimeNewsFeedWP> {
  private _telemetryService: ITelemetryService;
  private _themeProvider: ThemeProvider;
  private _themeVariant: IReadonlyTheme | undefined;

  private _handleThemeChangedEvent(args: ThemeChangedEventArgs): void {
    this._themeVariant = args.theme;
    this.render();
  }

  protected async onInit(): Promise<void> {

    // Disable pnp telemetry
    const telemetry = PnPTelemetry.getInstance();
    telemetry.optOut();

    // Make wp theme aware
    this._themeProvider = this.context.serviceScope.consume(ThemeProvider.serviceKey);
    this._themeVariant = this._themeProvider.tryGetTheme();
    this._themeProvider.themeChangedEvent.add(this, this._handleThemeChangedEvent);

    this._telemetryService = this.context.serviceScope.consume(TelemetryService.serviceKey);
    this._telemetryService.generateTraceEvent('RealTimeNewsFeedWebpart.tsx', 'Telemetry initialized', SeverityLevel.Information);

    super.onInit();

    getSP(this.context);
  }

  public render(): void {
    ReactDom.render(React.createElement(RealTimeNewsFeed, {
      themeVariant: this._themeVariant,
      context: this.context,
      list: this.properties.list,
      language: this.properties.language,
      newsCount: this.properties.newsCount,
      archivTargetUrl: this.properties.archivTargetUrl,
      telemetryService: this._telemetryService
    }), this.domElement);
  }

  protected get dataVersion(): Version {
    return Version.parse('1.0');
  }

  protected get disableReactivePropertyChanges(): boolean {
    return true;
  }

  private validateArchivUrl(value: string): string {
    if (value === null ||
      value.trim().length === 0) {
      return strings.archivTargetEmpty;
    }

    // Regex check Url
    //eslint-disable-next-line
    const regex = /(http|https):\/\/(\w+:{0,1}\w*)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%!\-\/]))?/;
    if (!regex.test(value.trim()) && !__.startsWith(value.trim(), '/')) {
      return strings.archivTargetInvalidUrl;
    }
    return '';
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
                PropertyFieldListPicker('list', {
                  label: strings.ListTitleFieldLabel,
                  selectedList: this.properties.list,
                  includeHidden: false,
                  orderBy: PropertyFieldListPickerOrderBy.Title,
                  disabled: false,
                  onPropertyChange: this.onPropertyPaneFieldChanged.bind(this),
                  properties: this.properties,
                  context: this.context as any,
                  onGetErrorMessage: null,
                  deferredValidationTime: 0,
                  key: 'listPickerFieldId'
                }),
                PropertyPaneDropdown('language', {
                  label: 'Sprache des Webparts',
                  options: [
                    { key: 'de', text: 'Deutsch' },
                    { key: 'fr', text: 'Français' },
                    { key: 'it', text: 'Italiano' }
                  ]
                }),
                PropertyFieldNumber("newsCount", {
                  key: "newsCount",
                  label: strings.newsCountLabel,
                  description: strings.newsCountDesc,
                  value: this.properties.newsCount,
                  maxValue: 24,
                  minValue: 1,
                  disabled: false
                }),
                PropertyPaneTextField('archivTargetUrl', {
                  label: strings.archivTargetLabel,
                  onGetErrorMessage: this.validateArchivUrl.bind(this)
                })
              ]
            }
          ]
        }
      ]
    };
  }
}

