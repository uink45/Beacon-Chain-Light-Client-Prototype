"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPubkeysForIndex = exports.getPubkeysForIndices = exports.computeSubnetForCommitteesAtSlot = void 0;
const lodestar_beacon_state_transition_1 = require("@chainsafe/lodestar-beacon-state-transition");
const lodestar_params_1 = require("@chainsafe/lodestar-params");
const lodestar_types_1 = require("@chainsafe/lodestar-types");
function computeSubnetForCommitteesAtSlot(slot, committeesAtSlot, committeeIndex) {
    const slotsSinceEpochStart = (0, lodestar_beacon_state_transition_1.computeSlotsSinceEpochStart)(slot);
    const committeesSinceEpochStart = committeesAtSlot * slotsSinceEpochStart;
    return (committeesSinceEpochStart + committeeIndex) % lodestar_params_1.ATTESTATION_SUBNET_COUNT;
}
exports.computeSubnetForCommitteesAtSlot = computeSubnetForCommitteesAtSlot;
/**
 * Precompute all pubkeys for given `validatorIndices`. Ensures that all `validatorIndices` are known
 * before doing other expensive logic.
 *
 * Uses special BranchNodeStruct state.validators data structure to optimize getting pubkeys.
 * Type-unsafe: assumes state.validators[i] is of BranchNodeStruct type.
 * Note: This is the fastest way of getting compressed pubkeys.
 *       See benchmark -> packages/lodestar/test/perf/api/impl/validator/attester.test.ts
 */
function getPubkeysForIndices(validators, indexes) {
    const validatorsLen = validators.length; // Get once, it's expensive
    const validatorsTree = validators.tree;
    const pubkeys = [];
    for (let i = 0, len = indexes.length; i < len; i++) {
        const index = indexes[i];
        if (index >= validatorsLen) {
            throw Error(`validatorIndex ${index} too high. Current validator count ${validatorsLen}`);
        }
        // NOTE: This could be optimized further by traversing the tree optimally with .getNodes()
        const gindex = lodestar_types_1.ssz.phase0.Validators.getGindexBitStringAtChunkIndex(index);
        const node = validatorsTree.getNode(gindex);
        pubkeys.push(node.value.pubkey);
    }
    return pubkeys;
}
exports.getPubkeysForIndices = getPubkeysForIndices;
/**
 * Uses special BranchNodeStruct state.validators data structure to optimize getting pubkeys.
 * Type-unsafe: assumes state.validators[i] is of BranchNodeStruct type.
 */
function getPubkeysForIndex(validators, index) {
    const validatorsLen = validators.length;
    if (index >= validatorsLen) {
        throw Error(`validatorIndex ${index} too high. Current validator count ${validatorsLen}`);
    }
    const validatorsTree = validators.tree;
    const gindex = lodestar_types_1.ssz.phase0.Validators.getGindexBitStringAtChunkIndex(index);
    const node = validatorsTree.getNode(gindex);
    return node.value.pubkey;
}
exports.getPubkeysForIndex = getPubkeysForIndex;
//# sourceMappingURL=utils.js.map