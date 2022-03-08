"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ErrorNoValueMinValue = exports.ErrorNoValues = exports.ErrorBinarySearch = exports.binarySearchLte = void 0;
function binarySearchLte(items, value, getter) {
    if (items.length == 0) {
        throw new ErrorNoValues();
    }
    const maxValue = getter(items[items.length - 1]);
    const minValue = getter(items[0]);
    // Shortcut for the actual value
    if (value >= maxValue) {
        return items[items.length - 1];
    }
    if (value < minValue) {
        throw new ErrorNoValueMinValue(value, minValue);
    }
    // Binary search of the value in the array
    let min = 0;
    let max = items.length - 1;
    while (max > min) {
        const mid = Math.floor((max + min + 1) / 2);
        if (getter(items[mid]) <= value) {
            min = mid;
        }
        else {
            max = mid - 1;
        }
    }
    return items[min];
}
exports.binarySearchLte = binarySearchLte;
class ErrorBinarySearch extends Error {
}
exports.ErrorBinarySearch = ErrorBinarySearch;
class ErrorNoValues extends ErrorBinarySearch {
    constructor() {
        super("Empty array to perform binary search");
    }
}
exports.ErrorNoValues = ErrorNoValues;
class ErrorNoValueMinValue extends ErrorBinarySearch {
    constructor(value, minValue) {
        super(`Target value ${value} is less than min value ${minValue}`);
        this.value = value;
        this.minValue = minValue;
    }
}
exports.ErrorNoValueMinValue = ErrorNoValueMinValue;
//# sourceMappingURL=binarySearch.js.map