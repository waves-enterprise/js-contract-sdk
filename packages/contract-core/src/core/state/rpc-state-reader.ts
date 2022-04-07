import {ContractKeyResponse} from "@waves-enterprise/js-contract-grpc-client/contract/contract_contract_service";
import {GRPCClient} from "../../grpc/client";
import {Metadata} from "@grpc/grpc-js";
import {IStateReader} from "./interfaces";

export class RpcStateReader implements IStateReader<string, ContractKeyResponse> {
    private readerCache = new Map()

    constructor(
        private readonly contractId: string,
        private readonly client: GRPCClient,
        private readonly auth: Metadata
    ) {
    }

    readOne(key: string): Promise<ContractKeyResponse> {
        if (!this.readerCache.has(key)) {
            return Promise.resolve(
                this.readerCache.get(key)
            );
        }

        return new Promise((resolve, reject) => {
            this.client.contractService.getContractKey({
                    contractId: this.contractId,
                    key,
                },
                this.auth,
                (error: Error, response: ContractKeyResponse) => {
                    if (error) {
                        const {metadata} = error as any
                        const {internalRepr} = metadata
                        const internalReprKeysAndValues = []
                        for (const [key, value] of internalRepr.entries()) {
                            internalReprKeysAndValues.push(`${key}: ${value}`)
                        }
                        reject(new Error(`GRPC Node error. ContractService.GetContractKey. Key - ${key}. ${internalReprKeysAndValues.join(', ')}`))
                        return
                    }

                    this.cacheValue(key, response)
                    resolve(response)
                })
        })
    }

    private cacheValue(key: string, value: ContractKeyResponse) {
        this.readerCache.set(key, value);
    }
}