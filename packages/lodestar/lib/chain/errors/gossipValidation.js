"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GossipActionError = exports.GossipAction = void 0;
const lodestar_utils_1 = require("@chainsafe/lodestar-utils");
var GossipAction;
(function (GossipAction) {
    GossipAction["IGNORE"] = "IGNORE";
    GossipAction["REJECT"] = "REJECT";
})(GossipAction = exports.GossipAction || (exports.GossipAction = {}));
class GossipActionError extends lodestar_utils_1.LodestarError {
    constructor(action, lodestarAction, type) {
        super(type);
        this.action = action;
        this.lodestarAction = lodestarAction;
    }
}
exports.GossipActionError = GossipActionError;
//# sourceMappingURL=gossipValidation.js.map