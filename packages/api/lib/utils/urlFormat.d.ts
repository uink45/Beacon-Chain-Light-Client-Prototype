declare type Args = Record<string, string | number>;
/**
 * Compile a route URL formater with syntax `/path/:var1/:var2`.
 * Returns a function that expects an object `{var1: 1, var2: 2}`, and returns`/path/1/2`.
 *
 * It's cheap enough to be neglibible. For the sample input below it costs:
 * - compile: 1010 ns / op
 * - execute: 105 ns / op
 * - execute with template literal: 12 ns / op
 * @param path `/eth/v1/validator/:name/attester/:epoch`
 */
export declare function compileRouteUrlFormater(path: string): (arg: Args) => string;
export {};
//# sourceMappingURL=urlFormat.d.ts.map