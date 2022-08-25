import {TArgs} from "./param";
import {ContractTransferIn} from "@wavesenterprise/js-contract-grpc-client/contract_transfer_in";

export class Payments extends Array<{ assetId: string, amount: number }> {
    static parseTx(
        transfersIn: ContractTransferIn[]
    ) {
        const res = transfersIn.map(t => {
            return {
                assetId: String.fromCharCode.apply(null, t.assetId) as string,
                amount: t.amount
            }
        })

        return Payments.from(res)
    }
}
