import { parseDataEntry } from '../../utils';
import { ContractTransaction } from '@wavesenterprise/js-contract-grpc-client/contract/contract_contract_service';

export class ParamsMap extends Map {}

export class ParamsMapper {
    static parse(tx: ContractTransaction): ParamsMap {
        const paramsMap = new ParamsMap();

        tx.params.map((p) => {
            const val = parseDataEntry(p);

            paramsMap.set(p.key, val);
        });

        return paramsMap;
    }
}
