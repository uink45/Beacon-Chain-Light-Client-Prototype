/**
 * Type-safe helper to filter out nullist values from an array
 * ```js
 * const array: (string | null)[] = ['foo', null];
 * const filteredArray: string[] = array.filter(notEmpty);
 * ```
 * @param value
 */
export declare function notNullish<TValue>(value: TValue | null | undefined): value is TValue;
//# sourceMappingURL=notNullish.d.ts.map