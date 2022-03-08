"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.votingPeriodStartTime = exports.fastSerializeEth1Data = exports.pickEth1Vote = exports.getEth1VotesToConsider = void 0;
const lodestar_params_1 = require("@chainsafe/lodestar-params");
const lodestar_beacon_state_transition_1 = require("@chainsafe/lodestar-beacon-state-transition");
const ssz_1 = require("@chainsafe/ssz");
async function getEth1VotesToConsider(config, state, eth1DataGetter) {
    const periodStart = votingPeriodStartTime(config, state);
    const { SECONDS_PER_ETH1_BLOCK, ETH1_FOLLOW_DISTANCE } = config;
    // Modified version of the spec function to fetch the required range directly from the DB
    return (await eth1DataGetter({
        timestampRange: {
            // Spec v0.12.2
            // is_candidate_block =
            //   block.timestamp + SECONDS_PER_ETH1_BLOCK * ETH1_FOLLOW_DISTANCE <= period_start &&
            //   block.timestamp + SECONDS_PER_ETH1_BLOCK * ETH1_FOLLOW_DISTANCE * 2 >= period_start
            lte: periodStart - SECONDS_PER_ETH1_BLOCK * ETH1_FOLLOW_DISTANCE,
            gte: periodStart - SECONDS_PER_ETH1_BLOCK * ETH1_FOLLOW_DISTANCE * 2,
        },
    })).filter((eth1Data) => eth1Data.depositCount >= state.eth1Data.depositCount);
}
exports.getEth1VotesToConsider = getEth1VotesToConsider;
function pickEth1Vote(state, votesToConsider) {
    var _a, _b, _c;
    const votesToConsiderKeys = new Set();
    for (const eth1Data of votesToConsider) {
        votesToConsiderKeys.add(getEth1DataKey(eth1Data));
    }
    const eth1DataHashToEth1Data = new Map();
    const eth1DataVoteCountByRoot = new Map();
    const eth1DataVotesOrder = [];
    // BeaconStateAllForks is always represented as a tree with a hashing cache.
    // To check equality its cheaper to use hashTreeRoot as keys.
    // However `votesToConsider` is an array of values since those are read from DB.
    // TODO: Optimize cache of known votes, to prevent re-hashing stored values.
    // Note: for low validator counts it's not very important, since this runs once per proposal
    const eth1DataVotes = Array.from((0, ssz_1.readonlyValues)(state.eth1DataVotes));
    for (const eth1DataVote of eth1DataVotes) {
        const rootHex = getEth1DataKey(eth1DataVote);
        if (votesToConsiderKeys.has(rootHex)) {
            const prevVoteCount = eth1DataVoteCountByRoot.get(rootHex);
            eth1DataVoteCountByRoot.set(rootHex, 1 + (prevVoteCount !== null && prevVoteCount !== void 0 ? prevVoteCount : 0));
            // Cache eth1DataVote to root Map only once per root
            if (prevVoteCount === undefined) {
                eth1DataHashToEth1Data.set(rootHex, eth1DataVote);
                eth1DataVotesOrder.push(rootHex);
            }
        }
    }
    const eth1DataRootsMaxVotes = getKeysWithMaxValue(eth1DataVoteCountByRoot);
    // No votes, vote for the last valid vote
    if (eth1DataRootsMaxVotes.length === 0) {
        return (_a = votesToConsider[votesToConsider.length - 1]) !== null && _a !== void 0 ? _a : state.eth1Data;
    }
    // If there's a single winning vote with a majority vote that one
    else if (eth1DataRootsMaxVotes.length === 1) {
        return (_b = eth1DataHashToEth1Data.get(eth1DataRootsMaxVotes[0])) !== null && _b !== void 0 ? _b : state.eth1Data;
    }
    // If there are multiple winning votes, vote for the latest one
    else {
        const latestMostVotedRoot = eth1DataVotesOrder[Math.max(...eth1DataRootsMaxVotes.map((root) => eth1DataVotesOrder.indexOf(root)))];
        eth1DataHashToEth1Data;
        return (_c = eth1DataHashToEth1Data.get(latestMostVotedRoot)) !== null && _c !== void 0 ? _c : state.eth1Data;
    }
}
exports.pickEth1Vote = pickEth1Vote;
/**
 * Returns the array of keys with max value. May return 0, 1 or more keys
 */
function getKeysWithMaxValue(map) {
    const entries = Array.from(map.entries());
    let keysMax = [];
    let valueMax = -Infinity;
    for (const [key, value] of entries) {
        if (value > valueMax) {
            keysMax = [key];
            valueMax = value;
        }
        else if (value === valueMax) {
            keysMax.push(key);
        }
    }
    return keysMax;
}
/**
 * Key-ed by fastSerializeEth1Data(). votesToConsider is read from DB as struct and always has a length of 2048.
 * `state.eth1DataVotes` has a length between 0 and ETH1_FOLLOW_DISTANCE with an equal probability of each value.
 * So to get the average faster time to key both votesToConsider and state.eth1DataVotes it's better to use
 * fastSerializeEth1Data(). However, a long term solution is to cache valid votes in memory and prevent having
 * to recompute their key on every proposal.
 *
 * With `fastSerializeEth1Data()`: avg time 20 ms/op
 * ✓ pickEth1Vote - no votes                                             233.0587 ops/s    4.290764 ms/op        -        121 runs   1.02 s
 * ✓ pickEth1Vote - max votes                                            29.21546 ops/s    34.22845 ms/op        -         25 runs   1.38 s
 *
 * With `toHexString(ssz.phase0.Eth1Data.hashTreeRoot(eth1Data))`: avg time 23 ms/op
 * ✓ pickEth1Vote - no votes                                             46.12341 ops/s    21.68096 ms/op        -        133 runs   3.40 s
 * ✓ pickEth1Vote - max votes                                            37.89912 ops/s    26.38583 ms/op        -         29 runs   1.27 s
 */
function getEth1DataKey(eth1Data) {
    // return toHexString(ssz.phase0.Eth1Data.hashTreeRoot(eth1Data));
    return fastSerializeEth1Data(eth1Data);
}
/**
 * Serialize eth1Data types to a unique string ID. It is only used for comparison.
 */
function fastSerializeEth1Data(eth1Data) {
    return (0, ssz_1.toHexString)(eth1Data.blockHash) + eth1Data.depositCount.toString(16) + (0, ssz_1.toHexString)(eth1Data.depositRoot);
}
exports.fastSerializeEth1Data = fastSerializeEth1Data;
function votingPeriodStartTime(config, state) {
    const eth1VotingPeriodStartSlot = state.slot - (state.slot % (lodestar_params_1.EPOCHS_PER_ETH1_VOTING_PERIOD * lodestar_params_1.SLOTS_PER_EPOCH));
    return (0, lodestar_beacon_state_transition_1.computeTimeAtSlot)(config, eth1VotingPeriodStartSlot, state.genesisTime);
}
exports.votingPeriodStartTime = votingPeriodStartTime;
//# sourceMappingURL=eth1Vote.js.map