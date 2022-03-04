using System.Collections.Generic;
using Nethermind.Core2.Crypto;
using Nethermind.Core2.Containers;
using Nethermind.Core2.Types;
using Newtonsoft.Json;
using System;
namespace Lantern
{
    public class SerializeSnapshot
    {
        public LightClientUtility Utility;
        public Snapshot.Root Contents;

        public SerializeSnapshot()
        {
            Utility = new LightClientUtility();
        }

        public void SerializeData(string text)
        {
            Contents = JsonConvert.DeserializeObject<Snapshot.Root>(text);
        }

        public LightClientSnapshot InitializeSnapshot()
        {
            LightClientSnapshot snapshot = new LightClientSnapshot();
            snapshot.FinalizedHeader = CreateHeader(Contents.data.header);
            snapshot.CurrentSyncCommittee = CreateNextSyncCommittee(Contents.data.current_sync_committee);
            snapshot.CurrentSyncCommitteeBranch = CreateNextSyncCommitteeBranch(Contents.data.current_sync_committee_branch);
            return snapshot;
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
