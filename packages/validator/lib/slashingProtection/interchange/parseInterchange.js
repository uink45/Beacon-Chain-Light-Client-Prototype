"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseInterchange = void 0;
const utils_1 = require("../utils");
const errors_1 = require("./errors");
const completeV4_1 = require("./formats/completeV4");
const v5_1 = require("./formats/v5");
function parseInterchange(interchange, expectedGenesisValidatorsRoot) {
    var _a, _b, _c;
    const format = (_b = (_a = interchange) === null || _a === void 0 ? void 0 : _a.metadata) === null || _b === void 0 ? void 0 : _b.interchange_format;
    const version = (_c = interchange === null || interchange === void 0 ? void 0 : interchange.metadata) === null || _c === void 0 ? void 0 : _c.interchange_format_version;
    if (!format) {
        // version >= v5.0.0
        switch (version) {
            case "5": {
                const interchangeLodestar = (0, v5_1.parseInterchangeV5)(interchange);
                if (!(0, utils_1.isEqualRoot)(interchangeLodestar.genesisValidatorsRoot, expectedGenesisValidatorsRoot)) {
                    throw new errors_1.InterchangeError({
                        code: errors_1.InterchangeErrorErrorCode.GENESIS_VALIDATOR_MISMATCH,
                        root: interchangeLodestar.genesisValidatorsRoot,
                        extectedRoot: expectedGenesisValidatorsRoot,
                    });
                }
                return interchangeLodestar;
            }
            default:
                throw new errors_1.InterchangeError({ code: errors_1.InterchangeErrorErrorCode.UNSUPPORTED_VERSION, version });
        }
    }
    // version < v5.0.0 (older version)
    switch (format) {
        case "complete":
            switch (version) {
                case "4": {
                    const interchangeLodestar = (0, completeV4_1.parseInterchangeCompleteV4)(interchange);
                    if (!(0, utils_1.isEqualRoot)(interchangeLodestar.genesisValidatorsRoot, expectedGenesisValidatorsRoot)) {
                        throw new errors_1.InterchangeError({
                            code: errors_1.InterchangeErrorErrorCode.GENESIS_VALIDATOR_MISMATCH,
                            root: interchangeLodestar.genesisValidatorsRoot,
                            extectedRoot: expectedGenesisValidatorsRoot,
                        });
                    }
                    return interchangeLodestar;
                }
                default:
                    throw new errors_1.InterchangeError({ code: errors_1.InterchangeErrorErrorCode.UNSUPPORTED_VERSION, version });
            }
        default:
            throw new errors_1.InterchangeError({ code: errors_1.InterchangeErrorErrorCode.UNSUPPORTED_FORMAT, format: format });
    }
}
exports.parseInterchange = parseInterchange;
//# sourceMappingURL=parseInterchange.js.map