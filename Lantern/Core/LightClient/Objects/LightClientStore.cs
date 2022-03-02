using Nethermind.Core2.Containers;
using Nethermind.Core2.Crypto;

namespace Lantern
{
    public class LightClientStore
    {
        private BeaconBlockHeader finalizedHeader;
        private SyncCommittee currentSyncCommittee;
        private SyncCommittee nextSyncCommittee;
        private LightClientUpdate bestValidUpdate;
        private LightClientProofs proofs;
        private BeaconBlockHeader optimisticHeader;
        private int previousMaxActiveParticipants;
        private int currentMaxActiveParticipants;


        public LightClientStore()
        {
            finalizedHeader = new BeaconBlockHeader(Root.Zero);
            currentSyncCommittee = new SyncCommittee();
            nextSyncCommittee = new SyncCommittee();
            bestValidUpdate = new LightClientUpdate();
            proofs = new LightClientProofs();
            optimisticHeader = new BeaconBlockHeader(Root.Zero);
            previousMaxActiveParticipants = 0;
            currentMaxActiveParticipants = 0;
        }

        public LightClientStore(
            BeaconBlockHeader _finalizedHeader,
            SyncCommittee _currentSyncCommittee,
            SyncCommittee _nextSyncCommittee,
            LightClientUpdate _bestValidUpdate,
            LightClientProofs _proofs,
            BeaconBlockHeader _optimisticHeader,
            int _previousMaxActiveParticipants,
            int _currentMaxActiveParticipants
            )
        {
            finalizedHeader = _finalizedHeader;
            currentSyncCommittee = _currentSyncCommittee;
            nextSyncCommittee = _nextSyncCommittee;
            bestValidUpdate = _bestValidUpdate;
            proofs = _proofs;
            optimisticHeader = _optimisticHeader;
            previousMaxActiveParticipants = _previousMaxActiveParticipants;
            currentMaxActiveParticipants = _currentMaxActiveParticipants;
        }

        public BeaconBlockHeader FinalizedHeader { get { return finalizedHeader; } set { finalizedHeader = value; } }
        public SyncCommittee CurrentSyncCommittee { get { return currentSyncCommittee; } set { currentSyncCommittee = value; } }
        public SyncCommittee NextSyncCommittee { get { return nextSyncCommittee; } set { nextSyncCommittee = value; } }
        public LightClientUpdate BestValidUpdate { get { return bestValidUpdate; } set { bestValidUpdate = value; } }
        public LightClientProofs Proofs { get { return proofs; } set { proofs = value; } }
        public BeaconBlockHeader OptimisticHeader { get { return optimisticHeader; } set { optimisticHeader = value; } }
        public int PreviousMaxActiveParticipants { get { return previousMaxActiveParticipants; } set { previousMaxActiveParticipants = value; } }
        public int CurrentMaxActiveParticipants { get { return currentMaxActiveParticipants; } set { currentMaxActiveParticipants = value; } }



    }
}
