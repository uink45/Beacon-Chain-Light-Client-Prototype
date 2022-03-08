"use strict";
/**
 * @module validator
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.externalSignerUpCheck = exports.externalSignerPostSignature = exports.externalSignerGetKeys = exports.SignerType = exports.waitForGenesis = exports.Validator = void 0;
var validator_1 = require("./validator");
Object.defineProperty(exports, "Validator", { enumerable: true, get: function () { return validator_1.Validator; } });
var genesis_1 = require("./genesis");
Object.defineProperty(exports, "waitForGenesis", { enumerable: true, get: function () { return genesis_1.waitForGenesis; } });
var validatorStore_1 = require("./services/validatorStore");
Object.defineProperty(exports, "SignerType", { enumerable: true, get: function () { return validatorStore_1.SignerType; } });
// Remote signer client
var externalSignerClient_1 = require("./util/externalSignerClient");
Object.defineProperty(exports, "externalSignerGetKeys", { enumerable: true, get: function () { return externalSignerClient_1.externalSignerGetKeys; } });
Object.defineProperty(exports, "externalSignerPostSignature", { enumerable: true, get: function () { return externalSignerClient_1.externalSignerPostSignature; } });
Object.defineProperty(exports, "externalSignerUpCheck", { enumerable: true, get: function () { return externalSignerClient_1.externalSignerUpCheck; } });
__exportStar(require("./slashingProtection"), exports);
__exportStar(require("./repositories"), exports);
//# sourceMappingURL=index.js.map