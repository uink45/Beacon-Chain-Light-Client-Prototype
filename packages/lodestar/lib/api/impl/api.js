"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getApi = void 0;
const beacon_1 = require("./beacon");
const config_1 = require("./config");
const debug_1 = require("./debug");
const events_1 = require("./events");
const lightclient_1 = require("./lightclient");
const lodestar_1 = require("./lodestar");
const node_1 = require("./node");
const validator_1 = require("./validator");
function getApi(opts, modules) {
    return {
        beacon: (0, beacon_1.getBeaconApi)(modules),
        config: (0, config_1.getConfigApi)(modules),
        debug: (0, debug_1.getDebugApi)(modules),
        events: (0, events_1.getEventsApi)(modules),
        lightclient: (0, lightclient_1.getLightclientApi)(opts, modules),
        lodestar: (0, lodestar_1.getLodestarApi)(modules),
        node: (0, node_1.getNodeApi)(opts, modules),
        validator: (0, validator_1.getValidatorApi)(modules),
    };
}
exports.getApi = getApi;
//# sourceMappingURL=api.js.map