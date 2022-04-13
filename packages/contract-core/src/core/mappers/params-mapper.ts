import {Tx} from "../../intefaces/tx";
import {parseDataEntry} from "../../utils";

export class ParamsMap extends Map {
}

export class ParamsMapper {
    parse(tx: Tx): ParamsMap {
        const paramsMap = new ParamsMap();

        tx.params.map(p => {
            const val = parseDataEntry(p);

            paramsMap.set(p.key, val);
        })

        return paramsMap;
    }
}