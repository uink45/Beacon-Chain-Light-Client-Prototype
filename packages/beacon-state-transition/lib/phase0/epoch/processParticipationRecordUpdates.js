"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.processParticipationRecordUpdates = void 0;
/**
 * PERF: Should have zero cost. It just moves a rootNode from one key to another. Then it creates an empty tree on the
 * previous key
 */
function processParticipationRecordUpdates(state) {
    // rotate current/previous epoch attestations
    state.previousEpochAttestations = state.currentEpochAttestations;
    state.currentEpochAttestations = [];
}
exports.processParticipationRecordUpdates = processParticipationRecordUpdates;
//# sourceMappingURL=processParticipationRecordUpdates.js.map