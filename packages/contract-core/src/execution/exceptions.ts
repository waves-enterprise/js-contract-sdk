import { ERROR_CODE } from "./constants";

export class ContractError extends Error {
    constructor(public message: string = "Unhandled internal error", public code: number = ERROR_CODE.FATAL) {
        super(message);
    }
}

export class RetryableError extends ContractError {
    constructor(public message: string = "Unhandled internal error") {
        super(message, ERROR_CODE.RECOVERABLE);
    }
}

export class UnavailableContractParamException extends Error {
    constructor(key: string) {
        super(`Required call param with name "${key}" not founded`);
    }
}

export class UnavailableContractActionException extends ContractError {
    constructor(key: string) {
        super(`Contract Action with name "${key}" not founded`);
    }
}

export class ConstraintValidationError extends ContractError {}

export class UnavailableStateKeyException extends ContractError {}

export class WrongStateKeyTypeException extends ContractError {}
