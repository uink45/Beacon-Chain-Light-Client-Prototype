export declare function binarySearchLte<T>(items: T[], value: number, getter: (item: T) => number): T;
export declare class ErrorBinarySearch extends Error {
}
export declare class ErrorNoValues extends ErrorBinarySearch {
    constructor();
}
export declare class ErrorNoValueMinValue extends ErrorBinarySearch {
    value: number;
    minValue: number;
    constructor(value: number, minValue: number);
}
//# sourceMappingURL=binarySearch.d.ts.map