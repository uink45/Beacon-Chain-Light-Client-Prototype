import { allForks, BLSPubkey, CommitteeIndex, Slot, ValidatorIndex } from "@chainsafe/lodestar-types";
export declare function computeSubnetForCommitteesAtSlot(slot: Slot, committeesAtSlot: number, committeeIndex: CommitteeIndex): number;
/**
 * Precompute all pubkeys for given `validatorIndices`. Ensures that all `validatorIndices` are known
 * before doing other expensive logic.
 *
 * Uses special BranchNodeStruct state.validators data structure to optimize getting pubkeys.
 * Type-unsafe: assumes state.validators[i] is of BranchNodeStruct type.
 * Note: This is the fastest way of getting compressed pubkeys.
 *       See benchmark -> packages/lodestar/test/perf/api/impl/validator/attester.test.ts
 */
export declare function getPubkeysForIndices(validators: allForks.BeaconState["validators"], indexes: ValidatorIndex[]): BLSPubkey[];
/**
 * Uses special BranchNodeStruct state.validators data structure to optimize getting pubkeys.
 * Type-unsafe: assumes state.validators[i] is of BranchNodeStruct type.
 */
export declare function getPubkeysForIndex(validators: allForks.BeaconState["validators"], index: ValidatorIndex): BLSPubkey;
//# sourceMappingURL=utils.d.ts.map