import {ContractTransferIn} from "@wavesenterprise/js-contract-grpc-client/contract_transfer_in";

export class Payments extends Array<{ assetId?: string, amount: number }> {
    static parseTx(transfersIn: ContractTransferIn[]) {

        const res = transfersIn.map(t => {
            if (t.assetId !== undefined) {
                return {
                    assetId: t.assetId,
                    amount: t.amount.toNumber()
                }
            }

            return {
                amount: t.amount.toNumber()
            }
        })

        return Payments.from(res)
    }
}
