import 'reflect-metadata';

import {Action, Contract} from "../src";
import {Param} from "../src/core/decorators/param";

@Contract()
export class TestContract {
    @Action({onInit: true})
    async init() {
    }

    @Action
    setValue(
        @Param('first') param: string,
        @Param('third') param2: string,
    ) {

    }
}