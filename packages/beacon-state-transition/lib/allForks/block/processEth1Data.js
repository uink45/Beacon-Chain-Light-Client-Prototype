"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.becomesNewEth1Data = exports.processEth1Data = void 0;
const lodestar_params_1 = require("@chainsafe/lodestar-params");
const lodestar_types_1 = require("@chainsafe/lodestar-types");
const ssz_1 = require("@chainsafe/ssz");
/**
 * Store vote counts for every eth1 block that has votes; if any eth1 block wins majority support within a 1024-slot
 * voting period, formally accept that eth1 block and set it as the official "latest known eth1 block" in the eth2 state.
 *
 * PERF: Processing cost depends on the current amount of votes.
 * - Best case: Vote is already decided, zero work. See becomesNewEth1Data conditions
 * - Worst case: 1023 votes and no majority vote yet.
 */
function processEth1Data(state, body) {
    // Convert to view first to hash once and compare hashes
    const eth1DataView = lodestar_types_1.ssz.phase0.Eth1Data.createTreeBackedFromStruct(body.eth1Data);
    if (becomesNewEth1Data(state, eth1DataView)) {
        state.eth1Data = eth1DataView;
    }
    state.eth1DataVotes.push(body.eth1Data);
}
exports.processEth1Data = processEth1Data;
/**
 * Returns `newEth1Data` if adding the given `eth1Data` to `state.eth1DataVotes` would
 * result in a change to `state.eth1Data`.
 */
function becomesNewEth1Data(state, newEth1Data) {
    const SLOTS_PER_ETH1_VOTING_PERIOD = lodestar_params_1.EPOCHS_PER_ETH1_VOTING_PERIOD * lodestar_params_1.SLOTS_PER_EPOCH;
    // If there are not more than 50% votes, then we do not have to count to find a winner.
    if ((state.eth1DataVotes.length + 1) * 2 <= SLOTS_PER_ETH1_VOTING_PERIOD) {
        return false;
    }
    // Nothing to do if the state already has this as eth1data (happens a lot after majority vote is in)
    if (lodestar_types_1.ssz.phase0.Eth1Data.equals(state.eth1Data, newEth1Data)) {
        return false;
    }
    // Close to half the EPOCHS_PER_ETH1_VOTING_PERIOD it can be expensive to do so many comparisions.
    // `eth1DataVotes.getAllReadonly()` navigates the tree once to fetch all the LeafNodes efficiently.
    // Then isEqualEth1DataView compares cached roots (HashObject as of Jan 2022) which is much cheaper
    // than doing structural equality, which requires tree -> value conversions
    let sameVotesCount = 0;
    const eth1DataVotes = Array.from((0, ssz_1.readonlyValues)(state.eth1DataVotes));
    for (let i = 0; i < eth1DataVotes.length; i++) {
        if (isEqualEth1DataView(eth1DataVotes[i], newEth1Data)) {
            sameVotesCount++;
        }
    }
    // The +1 is to account for the `eth1Data` supplied to the function.
    if ((sameVotesCount + 1) * 2 > SLOTS_PER_ETH1_VOTING_PERIOD) {
        return true;
    }
    else {
        return false;
    }
}
exports.becomesNewEth1Data = becomesNewEth1Data;
function isEqualEth1DataView(eth1DataA, eth1DataB) {
    return isEqualNode(eth1DataA.tree.rootNode, eth1DataB.tree.rootNode);
}
// TODO: Upstream to persistent-merkle-tree
function isEqualNode(nA, nB) {
    const hA = nA.rootHashObject;
    const hB = nB.rootHashObject;
    return (hA.h0 === hB.h0 &&
        hA.h1 === hB.h1 &&
        hA.h2 === hB.h2 &&
        hA.h3 === hB.h3 &&
        hA.h4 === hB.h4 &&
        hA.h5 === hB.h5 &&
        hA.h6 === hB.h6 &&
        hA.h7 === hB.h7);
}
//# sourceMappingURL=processEth1Data.js.map