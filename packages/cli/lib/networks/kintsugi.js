"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bootEnrs = exports.bootnodesFileUrl = exports.genesisFileUrl = exports.depositContractDeployBlock = exports.chainConfig = void 0;
const networks_1 = require("@chainsafe/lodestar-config/networks");
exports.chainConfig = networks_1.kintsugiChainConfig;
/* eslint-disable max-len */
exports.depositContractDeployBlock = 0;
exports.genesisFileUrl = "https://raw.githubusercontent.com/eth-clients/merge-testnets/main/kintsugi/genesis.ssz";
exports.bootnodesFileUrl = "https://raw.githubusercontent.com/eth-clients/merge-testnets/main/kintsugi/bootstrap_nodes.txt";
exports.bootEnrs = [];
//# sourceMappingURL=kintsugi.js.map