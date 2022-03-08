import { CachedBeaconStateAltair, EpochProcess } from "../../types";
import { processRewardsAndPenalties } from "./processRewardsAndPenalties";
import { processSlashings } from "./processSlashings";
import { processParticipationFlagUpdates } from "./processParticipationFlagUpdates";
import { processInactivityUpdates } from "./processInactivityUpdates";
import { processSyncCommitteeUpdates } from "./processSyncCommitteeUpdates";
export { getRewardsAndPenalties } from "./getRewardsAndPenalties";
export { processInactivityUpdates, processRewardsAndPenalties, processSlashings, processSyncCommitteeUpdates, processParticipationFlagUpdates, };
export declare function processEpoch(state: CachedBeaconStateAltair, epochProcess: EpochProcess): void;
//# sourceMappingURL=index.d.ts.map