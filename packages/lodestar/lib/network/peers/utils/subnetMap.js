"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubnetMap = void 0;
/**
 * Track requested subnets by `toSlot`
 */
class SubnetMap {
    constructor() {
        /** Map of subnets and the slot until they are needed */
        this.subnets = new Map();
    }
    get size() {
        return this.subnets.size;
    }
    has(subnet) {
        return this.subnets.has(subnet);
    }
    /**
     * Register requested subnets, extends toSlot if same subnet.
     **/
    request(requestedSubnet) {
        var _a;
        const { subnet, toSlot } = requestedSubnet;
        this.subnets.set(subnet, Math.max((_a = this.subnets.get(subnet)) !== null && _a !== void 0 ? _a : 0, toSlot));
    }
    /**
     * Get last active slot of a subnet.
     */
    getToSlot(subnet) {
        return this.subnets.get(subnet);
    }
    isActiveAtSlot(subnet, slot) {
        const toSlot = this.subnets.get(subnet);
        return toSlot !== undefined && toSlot >= slot; // ACTIVE: >=
    }
    /** Return subnetIds with a `toSlot` equal greater than `currentSlot` */
    getActive(currentSlot) {
        const subnetIds = [];
        for (const [subnet, toSlot] of this.subnets.entries()) {
            if (toSlot >= currentSlot) {
                subnetIds.push(subnet);
            }
        }
        return subnetIds;
    }
    /** Return subnetIds with a `toSlot` equal greater than `currentSlot` */
    getActiveTtl(currentSlot) {
        const subnets = [];
        for (const [subnet, toSlot] of this.subnets.entries()) {
            if (toSlot >= currentSlot) {
                subnets.push({ subnet, toSlot });
            }
        }
        return subnets;
    }
    /** Return subnetIds with a `toSlot` less than `currentSlot`. Also deletes expired entries */
    getExpired(currentSlot) {
        const subnetIds = [];
        for (const [subnet, toSlot] of this.subnets.entries()) {
            if (toSlot < currentSlot) {
                subnetIds.push(subnet);
                this.subnets.delete(subnet);
            }
        }
        return subnetIds;
    }
    getAll() {
        return Array.from(this.subnets.keys());
    }
    delete(subnet) {
        this.subnets.delete(subnet);
    }
}
exports.SubnetMap = SubnetMap;
//# sourceMappingURL=subnetMap.js.map