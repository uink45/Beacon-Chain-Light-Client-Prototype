"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SnappyFramesUncompress = void 0;
const bl_1 = __importDefault(require("bl"));
const snappyjs_1 = require("snappyjs");
const IDENTIFIER = Buffer.from([0x73, 0x4e, 0x61, 0x50, 0x70, 0x59]);
class SnappyFramesUncompress {
    constructor() {
        this.buffer = new bl_1.default();
        this.state = {
            foundIdentifier: false,
        };
    }
    /**
     * Accepts chunk of data containing some part of snappy frames stream
     * @param chunk
     * @return Buffer if there is one or more whole frames, null if it's partial
     */
    uncompress(chunk) {
        this.buffer.append(chunk);
        const result = new bl_1.default();
        while (this.buffer.length > 0) {
            if (this.buffer.length < 4)
                break;
            const type = getChunkType(this.buffer.get(0));
            const frameSize = getFrameSize(this.buffer, 1);
            const data = this.buffer.slice(4, 4 + frameSize);
            if (this.buffer.length - 4 < frameSize) {
                break;
            }
            this.buffer.consume(4 + frameSize);
            if (!this.state.foundIdentifier && type !== ChunkType.IDENTIFIER) {
                throw "malformed input: must begin with an identifier";
            }
            if (type === ChunkType.IDENTIFIER) {
                if (!data.equals(IDENTIFIER)) {
                    throw "malformed input: bad identifier";
                }
                this.state.foundIdentifier = true;
                continue;
            }
            if (type === ChunkType.COMPRESSED) {
                result.append((0, snappyjs_1.uncompress)(data.slice(4)));
            }
            if (type === ChunkType.UNCOMPRESSED) {
                result.append(data.slice(4));
            }
        }
        if (result.length === 0) {
            return null;
        }
        else {
            return result.slice();
        }
    }
    reset() {
        this.buffer = new bl_1.default();
        this.state = {
            foundIdentifier: false,
        };
    }
}
exports.SnappyFramesUncompress = SnappyFramesUncompress;
var ChunkType;
(function (ChunkType) {
    ChunkType[ChunkType["IDENTIFIER"] = 255] = "IDENTIFIER";
    ChunkType[ChunkType["COMPRESSED"] = 0] = "COMPRESSED";
    ChunkType[ChunkType["UNCOMPRESSED"] = 1] = "UNCOMPRESSED";
    ChunkType[ChunkType["PADDING"] = 254] = "PADDING";
})(ChunkType || (ChunkType = {}));
function getFrameSize(buffer, offset) {
    return buffer.get(offset) + (buffer.get(offset + 1) << 8) + (buffer.get(offset + 2) << 16);
}
function getChunkType(value) {
    switch (value) {
        case ChunkType.IDENTIFIER:
            return ChunkType.IDENTIFIER;
        case ChunkType.COMPRESSED:
            return ChunkType.COMPRESSED;
        case ChunkType.UNCOMPRESSED:
            return ChunkType.UNCOMPRESSED;
        case ChunkType.PADDING:
            return ChunkType.PADDING;
        default:
            throw new Error("Unsupported snappy chunk type");
    }
}
//# sourceMappingURL=uncompress.js.map