/// <reference types="node" />
import { ENR, ENRKey, ENRValue } from "@chainsafe/discv5";
import PeerId from "peer-id";
/**
 * `FileENR` is an `ENR` that saves the ENR contents to a file on every modification
 */
export declare class FileENR extends ENR {
    private filename;
    private localPeerId;
    constructor(filename: string, peerId: PeerId, kvs: Record<string, Uint8Array> | undefined, seq: bigint, signature: Buffer | null);
    static initFromFile(filename: string, peerId: PeerId): FileENR;
    static initFromENR(filename: string, peerId: PeerId, enr: ENR): FileENR;
    saveToFile(): void;
    set(key: ENRKey, value: ENRValue): this;
    delete(key: ENRKey): boolean;
}
//# sourceMappingURL=fileEnr.d.ts.map