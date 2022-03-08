import { BasicListType, List } from "@chainsafe/ssz";
import { ParticipationFlags, Uint8 } from "@chainsafe/lodestar-types";
import { MutableVector, PersistentVector, TransientVector } from "@chainsafe/persistent-ts";
import { Tree } from "@chainsafe/persistent-merkle-tree";
interface ICachedEpochParticipationOpts {
    type?: BasicListType<List<Uint8>>;
    tree?: Tree;
    persistent: MutableVector<ParticipationFlags>;
}
export declare class CachedEpochParticipation implements List<ParticipationFlags> {
    [index: number]: ParticipationFlags;
    type?: BasicListType<List<Uint8>>;
    tree?: Tree;
    persistent: MutableVector<ParticipationFlags>;
    constructor(opts: ICachedEpochParticipationOpts);
    get length(): number;
    get(index: number): ParticipationFlags | undefined;
    set(index: number, value: ParticipationFlags): void;
    updateAllStatus(data: PersistentVector<ParticipationFlags> | TransientVector<ParticipationFlags>): void;
    push(value: ParticipationFlags): number;
    pop(): ParticipationFlags;
    [Symbol.iterator](): Iterator<ParticipationFlags>;
    find(fn: (value: ParticipationFlags, index: number, list: this) => boolean): ParticipationFlags | undefined;
    findIndex(fn: (value: ParticipationFlags, index: number, list: this) => boolean): number;
    forEach(fn: (value: ParticipationFlags, index: number, list: this) => void): void;
    map<T>(fn: (value: ParticipationFlags, index: number) => T): T[];
    forEachStatus(fn: (value: ParticipationFlags, index: number, list: this) => void): void;
    mapStatus<T>(fn: (value: ParticipationFlags, index: number) => T): T[];
}
export declare const CachedEpochParticipationProxyHandler: ProxyHandler<CachedEpochParticipation>;
export {};
//# sourceMappingURL=cachedEpochParticipation.d.ts.map