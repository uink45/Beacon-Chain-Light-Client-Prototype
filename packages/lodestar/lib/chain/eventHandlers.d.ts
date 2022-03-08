import { AbortSignal } from "@chainsafe/abort-controller";
import { allForks, Epoch, phase0, Slot, Version } from "@chainsafe/lodestar-types";
import { CheckpointWithHex, IProtoBlock } from "@chainsafe/lodestar-fork-choice";
import { CachedBeaconStateAllForks } from "@chainsafe/lodestar-beacon-state-transition";
import { AttestationError, BlockError } from "./errors";
import { BeaconChain } from "./chain";
/**
 * Attach ChainEventEmitter event handlers
 * Listen on `signal` to remove event handlers
 */
export declare function handleChainEvents(this: BeaconChain, signal: AbortSignal): void;
export declare function onClockSlot(this: BeaconChain, slot: Slot): Promise<void>;
export declare function onClockEpoch(this: BeaconChain, currentEpoch: Epoch): void;
export declare function onForkVersion(this: BeaconChain, version: Version): void;
export declare function onCheckpoint(this: BeaconChain, cp: phase0.Checkpoint, state: CachedBeaconStateAllForks): void;
export declare function onJustified(this: BeaconChain, cp: phase0.Checkpoint, state: CachedBeaconStateAllForks): void;
export declare function onFinalized(this: BeaconChain, cp: phase0.Checkpoint): Promise<void>;
export declare function onForkChoiceJustified(this: BeaconChain, cp: CheckpointWithHex): void;
export declare function onForkChoiceFinalized(this: BeaconChain, cp: CheckpointWithHex): Promise<void>;
export declare function onForkChoiceHead(this: BeaconChain, head: IProtoBlock): void;
export declare function onForkChoiceReorg(this: BeaconChain, head: IProtoBlock, oldHead: IProtoBlock, depth: number): void;
export declare function onAttestation(this: BeaconChain, attestation: phase0.Attestation): void;
export declare function onBlock(this: BeaconChain, block: allForks.SignedBeaconBlock, _postState: CachedBeaconStateAllForks): Promise<void>;
export declare function onErrorAttestation(this: BeaconChain, err: AttestationError): Promise<void>;
export declare function onErrorBlock(this: BeaconChain, err: BlockError): Promise<void>;
//# sourceMappingURL=eventHandlers.d.ts.map