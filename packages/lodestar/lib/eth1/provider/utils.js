"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dataToRootHex = exports.dataToBytes = exports.bytesToData = exports.bytesToQuantity = exports.quantityToBytes = exports.quantityToBigint = exports.quantityToNum = exports.numToQuantity = exports.bytesToHex = exports.isJsonRpcTruncatedError = exports.numberToHex = exports.rootHexRegex = void 0;
const lodestar_utils_1 = require("@chainsafe/lodestar-utils");
const ssz_1 = require("@chainsafe/ssz");
const jsonRpcHttpClient_1 = require("./jsonRpcHttpClient");
exports.rootHexRegex = /^0x[a-fA-F0-9]{64}$/;
function numberToHex(n) {
    return "0x" + n.toString(16);
}
exports.numberToHex = numberToHex;
function isJsonRpcTruncatedError(error) {
    return (
    // Truncated responses usually get as 200 but since it's truncated the JSON will be invalid
    error instanceof jsonRpcHttpClient_1.ErrorParseJson ||
        // Otherwise guess Infura error message of too many events
        (error instanceof Error && error.message.includes("query returned more than 10000 results")));
}
exports.isJsonRpcTruncatedError = isJsonRpcTruncatedError;
function bytesToHex(bytes) {
    // Handle special case in Ethereum hex formating where hex values may include a single letter
    // 0x0, 0x1 are valid values
    if (bytes.length === 1 && bytes[0] <= 0xf) {
        return "0x" + bytes[0].toString(16);
    }
    return (0, ssz_1.toHexString)(bytes);
}
exports.bytesToHex = bytesToHex;
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
function numToQuantity(num) {
    return "0x" + num.toString(16);
}
exports.numToQuantity = numToQuantity;
/**
 * QUANTITY as defined in ethereum execution layer JSON RPC https://eth.wiki/json-rpc/API
 */
function quantityToNum(hex, id = "") {
    const num = parseInt(hex, 16);
    if (isNaN(num) || num < 0)
        throw Error(`Invalid hex decimal ${id} '${hex}'`);
    return num;
}
exports.quantityToNum = quantityToNum;
/**
 * QUANTITY as defined in ethereum execution layer JSON RPC https://eth.wiki/json-rpc/API.
 * Typesafe fn to convert hex string to bigint. The BigInt constructor param is any
 */
function quantityToBigint(hex, id = "") {
    try {
        return BigInt(hex);
    }
    catch (e) {
        throw Error(`Invalid hex bigint ${id} '${hex}': ${e.message}`);
    }
}
exports.quantityToBigint = quantityToBigint;
/**
 * QUANTITY as defined in ethereum execution layer JSON RPC https://eth.wiki/json-rpc/API.
 */
function quantityToBytes(hex) {
    const bn = quantityToBigint(hex);
    return (0, lodestar_utils_1.bigIntToBytes)(bn, 32, "le");
}
exports.quantityToBytes = quantityToBytes;
/**
 * QUANTITY as defined in ethereum execution layer JSON RPC https://eth.wiki/json-rpc/API.
 * Compress a 32 ByteVector into a QUANTITY
 */
function bytesToQuantity(bytes) {
    const bn = (0, lodestar_utils_1.bytesToBigInt)(bytes, "le");
    return numToQuantity(bn);
}
exports.bytesToQuantity = bytesToQuantity;
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
function bytesToData(bytes) {
    return (0, ssz_1.toHexString)(bytes);
}
exports.bytesToData = bytesToData;
/**
 * DATA as defined in ethereum execution layer JSON RPC https://eth.wiki/json-rpc/API
 */
function dataToBytes(hex, fixedLength) {
    try {
        const bytes = (0, ssz_1.fromHexString)(hex);
        if (fixedLength !== undefined && bytes.length !== fixedLength) {
            throw Error(`Wrong data length ${bytes.length} expected ${fixedLength}`);
        }
        return bytes;
    }
    catch (e) {
        e.message = `Invalid hex string: ${e.message}`;
        throw e;
    }
}
exports.dataToBytes = dataToBytes;
/**
 * DATA as defined in ethereum execution layer JSON RPC https://eth.wiki/json-rpc/API
 */
function dataToRootHex(hex, id = "") {
    if (!exports.rootHexRegex.test(hex))
        throw Error(`Invalid hex root ${id} '${hex}'`);
    return hex;
}
exports.dataToRootHex = dataToRootHex;
//# sourceMappingURL=utils.js.map