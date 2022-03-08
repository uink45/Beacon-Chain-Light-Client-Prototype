"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseExecutionPayload = exports.serializeExecutionPayload = exports.ExecutionEngineHttp = exports.defaultExecutionEngineHttpOpts = void 0;
const lodestar_params_1 = require("@chainsafe/lodestar-params");
const lodestar_utils_1 = require("@chainsafe/lodestar-utils");
const jsonRpcHttpClient_1 = require("../eth1/provider/jsonRpcHttpClient");
const utils_1 = require("../eth1/provider/utils");
const interface_1 = require("./interface");
exports.defaultExecutionEngineHttpOpts = {
    urls: ["http://localhost:8550"],
    timeout: 12000,
};
/**
 * based on Ethereum JSON-RPC API and inherits the following properties of this standard:
 * - Supported communication protocols (HTTP and WebSocket)
 * - Message format and encoding notation
 * - Error codes improvement proposal
 *
 * Client software MUST expose Engine API at a port independent from JSON-RPC API. The default port for the Engine API is 8550 for HTTP and 8551 for WebSocket.
 * https://github.com/ethereum/execution-apis/blob/v1.0.0-alpha.1/src/engine/interop/specification.md
 */
class ExecutionEngineHttp {
    constructor(opts, signal, rpc) {
        this.rpc =
            rpc !== null && rpc !== void 0 ? rpc : new jsonRpcHttpClient_1.JsonRpcHttpClient(opts.urls, {
                signal,
                timeout: opts.timeout,
                jwtSecret: opts.jwtSecretHex ? (0, lodestar_utils_1.fromHex)(opts.jwtSecretHex) : undefined,
            });
    }
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
    async notifyNewPayload(executionPayload) {
        const method = "engine_newPayloadV1";
        const serializedExecutionPayload = serializeExecutionPayload(executionPayload);
        const { status, latestValidHash, validationError } = await this.rpc
            .fetch({
            method,
            params: [serializedExecutionPayload],
        })
            // If there are errors by EL like connection refused, internal error, they need to be
            // treated seperate from being INVALID. For now, just pass the error upstream.
            .catch((e) => {
            if (e instanceof jsonRpcHttpClient_1.HttpRpcError || e instanceof jsonRpcHttpClient_1.ErrorJsonRpcResponse) {
                return { status: interface_1.ExecutePayloadStatus.ELERROR, latestValidHash: null, validationError: e.message };
            }
            else {
                return { status: interface_1.ExecutePayloadStatus.UNAVAILABLE, latestValidHash: null, validationError: e.message };
            }
        });
        switch (status) {
            case interface_1.ExecutePayloadStatus.VALID:
                if (latestValidHash == null) {
                    return {
                        status: interface_1.ExecutePayloadStatus.ELERROR,
                        latestValidHash: null,
                        validationError: `Invalid null latestValidHash for status=${status}`,
                    };
                }
                else {
                    return { status, latestValidHash, validationError: null };
                }
            case interface_1.ExecutePayloadStatus.INVALID:
                if (latestValidHash == null) {
                    return {
                        status: interface_1.ExecutePayloadStatus.ELERROR,
                        latestValidHash: null,
                        validationError: `Invalid null latestValidHash for status=${status}`,
                    };
                }
                else {
                    return { status, latestValidHash, validationError };
                }
            case interface_1.ExecutePayloadStatus.SYNCING:
            case interface_1.ExecutePayloadStatus.ACCEPTED:
                return { status, latestValidHash: null, validationError: null };
            case interface_1.ExecutePayloadStatus.INVALID_BLOCK_HASH:
            case interface_1.ExecutePayloadStatus.INVALID_TERMINAL_BLOCK:
                return { status, latestValidHash: null, validationError: validationError !== null && validationError !== void 0 ? validationError : "Malformed block" };
            case interface_1.ExecutePayloadStatus.UNAVAILABLE:
            case interface_1.ExecutePayloadStatus.ELERROR:
                return {
                    status,
                    latestValidHash: null,
                    validationError: validationError !== null && validationError !== void 0 ? validationError : "Unknown ELERROR",
                };
            default:
                return {
                    status: interface_1.ExecutePayloadStatus.ELERROR,
                    latestValidHash: null,
                    validationError: `Invalid EL status on executePayload: ${status}`,
                };
        }
    }
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
    async notifyForkchoiceUpdate(headBlockHash, finalizedBlockHash, payloadAttributes) {
        const method = "engine_forkchoiceUpdatedV1";
        const headBlockHashData = typeof headBlockHash === "string" ? headBlockHash : (0, utils_1.bytesToData)(headBlockHash);
        const apiPayloadAttributes = payloadAttributes
            ? {
                timestamp: (0, utils_1.numToQuantity)(payloadAttributes.timestamp),
                prevRandao: (0, utils_1.bytesToData)(payloadAttributes.prevRandao),
                suggestedFeeRecipient: (0, utils_1.bytesToData)(payloadAttributes.suggestedFeeRecipient),
            }
            : undefined;
        // TODO: propogate latestValidHash to the forkchoice, for now ignore it as we
        // currently do not propogate the validation status up the forkchoice
        const { payloadStatus: { status, latestValidHash: _latestValidHash, validationError }, payloadId, } = await this.rpc.fetch({
            method,
            params: [
                { headBlockHash: headBlockHashData, safeBlockHash: headBlockHashData, finalizedBlockHash },
                apiPayloadAttributes,
            ],
        });
        switch (status) {
            case interface_1.ExecutePayloadStatus.VALID:
                // if payloadAttributes are provided, a valid payloadId is expected
                if (payloadAttributes && (!payloadId || payloadId === "0x")) {
                    throw Error(`Received invalid payloadId=${payloadId}`);
                }
                return payloadId !== "0x" ? payloadId : null;
            case interface_1.ExecutePayloadStatus.SYNCING:
                // Throw error on syncing if requested to produce a block, else silently ignore
                if (payloadAttributes) {
                    throw Error("Execution Layer Syncing");
                }
                else {
                    return null;
                }
            case interface_1.ExecutePayloadStatus.INVALID:
                throw Error(`Invalid ${payloadAttributes ? "prepare payload" : "forkchoice request"}, validationError=${validationError !== null && validationError !== void 0 ? validationError : ""}`);
            case interface_1.ExecutePayloadStatus.INVALID_TERMINAL_BLOCK:
                throw Error(`Invalid terminal block for ${payloadAttributes ? "prepare payload" : "forkchoice request"}, validationError=${validationError !== null && validationError !== void 0 ? validationError : ""}`);
            default:
                throw Error(`Unknown status ${status}`);
        }
    }
    /**
     * `engine_getPayloadV1`
     *
     * 1. Given the payloadId client software MUST respond with the most recent version of the payload that is available in the corresponding building process at the time of receiving the call.
     * 2. The call MUST be responded with 5: Unavailable payload error if the building process identified by the payloadId doesn't exist.
     * 3. Client software MAY stop the corresponding building process after serving this call.
     */
    async getPayload(payloadId) {
        const method = "engine_getPayloadV1";
        const executionPayloadRpc = await this.rpc.fetch({
            method,
            params: [payloadId],
        });
        return parseExecutionPayload(executionPayloadRpc);
    }
}
exports.ExecutionEngineHttp = ExecutionEngineHttp;
function serializeExecutionPayload(data) {
    return {
        parentHash: (0, utils_1.bytesToData)(data.parentHash),
        feeRecipient: (0, utils_1.bytesToData)(data.feeRecipient),
        stateRoot: (0, utils_1.bytesToData)(data.stateRoot),
        receiptsRoot: (0, utils_1.bytesToData)(data.receiptsRoot),
        logsBloom: (0, utils_1.bytesToData)(data.logsBloom),
        prevRandao: (0, utils_1.bytesToData)(data.prevRandao),
        blockNumber: (0, utils_1.numToQuantity)(data.blockNumber),
        gasLimit: (0, utils_1.numToQuantity)(data.gasLimit),
        gasUsed: (0, utils_1.numToQuantity)(data.gasUsed),
        timestamp: (0, utils_1.numToQuantity)(data.timestamp),
        extraData: (0, utils_1.bytesToData)(data.extraData),
        baseFeePerGas: (0, utils_1.numToQuantity)(data.baseFeePerGas),
        blockHash: (0, utils_1.bytesToData)(data.blockHash),
        transactions: data.transactions.map((tran) => (0, utils_1.bytesToData)(tran)),
    };
}
exports.serializeExecutionPayload = serializeExecutionPayload;
function parseExecutionPayload(data) {
    return {
        parentHash: (0, utils_1.dataToBytes)(data.parentHash, 32),
        feeRecipient: (0, utils_1.dataToBytes)(data.feeRecipient, 20),
        stateRoot: (0, utils_1.dataToBytes)(data.stateRoot, 32),
        receiptsRoot: (0, utils_1.dataToBytes)(data.receiptsRoot, 32),
        logsBloom: (0, utils_1.dataToBytes)(data.logsBloom, lodestar_params_1.BYTES_PER_LOGS_BLOOM),
        prevRandao: (0, utils_1.dataToBytes)(data.prevRandao, 32),
        blockNumber: (0, utils_1.quantityToNum)(data.blockNumber),
        gasLimit: (0, utils_1.quantityToNum)(data.gasLimit),
        gasUsed: (0, utils_1.quantityToNum)(data.gasUsed),
        timestamp: (0, utils_1.quantityToNum)(data.timestamp),
        extraData: (0, utils_1.dataToBytes)(data.extraData),
        baseFeePerGas: (0, utils_1.quantityToBigint)(data.baseFeePerGas),
        blockHash: (0, utils_1.dataToBytes)(data.blockHash, 32),
        transactions: data.transactions.map((tran) => (0, utils_1.dataToBytes)(tran)),
    };
}
exports.parseExecutionPayload = parseExecutionPayload;
//# sourceMappingURL=http.js.map