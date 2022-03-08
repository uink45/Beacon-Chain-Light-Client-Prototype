import { Path } from "@chainsafe/ssz";
/**
 * Serialize proof path to JSON.
 * @param paths `[["finalized_checkpoint", 0, "root", 12000]]`
 * @returns `['["finalized_checkpoint",0,"root",12000]']`
 */
export declare function querySerializeProofPathsArr(paths: Path[]): string[];
/**
 * Deserialize JSON proof path to proof path
 * @param pathStrs `['["finalized_checkpoint",0,"root",12000]']`
 * @returns `[["finalized_checkpoint", 0, "root", 12000]]`
 */
export declare function queryParseProofPathsArr(pathStrs: string | string[]): Path[];
/**
 * Deserialize single JSON proof path to proof path
 * @param pathStr `'["finalized_checkpoint",0,"root",12000]'`
 * @returns `["finalized_checkpoint", 0, "root", 12000]`
 */
export declare function queryParseProofPaths(pathStr: string): Path;
//# sourceMappingURL=serdes.d.ts.map