import {Action, Contract, Param} from "@wavesenterprise/contract-core";

@Contract()
export class Cpmm {
    @Action({onInit: true})
    init() {
    }

    @Action
    setValue(
        @Param('first') param: string,
        @Param('third') param2: string,
    ) {

        // Write your logic here
    }
}