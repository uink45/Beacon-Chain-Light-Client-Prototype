/**
 * Return the last index in the array that matches the predicate
 */
export declare function findLastIndex<T>(array: T[], predicate: (value: T) => boolean): number;
/**
 * We want to use this if we only need push/pop/shift method
 * without random access.
 * The shift() method should be cheaper than regular array.
 */
export declare class LinkedList<T> {
    private _length;
    private head;
    private tail;
    constructor();
    get length(): number;
    push(data: T): void;
    pop(): T | null;
    shift(): T | null;
    clear(): void;
    toArray(): T[];
    map<U>(fn: (t: T) => U): U[];
}
//# sourceMappingURL=array.d.ts.map