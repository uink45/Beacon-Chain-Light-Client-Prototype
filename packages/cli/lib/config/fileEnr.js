"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileENR = void 0;
const discv5_1 = require("@chainsafe/discv5");
const util_1 = require("../util");
/**
 * `FileENR` is an `ENR` that saves the ENR contents to a file on every modification
 */
class FileENR extends discv5_1.ENR {
    constructor(filename, peerId, kvs, seq, signature) {
        super(kvs, seq, signature);
        Object.setPrototypeOf(this, FileENR.prototype);
        this.filename = filename;
        this.localPeerId = peerId;
        return this;
    }
    static initFromFile(filename, peerId) {
        const enr = FileENR.decodeTxt((0, util_1.readFile)(filename));
        return this.initFromENR(filename, peerId, enr);
    }
    static initFromENR(filename, peerId, enr) {
        const kvs = Array.from(enr.entries()).reduce((obj, kv) => {
            obj[kv[0]] = kv[1];
            return obj;
        }, {});
        return new FileENR(filename, peerId, kvs, enr.seq, enr.signature);
    }
    saveToFile() {
        if (this.localPeerId === null || this.localPeerId === undefined)
            return;
        const keypair = (0, discv5_1.createKeypairFromPeerId)(this.localPeerId);
        (0, util_1.writeFile)(this.filename, this.encodeTxt(keypair.privateKey));
    }
    set(key, value) {
        super.set(key, value);
        this.saveToFile();
        return this;
    }
    delete(key) {
        const result = super.delete(key);
        this.saveToFile();
        return result;
    }
}
exports.FileENR = FileENR;
//# sourceMappingURL=fileEnr.js.map