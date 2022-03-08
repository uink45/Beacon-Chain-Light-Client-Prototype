"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HistogramChild = exports.HistogramExtra = void 0;
const prom_client_1 = require("prom-client");
/**
 * Extends the prom-client Histogram with extra features:
 * - Add multiple collect functions after instantiation
 * - Create child histograms with fixed labels
 */
class HistogramExtra extends prom_client_1.Histogram {
    constructor(configuration) {
        super(configuration);
    }
    child(labels) {
        return new HistogramChild(labels, this);
    }
}
exports.HistogramExtra = HistogramExtra;
class HistogramChild {
    constructor(labelsParent, histogram) {
        this.histogram = histogram;
        this.labelsParent = labelsParent;
    }
    observe(arg1, arg2) {
        if (typeof arg1 === "object") {
            this.histogram.observe({ ...this.labelsParent, ...arg1 }, arg2 !== null && arg2 !== void 0 ? arg2 : 0);
        }
        else {
            this.histogram.observe(this.labelsParent, arg1 !== null && arg1 !== void 0 ? arg1 : 0);
        }
    }
    startTimer(arg1) {
        if (typeof arg1 === "object") {
            return this.histogram.startTimer({ ...this.labelsParent, ...arg1 });
        }
        else {
            return this.histogram.startTimer(this.labelsParent);
        }
    }
}
exports.HistogramChild = HistogramChild;
//# sourceMappingURL=histogram.js.map