"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initPeerId = exports.readPeerId = exports.writePeerId = exports.createPeerId = void 0;
const peer_id_1 = __importDefault(require("peer-id"));
const util_1 = require("../util");
async function createPeerId() {
    return await peer_id_1.default.create({ keyType: "secp256k1" });
}
exports.createPeerId = createPeerId;
function writePeerId(filepath, peerId) {
    (0, util_1.writeFile)(filepath, peerId.toJSON());
}
exports.writePeerId = writePeerId;
async function readPeerId(filepath) {
    return await peer_id_1.default.createFromJSON((0, util_1.readFile)(filepath));
}
exports.readPeerId = readPeerId;
async function initPeerId(filepath) {
    writePeerId(filepath, await createPeerId());
}
exports.initPeerId = initPeerId;
//# sourceMappingURL=peerId.js.map