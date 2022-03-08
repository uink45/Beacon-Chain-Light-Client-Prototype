"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.equalCheckpointWithHex = exports.toCheckpointWithHex = exports.ForkChoiceStore = void 0;
const ssz_1 = require("@chainsafe/ssz");
/* eslint-disable @typescript-eslint/naming-convention */
/**
 * IForkChoiceStore implementer which emits forkChoice events on updated justified and finalized checkpoints.
 */
class ForkChoiceStore {
    constructor(currentSlot, justifiedCheckpoint, finalizedCheckpoint, events) {
        this.currentSlot = currentSlot;
        this.events = events;
        this._justifiedCheckpoint = toCheckpointWithHex(justifiedCheckpoint);
        this._finalizedCheckpoint = toCheckpointWithHex(finalizedCheckpoint);
        this.bestJustifiedCheckpoint = this._justifiedCheckpoint;
    }
    get justifiedCheckpoint() {
        return this._justifiedCheckpoint;
    }
    set justifiedCheckpoint(checkpoint) {
        var _a;
        const cp = toCheckpointWithHex(checkpoint);
        this._justifiedCheckpoint = cp;
        (_a = this.events) === null || _a === void 0 ? void 0 : _a.onJustified(cp);
    }
    get finalizedCheckpoint() {
        return this._finalizedCheckpoint;
    }
    set finalizedCheckpoint(checkpoint) {
        var _a;
        const cp = toCheckpointWithHex(checkpoint);
        this._finalizedCheckpoint = cp;
        (_a = this.events) === null || _a === void 0 ? void 0 : _a.onFinalized(cp);
    }
}
exports.ForkChoiceStore = ForkChoiceStore;
function toCheckpointWithHex(checkpoint) {
    // `valueOf` coerses the checkpoint, which may be tree-backed, into a javascript object
    // See https://github.com/ChainSafe/lodestar/issues/2258
    const root = checkpoint.root.valueOf();
    return {
        epoch: checkpoint.epoch,
        root,
        rootHex: (0, ssz_1.toHexString)(root),
    };
}
exports.toCheckpointWithHex = toCheckpointWithHex;
function equalCheckpointWithHex(a, b) {
    return a.epoch === b.epoch && a.rootHex === b.rootHex;
}
exports.equalCheckpointWithHex = equalCheckpointWithHex;
//# sourceMappingURL=store.js.map