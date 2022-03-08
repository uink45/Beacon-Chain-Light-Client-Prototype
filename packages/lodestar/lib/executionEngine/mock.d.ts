import { bellatrix, RootHex, Root } from "@chainsafe/lodestar-types";
import { ExecutePayloadResponse, IExecutionEngine, PayloadId, PayloadAttributes } from "./interface";
export declare type ExecutionEngineMockOpts = {
    genesisBlockHash: string;
};
/**
 * Mock ExecutionEngine for fast prototyping and unit testing
 */
export declare class ExecutionEngineMock implements IExecutionEngine {
    headBlockRoot: string;
    finalizedBlockRoot: string;
    private knownBlocks;
    private preparingPayloads;
    private payloadId;
    constructor(opts: ExecutionEngineMockOpts);
    /**
     * `engine_newPayloadV1`
     *
     * 1. Client software MUST validate the payload according to the execution environment rule set with modifications to this rule set defined in the Block Validity section of EIP-3675 and respond with the validation result.
     * 2. Client software MUST defer persisting a valid payload until the corresponding engine_consensusValidated message deems the payload valid with respect to the proof-of-stake consensus rules.
     * 3. Client software MUST discard the payload if it's deemed invalid.
     * 4. The call MUST be responded with SYNCING status while the sync process is in progress and thus the execution cannot yet be validated.
     * 5. In the case when the parent block is unknown, client software MUST pull the block from the network and take one of the following actions depending on the parent block properties:
     * 6. If the parent block is a PoW block as per EIP-3675 definition, then all missing dependencies of the payload MUST be pulled from the network and validated accordingly. The call MUST be responded according to the validity of the payload and the chain of its ancestors.
     *    If the parent block is a PoS block as per EIP-3675 definition, then the call MAY be responded with SYNCING status and sync process SHOULD be initiated accordingly.
     */
    notifyNewPayload(executionPayload: bellatrix.ExecutionPayload): Promise<ExecutePayloadResponse>;
    /**
     * `engine_forkchoiceUpdated`
     *
     * 1. This method call maps on the POS_FORKCHOICE_UPDATED event of EIP-3675 and MUST be processed according to the specification defined in the EIP.
     * 2. Client software MUST respond with 4: Unknown block error if the payload identified by either the headBlockHash or the finalizedBlockHash is unknown.
     */
    notifyForkchoiceUpdate(headBlockHash: Root, finalizedBlockHash: RootHex, payloadAttributes?: PayloadAttributes): Promise<PayloadId>;
    /**
     * `engine_getPayload`
     *
     * 1. Given the payloadId client software MUST respond with the most recent version of the payload that is available in the corresponding building process at the time of receiving the call.
     * 2. The call MUST be responded with 5: Unavailable payload error if the building process identified by the payloadId doesn't exist.
     * 3. Client software MAY stop the corresponding building process after serving this call.
     */
    getPayload(payloadId: PayloadId): Promise<bellatrix.ExecutionPayload>;
}
//# sourceMappingURL=mock.d.ts.map