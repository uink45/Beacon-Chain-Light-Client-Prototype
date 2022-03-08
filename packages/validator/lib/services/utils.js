"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.groupSyncDutiesBySubcommitteeIndex = exports.groupAttDutiesByCommitteeIndex = exports.getAggregationBits = void 0;
function getAggregationBits(committeeLength, validatorIndexInCommittee) {
    return Array.from({ length: committeeLength }, (_, i) => i === validatorIndexInCommittee);
}
exports.getAggregationBits = getAggregationBits;
function groupAttDutiesByCommitteeIndex(duties) {
    const dutiesByCommitteeIndex = new Map();
    for (const dutyAndProof of duties) {
        const { committeeIndex } = dutyAndProof.duty;
        let dutyAndProofArr = dutiesByCommitteeIndex.get(committeeIndex);
        if (!dutyAndProofArr) {
            dutyAndProofArr = [];
            dutiesByCommitteeIndex.set(committeeIndex, dutyAndProofArr);
        }
        dutyAndProofArr.push(dutyAndProof);
    }
    return dutiesByCommitteeIndex;
}
exports.groupAttDutiesByCommitteeIndex = groupAttDutiesByCommitteeIndex;
function groupSyncDutiesBySubcommitteeIndex(duties) {
    const dutiesBySubcommitteeIndex = new Map();
    for (const validatorDuty of duties) {
        for (const { selectionProof, subcommitteeIndex } of validatorDuty.selectionProofs) {
            let dutyAndProofArr = dutiesBySubcommitteeIndex.get(subcommitteeIndex);
            if (!dutyAndProofArr) {
                dutyAndProofArr = [];
                dutiesBySubcommitteeIndex.set(subcommitteeIndex, dutyAndProofArr);
            }
            dutyAndProofArr.push({ duty: validatorDuty.duty, selectionProof: selectionProof });
        }
    }
    return dutiesBySubcommitteeIndex;
}
exports.groupSyncDutiesBySubcommitteeIndex = groupSyncDutiesBySubcommitteeIndex;
//# sourceMappingURL=utils.js.map