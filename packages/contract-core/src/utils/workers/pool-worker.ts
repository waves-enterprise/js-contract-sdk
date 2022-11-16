import { Worker, WorkerOptions } from 'worker_threads'

export class PoolWorker extends Worker {
  private _ready = false

  constructor(filename: string, opts?: WorkerOptions) {
    super(filename, opts)

    this.once('online', () => this.setReady())
  }

  get ready(): boolean {
    return this._ready
  }

  private setReady() {
    this._ready = true
    this.emit('ready', this)
  }

  run(param: unknown): Promise<unknown> {
    if (!this._ready) {
      return Promise.resolve()
    }

    return new Promise((resolve, reject) => {
      const error = (err: unknown) => {
        this.removeListener('message', message)
        reject(err)
      }

      const message = (res: unknown) => {
        this.removeListener('error', error)
        this.setReady()
        resolve(res)
      }

      this.once('message', message)
      this.once('error', error)
      this.postMessage(param)
    })
  }

  terminate(): Promise<number> {
    this.once('exit', () => {
      setImmediate(() => {
        this.removeAllListeners()
      })
    })

    return super.terminate()
  }
}
