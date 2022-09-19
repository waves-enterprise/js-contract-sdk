export class Payments extends Array<{ assetId: string, amount: number }> {
    parseTx(transfersIn: any[]) {
        const res = transfersIn.map(t => {
            return {
                assetId: t.assetId,
                amount: t.amount
            }
        })

        return Payments.from(res)
    }
}
