"use strict";
/**
 * @module eth1
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseDepositLog = exports.depositEventTopics = void 0;
const abi_1 = require("@ethersproject/abi");
const ssz_1 = require("@chainsafe/ssz");
const lodestar_types_1 = require("@chainsafe/lodestar-types");
const depositEventFragment = "event DepositEvent(bytes pubkey, bytes withdrawal_credentials, bytes amount, bytes signature, bytes index)";
const depositContractInterface = new abi_1.Interface([depositEventFragment]);
/**
 * Precomputed topics of DepositEvent logs
 */
exports.depositEventTopics = [depositContractInterface.getEventTopic("DepositEvent")];
/**
 * Parse DepositEvent log
 */
function parseDepositLog(log) {
    const event = depositContractInterface.parseLog(log);
    const values = event.args;
    if (values === undefined)
        throw Error(`DepositEvent at ${log.blockNumber} has no values`);
    return {
        blockNumber: log.blockNumber,
        index: lodestar_types_1.ssz.Number64.deserialize((0, ssz_1.fromHexString)(values.index)),
        depositData: {
            pubkey: (0, ssz_1.fromHexString)(values.pubkey),
            withdrawalCredentials: (0, ssz_1.fromHexString)(values.withdrawal_credentials),
            amount: lodestar_types_1.ssz.Number64.deserialize((0, ssz_1.fromHexString)(values.amount)),
            signature: (0, ssz_1.fromHexString)(values.signature),
        },
    };
}
exports.parseDepositLog = parseDepositLog;
//# sourceMappingURL=depositContract.js.map