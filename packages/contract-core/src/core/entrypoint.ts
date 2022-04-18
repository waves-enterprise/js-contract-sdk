import {envConfig, RPCConnectionConfig} from "../rpc/config";
import {logger} from "./logger";
import {RPC} from "../rpc";
import {TransactionResponseHandler} from "./handlers/transaction-response-handler";

type ContractConfig = {
    strictState: boolean;
}

export class Entrypoint {
    log = logger(this)

    /**
     * Contract RPC client
     * @private
     */
    private readonly rpc: RPC;

    /**
     * RPC connection config
     * @private
     */
    private readonly rpcConfig: RPCConnectionConfig;

    constructor(private config: ContractConfig = {strictState: false}) {
        this.rpcConfig = envConfig()
        this.rpc = new RPC(this.rpcConfig);
    }

    public start() {
        this.log.info('RPC connection created');

        const contractRPC = this.rpc.Contract;

        contractRPC.connect();

        const responseHandler = new TransactionResponseHandler(this.rpc)

        contractRPC
            .addResponseHandler(responseHandler.handle)
    }
}

export function start(contract: any) {
    Promise.resolve().then(async () => {
        try {
            const entry = new Entrypoint()
            entry.start();

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