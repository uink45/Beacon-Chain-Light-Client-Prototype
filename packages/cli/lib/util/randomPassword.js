"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.randomPassword = void 0;
const node_crypto_1 = __importDefault(require("node:crypto"));
const DEFAULT_PASSWORD_LEN = 48;
/**
 * Generates a hex encoded random password
 */
function randomPassword() {
    return node_crypto_1.default.randomBytes(DEFAULT_PASSWORD_LEN).toString("hex");
}
exports.randomPassword = randomPassword;
//# sourceMappingURL=randomPassword.js.map