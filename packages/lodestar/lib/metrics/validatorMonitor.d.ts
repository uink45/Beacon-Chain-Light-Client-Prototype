import { altair, IAttesterStatus } from "@chainsafe/lodestar-beacon-state-transition";
import { allForks } from "@chainsafe/lodestar-beacon-state-transition";
import { IChainForkConfig } from "@chainsafe/lodestar-config";
import { Epoch, Slot } from "@chainsafe/lodestar-types";
import { IndexedAttestation, SignedAggregateAndProof } from "@chainsafe/lodestar-types/phase0";
import { ILodestarMetrics } from "./metrics/lodestar";
declare type Seconds = number;
export declare enum OpSource {
    api = "api",
    gossip = "gossip"
}
export interface IValidatorMonitor {
    registerLocalValidator(index: number): void;
    registerValidatorStatuses(currentEpoch: Epoch, statuses: IAttesterStatus[], balances?: number[]): void;
    registerBeaconBlock(src: OpSource, seenTimestampSec: Seconds, block: allForks.BeaconBlock): void;
    registerUnaggregatedAttestation(src: OpSource, seenTimestampSec: Seconds, indexedAttestation: IndexedAttestation): void;
    registerAggregatedAttestation(src: OpSource, seenTimestampSec: Seconds, signedAggregateAndProof: SignedAggregateAndProof, indexedAttestation: IndexedAttestation): void;
    registerAttestationInBlock(indexedAttestation: IndexedAttestation, parentSlot: Slot, rootCache: altair.RootCache): void;
    scrapeMetrics(slotClock: Slot): void;
}
export declare function createValidatorMonitor(metrics: ILodestarMetrics, config: IChainForkConfig, genesisTime: number): IValidatorMonitor;
export {};
//# sourceMappingURL=validatorMonitor.d.ts.map