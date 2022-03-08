"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExecutionEngineDisabled = void 0;
class ExecutionEngineDisabled {
    async notifyNewPayload() {
        throw Error("Execution engine disabled");
    }
    async notifyForkchoiceUpdate() {
        throw Error("Execution engine disabled");
    }
    async getPayload() {
        throw Error("Execution engine disabled");
    }
}
exports.ExecutionEngineDisabled = ExecutionEngineDisabled;
//# sourceMappingURL=disabled.js.map