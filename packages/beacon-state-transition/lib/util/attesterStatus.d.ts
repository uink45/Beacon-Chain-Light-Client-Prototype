export declare const FLAG_PREV_SOURCE_ATTESTER: number;
export declare const FLAG_PREV_TARGET_ATTESTER: number;
export declare const FLAG_PREV_HEAD_ATTESTER: number;
export declare const FLAG_CURR_SOURCE_ATTESTER: number;
export declare const FLAG_CURR_TARGET_ATTESTER: number;
export declare const FLAG_CURR_HEAD_ATTESTER: number;
export declare const FLAG_UNSLASHED: number;
export declare const FLAG_ELIGIBLE_ATTESTER: number;
export declare const FLAG_PREV_SOURCE_ATTESTER_OR_UNSLASHED: number;
export declare const FLAG_PREV_TARGET_ATTESTER_OR_UNSLASHED: number;
export declare const FLAG_PREV_HEAD_ATTESTER_OR_UNSLASHED: number;
/**
 * During the epoch transition, additional data is precomputed to avoid traversing any state a second
 * time. Attestations are a big part of this, and each validator has a "status" to represent its
 * precomputed participation.
 */
export interface IAttesterStatus {
    flags: number;
    proposerIndex: number;
    inclusionDelay: number;
    active: boolean;
}
export declare function createIAttesterStatus(): IAttesterStatus;
export declare function hasMarkers(flags: number, markers: number): boolean;
export declare type AttesterFlags = {
    prevSourceAttester: boolean;
    prevTargetAttester: boolean;
    prevHeadAttester: boolean;
    currSourceAttester: boolean;
    currTargetAttester: boolean;
    currHeadAttester: boolean;
    unslashed: boolean;
    eligibleAttester: boolean;
};
export declare function parseAttesterFlags(flags: number): AttesterFlags;
export declare function toAttesterFlags(flagsObj: AttesterFlags): number;
//# sourceMappingURL=attesterStatus.d.ts.map