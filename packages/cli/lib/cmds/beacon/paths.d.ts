import { IGlobalArgs } from "../../options";
import { IGlobalPaths } from "../../paths/global";
export interface IBeaconPaths {
    beaconDir: string;
    peerStoreDir: string;
    dbDir: string;
    persistInvalidSszObjectsDir: string;
    configFile?: string;
    peerIdFile: string;
    enrFile: string;
    logFile?: string;
    bootnodesFile?: string;
}
/**
 * Defines the path structure of the files relevant to the beacon node
 *
 * ```bash
 * $rootDir
 * └── $beaconDir
 *     ├── beacon.config.json
 *     ├── peer-id.json
 *     ├── enr
 *     └── chain-db
 * ```
 */
export declare function getBeaconPaths(args: Partial<IBeaconPaths> & Pick<IGlobalArgs, "rootDir">): IBeaconPaths & IGlobalPaths;
/**
 * Constructs representations of the path structure to show in command's description
 */
export declare const defaultBeaconPaths: IBeaconPaths & IGlobalPaths;
//# sourceMappingURL=paths.d.ts.map