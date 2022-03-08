"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.assertEqualParams = exports.NotEqualParamsError = void 0;
const lodestar_config_1 = require("@chainsafe/lodestar-config");
class NotEqualParamsError extends Error {
}
exports.NotEqualParamsError = NotEqualParamsError;
/**
 * Assert localConfig values match externalSpecJson. externalSpecJson may contain more values than localConfig.
 */
function assertEqualParams(localConfig, externalSpecJson) {
    const params1Json = (0, lodestar_config_1.chainConfigToJson)(localConfig);
    const params2Json = externalSpecJson;
    const errors = [];
    // Ensure only that the localConfig values match the remote spec
    for (const key of Object.keys(params1Json)) {
        if (params1Json[key] !== params2Json[key])
            errors.push(`${key} different value: ${params1Json[key]} != ${params2Json[key]}`);
    }
    if (errors.length > 0) {
        throw new NotEqualParamsError("Not equal BeaconParams\n" + errors.join("\n"));
    }
}
exports.assertEqualParams = assertEqualParams;
//# sourceMappingURL=params.js.map