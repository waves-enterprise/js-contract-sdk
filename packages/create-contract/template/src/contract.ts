import {Action, Contract, Param} from "@waves-enterprise/js-contract-sdk";

@Contract()
export class #{contractName} {
    @Action({onInit: true})
    init() {


    }

    @Action
    setValue(
        @Param('first') param: string,
        @Param('third') param2: string,
    ) {

    }
}