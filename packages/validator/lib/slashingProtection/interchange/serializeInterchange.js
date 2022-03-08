"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.serializeInterchange = void 0;
const errors_1 = require("./errors");
const completeV4_1 = require("./formats/completeV4");
const v5_1 = require("./formats/v5");
function serializeInterchange(interchangeLodestar, { format, version }) {
    // version >= v5.0.0
    if (!format) {
        switch (version) {
            case "5":
                return (0, v5_1.serializeInterchangeV5)(interchangeLodestar);
            default:
                throw new errors_1.InterchangeError({ code: errors_1.InterchangeErrorErrorCode.UNSUPPORTED_VERSION, version });
        }
    }
    // version < v5.0.0
    switch (format) {
        case "complete":
            switch (version) {
                case "4":
                    return (0, completeV4_1.serializeInterchangeCompleteV4)(interchangeLodestar);
                default:
                    throw new errors_1.InterchangeError({ code: errors_1.InterchangeErrorErrorCode.UNSUPPORTED_VERSION, version });
            }
        default:
            throw new errors_1.InterchangeError({ code: errors_1.InterchangeErrorErrorCode.UNSUPPORTED_FORMAT, format });
    }
}
exports.serializeInterchange = serializeInterchange;
//# sourceMappingURL=serializeInterchange.js.map