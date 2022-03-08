"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GaugeChild = exports.GaugeExtra = void 0;
const prom_client_1 = require("prom-client");
/**
 * Extends the prom-client Gauge with extra features:
 * - Add multiple collect functions after instantiation
 * - Create child gauges with fixed labels
 */
class GaugeExtra extends prom_client_1.Gauge {
    constructor(configuration) {
        super(configuration);
        this.collectFns = [];
    }
    addCollect(collectFn) {
        this.collectFns.push(collectFn);
    }
    child(labels) {
        return new GaugeChild(labels, this);
    }
    /**
     * @override Metric.collect
     */
    collect() {
        for (const collectFn of this.collectFns) {
            collectFn(this);
        }
    }
}
exports.GaugeExtra = GaugeExtra;
class GaugeChild {
    constructor(labelsParent, gauge) {
        this.gauge = gauge;
        this.labelsParent = labelsParent;
    }
    inc(arg1, arg2) {
        if (typeof arg1 === "object") {
            this.gauge.inc({ ...this.labelsParent, ...arg1 }, arg2 !== null && arg2 !== void 0 ? arg2 : 1);
        }
        else {
            this.gauge.inc(this.labelsParent, arg1 !== null && arg1 !== void 0 ? arg1 : 1);
        }
    }
    set(arg1, arg2) {
        if (typeof arg1 === "object") {
            this.gauge.set({ ...this.labelsParent, ...arg1 }, arg2 !== null && arg2 !== void 0 ? arg2 : 0);
        }
        else {
            this.gauge.set(this.labelsParent, arg1 !== null && arg1 !== void 0 ? arg1 : 0);
        }
    }
    addCollect(collectFn) {
        this.gauge.addCollect(() => collectFn(this));
    }
}
exports.GaugeChild = GaugeChild;
//# sourceMappingURL=gauge.js.map