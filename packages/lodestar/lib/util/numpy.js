"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.linspace = void 0;
/**
 * Returns num evenly spaced samples, calculated over the interval [start, stop] inclusive.
 */
function linspace(start, stop) {
    const arr = [];
    for (let i = start; i <= stop; i++)
        arr.push(i);
    return arr;
}
exports.linspace = linspace;
//# sourceMappingURL=numpy.js.map