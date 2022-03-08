"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toGraffitiBuffer = void 0;
const constants_1 = require("../constants");
/**
 * Parses a graffiti UTF8 string and returns a 32 bytes buffer right padded with zeros
 */
function toGraffitiBuffer(graffiti) {
    return Buffer.concat([Buffer.from(graffiti, "utf8"), Buffer.alloc(constants_1.GRAFFITI_SIZE, 0)], constants_1.GRAFFITI_SIZE);
}
exports.toGraffitiBuffer = toGraffitiBuffer;
//# sourceMappingURL=graffiti.js.map