export declare const zeroAttnets: boolean[];
export declare const zeroSyncnets: boolean[];
/**
 * Fast deserialize a BitVector, with pre-cached bool array in `getUint8ByteToBitBooleanArray()`
 *
 * Never throw a deserialization error:
 * - if bytes is too short, it will pad with zeroes
 * - if bytes is too long, it will ignore the extra values
 */
export declare function deserializeEnrSubnets(bytes: Uint8Array, subnetCount: number): boolean[];
//# sourceMappingURL=enrSubnetsDeserialize.d.ts.map