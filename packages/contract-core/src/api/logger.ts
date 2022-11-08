import * as console from 'console'

type LogLevel = 'info' | 'error'

export class Logger {
    component: string

    static globalPrefix = 'WE Contract'
    static lastTimeStamp = Date.now()

    setComponent(name: string) {
      this.component = name
    }

    info(message: string, ...additionalParams: any[]) {
      const prefixes = [`[${Logger.globalPrefix}]`, this.component && `[${this.component}]`, Logger.timestampDiff()]

      this.printMessage('info', ...prefixes, message, ...additionalParams)
    }

    error(message: string, ...additionalParams: any[]) {
      const prefixes = [`[${Logger.globalPrefix}]`, this.component && `[${this.component}]`, Logger.timestampDiff()]

      this.printMessage('info', ...prefixes, message, ...additionalParams)
    }

    private printMessage(logLevel: LogLevel, ...args) {
      console[logLevel](...args)
    }

    static timestampDiff(): string {
      const result = `+${Date.now() - Logger.lastTimeStamp}ms`

      Logger.lastTimeStamp = Date.now()

      return result
    }
}

export function logger(c: { constructor: {name: string} }): Logger {
  const loggerIntance = new Logger()

  loggerIntance.setComponent(c.constructor.name)

  return loggerIntance
}
