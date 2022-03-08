declare type LogDataBasic = string | number | bigint | boolean | null | undefined;
export declare type LogData = LogDataBasic | Record<string, LogDataBasic> | LogDataBasic[] | Record<string, LogDataBasic>[];
/**
 * Renders any log Context to JSON up to one level of depth.
 *
 * By limiting recursiveness, it renders limited content while ensuring safer logging.
 * Consumers of the logger should ensure to send pre-formated data if they require nesting.
 */
export declare function logCtxToJson(arg: unknown, depth?: number, fromError?: boolean): LogData;
/**
 * Renders any log Context to a string up to one level of depth.
 *
 * By limiting recursiveness, it renders limited content while ensuring safer logging.
 * Consumers of the logger should ensure to send pre-formated data if they require nesting.
 */
export declare function logCtxToString(arg: unknown, depth?: number, fromError?: boolean): string;
export {};
//# sourceMappingURL=json.d.ts.map