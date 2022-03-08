/// <reference types="node" />
declare type Endianness = "le" | "be";
export declare function toHexString(bytes: Uint8Array): string;
/**
 * Return a byte array from a number or BigInt
 */
export declare function intToBytes(value: bigint | number, length: number, endianness?: Endianness): Buffer;
/**
 * Convert byte array in LE to integer.
 */
export declare function bytesToInt(value: Uint8Array, endianness?: Endianness): number;
export declare function bigIntToBytes(value: bigint, length: number, endianness?: Endianness): Buffer;
export declare function bytesToBigInt(value: Uint8Array, endianness?: Endianness): bigint;
export declare function toHex(buffer: Parameters<typeof Buffer.from>[0]): string;
export declare function fromHex(hex: string): Uint8Array;
export {};
//# sourceMappingURL=bytes.d.ts.map