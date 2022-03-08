"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notNullish = void 0;
/**
 * Type-safe helper to filter out nullist values from an array
 * ```js
 * const array: (string | null)[] = ['foo', null];
 * const filteredArray: string[] = array.filter(notEmpty);
 * ```
 * @param value
 */
function notNullish(value) {
    return value !== null && value !== undefined;
}
exports.notNullish = notNullish;
//# sourceMappingURL=notNullish.js.map