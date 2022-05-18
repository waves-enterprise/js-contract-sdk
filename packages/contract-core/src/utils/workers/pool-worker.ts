import {Worker, WorkerOptions} from 'worker_threads';

export class PoolWorker extends Worker {
    private _ready = false;

    private isDone = false;

    constructor(filename: string, opts?: WorkerOptions) {
        super(filename, opts);

        this.once('online', () => this.setReady());
    }

    public get ready(): boolean {
        return this._ready;
    }

    private setReady() {
        this._ready = true;
        this.emit('ready', this);
    }

    async run(param: any): Promise<any> {
        if (!this._ready) {
            return;
        }

        return new Promise((resolve, reject) => {
            const error = (err: any) => {
                this.removeListener('message', message);
                reject(err);
            }

            const message = (res: unknown) => {
                this.removeListener('error', error);
                this.setReady();
                resolve(res);
            }

            this.once('message', message);
            this.once('error', error);
            this.postMessage(param);
        })
    }

    override async terminate(): Promise<number> {
        this.once('exit', () => {
            setImmediate(() => {
                this.removeAllListeners();
            });
        });

        return super.terminate();
    }
}