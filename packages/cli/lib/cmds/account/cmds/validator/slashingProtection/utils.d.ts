import { Root } from "@chainsafe/lodestar-types";
import { SlashingProtection } from "@chainsafe/lodestar-validator";
import { IGlobalArgs } from "../../../../../options";
import { ISlashingProtectionArgs } from "./options";
/**
 * Returns a new SlashingProtection object instance based on global args.
 */
export declare function getSlashingProtection(args: IGlobalArgs): SlashingProtection;
/**
 * Returns genesisValidatorsRoot from validator API client.
 */
export declare function getGenesisValidatorsRoot(args: IGlobalArgs & ISlashingProtectionArgs): Promise<Root>;
//# sourceMappingURL=utils.d.ts.map