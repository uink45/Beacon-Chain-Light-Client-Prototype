using Nethermind.Core2.Crypto;
using Nethermind.Core2.Types;
using Nethermind.Core2.Containers;
using Newtonsoft.Json;
using System.Collections.Generic;
namespace LightClientV2
{
    public class SerializeSyncCommittee
    {
        public LightClientUtility Utility;
        public SyncCommitteeObject.Root Contents;

        public SerializeSyncCommittee()
        {
            Utility = new LightClientUtility();
        }

        public void SerializeData(string text)
        {
            Contents = JsonConvert.DeserializeObject<SyncCommitteeObject.Root>(text);
        }

        public LightClientSnapshot InitializeSnapshot()
        {
            LightClientSnapshot snapshot = new LightClientSnapshot();
            snapshot.FinalizedHeader = CreateHeader(Contents.data.header);
            snapshot.CurrentSyncCommittee = CreateSyncCommittee(Contents.data.current_sync_committee_pubkeys, Contents.data.current_sync_committee_aggregate_pubkey);
            snapshot.CurrentSyncCommitteeBranch = CreateSyncCommitteeBranch(Contents.data.current_sync_committee_branch);
            return snapshot;
        }

        public BeaconBlockHeader CreateHeader(SyncCommitteeObject.Header header)
        {
            return new BeaconBlockHeader(
                new Slot(ulong.Parse(header.slot)),
                new ValidatorIndex(ulong.Parse(header.proposer_index)),
                Utility.ConvertHexStringToRoot(header.parent_root),
                Utility.ConvertHexStringToRoot(header.state_root),
                Utility.ConvertHexStringToRoot(header.body_root)
                );
        }

        public SyncCommittee CreateSyncCommittee(List<string> publicKeys, string aggregatePublicKey)
        {
            return new SyncCommittee(CreateBlsPublicKeys(publicKeys), Utility.ConvertStringToBlsPubKey(aggregatePublicKey));
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

        private Root[] CreateSyncCommitteeBranch(List<string> next_sync_committee_branch)
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
