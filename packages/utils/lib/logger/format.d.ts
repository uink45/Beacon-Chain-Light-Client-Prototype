import { format } from "winston";
import { ILoggerOptions } from "./interface";
declare type Format = ReturnType<typeof format.combine>;
export declare function getFormat(opts: ILoggerOptions): Format;
export {};
//# sourceMappingURL=format.d.ts.map