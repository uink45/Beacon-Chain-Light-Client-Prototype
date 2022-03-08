/**
 * Alias to allow easier refactoring.
 * TODO: Estimate the risk of future proof of MAX_EFFECTIVE_BALANCE_INCREMENT < 255
 */
export declare type EffectiveBalanceIncrements = Uint8Array;
/** Helper to prevent re-writting tests downstream if we change Uint8Array to number[] */
export declare function getEffectiveBalanceIncrementsZeroed(len: number): EffectiveBalanceIncrements;
/**
 * effectiveBalanceIncrements length will always be equal or greater than validatorCount. The
 * getEffectiveBalanceIncrementsByteLen() modulo is used to reduce the frequency at which its Uint8Array is recreated.
 * if effectiveBalanceIncrements has length greater than validatorCount it's not a problem since those values would
 * never be accessed.
 */
export declare function getEffectiveBalanceIncrementsWithLen(validatorCount: number): EffectiveBalanceIncrements;
//# sourceMappingURL=effectiveBalanceIncrements.d.ts.map