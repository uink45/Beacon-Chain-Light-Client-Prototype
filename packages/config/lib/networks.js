"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.networksChainConfig = exports.kintsugiChainConfig = exports.praterChainConfig = exports.mainnetChainConfig = void 0;
const mainnet_1 = require("./chainConfig/networks/mainnet");
Object.defineProperty(exports, "mainnetChainConfig", { enumerable: true, get: function () { return mainnet_1.mainnetChainConfig; } });
const prater_1 = require("./chainConfig/networks/prater");
Object.defineProperty(exports, "praterChainConfig", { enumerable: true, get: function () { return prater_1.praterChainConfig; } });
const kintsugi_1 = require("./chainConfig/networks/kintsugi");
Object.defineProperty(exports, "kintsugiChainConfig", { enumerable: true, get: function () { return kintsugi_1.kintsugiChainConfig; } });
exports.networksChainConfig = {
    mainnet: mainnet_1.mainnetChainConfig,
    prater: prater_1.praterChainConfig,
    kintsugi: kintsugi_1.kintsugiChainConfig,
};
//# sourceMappingURL=networks.js.map