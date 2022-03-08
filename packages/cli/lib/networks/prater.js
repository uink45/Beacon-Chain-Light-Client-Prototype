"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bootEnrs = exports.bootnodesFileUrl = exports.genesisFileUrl = exports.depositContractDeployBlock = exports.chainConfig = void 0;
const networks_1 = require("@chainsafe/lodestar-config/networks");
exports.chainConfig = networks_1.praterChainConfig;
/* eslint-disable max-len */
exports.depositContractDeployBlock = 4367322;
exports.genesisFileUrl = "https://raw.githubusercontent.com/eth2-clients/eth2-testnets/master/shared/prater/genesis.ssz";
exports.bootnodesFileUrl = "https://raw.githubusercontent.com/eth2-clients/eth2-testnets/master/shared/prater/bootstrap_nodes.txt";
exports.bootEnrs = [];
//# sourceMappingURL=prater.js.map