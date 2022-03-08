"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RegistryMetricCreator = void 0;
const prom_client_1 = require("prom-client");
const avgMinMax_1 = require("./avgMinMax");
const gauge_1 = require("./gauge");
const histogram_1 = require("./histogram");
class RegistryMetricCreator extends prom_client_1.Registry {
    gauge(configuration) {
        return new gauge_1.GaugeExtra({ ...configuration, registers: [this] });
    }
    histogram(configuration) {
        return new histogram_1.HistogramExtra({ ...configuration, registers: [this] });
    }
    avgMinMax(configuration) {
        return new avgMinMax_1.AvgMinMax({ ...configuration, registers: [this] });
    }
    /** Static metric to send string-based data such as versions, config params, etc */
    static({ name, help, value }) {
        new prom_client_1.Gauge({ name, help, labelNames: Object.keys(value), registers: [this] }).set(value, 1);
    }
    counter(configuration) {
        return new prom_client_1.Counter({ ...configuration, registers: [this] });
    }
}
exports.RegistryMetricCreator = RegistryMetricCreator;
//# sourceMappingURL=registryMetricCreator.js.map