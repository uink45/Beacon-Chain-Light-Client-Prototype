using Nethermind.Core2.Containers;
using Nethermind.Core2.Types;
using Nethermind.Core2.Crypto;

namespace Lantern
{
    public class LightClientSnapshot
    {
        private BeaconBlockHeader finalizedHeader;
        private SyncCommittee currentSyncCommittee;
        private Root[] currentSyncCommitteeBranch;

        public LightClientSnapshot()
        {
            finalizedHeader = null;
            currentSyncCommittee = new SyncCommittee();
            currentSyncCommitteeBranch = InitializeArray<Root>(4);
        }

        public LightClientSnapshot(
            BeaconBlockHeader _finalizedHeader,
            SyncCommittee _currentSyncCommittee,
            Root[] _currentSyncCommitteeBranch)
        {
            finalizedHeader = _finalizedHeader;
            currentSyncCommittee = _currentSyncCommittee;
            currentSyncCommitteeBranch = _currentSyncCommitteeBranch;
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

        public BeaconBlockHeader FinalizedHeader { get { return finalizedHeader; } set { finalizedHeader = value; } }
        public SyncCommittee CurrentSyncCommittee { get { return currentSyncCommittee; } set { currentSyncCommittee = value; } }
        public Root[] CurrentSyncCommitteeBranch { get { return currentSyncCommitteeBranch; } set { currentSyncCommitteeBranch = value; } }

    }
}
