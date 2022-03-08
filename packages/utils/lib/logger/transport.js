"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fromTransportOpts = exports.TransportType = void 0;
const winston_1 = require("winston");
const winston_daily_rotate_file_1 = __importDefault(require("winston-daily-rotate-file"));
var TransportType;
(function (TransportType) {
    TransportType["console"] = "console";
    TransportType["file"] = "file";
    TransportType["stream"] = "stream";
})(TransportType = exports.TransportType || (exports.TransportType = {}));
function fromTransportOpts(transportOpts) {
    switch (transportOpts.type) {
        case TransportType.console:
            return new winston_1.transports.Console({
                debugStdout: true,
                level: transportOpts.level,
                handleExceptions: true,
            });
        case TransportType.file:
            return transportOpts.rotate
                ? new winston_daily_rotate_file_1.default({
                    level: transportOpts.level,
                    //insert the date pattern in filename before the file extension.
                    filename: transportOpts.filename.replace(/\.(?=[^.]*$)|$/, "-%DATE%$&"),
                    datePattern: "YYYY-MM-DD",
                    handleExceptions: true,
                    maxFiles: transportOpts.maxfiles,
                })
                : new winston_1.transports.File({
                    level: transportOpts.level,
                    filename: transportOpts.filename,
                    handleExceptions: true,
                });
        case TransportType.stream:
            return new winston_1.transports.Stream({
                level: transportOpts.level,
                stream: transportOpts.stream,
                handleExceptions: true,
            });
    }
}
exports.fromTransportOpts = fromTransportOpts;
//# sourceMappingURL=transport.js.map