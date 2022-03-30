import {GRPCClient} from "../grpc/client";
import {Config, envConfig} from "../grpc/config";
import {Context} from "./context";
import {ContractTransactionResponse} from "@waves-enterprise/js-contract-grpc-client/contract/contract_contract_service";
import {ContractProcessor} from "./processors/contract-processor";



export class Entrypoint {
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
        this.rpcClient = new GRPCClient(this.config);
    }

    public start() {
        const conn = this.rpcClient.connect();
        const processor = new ContractProcessor(this.rpcClient);

        conn.on('data', (resp: ContractTransactionResponse) => {
            const ctx = new Context(resp);

            console.log('ContractTransactionResponse=', JSON.stringify(resp));

            processor.process(ctx);
        })
    }

    // startTest() {
    //     const processor = new ContractProcessor(this.rpcClient);
    //     const ctx = new Context({transaction: require('../call-contract.json'), authToken: 'test'});
    //
    //     console.log('ContractTransactionResponse=', JSON.stringify(resp_mock));
    //
    //     processor.process(ctx);
    // }
}