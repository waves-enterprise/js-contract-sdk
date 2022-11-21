import http from 'http'

type LogLevel = 'verbose' | 'info' | 'error'

const { DEBUG, HOST_NETWORK, HOSTNAME, VERBOSE_LOG } = process.env

const request = (url: string, data: unknown) => {
  const body = JSON.stringify(data, (key, value) => {
    if (typeof value === 'object' && 'toNumber' in value) {
      return value.toNumber() as number
    }
    return value as unknown
  })

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

  private static lastTimeStamp = Date.now()

  static workerIdx: number | string = 'Main Thread'

  setComponent(name: string) {
    this.component = name
  }

  info(...args: unknown[]) {
    this.printMessage('info', ...this.prefixes, ...args)
  }

  verbose(...args: unknown[]) {
    if (VERBOSE_LOG) {
      this.printMessage('verbose', ...this.prefixes, ...args)
    }
  }

  error(...args: unknown[]) {
    this.printMessage('info', ...this.prefixes, ...args)
  }

  private get prefixes() {
    return [
      this.component && `[${this.component}]`,
      Logger.workerPrefix,
      Logger.timestampDiff,
    ]
  }

  private printMessage(logLevel: LogLevel, ...args: unknown[]) {
    writeLog(logLevel, ...args)
  }

  private static get timestampDiff(): string {
    const result = `+${Date.now() - Logger.lastTimeStamp}ms`

    Logger.lastTimeStamp = Date.now()

    return result
  }

  private static get workerPrefix() {
    if (typeof Logger.workerIdx === 'number') {
      return `Worker#${Logger.workerIdx}`
    }
    return Logger.workerIdx
  }

}

export const CommonLogger = new Logger()
CommonLogger.setComponent('Common log')

export function logger(c: { constructor: { name: string } }): Logger {
  const loggerInstance = new Logger()
  loggerInstance.setComponent(c.constructor.name)

  return loggerInstance
}
