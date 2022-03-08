import { Root } from "@chainsafe/lodestar-types";
import { LodestarError } from "@chainsafe/lodestar-utils";
export declare enum InterchangeErrorErrorCode {
    UNSUPPORTED_FORMAT = "ERR_INTERCHANGE_UNSUPPORTED_FORMAT",
    UNSUPPORTED_VERSION = "ERR_INTERCHANGE_UNSUPPORTED_VERSION",
    GENESIS_VALIDATOR_MISMATCH = "ERR_INTERCHANGE_GENESIS_VALIDATOR_MISMATCH"
}
declare type InterchangeErrorErrorType = {
    code: InterchangeErrorErrorCode.UNSUPPORTED_FORMAT;
    format: string;
} | {
    code: InterchangeErrorErrorCode.UNSUPPORTED_VERSION;
    version: string;
} | {
    code: InterchangeErrorErrorCode.GENESIS_VALIDATOR_MISMATCH;
    root: Root;
    extectedRoot: Root;
};
export declare class InterchangeError extends LodestarError<InterchangeErrorErrorType> {
    constructor(type: InterchangeErrorErrorType);
}
export {};
//# sourceMappingURL=errors.d.ts.map