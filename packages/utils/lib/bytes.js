"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fromHex = exports.toHex = exports.bytesToBigInt = exports.bigIntToBytes = exports.bytesToInt = exports.intToBytes = exports.toHexString = void 0;
const bigint_buffer_1 = require("bigint-buffer");
const hexByByte = [];
function toHexString(bytes) {
    let hex = "0x";
    for (const byte of bytes) {
        if (!hexByByte[byte]) {
            hexByByte[byte] = byte < 16 ? "0" + byte.toString(16) : byte.toString(16);
        }
        hex += hexByByte[byte];
    }
    return hex;
}
exports.toHexString = toHexString;
/**
 * Return a byte array from a number or BigInt
 */
function intToBytes(value, length, endianness = "le") {
    return bigIntToBytes(BigInt(value), length, endianness);
}
exports.intToBytes = intToBytes;
/**
 * Convert byte array in LE to integer.
 */
function bytesToInt(value, endianness = "le") {
    return Number(bytesToBigInt(value, endianness));
}
exports.bytesToInt = bytesToInt;
function bigIntToBytes(value, length, endianness = "le") {
    if (endianness === "le") {
        return (0, bigint_buffer_1.toBufferLE)(value, length);
    }
    else if (endianness === "be") {
        return (0, bigint_buffer_1.toBufferBE)(value, length);
    }
    throw new Error("endianness must be either 'le' or 'be'");
}
exports.bigIntToBytes = bigIntToBytes;
function bytesToBigInt(value, endianness = "le") {
    if (endianness === "le") {
        return (0, bigint_buffer_1.toBigIntLE)(value);
    }
    else if (endianness === "be") {
        return (0, bigint_buffer_1.toBigIntBE)(value);
    }
    throw new Error("endianness must be either 'le' or 'be'");
}
exports.bytesToBigInt = bytesToBigInt;
function toHex(buffer) {
    if (Buffer.isBuffer(buffer)) {
        return "0x" + buffer.toString("hex");
    }
    else if (buffer instanceof Uint8Array) {
        return "0x" + Buffer.from(buffer.buffer, buffer.byteOffset, buffer.length).toString("hex");
    }
    else {
        return "0x" + Buffer.from(buffer).toString("hex");
    }
}
exports.toHex = toHex;
function fromHex(hex) {
    const b = Buffer.from(hex.replace("0x", ""), "hex");
    return new Uint8Array(b.buffer, b.byteOffset, b.length);
}
exports.fromHex = fromHex;
//# sourceMappingURL=bytes.js.map