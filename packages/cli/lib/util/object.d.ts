import { RecursivePartial } from "@chainsafe/lodestar-utils";
/**
 * Removes (mutates) all properties with a value === undefined, recursively
 */
export declare function removeUndefinedRecursive<T extends {
    [key: string]: any;
}>(obj: T): RecursivePartial<T>;
//# sourceMappingURL=object.d.ts.map