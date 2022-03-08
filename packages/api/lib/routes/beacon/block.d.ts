import { Json } from "@chainsafe/ssz";
import { ForkName } from "@chainsafe/lodestar-params";
import { IChainForkConfig } from "@chainsafe/lodestar-config";
import { phase0, allForks, Slot, Root } from "@chainsafe/lodestar-types";
import { RoutesData, ReturnTypes, ReqSerializers } from "../../utils";
export declare type BlockId = "head" | "genesis" | "finalized" | string | number;
export declare type BlockHeaderResponse = {
    root: Root;
    canonical: boolean;
    header: phase0.SignedBeaconBlockHeader;
};
export declare type Api = {
    /**
     * Get block
     * Returns the complete `SignedBeaconBlock` for a given block ID.
     * Depending on the `Accept` header it can be returned either as JSON or SSZ-serialized bytes.
     *
     * @param blockId Block identifier.
     * Can be one of: "head" (canonical head in node's view), "genesis", "finalized", \<slot\>, \<hex encoded blockRoot with 0x prefix\>.
     */
    getBlock(blockId: BlockId): Promise<{
        data: allForks.SignedBeaconBlock;
    }>;
    /**
     * Get block
     * Retrieves block details for given block id.
     * @param blockId Block identifier.
     * Can be one of: "head" (canonical head in node's view), "genesis", "finalized", \<slot\>, \<hex encoded blockRoot with 0x prefix\>.
     */
    getBlockV2(blockId: BlockId): Promise<{
        data: allForks.SignedBeaconBlock;
        version: ForkName;
    }>;
    /**
     * Get block attestations
     * Retrieves attestation included in requested block.
     * @param blockId Block identifier.
     * Can be one of: "head" (canonical head in node's view), "genesis", "finalized", \<slot\>, \<hex encoded blockRoot with 0x prefix\>.
     */
    getBlockAttestations(blockId: BlockId): Promise<{
        data: phase0.Attestation[];
    }>;
    /**
     * Get block header
     * Retrieves block header for given block id.
     * @param blockId Block identifier.
     * Can be one of: "head" (canonical head in node's view), "genesis", "finalized", \<slot\>, \<hex encoded blockRoot with 0x prefix\>.
     */
    getBlockHeader(blockId: BlockId): Promise<{
        data: BlockHeaderResponse;
    }>;
    /**
     * Get block headers
     * Retrieves block headers matching given query. By default it will fetch current head slot blocks.
     * @param slot
     * @param parentRoot
     */
    getBlockHeaders(filters: Partial<{
        slot: Slot;
        parentRoot: string;
    }>): Promise<{
        data: BlockHeaderResponse[];
    }>;
    /**
     * Get block root
     * Retrieves hashTreeRoot of BeaconBlock/BeaconBlockHeader
     * @param blockId Block identifier.
     * Can be one of: "head" (canonical head in node's view), "genesis", "finalized", \<slot\>, \<hex encoded blockRoot with 0x prefix\>.
     */
    getBlockRoot(blockId: BlockId): Promise<{
        data: Root;
    }>;
    /**
     * Publish a signed block.
     * Instructs the beacon node to broadcast a newly signed beacon block to the beacon network,
     * to be included in the beacon chain. The beacon node is not required to validate the signed
     * `BeaconBlock`, and a successful response (20X) only indicates that the broadcast has been
     * successful. The beacon node is expected to integrate the new block into its state, and
     * therefore validate the block internally, however blocks which fail the validation are still
     * broadcast but a different status code is returned (202)
     *
     * @param requestBody The `SignedBeaconBlock` object composed of `BeaconBlock` object (produced by beacon node) and validator signature.
     * @returns any The block was validated successfully and has been broadcast. It has also been integrated into the beacon node's database.
     */
    publishBlock(block: allForks.SignedBeaconBlock): Promise<void>;
};
/**
 * Define javascript values for each route
 */
export declare const routesData: RoutesData<Api>;
declare type BlockIdOnlyReq = {
    params: {
        blockId: string | number;
    };
};
export declare type ReqTypes = {
    getBlock: BlockIdOnlyReq;
    getBlockV2: BlockIdOnlyReq;
    getBlockAttestations: BlockIdOnlyReq;
    getBlockHeader: BlockIdOnlyReq;
    getBlockHeaders: {
        query: {
            slot?: number;
            parent_root?: string;
        };
    };
    getBlockRoot: BlockIdOnlyReq;
    publishBlock: {
        body: Json;
    };
};
export declare function getReqSerializers(config: IChainForkConfig): ReqSerializers<Api, ReqTypes>;
export declare function getReturnTypes(): ReturnTypes<Api>;
export {};
//# sourceMappingURL=block.d.ts.map