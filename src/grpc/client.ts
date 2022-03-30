import {ClientReadableStream, credentials, Metadata} from "@grpc/grpc-js";
import {ContractServiceClient} from "@waves-enterprise/js-contract-grpc-client/contract/contract_contract_service";
import {TransactionServiceClient} from "@waves-enterprise/js-contract-grpc-client/contract/contract_transaction_service";
import {AddressServiceClient} from "@waves-enterprise/js-contract-grpc-client/contract/contract_address_service";
import {UtilServiceClient} from "@waves-enterprise/js-contract-grpc-client/contract/contract_util_service";
import {Config} from "./config";
import {TypeOf} from "../intefaces/helpers";


export class GRPCClient {
    contractService: TypeOf<typeof ContractServiceClient>;
    transactionService: TypeOf<typeof TransactionServiceClient>;
    addressService: TypeOf<typeof AddressServiceClient>;
    contractUtilService: TypeOf<typeof UtilServiceClient>;

    constructor(private config: Config) {
        const address = `${this.config.node()}:${this.config.nodePort()}`;

        this.contractService = new ContractServiceClient(address, credentials.createInsecure());
        this.addressService = new AddressServiceClient(address, credentials.createInsecure());
        this.transactionService = new TransactionServiceClient(address, credentials.createInsecure());
        this.contractUtilService = new UtilServiceClient(address, credentials.createInsecure());
    }

    public connect() {
        const connectionMeta = new Metadata();

        connectionMeta.set(
            'authorization',
            this.config.connectionToken()
        );

        const connection: ClientReadableStream<any> = this.contractService.connect({
            connectionId: this.config.connectionId(),
        }, connectionMeta)

        return connection;
    }
}