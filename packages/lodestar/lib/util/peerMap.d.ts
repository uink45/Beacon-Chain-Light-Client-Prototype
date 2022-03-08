import PeerId from "peer-id";
export declare class PeerSet {
    private peerMap;
    add(peer: PeerId): void;
    delete(peer: PeerId): boolean;
    has(peer: PeerId): boolean;
    get size(): number;
    values(): PeerId[];
}
/**
 * Special ES6 Map that allows using PeerId objects as indexers
 * Also, uses a WeakMap to reduce unnecessary calls to `PeerId.toB58String()`
 */
export declare class PeerMap<T> {
    private map;
    private peers;
    static from(peers: PeerId[]): PeerMap<void>;
    set(peer: PeerId, value: T): void;
    get(peer: PeerId): T | undefined;
    has(peer: PeerId): boolean;
    delete(peer: PeerId): boolean;
    get size(): number;
    keys(): PeerId[];
    values(): T[];
    entries(): [PeerId, T][];
    /**
     * Caches peerId.toB58String result in a WeakMap
     */
    private getPeerIdString;
}
//# sourceMappingURL=peerMap.d.ts.map