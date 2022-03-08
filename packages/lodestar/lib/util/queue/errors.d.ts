import { LodestarError } from "@chainsafe/lodestar-utils";
export declare enum QueueErrorCode {
    QUEUE_ABORTED = "QUEUE_ERROR_QUEUE_ABORTED",
    QUEUE_MAX_LENGTH = "QUEUE_ERROR_QUEUE_MAX_LENGTH"
}
export declare type QueueErrorCodeType = {
    code: QueueErrorCode.QUEUE_ABORTED;
} | {
    code: QueueErrorCode.QUEUE_MAX_LENGTH;
};
export declare class QueueError extends LodestarError<QueueErrorCodeType> {
    constructor(type: QueueErrorCodeType);
}
//# sourceMappingURL=errors.d.ts.map