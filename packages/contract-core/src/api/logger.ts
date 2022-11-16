import http from 'http'

type LogLevel = 'verbose' | 'info' | 'error'

const { DEBUG, HOST_NETWORK, HOSTNAME, VERBOSE_LOG } = process.env

const request = (url: string, data: unknown) => {
  const body = JSON.stringify(data)

  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': body.length,
    },
  }

  const req = http.request(url, options)

  req.write(body)
  req.end()
}

export const writeLog = (...message: [LogLevel, ...unknown[]]) => {
  if (Number(DEBUG)) {
    const [type, ...data] = message
    const prefix = HOSTNAME ? `[${(new Date()).toISOString()}] Host: ${HOSTNAME}` : `[${(new Date()).toISOString()}]`
    // eslint-disable-next-line no-console
    console[type](prefix, ...data)
    const loggerAddress = `http://${HOST_NETWORK}:5050`
    request(loggerAddress, [type, prefix, ...data])
  }
}

export class Logger {
  component: string

  private static globalPrefix = 'WE Contract'

  private static lastTimeStamp = Date.now()

  private static timers = new Map<string, number>()

  setComponent(name: string) {
    this.component = name
  }

  info(...args: unknown[]) {
    const prefixes = [`[${Logger.globalPrefix}]`, this.component && `[${this.component}]`, Logger.timestampDiff()]

    this.printMessage('info', ...prefixes, ...args)
  }

  verbose(...args: unknown[]) {
    if (VERBOSE_LOG) {
      const prefixes = [`[${Logger.globalPrefix}]`, this.component && `[${this.component}]`, Logger.timestampDiff()]
      this.printMessage('verbose', ...prefixes, ...args)
    }
  }

  error(...args: unknown[]) {
    const prefixes = [`[${Logger.globalPrefix}]`, this.component && `[${this.component}]`, Logger.timestampDiff()]

    this.printMessage('info', ...prefixes, ...args)
  }

  private printMessage(logLevel: LogLevel, ...args: unknown[]) {
    writeLog(logLevel, ...args)
  }

  static timestampDiff(): string {
    const result = `+${Date.now() - Logger.lastTimeStamp}ms`

    Logger.lastTimeStamp = Date.now()

    return result
  }
}

export const CommonLogger = new Logger()
CommonLogger.setComponent('Common log')

export function logger(c: { constructor: { name: string } }): Logger {
  const loggerInstance = new Logger()
  loggerInstance.setComponent(c.constructor.name)

  return loggerInstance
}
