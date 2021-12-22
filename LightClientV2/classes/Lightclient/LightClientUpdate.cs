using Nethermind.Core2.Containers;
using Nethermind.Core2.Types;
using Nethermind.Core2.Crypto;
using System.Linq;
namespace LightClientV2
{
    public class LightClientUpdate
    {
        private BeaconBlockHeader attestedHeader;
        private SyncCommittee nextSyncCommittee;
        private Root[] nextSyncCommitteeBranch;
        private BeaconBlockHeader finalizedHeader;
        private Root[] finalityBranch;
        private SyncAggregate syncAggregate;
        private ForkVersion forkVersion;

        public LightClientUpdate()
        {
            attestedHeader = null;
            nextSyncCommittee = new SyncCommittee();
            nextSyncCommitteeBranch = InitializeArray<Root>(4);
            finalityBranch = InitializeArray<Root>(5);
            finalizedHeader = null;
            syncAggregate = new SyncAggregate();
            forkVersion = ForkVersion.Zero;
        }

        public LightClientUpdate(
            BeaconBlockHeader _attestedHeader,
            SyncCommittee _nextSyncCommittee,
            Root[] _nextSyncCommitteeBranch,
            BeaconBlockHeader _finalizedHeader,
            Root[] _finalityBranch,
            SyncAggregate _syncAggregate,
            ForkVersion _forkVersion)
        {
            attestedHeader = _attestedHeader;
            nextSyncCommittee = _nextSyncCommittee;
            nextSyncCommitteeBranch = _nextSyncCommitteeBranch;
            finalizedHeader = _finalizedHeader;
            finalityBranch = _finalityBranch;
            syncAggregate = _syncAggregate;
            forkVersion = _forkVersion;
        }

        public T[] InitializeArray<T>(int length) where T : new()
        {
            T[] array = new T[length + 1];
            for (int i = 0; i < length + 1; ++i)
            {
                array[i] = new T();
            }

            return array;
        }

        public BeaconBlockHeader AttestedHeader { get { return attestedHeader; } set { attestedHeader = value; } }
        public SyncCommittee NextSyncCommittee { get { return nextSyncCommittee; } set { nextSyncCommittee = value; } }
        public Root[] NextSyncCommitteeBranch { get { return nextSyncCommitteeBranch; } set { nextSyncCommitteeBranch = value; } }
        public BeaconBlockHeader FinalizedHeader { get { return finalizedHeader; } set { finalizedHeader = value; } }
        public Root[] FinalityBranch { get { return finalityBranch; } set { finalityBranch = value; } }
        public SyncAggregate SyncAggregate { get { return syncAggregate; } set { syncAggregate = value; } }
        public ForkVersion ForkVersion { get { return forkVersion; } set { forkVersion = value; } }
    }
}
