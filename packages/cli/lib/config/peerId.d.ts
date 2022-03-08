import PeerId from "peer-id";
export declare function createPeerId(): Promise<PeerId>;
export declare function writePeerId(filepath: string, peerId: PeerId): void;
export declare function readPeerId(filepath: string): Promise<PeerId>;
export declare function initPeerId(filepath: string): Promise<void>;
//# sourceMappingURL=peerId.d.ts.map