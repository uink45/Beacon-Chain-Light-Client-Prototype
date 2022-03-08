"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getReqRespHandlers = void 0;
const beaconBlocksByRange_1 = require("./beaconBlocksByRange");
const beaconBlocksByRoot_1 = require("./beaconBlocksByRoot");
/**
 * The ReqRespHandler module handles app-level requests / responses from other peers,
 * fetching state from the chain and database as needed.
 */
function getReqRespHandlers({ db, chain }) {
    return {
        async *onStatus() {
            yield chain.getStatus();
        },
        async *onBeaconBlocksByRange(req) {
            yield* (0, beaconBlocksByRange_1.onBeaconBlocksByRange)(req, chain, db);
        },
        async *onBeaconBlocksByRoot(req) {
            yield* (0, beaconBlocksByRoot_1.onBeaconBlocksByRoot)(req, chain, db);
        },
    };
}
exports.getReqRespHandlers = getReqRespHandlers;
//# sourceMappingURL=index.js.map