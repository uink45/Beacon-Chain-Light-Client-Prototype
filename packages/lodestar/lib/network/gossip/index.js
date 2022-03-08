"use strict";
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
exports.getGossipHandlers = exports.Eth2Gossipsub = void 0;
var gossipsub_1 = require("./gossipsub");
Object.defineProperty(exports, "Eth2Gossipsub", { enumerable: true, get: function () { return gossipsub_1.Eth2Gossipsub; } });
var handlers_1 = require("./handlers");
Object.defineProperty(exports, "getGossipHandlers", { enumerable: true, get: function () { return handlers_1.getGossipHandlers; } });
__exportStar(require("./interface"), exports);
//# sourceMappingURL=index.js.map