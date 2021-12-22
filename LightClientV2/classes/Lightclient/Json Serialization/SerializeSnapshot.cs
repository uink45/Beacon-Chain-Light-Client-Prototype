using System.Collections.Generic;
using Nethermind.Core2.Crypto;
using Nethermind.Core2.Containers;
using Nethermind.Core2.Types;

namespace LightClientV2
{
    public class SerializeSnapshot
    {
        public LightClientUtility Utility;
        public Snapshot.Root Contents;
        public RetrieveData Query;

        public SerializeSnapshot()
        {
            Utility = new LightClientUtility();
            Query = new RetrieveData();
        }

        public LightClientUpdate InitializeSnapshot()
        {
            LightClientUpdate update = new LightClientUpdate();
            
            update.AttestedHeader = CreateHeader(Contents.data[0].header);
            update.NextSyncCommittee = CreateNextSyncCommittee(Contents.data[0].current_sync_committee);
            update.NextSyncCommitteeBranch = CreateNextSyncCommitteeBranch(Contents.data[0].current_sync_committee_branch);
            return update;
        }

        public BeaconBlockHeader CreateHeader(Snapshot.Header header)
        {  
            return new BeaconBlockHeader(
                new Slot(ulong.Parse(header.slot)),
                new ValidatorIndex(ulong.Parse(header.proposer_index)),
                Utility.ConvertHexStringToRoot(header.parent_root),
                Utility.ConvertHexStringToRoot(header.state_root),
                Utility.ConvertHexStringToRoot(header.body_root)
                );
        }

        public SyncCommittee CreateNextSyncCommittee(Snapshot.CurrentSyncCommittee nextSync)
        {
            return new SyncCommittee(CreateBlsPublicKeys(nextSync.pubkeys), Utility.ConvertStringToBlsPubKey(nextSync.aggregate_pubkey));
        }

        private BlsPublicKey[] CreateBlsPublicKeys(List<string> pubKeys)
        {
            BlsPublicKey[] publicKeys = new BlsPublicKey[Utility.Constant.SyncCommitteeSize];
            for (int i = 0; i < pubKeys.Count; i++)
            {
                publicKeys[i] = Utility.ConvertStringToBlsPubKey(pubKeys[i]);
            }
            return publicKeys;
        }

        private Root[] CreateNextSyncCommitteeBranch(List<string> next_sync_committee_branch)
        {
            Root[] branches = new Root[next_sync_committee_branch.Count];
            for (int i = 0; i < next_sync_committee_branch.Count; i++)
            {
                branches[i] = Utility.ConvertHexStringToRoot(next_sync_committee_branch[i]);
            }
            return branches;
        }

    }
}
