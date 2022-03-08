"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExecutionStatus = exports.HEX_ZERO_HASH = void 0;
// RootHex is a root as a hex string
// Used for lightweight and easy comparison
exports.HEX_ZERO_HASH = "0x0000000000000000000000000000000000000000000000000000000000000000";
var ExecutionStatus;
(function (ExecutionStatus) {
    ExecutionStatus["Valid"] = "Valid";
    ExecutionStatus["Syncing"] = "Syncing";
    ExecutionStatus["PreMerge"] = "PreMerge";
})(ExecutionStatus = exports.ExecutionStatus || (exports.ExecutionStatus = {}));
//# sourceMappingURL=interface.js.map