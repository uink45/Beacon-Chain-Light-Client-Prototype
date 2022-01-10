using System;
using Nethermind.Core2.Containers;
using Nethermind.Core2.Types;
using Newtonsoft.Json;
namespace LightClientV2
{
    public class SerializeHeaderUpdate
    {
        public LightClientUtility Utility;
        public AltairBlock.Root Contents;

        public SerializeHeaderUpdate()
        {
            Utility = new LightClientUtility();
        }

        public void SerializeData(string text)
        {
            Contents = JsonConvert.DeserializeObject<AltairBlock.Root>(text);
        }

        public LightClientUpdate InitializeHeaderUpdate()
        {
            LightClientUpdate update = new LightClientUpdate();
            update.AttestedHeader = CreateHeader(Contents.data);
            update.SyncAggregate = CreateSyncAggregate(Contents.data.message.body.sync_aggregate.sync_committee_bits, Contents.data.message.body.sync_aggregate.sync_committee_signature);
            update.ForkVersion = Utility.ConvertStringToForkVersion("0x01000000");
            return update;
        }

        public BeaconBlockHeader CreateHeader(AltairBlock.Data data)
        {
            return new BeaconBlockHeader(
                new Slot(ulong.Parse(data.message.slot)),
                new ValidatorIndex(ulong.Parse(data.message.proposer_index)),
                Utility.ConvertHexStringToRoot(data.message.parent_root),
                Utility.ConvertHexStringToRoot(data.message.state_root),
                Utility.ConvertHexStringToRoot(data.beacon_block_root)
                );
        }

        public SyncAggregate CreateSyncAggregate(string syncBits, string syncCommitteeSignature)
        {
            return new SyncAggregate(Utility.StringToBitArray(syncBits), Utility.ConvertStringToBlsSignature(syncCommitteeSignature));
        }

        
    }
}
