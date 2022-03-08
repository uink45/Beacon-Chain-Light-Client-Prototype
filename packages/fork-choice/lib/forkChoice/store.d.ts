import { phase0, Slot, RootHex } from "@chainsafe/lodestar-types";
/**
 * Stores checkpoints in a hybrid format:
 * - Original checkpoint for fast consumption in Lodestar's side
 * - Root in string hex for fast comparisions inside the fork-choice
 */
export declare type CheckpointWithHex = phase0.Checkpoint & {
    rootHex: RootHex;
};
/**
 * Approximates the `Store` in "Ethereum 2.0 Phase 0 -- Beacon Chain Fork Choice":
 *
 * https://github.com/ethereum/eth2.0-specs/blob/v0.12.2/specs/phase0/fork-choice.md#store
 *
 * ## Detail
 *
 * This is only an approximation for two reasons:
 *
 * - The actual block DAG in `ProtoArray`.
 * - `time` is represented using `Slot` instead of UNIX epoch `u64`.
 */
export interface IForkChoiceStore {
    currentSlot: Slot;
    justifiedCheckpoint: CheckpointWithHex;
    finalizedCheckpoint: CheckpointWithHex;
    bestJustifiedCheckpoint: CheckpointWithHex;
}
/**
 * IForkChoiceStore implementer which emits forkChoice events on updated justified and finalized checkpoints.
 */
export declare class ForkChoiceStore implements IForkChoiceStore {
    currentSlot: Slot;
    private readonly events?;
    bestJustifiedCheckpoint: CheckpointWithHex;
    private _justifiedCheckpoint;
    private _finalizedCheckpoint;
    constructor(currentSlot: Slot, justifiedCheckpoint: phase0.Checkpoint, finalizedCheckpoint: phase0.Checkpoint, events?: {
        onJustified: (cp: CheckpointWithHex) => void;
        onFinalized: (cp: CheckpointWithHex) => void;
    } | undefined);
    get justifiedCheckpoint(): CheckpointWithHex;
    set justifiedCheckpoint(checkpoint: CheckpointWithHex);
    get finalizedCheckpoint(): CheckpointWithHex;
    set finalizedCheckpoint(checkpoint: CheckpointWithHex);
}
export declare function toCheckpointWithHex(checkpoint: phase0.Checkpoint): CheckpointWithHex;
export declare function equalCheckpointWithHex(a: CheckpointWithHex, b: CheckpointWithHex): boolean;
//# sourceMappingURL=store.d.ts.map