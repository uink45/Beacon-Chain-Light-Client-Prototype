"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deserializeEnrSubnets = exports.zeroSyncnets = exports.zeroAttnets = void 0;
const lodestar_beacon_state_transition_1 = require("@chainsafe/lodestar-beacon-state-transition");
const lodestar_params_1 = require("@chainsafe/lodestar-params");
exports.zeroAttnets = (0, lodestar_beacon_state_transition_1.newFilledArray)(lodestar_params_1.ATTESTATION_SUBNET_COUNT, false);
exports.zeroSyncnets = (0, lodestar_beacon_state_transition_1.newFilledArray)(lodestar_params_1.SYNC_COMMITTEE_SUBNET_COUNT, false);
/**
 * Fast deserialize a BitVector, with pre-cached bool array in `getUint8ByteToBitBooleanArray()`
 *
 * Never throw a deserialization error:
 * - if bytes is too short, it will pad with zeroes
 * - if bytes is too long, it will ignore the extra values
 */
function deserializeEnrSubnets(bytes, subnetCount) {
    var _a, _b;
    if (subnetCount <= 8) {
        return (0, lodestar_beacon_state_transition_1.getUint8ByteToBitBooleanArray)((_a = bytes[0]) !== null && _a !== void 0 ? _a : 0);
    }
    const boolsArr = [];
    const byteCount = Math.ceil(subnetCount / 8);
    for (let i = 0; i < byteCount; i++) {
        boolsArr.concat((0, lodestar_beacon_state_transition_1.getUint8ByteToBitBooleanArray)((_b = bytes[i]) !== null && _b !== void 0 ? _b : 0));
    }
    return boolsArr;
}
exports.deserializeEnrSubnets = deserializeEnrSubnets;
//# sourceMappingURL=enrSubnetsDeserialize.js.map