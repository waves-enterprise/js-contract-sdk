export class ContractError extends Error {
    constructor(
        public message: string = "Unhandled internal error",
        public code: number = 0
    ) {
        super(message);
    }
}


export class UnavailableContractParamException extends Error {
}


export class UnavailableContractActionException extends Error {
}

export class InvokeContractActionException extends ContractError {
    constructor(message) {
        super(`['Invoke contract action error'] ${message}`);
    }
}

export class CommitExecutionException extends Error {
}


export class ReadContractStateException extends Error {
}


export class ConstraintValidationError extends ContractError {
}