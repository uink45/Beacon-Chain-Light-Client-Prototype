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
Object.defineProperty(exports, "__esModule", { value: true });
exports.validator = exports.node = exports.lodestar = exports.lightclient = exports.events = exports.debug = exports.config = exports.beacon = void 0;
exports.beacon = __importStar(require("./beacon"));
exports.config = __importStar(require("./config"));
exports.debug = __importStar(require("./debug"));
exports.events = __importStar(require("./events"));
exports.lightclient = __importStar(require("./lightclient"));
exports.lodestar = __importStar(require("./lodestar"));
exports.node = __importStar(require("./node"));
exports.validator = __importStar(require("./validator"));
// Reasoning of the API definitions
// ================================
//
// An HTTP request to the Lodestar BeaconNode API involves these steps regarding serialization:
// 1. Serialize request: api args => req params
//    --- wire
// 2. Deserialize request: req params => api args
//    --- exec api
// 3. Serialize api return => res body
//    --- wire
// 4. Deserialize res body => api return
//
// In our case we define the client in the exact same interface as the API executor layer.
// Therefore we only need to define how to translate args <-> request, and return <-> response.
//
// All files in the /routes directory provide succint definitions to do those transformations plus:
// - URL + method, for each route ID
// - Runtime schema, for each route ID
//
// Almost all routes receive JSON and return JSON. So both the client and the server can be
// auto-generated from the definitions. Also, the design allows for customizability for the few
// routes that need non-JSON serialization (like debug.getState and lightclient.getProof)
//
// With this approach Typescript help us ensure that the client and server are compatible at build
// time, ensure there are tests for all routes and makes it very cheap to mantain and add new routes.
//
//
// How to add new routes
// =====================
//
// 1. Add the route function signature to the `Api` type. The function name MUST match the routeId from the spec.
//    The arguments should use spec types if approapriate. Non-spec types MUST be defined in before the Api type
//    so they are scoped by routes namespace. The all arguments MUST use camelCase casing.
// 2. Add URL + METHOD in `routesData` matching the spec.
// 3. Declare request serializers in `getReqSerializers()`. You MAY use `RouteReqTypeGenerator` to declare the
//    ReqTypes and request serializers in the same place.
// 4. Add the return type of the route to `getReturnTypes()` if it has any. The return type doesn't have to be
//    a full SSZ type, but just a TypeJson with allows to convert from struct -> json -> struct.
//# sourceMappingURL=index.js.map