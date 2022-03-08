"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toAttesterFlags = exports.parseAttesterFlags = exports.hasMarkers = exports.createIAttesterStatus = exports.FLAG_PREV_HEAD_ATTESTER_OR_UNSLASHED = exports.FLAG_PREV_TARGET_ATTESTER_OR_UNSLASHED = exports.FLAG_PREV_SOURCE_ATTESTER_OR_UNSLASHED = exports.FLAG_ELIGIBLE_ATTESTER = exports.FLAG_UNSLASHED = exports.FLAG_CURR_HEAD_ATTESTER = exports.FLAG_CURR_TARGET_ATTESTER = exports.FLAG_CURR_SOURCE_ATTESTER = exports.FLAG_PREV_HEAD_ATTESTER = exports.FLAG_PREV_TARGET_ATTESTER = exports.FLAG_PREV_SOURCE_ATTESTER = void 0;
exports.FLAG_PREV_SOURCE_ATTESTER = 1 << 0;
exports.FLAG_PREV_TARGET_ATTESTER = 1 << 1;
exports.FLAG_PREV_HEAD_ATTESTER = 1 << 2;
exports.FLAG_CURR_SOURCE_ATTESTER = 1 << 3;
exports.FLAG_CURR_TARGET_ATTESTER = 1 << 4;
exports.FLAG_CURR_HEAD_ATTESTER = 1 << 5;
exports.FLAG_UNSLASHED = 1 << 6;
exports.FLAG_ELIGIBLE_ATTESTER = 1 << 7;
// Precompute OR flags
exports.FLAG_PREV_SOURCE_ATTESTER_OR_UNSLASHED = exports.FLAG_PREV_SOURCE_ATTESTER | exports.FLAG_UNSLASHED;
exports.FLAG_PREV_TARGET_ATTESTER_OR_UNSLASHED = exports.FLAG_PREV_TARGET_ATTESTER | exports.FLAG_UNSLASHED;
exports.FLAG_PREV_HEAD_ATTESTER_OR_UNSLASHED = exports.FLAG_PREV_HEAD_ATTESTER | exports.FLAG_UNSLASHED;
function createIAttesterStatus() {
    return {
        flags: 0,
        proposerIndex: -1,
        inclusionDelay: 0,
        active: false,
    };
}
exports.createIAttesterStatus = createIAttesterStatus;
function hasMarkers(flags, markers) {
    return (flags & markers) === markers;
}
exports.hasMarkers = hasMarkers;
function parseAttesterFlags(flags) {
    return {
        prevSourceAttester: hasMarkers(flags, exports.FLAG_PREV_SOURCE_ATTESTER),
        prevTargetAttester: hasMarkers(flags, exports.FLAG_PREV_TARGET_ATTESTER),
        prevHeadAttester: hasMarkers(flags, exports.FLAG_PREV_HEAD_ATTESTER),
        currSourceAttester: hasMarkers(flags, exports.FLAG_CURR_SOURCE_ATTESTER),
        currTargetAttester: hasMarkers(flags, exports.FLAG_CURR_TARGET_ATTESTER),
        currHeadAttester: hasMarkers(flags, exports.FLAG_CURR_HEAD_ATTESTER),
        unslashed: hasMarkers(flags, exports.FLAG_UNSLASHED),
        eligibleAttester: hasMarkers(flags, exports.FLAG_ELIGIBLE_ATTESTER),
    };
}
exports.parseAttesterFlags = parseAttesterFlags;
function toAttesterFlags(flagsObj) {
    let flag = 0;
    if (flagsObj.prevSourceAttester)
        flag |= exports.FLAG_PREV_SOURCE_ATTESTER;
    if (flagsObj.prevTargetAttester)
        flag |= exports.FLAG_PREV_TARGET_ATTESTER;
    if (flagsObj.prevHeadAttester)
        flag |= exports.FLAG_PREV_HEAD_ATTESTER;
    if (flagsObj.currSourceAttester)
        flag |= exports.FLAG_CURR_SOURCE_ATTESTER;
    if (flagsObj.currTargetAttester)
        flag |= exports.FLAG_CURR_TARGET_ATTESTER;
    if (flagsObj.currHeadAttester)
        flag |= exports.FLAG_CURR_HEAD_ATTESTER;
    if (flagsObj.unslashed)
        flag |= exports.FLAG_UNSLASHED;
    if (flagsObj.eligibleAttester)
        flag |= exports.FLAG_ELIGIBLE_ATTESTER;
    return flag;
}
exports.toAttesterFlags = toAttesterFlags;
//# sourceMappingURL=attesterStatus.js.map