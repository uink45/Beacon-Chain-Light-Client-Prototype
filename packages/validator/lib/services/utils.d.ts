import { routes } from "@chainsafe/lodestar-api";
import { CommitteeIndex, SubcommitteeIndex } from "@chainsafe/lodestar-types";
import { AttDutyAndProof } from "./attestationDuties";
import { SyncDutyAndProofs, SyncSelectionProof } from "./syncCommitteeDuties";
/** Sync committee duty associated to a single sub committee subnet */
export declare type SubcommitteeDuty = {
    duty: routes.validator.SyncDuty;
    selectionProof: SyncSelectionProof["selectionProof"];
};
export declare function getAggregationBits(committeeLength: number, validatorIndexInCommittee: number): boolean[];
export declare function groupAttDutiesByCommitteeIndex(duties: AttDutyAndProof[]): Map<CommitteeIndex, AttDutyAndProof[]>;
export declare function groupSyncDutiesBySubcommitteeIndex(duties: SyncDutyAndProofs[]): Map<SubcommitteeIndex, SubcommitteeDuty[]>;
//# sourceMappingURL=utils.d.ts.map