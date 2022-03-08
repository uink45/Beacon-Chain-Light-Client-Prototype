import { CachedBeaconStatePhase0, EpochProcess } from "../../types";
import { processRewardsAndPenalties } from "./processRewardsAndPenalties";
import { processSlashings } from "./processSlashings";
import { getAttestationDeltas } from "./getAttestationDeltas";
export { processRewardsAndPenalties, processSlashings, getAttestationDeltas };
export declare function processEpoch(state: CachedBeaconStatePhase0, epochProcess: EpochProcess): void;
//# sourceMappingURL=index.d.ts.map