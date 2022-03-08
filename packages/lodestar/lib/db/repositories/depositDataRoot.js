"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DepositDataRootRepository = void 0;
const ssz_1 = require("@chainsafe/ssz");
const lodestar_types_1 = require("@chainsafe/lodestar-types");
const lodestar_utils_1 = require("@chainsafe/lodestar-utils");
const lodestar_db_1 = require("@chainsafe/lodestar-db");
class DepositDataRootRepository extends lodestar_db_1.Repository {
    constructor(config, db, metrics) {
        super(config, db, lodestar_db_1.Bucket.index_depositDataRoot, lodestar_types_1.ssz.Root, metrics);
    }
    decodeKey(data) {
        return (0, lodestar_utils_1.bytesToInt)(super.decodeKey(data), "be");
    }
    // depositDataRoots stored by depositData index
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    getId(value) {
        throw new Error("Unable to create depositIndex from root");
    }
    async put(id, value) {
        const depositRootTree = await this.getDepositRootTree();
        await super.put(id, value);
        depositRootTree[id] = value;
    }
    async batchPut(items) {
        const depositRootTree = await this.getDepositRootTree();
        await super.batchPut(items);
        for (const { key, value } of items) {
            depositRootTree[key] = value;
        }
    }
    async putList(list) {
        await this.batchPut(Array.from((0, ssz_1.readonlyValues)(list), (value, key) => ({ key, value })));
    }
    async batchPutValues(values) {
        await this.batchPut(values.map(({ index, root }) => ({
            key: index,
            value: root,
        })));
    }
    async getTreeBacked(depositIndex) {
        const depositRootTree = await this.getDepositRootTree();
        const tree = depositRootTree.clone();
        let maxIndex = tree.length - 1;
        if (depositIndex > maxIndex) {
            throw new Error(`Cannot get tree for unseen deposits: requested ${depositIndex}, last seen ${maxIndex}`);
        }
        while (maxIndex > depositIndex) {
            tree.pop();
            maxIndex = tree.length - 1;
        }
        return tree;
    }
    async getDepositRootTree() {
        if (!this.depositRootTree) {
            const values = (await this.values());
            this.depositRootTree = lodestar_types_1.ssz.phase0.DepositDataRootList.createTreeBackedFromStruct(values);
        }
        return this.depositRootTree;
    }
}
exports.DepositDataRootRepository = DepositDataRootRepository;
//# sourceMappingURL=depositDataRoot.js.map