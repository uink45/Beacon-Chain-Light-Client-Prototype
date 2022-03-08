"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.shuffleOne = exports.shuffle = void 0;
/**
 * Randomize an array of items without mutation.
 * Note: Uses Math.random() as entropy source, use for non-critical stuff
 */
function shuffle(arr) {
    const _arr = [...arr];
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [_arr[i], _arr[j]] = [_arr[j], _arr[i]];
    }
    return _arr;
}
exports.shuffle = shuffle;
/**
 * Return one random item from array
 */
function shuffleOne(arr) {
    if (arr.length === 0)
        return undefined;
    return arr[Math.floor(Math.random() * arr.length)];
}
exports.shuffleOne = shuffleOne;
//# sourceMappingURL=shuffle.js.map