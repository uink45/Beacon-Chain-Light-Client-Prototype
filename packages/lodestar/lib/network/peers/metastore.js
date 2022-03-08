"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Libp2pPeerMetadataStore = void 0;
const lodestar_types_1 = require("@chainsafe/lodestar-types");
/**
 * Wrapper around Libp2p.peerstore.metabook
 * that uses ssz serialization to store data
 */
class Libp2pPeerMetadataStore {
    constructor(metabook) {
        this.metabook = metabook;
        const number64Serdes = typeToSerdes(lodestar_types_1.ssz.Number64);
        const metadataV2Serdes = typeToSerdes(lodestar_types_1.ssz.altair.Metadata);
        const stringSerdes = {
            serialize: (v) => Buffer.from(v, "utf8"),
            deserialize: (b) => Buffer.from(b).toString("utf8"),
        };
        const floatSerdes = {
            serialize: (f) => Buffer.from(String(f), "utf8"),
            deserialize: (b) => parseFloat(Buffer.from(b).toString("utf8")),
        };
        this.encoding = this.typedStore("encoding", stringSerdes);
        // Discard existing `metadata` stored values. Store both phase0 and altair Metadata objects as altair
        // Serializing altair.Metadata instead of phase0.Metadata has a cost of just `SYNC_COMMITTEE_SUBNET_COUNT // 8` bytes
        this.metadata = this.typedStore("metadata-altair", metadataV2Serdes);
        this.rpcScore = this.typedStore("score", floatSerdes);
        this.rpcScoreLastUpdate = this.typedStore("score-last-update", number64Serdes);
    }
    typedStore(key, type) {
        return {
            set: (peer, value) => {
                if (value != null) {
                    // TODO: fix upstream type (which also contains @ts-ignore)
                    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                    // @ts-ignore
                    this.metabook.set(peer, key, Buffer.from(type.serialize(value)));
                }
                else {
                    this.metabook.deleteValue(peer, key);
                }
            },
            get: (peer) => {
                const value = this.metabook.getValue(peer, key);
                return value ? type.deserialize(value) : undefined;
            },
        };
    }
}
exports.Libp2pPeerMetadataStore = Libp2pPeerMetadataStore;
function typeToSerdes(type) {
    return {
        serialize: (v) => type.serialize(v),
        deserialize: (b) => type.deserialize(b),
    };
}
//# sourceMappingURL=metastore.js.map