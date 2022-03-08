"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.runNodeNotifier = void 0;
const lodestar_utils_1 = require("@chainsafe/lodestar-utils");
const lodestar_params_1 = require("@chainsafe/lodestar-params");
const lodestar_beacon_state_transition_1 = require("@chainsafe/lodestar-beacon-state-transition");
const sync_1 = require("../sync");
const time_1 = require("../util/time");
const timeSeries_1 = require("../util/timeSeries");
/** Create a warning log whenever the peer count is at or below this value */
const WARN_PEER_COUNT = 1;
/**
 * Runs a notifier service that periodically logs information about the node.
 */
async function runNodeNotifier({ network, chain, sync, config, logger, signal, }) {
    var _a;
    const SLOTS_PER_SYNC_COMMITTEE_PERIOD = lodestar_params_1.SLOTS_PER_EPOCH * lodestar_params_1.EPOCHS_PER_SYNC_COMMITTEE_PERIOD;
    const timeSeries = new timeSeries_1.TimeSeries({ maxPoints: 10 });
    let hasLowPeerCount = false; // Only log once
    try {
        while (!signal.aborted) {
            const connectedPeerCount = network.getConnectedPeers().length;
            if (connectedPeerCount <= WARN_PEER_COUNT) {
                if (!hasLowPeerCount) {
                    logger.warn("Low peer count", { peers: connectedPeerCount });
                    hasLowPeerCount = true;
                }
            }
            else {
                hasLowPeerCount = false;
            }
            const clockSlot = chain.clock.currentSlot;
            const clockEpoch = (0, lodestar_beacon_state_transition_1.computeEpochAtSlot)(clockSlot);
            const headInfo = chain.forkChoice.getHead();
            const headState = chain.getHeadState();
            const finalizedEpoch = headState.finalizedCheckpoint.epoch;
            const finalizedRoot = headState.finalizedCheckpoint.root.valueOf();
            const headSlot = headInfo.slot;
            timeSeries.addPoint(headSlot, Date.now());
            const peersRow = `peers: ${connectedPeerCount}`;
            const finalizedCheckpointRow = `finalized: ${(0, lodestar_utils_1.prettyBytes)(finalizedRoot)}:${finalizedEpoch}`;
            const headRow = `head: ${headInfo.slot} ${(0, lodestar_utils_1.prettyBytes)(headInfo.blockRoot)}`;
            const isMergeTransitionComplete = lodestar_beacon_state_transition_1.bellatrix.isBellatrixStateType(headState) && lodestar_beacon_state_transition_1.bellatrix.isMergeTransitionComplete(headState);
            const executionInfo = isMergeTransitionComplete
                ? [
                    `execution: ${headInfo.executionStatus.toLowerCase()}(${(0, lodestar_utils_1.prettyBytes)((_a = headInfo.executionPayloadBlockHash) !== null && _a !== void 0 ? _a : "empty")})`,
                ]
                : [];
            // Give info about empty slots if head < clock
            const skippedSlots = clockSlot - headInfo.slot;
            const clockSlotRow = `slot: ${clockSlot}` + (skippedSlots > 0 ? ` (skipped ${skippedSlots})` : "");
            let nodeState;
            switch (sync.state) {
                case sync_1.SyncState.SyncingFinalized:
                case sync_1.SyncState.SyncingHead: {
                    const slotsPerSecond = timeSeries.computeLinearSpeed();
                    const distance = Math.max(clockSlot - headSlot, 0);
                    const secondsLeft = distance / slotsPerSecond;
                    const timeLeft = isFinite(secondsLeft) ? (0, time_1.prettyTimeDiff)(1000 * secondsLeft) : "?";
                    // Syncing - time left - speed - head - finalized - clock - peers
                    nodeState = [
                        "Syncing",
                        `${timeLeft} left`,
                        `${slotsPerSecond.toPrecision(3)} slots/s`,
                        clockSlotRow,
                        headRow,
                        ...executionInfo,
                        finalizedCheckpointRow,
                        peersRow,
                    ];
                    break;
                }
                case sync_1.SyncState.Synced: {
                    // Synced - clock - head - finalized - peers
                    nodeState = ["Synced", clockSlotRow, headRow, ...executionInfo, finalizedCheckpointRow, peersRow];
                    break;
                }
                case sync_1.SyncState.Stalled: {
                    // Searching peers - peers - head - finalized - clock
                    nodeState = ["Searching peers", peersRow, clockSlotRow, headRow, ...executionInfo, finalizedCheckpointRow];
                }
            }
            logger.info(nodeState.join(" - "));
            // Log important chain time-based events
            // Log sync committee change
            if (clockEpoch > config.ALTAIR_FORK_EPOCH) {
                if (clockSlot % SLOTS_PER_SYNC_COMMITTEE_PERIOD === 0) {
                    const period = Math.floor(clockEpoch / lodestar_params_1.EPOCHS_PER_SYNC_COMMITTEE_PERIOD);
                    logger.info(`New sync committee period ${period}`);
                }
            }
            // Log halfway through each slot
            await (0, lodestar_utils_1.sleep)(timeToNextHalfSlot(config, chain), signal);
        }
    }
    catch (e) {
        if (e instanceof lodestar_utils_1.ErrorAborted) {
            return; // Ok
        }
        else {
            logger.error("Node notifier error", {}, e);
        }
    }
}
exports.runNodeNotifier = runNodeNotifier;
function timeToNextHalfSlot(config, chain) {
    const msPerSlot = config.SECONDS_PER_SLOT * 1000;
    const msFromGenesis = Date.now() - chain.getGenesisTime() * 1000;
    const msToNextSlot = msPerSlot - (msFromGenesis % msPerSlot);
    return msToNextSlot > msPerSlot / 2 ? msToNextSlot - msPerSlot / 2 : msToNextSlot + msPerSlot / 2;
}
//# sourceMappingURL=notifier.js.map