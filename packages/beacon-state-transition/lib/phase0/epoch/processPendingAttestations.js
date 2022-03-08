"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.statusProcessEpoch = void 0;
const lodestar_types_1 = require("@chainsafe/lodestar-types");
const ssz_1 = require("@chainsafe/ssz");
const util_1 = require("../../util");
/**
 * Mutates `statuses` from all pending attestations.
 *
 * PERF: Cost 'proportional' to attestation count + how many bits per attestation + how many flags the attestation triggers
 *
 * - On normal mainnet conditions:
 *   - previousEpochAttestations: 3403
 *   - currentEpochAttestations:  3129
 *   - previousEpochAttestationsBits: 83
 *   - currentEpochAttestationsBits:  85
 */
function statusProcessEpoch(state, statuses, attestations, epoch, sourceFlag, targetFlag, headFlag) {
    const { epochCtx, slot: stateSlot } = state;
    const rootType = lodestar_types_1.ssz.Root;
    const prevEpoch = epochCtx.previousShuffling.epoch;
    if (attestations.length === 0) {
        return;
    }
    const actualTargetBlockRoot = (0, util_1.getBlockRootAtSlot)(state, (0, util_1.computeStartSlotAtEpoch)(epoch));
    for (const att of (0, ssz_1.readonlyValues)(attestations)) {
        const aggregationBits = att.aggregationBits;
        const attData = att.data;
        const inclusionDelay = att.inclusionDelay;
        const proposerIndex = att.proposerIndex;
        const attSlot = attData.slot;
        const committeeIndex = attData.index;
        const attBeaconBlockRoot = attData.beaconBlockRoot;
        const attTarget = attData.target;
        const attVotedTargetRoot = rootType.equals(attTarget.root, actualTargetBlockRoot);
        const attVotedHeadRoot = attSlot < stateSlot && rootType.equals(attBeaconBlockRoot, (0, util_1.getBlockRootAtSlot)(state, attSlot));
        const committee = epochCtx.getBeaconCommittee(attSlot, committeeIndex);
        const participants = (0, util_1.zipIndexesCommitteeBits)(committee, aggregationBits);
        if (epoch === prevEpoch) {
            for (const p of participants) {
                const status = statuses[p];
                if (status.proposerIndex === -1 || status.inclusionDelay > inclusionDelay) {
                    status.proposerIndex = proposerIndex;
                    status.inclusionDelay = inclusionDelay;
                }
            }
        }
        for (const p of participants) {
            const status = statuses[p];
            status.flags |= sourceFlag;
            if (attVotedTargetRoot) {
                status.flags |= targetFlag;
                if (attVotedHeadRoot) {
                    status.flags |= headFlag;
                }
            }
        }
    }
}
exports.statusProcessEpoch = statusProcessEpoch;
//# sourceMappingURL=processPendingAttestations.js.map