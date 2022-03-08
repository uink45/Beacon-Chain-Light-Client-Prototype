"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.processEpoch = exports.getAttestationDeltas = exports.processSlashings = exports.processRewardsAndPenalties = void 0;
const epoch_1 = require("../../allForks/epoch");
const processRewardsAndPenalties_1 = require("./processRewardsAndPenalties");
Object.defineProperty(exports, "processRewardsAndPenalties", { enumerable: true, get: function () { return processRewardsAndPenalties_1.processRewardsAndPenalties; } });
const processSlashings_1 = require("./processSlashings");
Object.defineProperty(exports, "processSlashings", { enumerable: true, get: function () { return processSlashings_1.processSlashings; } });
const getAttestationDeltas_1 = require("./getAttestationDeltas");
Object.defineProperty(exports, "getAttestationDeltas", { enumerable: true, get: function () { return getAttestationDeltas_1.getAttestationDeltas; } });
const processParticipationRecordUpdates_1 = require("./processParticipationRecordUpdates");
function processEpoch(state, epochProcess) {
    (0, epoch_1.processJustificationAndFinalization)(state, epochProcess);
    (0, processRewardsAndPenalties_1.processRewardsAndPenalties)(state, epochProcess);
    (0, epoch_1.processRegistryUpdates)(state, epochProcess);
    (0, processSlashings_1.processSlashings)(state, epochProcess);
    // inline processFinalUpdates() to follow altair and for clarity
    (0, epoch_1.processEth1DataReset)(state, epochProcess);
    (0, epoch_1.processEffectiveBalanceUpdates)(state, epochProcess);
    (0, epoch_1.processSlashingsReset)(state, epochProcess);
    (0, epoch_1.processRandaoMixesReset)(state, epochProcess);
    (0, epoch_1.processHistoricalRootsUpdate)(state, epochProcess);
    (0, processParticipationRecordUpdates_1.processParticipationRecordUpdates)(state);
}
exports.processEpoch = processEpoch;
//# sourceMappingURL=index.js.map