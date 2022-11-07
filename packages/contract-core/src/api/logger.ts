import * as console from "console";

type LogLevel = "info" | "error";

export class Logger {
    public component: string;

    public static globalPrefix = "WE Contract";
    public static lastTimeStamp = Date.now();

    setComponent(name: string) {
        this.component = name;
    }

    info(message: string, ...additionalParams: any[]) {
        const prefixes = [`[${Logger.globalPrefix}]`, this.component && `[${this.component}]`, Logger.timestampDiff()];

        this.printMessage("info", ...prefixes, message, ...additionalParams);
    }

    error(message: string, ...additionalParams: any[]) {
        const prefixes = [`[${Logger.globalPrefix}]`, this.component && `[${this.component}]`, Logger.timestampDiff()];

        this.printMessage("info", ...prefixes, message, ...additionalParams);
    }

    private printMessage(logLevel: LogLevel, ...args) {
        console[logLevel](...args);
    }

    public static timestampDiff(): string {
        const result = `+${Date.now() - Logger.lastTimeStamp}ms`;

        Logger.lastTimeStamp = Date.now();

        return result;
    }
}

export function logger(c: { constructor: any }): Logger {
    const logger = new Logger();

    logger.setComponent(c.constructor.name);

    return logger;
}
