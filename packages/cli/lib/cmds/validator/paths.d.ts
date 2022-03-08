import { IGlobalArgs } from "../../options";
import { IGlobalPaths } from "../../paths/global";
export declare type IValidatorPaths = {
    validatorsDbDir: string;
};
/**
 * Defines the path structure of the validator files
 *
 * ```bash
 * $validatorRootDir
 * └── validator-db
 *     └── (db files)
 * ```
 */
export declare function getValidatorPaths(args: Partial<IValidatorPaths> & Pick<IGlobalArgs, "rootDir">): IValidatorPaths & IGlobalPaths;
/**
 * Constructs representations of the path structure to show in command's description
 */
export declare const defaultValidatorPaths: IValidatorPaths & IGlobalPaths;
//# sourceMappingURL=paths.d.ts.map