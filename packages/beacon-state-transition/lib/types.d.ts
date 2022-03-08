import { allForks, altair, bellatrix, phase0 } from "@chainsafe/lodestar-types";
import { CachedBeaconState } from "./cache/cachedBeaconState";
export { EpochContext } from "./cache/epochContext";
export { EpochProcess } from "./cache/epochProcess";
export declare type CachedBeaconStatePhase0 = CachedBeaconState<phase0.BeaconState>;
export declare type CachedBeaconStateAltair = CachedBeaconState<altair.BeaconState>;
export declare type CachedBeaconStateBellatrix = CachedBeaconState<bellatrix.BeaconState>;
export declare type CachedBeaconStateAllForks = CachedBeaconState<allForks.BeaconState>;
export declare type CachedBeaconStateAnyFork = CachedBeaconStatePhase0 | CachedBeaconStateAltair | CachedBeaconStateBellatrix | CachedBeaconStateAllForks;
//# sourceMappingURL=types.d.ts.map