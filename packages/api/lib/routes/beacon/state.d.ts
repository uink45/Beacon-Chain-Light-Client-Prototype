import { phase0, CommitteeIndex, Slot, ValidatorIndex, Epoch, Root } from "@chainsafe/lodestar-types";
import { RoutesData, ReturnTypes, ReqSerializers } from "../../utils";
export declare type StateId = string | "head" | "genesis" | "finalized" | "justified";
export declare type ValidatorId = string | number;
export declare type ValidatorStatus = "active" | "pending_initialized" | "pending_queued" | "active_ongoing" | "active_exiting" | "active_slashed" | "exited_unslashed" | "exited_slashed" | "withdrawal_possible" | "withdrawal_done";
export declare type ValidatorFilters = {
    indices?: ValidatorId[];
    statuses?: ValidatorStatus[];
};
export declare type CommitteesFilters = {
    epoch?: Epoch;
    index?: CommitteeIndex;
    slot?: Slot;
};
export declare type FinalityCheckpoints = {
    previousJustified: phase0.Checkpoint;
    currentJustified: phase0.Checkpoint;
    finalized: phase0.Checkpoint;
};
export declare type ValidatorResponse = {
    index: ValidatorIndex;
    balance: number;
    status: ValidatorStatus;
    validator: phase0.Validator;
};
export declare type ValidatorBalance = {
    index: ValidatorIndex;
    balance: number;
};
export declare type EpochCommitteeResponse = {
    index: CommitteeIndex;
    slot: Slot;
    validators: ValidatorIndex[];
};
export declare type EpochSyncCommitteeResponse = {
    /** all of the validator indices in the current sync committee */
    validators: ValidatorIndex[];
    /** Subcommittee slices of the current sync committee */
    validatorAggregates: ValidatorIndex[];
};
export declare type Api = {
    /**
     * Get state SSZ HashTreeRoot
     * Calculates HashTreeRoot for state with given 'stateId'. If stateId is root, same value will be returned.
     *
     * @param stateId State identifier.
     * Can be one of: "head" (canonical head in node's view), "genesis", "finalized", "justified", \<slot\>, \<hex encoded stateRoot with 0x prefix\>.
     */
    getStateRoot(stateId: StateId): Promise<{
        data: Root;
    }>;
    /**
     * Get Fork object for requested state
     * Returns [Fork](https://github.com/ethereum/eth2.0-specs/blob/v0.11.1/specs/phase0/beacon-chain.md#fork) object for state with given 'stateId'.
     * @param stateId State identifier.
     * Can be one of: "head" (canonical head in node's view), "genesis", "finalized", "justified", \<slot\>, \<hex encoded stateRoot with 0x prefix\>.
     */
    getStateFork(stateId: StateId): Promise<{
        data: phase0.Fork;
    }>;
    /**
     * Get state finality checkpoints
     * Returns finality checkpoints for state with given 'stateId'.
     * In case finality is not yet achieved, checkpoint should return epoch 0 and ZERO_HASH as root.
     * @param stateId State identifier.
     * Can be one of: "head" (canonical head in node's view), "genesis", "finalized", "justified", \<slot\>, \<hex encoded stateRoot with 0x prefix\>.
     */
    getStateFinalityCheckpoints(stateId: StateId): Promise<{
        data: FinalityCheckpoints;
    }>;
    /**
     * Get validators from state
     * Returns filterable list of validators with their balance, status and index.
     * @param stateId State identifier.
     * Can be one of: "head" (canonical head in node's view), "genesis", "finalized", "justified", \<slot\>, \<hex encoded stateRoot with 0x prefix\>.
     * @param id Either hex encoded public key (with 0x prefix) or validator index
     * @param status [Validator status specification](https://hackmd.io/ofFJ5gOmQpu1jjHilHbdQQ)
     */
    getStateValidators(stateId: StateId, filters?: ValidatorFilters): Promise<{
        data: ValidatorResponse[];
    }>;
    /**
     * Get validator from state by id
     * Returns validator specified by state and id or public key along with status and balance.
     * @param stateId State identifier.
     * Can be one of: "head" (canonical head in node's view), "genesis", "finalized", "justified", \<slot\>, \<hex encoded stateRoot with 0x prefix\>.
     * @param validatorId Either hex encoded public key (with 0x prefix) or validator index
     */
    getStateValidator(stateId: StateId, validatorId: ValidatorId): Promise<{
        data: ValidatorResponse;
    }>;
    /**
     * Get validator balances from state
     * Returns filterable list of validator balances.
     * @param stateId State identifier.
     * Can be one of: "head" (canonical head in node's view), "genesis", "finalized", "justified", \<slot\>, \<hex encoded stateRoot with 0x prefix\>.
     * @param id Either hex encoded public key (with 0x prefix) or validator index
     */
    getStateValidatorBalances(stateId: StateId, indices?: ValidatorId[]): Promise<{
        data: ValidatorBalance[];
    }>;
    /**
     * Get all committees for a state.
     * Retrieves the committees for the given state.
     * @param stateId State identifier.
     * Can be one of: "head" (canonical head in node's view), "genesis", "finalized", "justified", \<slot\>, \<hex encoded stateRoot with 0x prefix\>.
     * @param epoch Fetch committees for the given epoch.  If not present then the committees for the epoch of the state will be obtained.
     * @param index Restrict returned values to those matching the supplied committee index.
     * @param slot Restrict returned values to those matching the supplied slot.
     */
    getEpochCommittees(stateId: StateId, filters?: CommitteesFilters): Promise<{
        data: EpochCommitteeResponse[];
    }>;
    getEpochSyncCommittees(stateId: StateId, epoch?: Epoch): Promise<{
        data: EpochSyncCommitteeResponse;
    }>;
};
/**
 * Define javascript values for each route
 */
export declare const routesData: RoutesData<Api>;
declare type StateIdOnlyReq = {
    params: {
        stateId: string;
    };
};
export declare type ReqTypes = {
    getEpochCommittees: {
        params: {
            stateId: StateId;
        };
        query: {
            slot?: number;
            epoch?: number;
            index?: number;
        };
    };
    getEpochSyncCommittees: {
        params: {
            stateId: StateId;
        };
        query: {
            epoch?: number;
        };
    };
    getStateFinalityCheckpoints: StateIdOnlyReq;
    getStateFork: StateIdOnlyReq;
    getStateRoot: StateIdOnlyReq;
    getStateValidator: {
        params: {
            stateId: StateId;
            validatorId: ValidatorId;
        };
    };
    getStateValidators: {
        params: {
            stateId: StateId;
        };
        query: {
            indices?: ValidatorId[];
            statuses?: ValidatorStatus[];
        };
    };
    getStateValidatorBalances: {
        params: {
            stateId: StateId;
        };
        query: {
            indices?: ValidatorId[];
        };
    };
};
export declare function getReqSerializers(): ReqSerializers<Api, ReqTypes>;
export declare function getReturnTypes(): ReturnTypes<Api>;
export {};
//# sourceMappingURL=state.d.ts.map