"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.computeMostCommonTarget = void 0;
const ssz_1 = require("@chainsafe/ssz");
function computeMostCommonTarget(targets) {
    var _a;
    if (targets.length === 0) {
        throw Error("Must provide at least one target");
    }
    const countById = new Map();
    let mostCommonTarget = targets[0];
    let mostCommonCount = 0;
    for (const target of targets) {
        const targetId = `${target.slot}-${(0, ssz_1.toHexString)(target.root)}`;
        const count = 1 + ((_a = countById.get(targetId)) !== null && _a !== void 0 ? _a : 0);
        countById.set(targetId, count);
        if (count > mostCommonCount) {
            mostCommonCount = count;
            mostCommonTarget = target;
        }
    }
    return mostCommonTarget;
}
exports.computeMostCommonTarget = computeMostCommonTarget;
//# sourceMappingURL=chainTarget.js.map