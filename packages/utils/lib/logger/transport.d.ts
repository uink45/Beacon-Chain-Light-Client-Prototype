/// <reference types="node" />
import { LogLevel } from "./interface";
import TransportStream from "winston-transport";
export declare enum TransportType {
    console = "console",
    file = "file",
    stream = "stream"
}
export declare type TransportOpts = {
    type: TransportType.console;
    level?: LogLevel;
} | {
    type: TransportType.file;
    level?: LogLevel;
    filename: string;
    rotate?: boolean;
    maxfiles?: number;
} | {
    type: TransportType.stream;
    level?: LogLevel;
    stream: NodeJS.WritableStream;
};
export declare function fromTransportOpts(transportOpts: TransportOpts): TransportStream;
//# sourceMappingURL=transport.d.ts.map