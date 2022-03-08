"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFormat = void 0;
const winston_1 = require("winston");
const json_1 = require("./json");
const interface_1 = require("./interface");
const util_1 = require("./util");
function getFormat(opts) {
    switch (opts.format) {
        case "json":
            return jsonLogFormat(opts);
        case "human":
        default:
            return humanReadableLogFormat(opts);
    }
}
exports.getFormat = getFormat;
function humanReadableLogFormat(opts) {
    return winston_1.format.combine(...(opts.hideTimestamp ? [] : [formatTimestamp(opts)]), winston_1.format.colorize(), winston_1.format.printf(humanReadableTemplateFn));
}
function formatTimestamp(opts) {
    const { timestampFormat } = opts;
    switch (timestampFormat === null || timestampFormat === void 0 ? void 0 : timestampFormat.format) {
        case interface_1.TimestampFormatCode.EpochSlot:
            return {
                transform: (info) => {
                    info.timestamp = (0, util_1.formatEpochSlotTime)(timestampFormat);
                    return info;
                },
            };
        case interface_1.TimestampFormatCode.DateRegular:
        default:
            return winston_1.format.timestamp({ format: "MMM-DD HH:mm:ss.SSS" });
    }
}
function jsonLogFormat(opts) {
    return winston_1.format.combine(...(opts.hideTimestamp ? [] : [winston_1.format.timestamp()]), 
    // eslint-disable-next-line @typescript-eslint/naming-convention
    (0, winston_1.format)((_info) => {
        const info = _info;
        info.context = (0, json_1.logCtxToJson)(info.context);
        info.error = (0, json_1.logCtxToJson)(info.error);
        return info;
    })(), winston_1.format.json());
}
/**
 * Winston template function print a human readable string given a log object
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/naming-convention
function humanReadableTemplateFn(_info) {
    const info = _info;
    const paddingBetweenInfo = 30;
    const infoString = info.module || info.namespace || "";
    const infoPad = paddingBetweenInfo - infoString.length;
    let str = "";
    if (info.timestamp)
        str += info.timestamp;
    str += `[${infoString.toUpperCase()}] ${info.level.padStart(infoPad)}: ${info.message}`;
    if (info.context !== undefined)
        str += " " + (0, json_1.logCtxToString)(info.context);
    if (info.error !== undefined)
        str += " " + (0, json_1.logCtxToString)(info.error);
    return str;
}
//# sourceMappingURL=format.js.map