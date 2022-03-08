"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getContributionPubkeys = exports.getSyncCommitteeContributionSignatureSet = void 0;
const lodestar_types_1 = require("@chainsafe/lodestar-types");
const lodestar_params_1 = require("@chainsafe/lodestar-params");
const ssz_1 = require("@chainsafe/ssz");
const lodestar_beacon_state_transition_1 = require("@chainsafe/lodestar-beacon-state-transition");
function getSyncCommitteeContributionSignatureSet(state, contribution, pubkeys) {
    const domain = state.config.getDomain(lodestar_params_1.DOMAIN_SYNC_COMMITTEE, contribution.slot);
    return {
        type: lodestar_beacon_state_transition_1.SignatureSetType.aggregate,
        pubkeys,
        signingRoot: (0, lodestar_beacon_state_transition_1.computeSigningRoot)(lodestar_types_1.ssz.Root, contribution.beaconBlockRoot, domain),
        signature: contribution.signature.valueOf(),
    };
}
exports.getSyncCommitteeContributionSignatureSet = getSyncCommitteeContributionSignatureSet;
/**
 * Retrieve pubkeys in contribution aggregate using epochCtx:
 * - currSyncCommitteeIndexes cache
 * - index2pubkey cache
 */
function getContributionPubkeys(state, contribution) {
    const pubkeys = [];
    const subcommitteeSize = Math.floor(lodestar_params_1.SYNC_COMMITTEE_SIZE / lodestar_params_1.SYNC_COMMITTEE_SUBNET_COUNT);
    const startIndex = contribution.subcommitteeIndex * subcommitteeSize;
    const aggBits = Array.from((0, ssz_1.readonlyValues)(contribution.aggregationBits));
    const syncCommittee = state.epochCtx.getIndexedSyncCommittee(contribution.slot);
    for (const [i, bit] of aggBits.entries()) {
        if (bit) {
            const indexInCommittee = startIndex + i;
            const validatorIndex = syncCommittee.validatorIndices[indexInCommittee];
            const pubkey = state.index2pubkey[validatorIndex];
            pubkeys.push(pubkey);
        }
    }
    return pubkeys;
}
exports.getContributionPubkeys = getContributionPubkeys;
//# sourceMappingURL=syncCommitteeContribution.js.map