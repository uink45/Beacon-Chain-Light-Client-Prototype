"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeExecutionEngine = exports.defaultExecutionEngineOpts = exports.ExecutionEngineMock = exports.ExecutionEngineDisabled = exports.ExecutionEngineHttp = void 0;
const disabled_1 = require("./disabled");
Object.defineProperty(exports, "ExecutionEngineDisabled", { enumerable: true, get: function () { return disabled_1.ExecutionEngineDisabled; } });
const http_1 = require("./http");
Object.defineProperty(exports, "ExecutionEngineHttp", { enumerable: true, get: function () { return http_1.ExecutionEngineHttp; } });
const mock_1 = require("./mock");
Object.defineProperty(exports, "ExecutionEngineMock", { enumerable: true, get: function () { return mock_1.ExecutionEngineMock; } });
exports.defaultExecutionEngineOpts = http_1.defaultExecutionEngineHttpOpts;
function initializeExecutionEngine(opts, signal) {
    switch (opts.mode) {
        case "mock":
            return new mock_1.ExecutionEngineMock(opts);
        case "disabled":
            return new disabled_1.ExecutionEngineDisabled();
        case "http":
        default:
            return new http_1.ExecutionEngineHttp(opts, signal);
    }
}
exports.initializeExecutionEngine = initializeExecutionEngine;
//# sourceMappingURL=index.js.map