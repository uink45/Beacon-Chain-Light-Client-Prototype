"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.processEpoch = exports.processParticipationFlagUpdates = exports.processSyncCommitteeUpdates = exports.processSlashings = exports.processRewardsAndPenalties = exports.processInactivityUpdates = exports.getRewardsAndPenalties = void 0;
const epoch_1 = require("../../allForks/epoch");
const processRewardsAndPenalties_1 = require("./processRewardsAndPenalties");
Object.defineProperty(exports, "processRewardsAndPenalties", { enumerable: true, get: function () { return processRewardsAndPenalties_1.processRewardsAndPenalties; } });
const processSlashings_1 = require("./processSlashings");
Object.defineProperty(exports, "processSlashings", { enumerable: true, get: function () { return processSlashings_1.processSlashings; } });
const processParticipationFlagUpdates_1 = require("./processParticipationFlagUpdates");
Object.defineProperty(exports, "processParticipationFlagUpdates", { enumerable: true, get: function () { return processParticipationFlagUpdates_1.processParticipationFlagUpdates; } });
const processInactivityUpdates_1 = require("./processInactivityUpdates");
Object.defineProperty(exports, "processInactivityUpdates", { enumerable: true, get: function () { return processInactivityUpdates_1.processInactivityUpdates; } });
const processSyncCommitteeUpdates_1 = require("./processSyncCommitteeUpdates");
Object.defineProperty(exports, "processSyncCommitteeUpdates", { enumerable: true, get: function () { return processSyncCommitteeUpdates_1.processSyncCommitteeUpdates; } });
// For spec tests
var getRewardsAndPenalties_1 = require("./getRewardsAndPenalties");
Object.defineProperty(exports, "getRewardsAndPenalties", { enumerable: true, get: function () { return getRewardsAndPenalties_1.getRewardsAndPenalties; } });
function processEpoch(state, epochProcess) {
    (0, epoch_1.processJustificationAndFinalization)(state, epochProcess);
    (0, processInactivityUpdates_1.processInactivityUpdates)(state, epochProcess);
    (0, processRewardsAndPenalties_1.processRewardsAndPenalties)(state, epochProcess);
    (0, epoch_1.processRegistryUpdates)(state, epochProcess);
    (0, processSlashings_1.processSlashings)(state, epochProcess);
    (0, epoch_1.processEth1DataReset)(state, epochProcess);
    (0, epoch_1.processEffectiveBalanceUpdates)(state, epochProcess);
    (0, epoch_1.processSlashingsReset)(state, epochProcess);
    (0, epoch_1.processRandaoMixesReset)(state, epochProcess);
    (0, epoch_1.processHistoricalRootsUpdate)(state, epochProcess);
    (0, processParticipationFlagUpdates_1.processParticipationFlagUpdates)(state);
    (0, processSyncCommitteeUpdates_1.processSyncCommitteeUpdates)(state);
}
exports.processEpoch = processEpoch;
//# sourceMappingURL=index.js.map