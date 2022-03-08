"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hexToBuffer = exports.bufferToHex = void 0;
function bufferToHex(buffer) {
    return "0x" + buffer.toString("hex");
}
exports.bufferToHex = bufferToHex;
function hexToBuffer(v) {
    return Buffer.from(v.replace("0x", ""));
}
exports.hexToBuffer = hexToBuffer;
//# sourceMappingURL=hex.js.map