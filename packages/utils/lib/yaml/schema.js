"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.schema = void 0;
const js_yaml_1 = require("js-yaml");
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
const failsafe_1 = __importDefault(require("js-yaml/lib/js-yaml/schema/failsafe"));
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
const null_1 = __importDefault(require("js-yaml/lib/js-yaml/type/null"));
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
const bool_1 = __importDefault(require("js-yaml/lib/js-yaml/type/bool"));
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
const float_1 = __importDefault(require("js-yaml/lib/js-yaml/type/float"));
const int_1 = require("./int");
exports.schema = new js_yaml_1.Schema({
    include: [failsafe_1.default],
    implicit: [null_1.default, bool_1.default, int_1.intType, float_1.default],
    explicit: [],
});
//# sourceMappingURL=schema.js.map