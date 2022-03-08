#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const downloadTests_1 = require("./downloadTests");
/* eslint-disable no-console */
async function downloadTestsCli() {
    const [specVersion, outputDir, testsToDownloadCsv] = process.argv.slice(2);
    // Print help
    if (specVersion === "--help" || !specVersion || !outputDir) {
        return console.log(`
  USAGE: 
  
  eth2-spec-test-download [specVersion] [outputDir] [testToDownload]

  Downloads tests to $outputDir/$specVersion 

  EXAMPLE:

  eth2-spec-test-download v1.0.0 ./spec-tests general,mainnet

  Results in:

  ./spec-tests/tests/general/phase0/bls/aggregate
  ./spec-tests/tests/general/phase0/bls/aggregate_verify
  ./spec-tests/tests/general/phase0/bls/fast_aggregate_verify
  `);
    }
    const testsToDownload = testsToDownloadCsv ? testsToDownloadCsv.split(",") : undefined;
    await (0, downloadTests_1.downloadTests)({ specVersion, outputDir, testsToDownload }, console.log);
}
downloadTestsCli().catch((e) => {
    console.error(e);
    process.exit(1);
});
//# sourceMappingURL=downloadTestsCli.js.map