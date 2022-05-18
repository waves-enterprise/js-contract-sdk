import {EventEmitter} from 'events'
import {PoolWorker} from "./pool-worker";
import {SHARE_ENV} from "worker_threads";

export interface PoolOptions {
    size: number;
    task: string;
    contractPath: string;
}

type ResolveFunc = (value: any) => void;
type RejectFunc = (reason: any) => void;

export class Task {
    constructor(
        public param: any,
        public resolve: ResolveFunc,
        public reject: RejectFunc
    ) {}
}

function validatePoolSize(size: number) {
}

export class StaticPool extends EventEmitter {
    private readonly size : number;
    private readonly contractPath: string;

    /**
     * Available pool workers
     * @private
     */
    private workers: PoolWorker[] = [];

    /**
     * Tasks queued
     * @private
     */
    private taskQueue: Task[] = []

    constructor(opts: PoolOptions) {
        super();

        const {task, size, contractPath} = opts;

        validatePoolSize(size);

        this.size = size;
        this.contractPath = contractPath;

        this.fill(task);
    }

    private fill(task: string) {
        const size = this.size;

        for (let i = 0; i < size; i++) {
            const worker = new PoolWorker(task, {
                workerData: {index: i, contractPath: this.contractPath},
                env: SHARE_ENV,
            })

            worker.on('ready', (worker) => this.emit('worker-ready', worker));

            this.workers.push(worker);
        }
    }

    private getIdleWorker(): PoolWorker | null {
        const worker = this.workers.find((worker) => worker.ready);

        return worker ?? null;
    }

    private processTask(worker: PoolWorker): void {
        const task = this.taskQueue.shift();

        if (!task) {
            return;
        }

        const { param, resolve, reject } = task;

        worker
            .run(param)
            .then(resolve)
            .catch((error) => {
                reject(error);
            });
    }

    async runTask<TParam, TResult>(param: TParam): Promise<TResult> {
        return new Promise((resolve, reject) => {
            const task = new Task(param, resolve, reject);

            this.taskQueue.push(task);
            const worker = this.getIdleWorker();

            if (worker) {
                this.processTask(worker);
            }
        });
    }
}