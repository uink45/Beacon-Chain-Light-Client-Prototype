"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TimeSeries = void 0;
class TimeSeries {
    constructor(opts) {
        var _a;
        this.points = [];
        this.maxPoints = (_a = opts === null || opts === void 0 ? void 0 : opts.maxPoints) !== null && _a !== void 0 ? _a : 1000;
        this.startTimeSec = Date.now() / 1000;
    }
    /** Add TimeSeries entry for value at current time */
    addPoint(value, timeMs = Date.now()) {
        // Substract initial time so x values are not big and cause rounding errors
        const time = timeMs / 1000 - this.startTimeSec;
        this.points.push([time, value]);
        // Limit length by removing old entries
        while (this.points.length > this.maxPoints) {
            this.points.shift();
        }
    }
    /** Compute the slope of all registered points assuming linear regression */
    computeLinearSpeed() {
        return linearRegression(this.points).m;
    }
    /** Remove all entries */
    clear() {
        this.points = [];
    }
}
exports.TimeSeries = TimeSeries;
/**
 * From https://github.com/simple-statistics/simple-statistics/blob/d0d177baf74976a2421638bce98ab028c5afb537/src/linear_regression.js
 *
 * [Simple linear regression](http://en.wikipedia.org/wiki/Simple_linear_regression)
 * is a simple way to find a fitted line between a set of coordinates.
 * This algorithm finds the slope and y-intercept of a regression line
 * using the least sum of squares.
 *
 * @param data an array of two-element of arrays,
 * like `[[0, 1], [2, 3]]`
 * @returns object containing slope and intersect of regression line
 * @example
 * linearRegression([[0, 0], [1, 1]]); // => { m: 1, b: 0 }
 */
function linearRegression(data) {
    let m, b;
    // Store data length in a local variable to reduce
    // repeated object property lookups
    const dataLength = data.length;
    //if there's only one point, arbitrarily choose a slope of 0
    //and a y-intercept of whatever the y of the initial point is
    if (dataLength === 1) {
        m = 0;
        b = data[0][1];
    }
    else {
        // Initialize our sums and scope the `m` and `b`
        // variables that define the line.
        let sumX = 0, sumY = 0, sumXX = 0, sumXY = 0;
        // Use local variables to grab point values
        // with minimal object property lookups
        let point, x, y;
        // Gather the sum of all x values, the sum of all
        // y values, and the sum of x^2 and (x*y) for each
        // value.
        //
        // In math notation, these would be SS_x, SS_y, SS_xx, and SS_xy
        for (let i = 0; i < dataLength; i++) {
            point = data[i];
            x = point[0];
            y = point[1];
            sumX += x;
            sumY += y;
            sumXX += x * x;
            sumXY += x * y;
        }
        // `m` is the slope of the regression line
        m = (dataLength * sumXY - sumX * sumY) / (dataLength * sumXX - sumX * sumX);
        // `b` is the y-intercept of the line.
        b = sumY / dataLength - (m * sumX) / dataLength;
    }
    // Return both values as an object.
    return {
        m: m,
        b: b,
    };
}
//# sourceMappingURL=timeSeries.js.map