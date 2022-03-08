"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cmds = void 0;
const account_1 = require("./account");
const beacon_1 = require("./beacon");
const dev_1 = require("./dev");
const init_1 = require("./init");
const validator_1 = require("./validator");
exports.cmds = [
    beacon_1.beacon,
    validator_1.validator,
    account_1.account,
    init_1.init,
    dev_1.dev,
];
//# sourceMappingURL=index.js.map