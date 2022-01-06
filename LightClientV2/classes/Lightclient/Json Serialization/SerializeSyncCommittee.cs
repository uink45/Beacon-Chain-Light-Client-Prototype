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

        public LightClientUpdate InitializeSnapshot()
        {
            LightClientUpdate update = new LightClientUpdate();
            update.AttestedHeader = CreateHeader(Contents.data.header);
            update.NextSyncCommittee = CreateNextSyncCommittee(Contents.data.pubkeys, Contents.data.aggregate_pubkey);
            update.NextSyncCommitteeBranch = CreateNextSyncCommitteeBranch(Contents.data.current_sync_committee_branch);
            return update;
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

        public SyncCommittee CreateNextSyncCommittee(List<string> publicKeys, string aggregatePublicKey)
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
