using System.Collections;
using System.Collections.Generic;
using Nethermind.Core2.Crypto;
using Nethermind.Core2.Containers;
using Nethermind.Core2.Types;
using Newtonsoft.Json;

namespace LightClientV2
{
    public class SerializeLightClientUpdate
    {
        private LightClientUtility Utility;
        private UpdateRoot Contents;

        public SerializeLightClientUpdate(string text)
        {
            Utility = new LightClientUtility();
            Contents = ParseLightClientUpdate(text);
        }

        public UpdateRoot ParseLightClientUpdate(string text)
        {
            return JsonConvert.DeserializeObject<UpdateRoot>(text); ;
        }

        public List<LightClientUpdate> InitializeUpdates()
        {
            List<LightClientUpdate> updates = new List<LightClientUpdate>();
            for (int i = 0; i < Contents.data.Count; i++)
            {
                updates.Add(
                    ClientUpdate(Contents.data[i].header, Contents.data[i].next_sync_committee,
                    Contents.data[i].next_sync_committee_branch,
                    Contents.data[i].finality_header,
                    Contents.data[i].finality_branch,
                    Contents.data[i].sync_committee_bits,
                    Contents.data[i].sync_committee_signature,
                    Contents.data[i].fork_version));
            }
            return updates;
        }

        private LightClientUpdate ClientUpdate(Header header, NextSyncCommittee nextSync, List<string> next_sync_committee_branch,
            FinalityHeader finality_header, List<string> finality_branch, string sync_committee_bits, string sync_committee_signature, string fork_version)
        {
            LightClientUpdate update = new LightClientUpdate(
                CreateHeader(header),
                CreateNextSyncCommittee(nextSync),
                CreateNextSyncCommitteeBranch(next_sync_committee_branch),
                CreateFinalityHeader(finality_header),
                CreateFinalityBranch(finality_branch),
                new SyncAggregate(CreateSyncCommitteeBits(sync_committee_bits),CreateSyncCommitteeSignature(sync_committee_signature)),
                CreateForkVersion(fork_version)
                );
            return update;
        }

        private BeaconBlockHeader CreateHeader(Header header)
        {
            return new BeaconBlockHeader(
                new Slot(ulong.Parse(header.slot)),
                new ValidatorIndex(ulong.Parse(header.proposer_index)),
                Utility.ConvertHexStringToRoot(header.parent_root),
                Utility.ConvertHexStringToRoot(header.state_root),
                Utility.ConvertHexStringToRoot(header.body_root)
                );
        }

        public SyncCommittee CreateNextSyncCommittee(NextSyncCommittee nextSync)
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

        private BeaconBlockHeader CreateFinalityHeader(FinalityHeader finality_header)
        {
            return new BeaconBlockHeader(
                new Slot(ulong.Parse(finality_header.slot)),
                new ValidatorIndex(ulong.Parse(finality_header.proposer_index)),
                Utility.ConvertHexStringToRoot(finality_header.parent_root),
                Utility.ConvertHexStringToRoot(finality_header.state_root),
                Utility.ConvertHexStringToRoot(finality_header.body_root)
                );
        }

        private Root[] CreateFinalityBranch(List<string> finality_branch)
        {
            Root[] branches = new Root[finality_branch.Count];
            for (int i = 0; i < finality_branch.Count; i++)
            {
                branches[i] = Utility.ConvertHexStringToRoot(finality_branch[i]);
            }
            return branches;
        }

        private BitArray CreateSyncCommitteeBits(string sync_committee_bits)
        {
            return Utility.StringToBitArray(sync_committee_bits);
        }

        private BlsSignature CreateSyncCommitteeSignature(string sync_committee_signature)
        {
            return Utility.ConvertStringToBlsSignature(sync_committee_signature);
        }

        private ForkVersion CreateForkVersion(string fork_version)
        {
            return Utility.ConvertStringToForkVersion(fork_version);
        }
    }
}
