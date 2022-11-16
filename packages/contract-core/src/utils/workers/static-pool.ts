/* eslint-disable no-redeclare */
import { SHARE_ENV, Worker, WorkerOptions } from 'worker_threads'
import { URL } from 'node:url'
import { EventEmitter } from 'events'
import { CommonLogger } from '../../api'

type WorkerPoolProps = {
  size: number,
  filename: string,
  contractPath: string,
}

export class WorkerPoolWorker<Request, Response> extends Worker {

  initialized = false

  idle = true

  constructor(filename: string | URL, options?: WorkerOptions) {
    super(filename, {
      ...options,
      // stderr: true,
      // stdin: true,
      // stdout: true,
    })
  }

  init() {
    if (this.initialized) {
      return
    }
    this.once('online', () => {
      CommonLogger.verbose('Worker is online')
      this.initialized = true
      this.emit('ready')
    })
  }

  execute(value: Request): Promise<Response> {
    if (!this.initialized || !this.idle) {
      return Promise.reject('Worker is not ready')
    }
    this.idle = false
    return new Promise((resolve, reject) => {
      this.postMessage(value)
      const messageHandle = (value: Response) => {
        this.idle = true
        this.emit('ready')
        resolve(value)
        this.off('error', errorHandle)
      }
      const errorHandle = (error: unknown) => {
        this.idle = true
        this.emit('ready')
        reject(error)
        this.off('message', messageHandle)
      }
      this.once('message', messageHandle)
      this.once('error', errorHandle)
    })
  }

}

export class WorkerPool<Request, Response> extends EventEmitter {

  workers: Set<WorkerPoolWorker<Request, Response>> = new Set()

  waitingTasks: Array<(worker: WorkerPoolWorker<Request, Response>) => void> = []

  private terminated = false

   constructor(props: WorkerPoolProps) {
    super()
    const { size, filename, contractPath } = props
    this.on('worker-ready', (worker: WorkerPoolWorker<Request, Response>) => {
      if (this.waitingTasks.length > 0) {
        this.waitingTasks.shift()!(worker)
      }
    })
    for (let i = 0; i < size; i++) {
      this.createWorker(filename, contractPath, i)
    }
  }

  private createWorker(filename: string, contractPath: string, idx: number) {
    const worker = new WorkerPoolWorker<Request, Response>(filename, {
      env: SHARE_ENV,
      workerData: { contractPath, index: idx },
    })
    worker.init()
    worker.on('exit', () => {
      this.workers.delete(worker)
      if (!this.terminated) {
        this.createWorker(filename, contractPath, idx)
      }
    })
    worker.on('ready', () => {
      this.emit('worker-ready', worker)
    })
    this.workers.add(worker)
  }

  private getIdleWorker(): Promise<WorkerPoolWorker<Request, Response>> | WorkerPoolWorker<Request, Response> {
    for (const worker of this.workers) {
      if (worker.idle && worker.initialized) {
        return worker
      }
    }
    return new Promise((resolve) => {
      this.waitingTasks.push(resolve)
    })
  }

  async execute(value: Request): Promise<Response> {
    if (this.terminated) {
      throw new Error('Pool is terminated')
    }
    CommonLogger.verbose('Waiting for idle worker')
    const worker = await this.getIdleWorker()
    CommonLogger.verbose('Worker found, executing')
    return worker.execute(value)
  }

  terminate() {
    const terminated: Array<Promise<number>> = []
    this.terminated = true
    this.waitingTasks = []
    for (const worker of this.workers) {
      terminated.push(worker.terminate())
    }
    return Promise.all(terminated)
  }
}
