/**
 * Sort by multiple prioritized conditions
 * - Sort is stable
 * - Sort does not mutate the original array
 * - Sorts by number in ascending order: [-1,0,1,2]
 * @param condition Must return an number, used to sort compare each item
 * - conditions[0] has priority over conditions[1]
 */
export declare function sortBy<T>(arr: T[], ...conditions: ((item: T) => number)[]): T[];
//# sourceMappingURL=sortBy.d.ts.map