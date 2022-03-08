export declare const assert: {
    /**
     * Assert condition is true, otherwise throw AssertionError
     */
    true(condition: boolean, message?: string | undefined): void;
    /**
     * Assert strict equality
     * ```js
     * actual === expected
     * ```
     */
    equal<T>(actual: T, expected: T, message?: string | undefined): void;
    /**
     * Assert less than or equal
     * ```js
     * left <= right
     * ```
     */
    lte(left: number, right: number, message?: string | undefined): void;
    /**
     * Assert less than
     * ```js
     * left < right
     * ```
     */
    lt(left: number, right: number, message?: string | undefined): void;
    /**
     * Assert greater than or equal
     * ```js
     * left >= right
     * ```
     */
    gte(left: number, right: number, message?: string | undefined): void;
    /**
     * Assert greater than
     * ```js
     * left > right
     * ```
     */
    gt(left: number, right: number, message?: string | undefined): void;
};
export declare class AssertionError extends Error {
    static code: string;
}
//# sourceMappingURL=assert.d.ts.map