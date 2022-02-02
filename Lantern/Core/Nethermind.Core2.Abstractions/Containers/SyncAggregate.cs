using System.Collections;
using Nethermind.Core2.Crypto;

namespace Nethermind.Core2.Containers
{
    public class SyncAggregate
    {
        private BitArray syncCommitteeBits;
        private BlsSignature syncCommitteeSignature;

        public SyncAggregate()
        {
            syncCommitteeBits = new BitArray(0);
            syncCommitteeSignature = BlsSignature.Zero;
        }

        public SyncAggregate(BitArray _syncCommitteeBits, BlsSignature _syncCommitteeSignature)
        {
            syncCommitteeBits = _syncCommitteeBits;
            syncCommitteeSignature = _syncCommitteeSignature;
        }

        public BitArray SyncCommitteeBits { get { return syncCommitteeBits; } set { syncCommitteeBits = value; } }
        public BlsSignature SyncCommitteeSignature { get { return syncCommitteeSignature; } set { syncCommitteeSignature = value; } }

    }
}
