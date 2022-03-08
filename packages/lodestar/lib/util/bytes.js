"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.byteArrayEquals = exports.byteArrayConcat = void 0;
function byteArrayConcat(bytesArr) {
    const totalBytes = bytesArr.reduce((total, bytes) => total + bytes.length, 0);
    const mergedBytes = new Uint8Array(totalBytes);
    let offset = 0;
    for (const bytes of bytesArr) {
        mergedBytes.set(bytes, offset);
        offset += bytes.length;
    }
    return mergedBytes;
}
exports.byteArrayConcat = byteArrayConcat;
function byteArrayEquals(a, b) {
    if (a.length !== b.length) {
        return false;
    }
    for (let i = 0; i < a.length; i++) {
        if (a[i] !== b[i])
            return false;
    }
    return true;
}
exports.byteArrayEquals = byteArrayEquals;
//# sourceMappingURL=bytes.js.map