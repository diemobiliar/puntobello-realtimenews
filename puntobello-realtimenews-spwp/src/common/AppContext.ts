import { ServiceScope } from '@microsoft/sp-core-library';
import * as React from 'react';
import { WebPartContext } from "@microsoft/sp-webpart-base";
import { IReadonlyTheme } from '@microsoft/sp-component-base';

export interface AppContextProps {
    serviceScope: ServiceScope;
    themeVariant: IReadonlyTheme | undefined;
    context: WebPartContext;
    pageLanguage: string;
}

export const AppContext = React.createContext<AppContextProps | undefined>(undefined);