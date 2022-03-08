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
__exportStar(require("./block"), exports);
__exportStar(require("./epoch"), exports);
__exportStar(require("./upgradeState"), exports);
__exportStar(require("./utils"), exports);
// re-export bellatrix lodestar types for ergonomic usage downstream
// eg:
//
// import {bellatrix} from "@chainsafe/lodestar-beacon-state-transition";
//
// bellatrix.processExecutionPayload(...)
//
// const x: bellatrix.BeaconState;
__exportStar(require("@chainsafe/lodestar-types/bellatrix"), exports);
//# sourceMappingURL=index.js.map