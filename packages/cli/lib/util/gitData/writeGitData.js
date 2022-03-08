#!/usr/bin/env node
"use strict";
/**
 * Persist git data and distribute through NPM so CLI consumers can know exactly
 * at what commit was this source build. This is also used in the metrics and to log initially.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const gitDataPath_1 = require("./gitDataPath");
const index_1 = require("./index");
/** Script to write the git data file (json) used by the build procedures to persist git data. */
(0, gitDataPath_1.writeGitDataFile)((0, index_1.forceUpdateGitData)());
//# sourceMappingURL=writeGitData.js.map