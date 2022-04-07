import {GRPCClient} from "../grpc/client";
import {Config, envConfig} from "../grpc/config";
import {Context} from "./context";
import {ContractTransactionResponse} from "@waves-enterprise/js-contract-grpc-client/contract/contract_contract_service";
import {ContractProcessor} from "./processors/contract-processor";
import {logger} from "./logger";

export class Entrypoint {
    log = logger(this)

    /**
     * Contract RPC client
     * @private
     */
    private rpcClient: GRPCClient;

    /**
     * RPC connection config
     * @private
     */
    private readonly config: Config;

    constructor() {
        this.config = envConfig()
        // this.rpcClient = new GRPCClient(this.config);
    }

    public start() {
        this.log.info('RPC connection created');

        const conn = this.rpcClient.connect();
        const processor = new ContractProcessor(this.rpcClient);

        conn.on('data', (resp: ContractTransactionResponse) => {
            const ctx = new Context(resp);

            console.log('ContractTransactionResponse=', JSON.stringify(resp));

            processor.process(ctx);
        })

        conn.on('close', () => {
            this.log.info('Connection stream closed')
        })
        conn.on('end', () => {
            this.log.info('Connection stream ended')
        })
        conn.on('error', (error) => {
            this.log.info('Connection stream error: ', error)
        })
        conn.on('readable', () => {
            this.log.info('Connection stream readable')
            conn.read()
        })
        conn.on('pause', () => {
            this.log.info('Connection stream paused')
        })
        conn.on('resume', () => {
            this.log.info('Connection stream resume')
        })

        this.log.info('RPC connection created');
    }
}

export function start(contract: any) {
    Promise.resolve().then(async () => {
        try {
            const entry = new Entrypoint()

            entry.start()

            process.on('SIGINT', async () => {
                try {
                    console.log('Graceful shutdown');
                    process.exit(0);
                } catch (err) {
                    console.log(`Graceful shutdown failure: ${err.message}`);
                    process.exit(1);
                }
            });

        } catch (err) {
            console.error(err);
            process.exit(1);
        }
    });
}