import { ILogger } from "./ILogger";

enum LogLevel {
    Info = 'info',
    Warn = 'warn',
    Error = 'error',
}

export class Logger implements ILogger {
    private static instance: Logger;
    private isVerbose: boolean;
    private contextInfo: string;

    private constructor() {
        const urlParams = new URLSearchParams(window.location.href);
        this.isVerbose = urlParams.get('loadSPFX') === 'true' || window.location.href.indexOf('workbench.aspx') !== -1;
    }

    public static getInstance(): Logger {
        if (!Logger.instance) {
            Logger.instance = new Logger();
        }
        return Logger.instance;
    }

    public setContextInfo(info: string) {
        this.contextInfo = info;
    }

    public info<T>(message: string, ...optionalParams: T[]): void {
        if (this.isVerbose) {
            this.customLog(LogLevel.Info, message, ...optionalParams);
        }
    }

    public warn<T>(message: string, ...optionalParams: T[]): void {
        this.customLog(LogLevel.Warn, message, ...optionalParams);
    }

    public error<T>(message: string, ...optionalParams: T[]): void {
        this.customLog(LogLevel.Error, message, ...optionalParams);
        console.trace('Stack Trace:');
    }

    private customLog<T>(level: LogLevel, message: string, ...optionalParams: T[]): void {
        const icon = level === LogLevel.Error ? '🔥' : level === LogLevel.Warn ? '⚠️' : 'ℹ️';
        const color = level === LogLevel.Error ? 'color: red;' : level === LogLevel.Warn ? 'color: orange;' : 'color: blue;';
        const prefix = `%c${icon} [${level.toUpperCase()}]:`;
        const style = `${color} font-weight: bold;`;

        const logFunction = console[level] || console.log;

        const params = this.contextInfo ? [`${prefix}`, style, this.contextInfo, message, ...optionalParams] : [`${prefix}`, style, message, ...optionalParams];

        logFunction(...params);
    }
    
}
