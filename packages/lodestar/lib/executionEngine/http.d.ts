import { AbortSignal } from "@chainsafe/abort-controller";
import { bellatrix, RootHex, Root } from "@chainsafe/lodestar-types";
import { DATA, QUANTITY } from "../eth1/provider/utils";
import { IJsonRpcHttpClient } from "../eth1/provider/jsonRpcHttpClient";
import { ExecutePayloadResponse, IExecutionEngine, PayloadId, PayloadAttributes } from "./interface";
export declare type ExecutionEngineHttpOpts = {
    urls: string[];
    timeout?: number;
    /**
     * 256 bit jwt secret in hex format without the leading 0x. If provided, the execution engine
     * rpc requests will be bundled by an authorization header having a fresh jwt token on each
     * request, as the EL auth specs mandate the fresh of the token (iat) to be checked within
     * +-5 seconds interval.
     */
    jwtSecretHex?: string;
};
export declare const defaultExecutionEngineHttpOpts: ExecutionEngineHttpOpts;
/**
 * based on Ethereum JSON-RPC API and inherits the following properties of this standard:
 * - Supported communication protocols (HTTP and WebSocket)
 * - Message format and encoding notation
 * - Error codes improvement proposal
 *
 * Client software MUST expose Engine API at a port independent from JSON-RPC API. The default port for the Engine API is 8550 for HTTP and 8551 for WebSocket.
 * https://github.com/ethereum/execution-apis/blob/v1.0.0-alpha.1/src/engine/interop/specification.md
 */
export declare class ExecutionEngineHttp implements IExecutionEngine {
    private readonly rpc;
    constructor(opts: ExecutionEngineHttpOpts, signal: AbortSignal, rpc?: IJsonRpcHttpClient);
    /**
     * `engine_newPayloadV1`
     * From: https://github.com/ethereum/execution-apis/blob/v1.0.0-alpha.6/src/engine/specification.md#engine_newpayloadv1
     *
     * Client software MUST respond to this method call in the following way:
     *
     *   1. {status: INVALID_BLOCK_HASH, latestValidHash: null, validationError:
     *      errorMessage | null} if the blockHash validation has failed
     *
     *   2. {status: INVALID_TERMINAL_BLOCK, latestValidHash: null, validationError:
     *      errorMessage | null} if terminal block conditions are not satisfied
     *
     *   3. {status: SYNCING, latestValidHash: null, validationError: null} if the payload
     *      extends the canonical chain and requisite data for its validation is missing
     *      with the payload status obtained from the Payload validation process if the payload
     *      has been fully validated while processing the call
     *
     *   4. {status: ACCEPTED, latestValidHash: null, validationError: null} if the
     *      following conditions are met:
     *        i) the blockHash of the payload is valid
     *        ii) the payload doesn't extend the canonical chain
     *        iii) the payload hasn't been fully validated.
     *
     * If any of the above fails due to errors unrelated to the normal processing flow of the method, client software MUST respond with an error object.
     */
    notifyNewPayload(executionPayload: bellatrix.ExecutionPayload): Promise<ExecutePayloadResponse>;
    /**
     * `engine_forkchoiceUpdatedV1`
     * From: https://github.com/ethereum/execution-apis/blob/v1.0.0-alpha.6/src/engine/specification.md#engine_forkchoiceupdatedv1
     *
     * Client software MUST respond to this method call in the following way:
     *
     *   1. {payloadStatus: {status: SYNCING, latestValidHash: null, validationError: null}
     *      , payloadId: null}
     *      if forkchoiceState.headBlockHash references an unknown payload or a payload that
     *      can't be validated because requisite data for the validation is missing
     *
     *   2. {payloadStatus: {status: INVALID, latestValidHash: null, validationError:
     *      errorMessage | null}, payloadId: null}
     *      obtained from the Payload validation process if the payload is deemed INVALID
     *
     *   3. {payloadStatus: {status: INVALID_TERMINAL_BLOCK, latestValidHash: null,
     *      validationError: errorMessage | null}, payloadId: null}
     *      either obtained from the Payload validation process or as a result of validating a
     *      PoW block referenced by forkchoiceState.headBlockHash
     *
     *   4. {payloadStatus: {status: VALID, latestValidHash: forkchoiceState.headBlockHash,
     *      validationError: null}, payloadId: null}
     *      if the payload is deemed VALID and a build process hasn't been started
     *
     *   5. {payloadStatus: {status: VALID, latestValidHash: forkchoiceState.headBlockHash,
     *      validationError: null}, payloadId: buildProcessId}
     *      if the payload is deemed VALID and the build process has begun.
     *
     * If any of the above fails due to errors unrelated to the normal processing flow of the method, client software MUST respond with an error object.
     */
    notifyForkchoiceUpdate(headBlockHash: Root | RootHex, finalizedBlockHash: RootHex, payloadAttributes?: PayloadAttributes): Promise<PayloadId | null>;
    /**
     * `engine_getPayloadV1`
     *
     * 1. Given the payloadId client software MUST respond with the most recent version of the payload that is available in the corresponding building process at the time of receiving the call.
     * 2. The call MUST be responded with 5: Unavailable payload error if the building process identified by the payloadId doesn't exist.
     * 3. Client software MAY stop the corresponding building process after serving this call.
     */
    getPayload(payloadId: PayloadId): Promise<bellatrix.ExecutionPayload>;
}
declare type ExecutionPayloadRpc = {
    parentHash: DATA;
    feeRecipient: DATA;
    stateRoot: DATA;
    receiptsRoot: DATA;
    logsBloom: DATA;
    prevRandao: DATA;
    blockNumber: QUANTITY;
    gasLimit: QUANTITY;
    gasUsed: QUANTITY;
    timestamp: QUANTITY;
    extraData: DATA;
    baseFeePerGas: QUANTITY;
    blockHash: DATA;
    transactions: DATA[];
};
export declare function serializeExecutionPayload(data: bellatrix.ExecutionPayload): ExecutionPayloadRpc;
export declare function parseExecutionPayload(data: ExecutionPayloadRpc): bellatrix.ExecutionPayload;
export {};
//# sourceMappingURL=http.d.ts.map