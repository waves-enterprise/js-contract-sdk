import { isBool } from '../utils';
import { ConstraintValidationError } from './exceptions';

type AssertCondition = boolean | (() => boolean);

export function assert(condition: AssertCondition, message?: string) {
    if (isBool(condition)) {
        if (!condition) {
            throw new ConstraintValidationError(message ?? 'Unhandled error');
        }
    } else if (typeof condition === 'function') {
        if (condition()) {
            throw new ConstraintValidationError(message ?? 'Unhandled error');
        }
    }

    console.log('WARN: Invalid assert argument, condition must be a bool or fn that return bool value');
}
