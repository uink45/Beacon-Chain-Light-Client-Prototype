"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBucketNameByValue = void 0;
const _1 = require(".");
function getBucketNameByValue(enumValue) {
    const keys = Object.keys(_1.Bucket).filter((x) => {
        if (isNaN(parseInt(x))) {
            return _1.Bucket[x] == enumValue;
        }
        else {
            return false;
        }
    });
    if (keys.length > 0) {
        return keys[0];
    }
    throw new Error("Missing bucket for value " + enumValue);
}
exports.getBucketNameByValue = getBucketNameByValue;
//# sourceMappingURL=util.js.map