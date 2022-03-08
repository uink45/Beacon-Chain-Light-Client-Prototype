"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HttpError = exports.HttpClient = exports.getClient = exports.routes = void 0;
exports.routes = __importStar(require("./routes"));
__exportStar(require("./interface"), exports);
var client_1 = require("./client");
Object.defineProperty(exports, "getClient", { enumerable: true, get: function () { return client_1.getClient; } });
Object.defineProperty(exports, "HttpClient", { enumerable: true, get: function () { return client_1.HttpClient; } });
Object.defineProperty(exports, "HttpError", { enumerable: true, get: function () { return client_1.HttpError; } });
// Node: Don't export server here so it's not bundled to all consumers
//# sourceMappingURL=index.js.map