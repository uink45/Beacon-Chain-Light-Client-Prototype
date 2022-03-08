import { Slot } from "@chainsafe/lodestar-types";
export declare type RequestedSubnet = {
    subnet: number;
    /**
     * Slot after which the network will stop maintaining a min number of peers
     * connected to `subnetId`RequestedSubnet
     */
    toSlot: Slot;
};
/**
 * Track requested subnets by `toSlot`
 */
export declare class SubnetMap {
    /** Map of subnets and the slot until they are needed */
    private subnets;
    get size(): number;
    has(subnet: number): boolean;
    /**
     * Register requested subnets, extends toSlot if same subnet.
     **/
    request(requestedSubnet: RequestedSubnet): void;
    /**
     * Get last active slot of a subnet.
     */
    getToSlot(subnet: number): number | undefined;
    isActiveAtSlot(subnet: number, slot: Slot): boolean;
    /** Return subnetIds with a `toSlot` equal greater than `currentSlot` */
    getActive(currentSlot: Slot): number[];
    /** Return subnetIds with a `toSlot` equal greater than `currentSlot` */
    getActiveTtl(currentSlot: Slot): RequestedSubnet[];
    /** Return subnetIds with a `toSlot` less than `currentSlot`. Also deletes expired entries */
    getExpired(currentSlot: Slot): number[];
    getAll(): number[];
    delete(subnet: number): void;
}
//# sourceMappingURL=subnetMap.d.ts.map