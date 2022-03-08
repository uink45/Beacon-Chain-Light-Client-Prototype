import { routes } from "@chainsafe/lodestar-api";
import { PubkeyIndexMap } from "@chainsafe/lodestar-beacon-state-transition";
import { phase0 } from "@chainsafe/lodestar-types";
import { allForks } from "@chainsafe/lodestar-beacon-state-transition";
import { IChainForkConfig } from "@chainsafe/lodestar-config";
import { Epoch, ValidatorIndex } from "@chainsafe/lodestar-types";
import { ByteVector } from "@chainsafe/ssz";
import { IBeaconChain } from "../../../../chain";
import { IBeaconDb } from "../../../../db";
declare type ResolveStateIdOpts = {
    /**
     * triggers a fetch of the nearest finalized state from the archive if the state at the desired
     * stateId is not in the archive and run the state transition up to the desired slot
     * NOTE: this is not related to chain.regen, which handles regenerating un-finalized states
     */
    regenFinalizedState?: boolean;
};
export declare function resolveStateId(config: IChainForkConfig, chain: IBeaconChain, db: IBeaconDb, stateId: routes.beacon.StateId, opts?: ResolveStateIdOpts): Promise<allForks.BeaconState>;
/**
 * Get the status of the validator
 * based on conditions outlined in https://hackmd.io/ofFJ5gOmQpu1jjHilHbdQQ
 */
export declare function getValidatorStatus(validator: phase0.Validator, currentEpoch: Epoch): routes.beacon.ValidatorStatus;
export declare function toValidatorResponse(index: ValidatorIndex, validator: phase0.Validator, balance: number, currentEpoch: Epoch): routes.beacon.ValidatorResponse;
export declare function filterStateValidatorsByStatuses(statuses: string[], state: allForks.BeaconState, pubkey2index: PubkeyIndexMap, currentEpoch: Epoch): routes.beacon.ValidatorResponse[];
export declare function getStateValidatorIndex(id: routes.beacon.ValidatorId | ByteVector, state: allForks.BeaconState, pubkey2index: PubkeyIndexMap): number | undefined;
export {};
//# sourceMappingURL=utils.d.ts.map