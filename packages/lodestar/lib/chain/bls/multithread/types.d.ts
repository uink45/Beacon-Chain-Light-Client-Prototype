import { VerifySignatureOpts } from "../interface";
export declare type WorkerData = {
    implementation: "herumi" | "blst-native";
    workerId: number;
};
export declare type SerializedSet = {
    publicKey: Uint8Array;
    message: Uint8Array;
    signature: Uint8Array;
};
export declare type BlsWorkReq = {
    opts: VerifySignatureOpts;
    sets: SerializedSet[];
};
export declare enum WorkResultCode {
    success = "success",
    error = "error"
}
export declare type WorkResult<R> = {
    code: WorkResultCode.success;
    result: R;
} | {
    code: WorkResultCode.error;
    error: Error;
};
export declare type BlsWorkResult = {
    /** Ascending integer identifying the worker for metrics */
    workerId: number;
    /** Total num of batches that had to be retried */
    batchRetries: number;
    /** Total num of sigs that have been successfully verified with batching */
    batchSigsSuccess: number;
    /** Time worker function starts - UNIX timestamp in nanoseconds */
    workerStartNs: bigint;
    /** Time worker function ends - UNIX timestamp in nanoseconds */
    workerEndNs: bigint;
    results: WorkResult<boolean>[];
};
//# sourceMappingURL=types.d.ts.map