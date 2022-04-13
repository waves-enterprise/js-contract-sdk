import {GenericClient} from "../types";
import {Config} from "../config";
import {ClientReadableStream, credentials, Metadata, ServiceError} from "@grpc/grpc-js";
import type {
    CommitExecutionResponse,
    ContractKeyRequest,
    ContractKeyResponse,
    ContractKeysRequest,
    ContractKeysResponse,
    ContractTransactionResponse,
    ExecutionErrorRequest,
    ExecutionSuccessRequest
} from "@wavesenterprise/js-contract-grpc-client/contract/contract_contract_service";
import {ContractServiceClient} from "@wavesenterprise/js-contract-grpc-client/contract/contract_contract_service";
import {logger} from "../../core/logger";


export type IContractClient = GenericClient<Omit<ContractServiceClient, 'connect'>>;

export class ContractClient implements IContractClient {
    log = logger(this);

    private config: Config;
    private auth: Metadata;
    private impl: ContractServiceClient;

    connection: ClientReadableStream<ContractTransactionResponse>;

    constructor(config: Config) {
        this.config = config;

        const address = `${this.config.node()}:${this.config.nodePort()}`;

        this.impl = new ContractServiceClient(address, credentials.createInsecure());
    }

    connect() {
        const connectionMeta = new Metadata();

        connectionMeta.set(
            'authorization',
            this.config.connectionToken()
        );

        this.connection = this.impl.connect({
            connectionId: this.config.connectionId()
        }, connectionMeta);

        this.connection.on('close', () => {
            this.log.info('Connection stream closed')
        })
        this.connection.on('end', () => {
            this.log.info('Connection stream ended')
        })
        this.connection.on('error', (error) => {
            this.log.info('Connection stream error: ', error)
        })
        this.connection.on('readable', () => {
            this.log.info('Connection stream readable')
            this.connection.read()
        })
        this.connection.on('pause', () => {
            this.log.info('Connection stream paused')
        })
        this.connection.on('resume', () => {
            this.log.info('Connection stream resume')
        })

        this.log.info('RPC connection created');
    }

    setAuth(auth: Metadata) {
        this.auth = auth;
    }

    getContractKey(req: ContractKeyRequest) {
        return this.internalCall<ContractKeyRequest, ContractKeyResponse>(
            (handler) => this.impl.getContractKey(req, this.auth, handler)
        )
    }

    getContractKeys(req: ContractKeysRequest) {
        return this.internalCall<ContractKeysRequest, ContractKeysResponse>(
            (handler) => this.impl.getContractKeys(req, this.auth, handler)
        )
    }

    commitExecutionSuccess(req: ExecutionSuccessRequest) {
        return this.internalCall<ExecutionSuccessRequest, CommitExecutionResponse>(
            (handler) => this.impl.commitExecutionSuccess(req, this.auth, handler)
        )
    }

    commitExecutionError(req: ExecutionErrorRequest) {
        return this.internalCall<ExecutionErrorRequest, CommitExecutionResponse>(
            (handler) => this.impl.commitExecutionError(req, this.auth, handler)
        )
    }

    addResponseHandler(handler: (r: ContractTransactionResponse) => void) {
        if (!this.connection) {
            throw new Error('Connection closed or not opened');
        }

        this.connection.on("data", handler);
    }

    private internalCall<P, R>(fn: (h: (e: ServiceError, r: R) => void) => void) {
        return new Promise<R>((resolve, reject) => {
            const handler = (err: ServiceError, resp: R) => {
                if (!err) {
                    return resolve(resp);
                }

                reject(err);
            };

            fn(handler);
        })
    }
}