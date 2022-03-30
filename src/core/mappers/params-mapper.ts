import {Tx} from "../../intefaces/tx";
import {DataEntry} from "@waves-enterprise/js-contract-grpc-client/data_entry";
import {isUndefined} from "../../utils";

export class ParamsMap extends Map {}

export class ParamsMapper {
    parse(tx: Tx): ParamsMap {
        const paramsMap = new ParamsMap();

        tx.params.map(p => {
            const val = this.parseDataEntry(p);

            paramsMap.set(p.key, val);
        })

        return paramsMap;
    }


    parseDataEntry(d: DataEntry) {
        if (!isUndefined(d.stringValue)) {
            return d.stringValue
        }

        if (!isUndefined(d.intValue)) {
            return d.intValue
        }

        if (!isUndefined(d.boolValue)) {
            return d.boolValue
        }

        if (!isUndefined(d.binaryValue)) {
            return d.binaryValue
        }
    }
}