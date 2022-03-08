import { RootHex } from "@chainsafe/lodestar-types";
import { ByteVector } from "@chainsafe/ssz";
/** QUANTITY as defined in ethereum execution layer JSON RPC https://eth.wiki/json-rpc/API */
export declare type QUANTITY = string;
/** DATA as defined in ethereum execution layer JSON RPC https://eth.wiki/json-rpc/API */
export declare type DATA = string;
export declare const rootHexRegex: RegExp;
export declare function numberToHex(n: number | bigint): string;
export declare function isJsonRpcTruncatedError(error: Error): boolean;
export declare function bytesToHex(bytes: Uint8Array | ByteVector): string;
/**
 * QUANTITY as defined in ethereum execution layer JSON RPC https://eth.wiki/json-rpc/API
 *
 * When encoding QUANTITIES (integers, numbers): encode as hex, prefix with “0x”, the most compact representation (slight exception: zero should be represented as “0x0”). Examples:
 * - 0x41 (65 in decimal)
 * - 0x400 (1024 in decimal)
 * - WRONG: 0x (should always have at least one digit - zero is “0x0”)
 * - WRONG: 0x0400 (no leading zeroes allowed)
 * - WRONG: ff (must be prefixed 0x)
 */
export declare function numToQuantity(num: number | bigint): QUANTITY;
/**
 * QUANTITY as defined in ethereum execution layer JSON RPC https://eth.wiki/json-rpc/API
 */
export declare function quantityToNum(hex: QUANTITY, id?: string): number;
/**
 * QUANTITY as defined in ethereum execution layer JSON RPC https://eth.wiki/json-rpc/API.
 * Typesafe fn to convert hex string to bigint. The BigInt constructor param is any
 */
export declare function quantityToBigint(hex: QUANTITY, id?: string): bigint;
/**
 * QUANTITY as defined in ethereum execution layer JSON RPC https://eth.wiki/json-rpc/API.
 */
export declare function quantityToBytes(hex: QUANTITY): Uint8Array;
/**
 * QUANTITY as defined in ethereum execution layer JSON RPC https://eth.wiki/json-rpc/API.
 * Compress a 32 ByteVector into a QUANTITY
 */
export declare function bytesToQuantity(bytes: Uint8Array | ByteVector): QUANTITY;
/**
 * DATA as defined in ethereum execution layer JSON RPC https://eth.wiki/json-rpc/API
 *
 * When encoding UNFORMATTED DATA (byte arrays, account addresses, hashes, bytecode arrays): encode as hex, prefix with
 * “0x”, two hex digits per byte. Examples:
 *
 * - 0x41 (size 1, “A”)
 * - 0x004200 (size 3, “\0B\0”)
 * - 0x (size 0, “”)
 * - WRONG: 0xf0f0f (must be even number of digits)
 * - WRONG: 004200 (must be prefixed 0x)
 */
export declare function bytesToData(bytes: Uint8Array | ByteVector): DATA;
/**
 * DATA as defined in ethereum execution layer JSON RPC https://eth.wiki/json-rpc/API
 */
export declare function dataToBytes(hex: DATA, fixedLength?: number): Uint8Array;
/**
 * DATA as defined in ethereum execution layer JSON RPC https://eth.wiki/json-rpc/API
 */
export declare function dataToRootHex(hex: DATA, id?: string): RootHex;
//# sourceMappingURL=utils.d.ts.map