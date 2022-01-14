using Nethermind.Core2.Crypto;
using Nethermind.Core2.Types;
using Nethermind.Core2.Containers;
using Newtonsoft.Json;
using System.Collections.Generic;

namespace LightClientV2
{
    public class SerializeHeader
    {
        public LightClientUtility Utility;
        public HeaderObject.Root Contents;

        public SerializeHeader()
        {
            Utility = new LightClientUtility();
        }

        public void SerializeData(string text)
        {
            Contents = JsonConvert.DeserializeObject<HeaderObject.Root>(text);
        }

        public LightClientUpdate InitializeHeader()
        {
            LightClientUpdate update = new LightClientUpdate();
            update.AttestedHeader = CreateHeader(Contents.data);
            update.SyncAggregate = CreateSyncAggregate(Contents.data.sync_aggregate.sync_committee_bits, Contents.data.sync_aggregate.sync_committee_signature);
            update.ForkVersion = Utility.ConvertStringToForkVersion("0x01000000");
            return update;
        }

        public BeaconBlockHeader CreateHeader(HeaderObject.Data data)
        {
            return new BeaconBlockHeader(
                new Slot(ulong.Parse(data.attested_header.slot)),
                new ValidatorIndex(ulong.Parse(data.attested_header.proposer_index)),
                Utility.ConvertHexStringToRoot(data.attested_header.parent_root),
                Utility.ConvertHexStringToRoot(data.attested_header.state_root),
                Utility.ConvertHexStringToRoot(data.attested_header.body_root)
                );
        }

        public SyncAggregate CreateSyncAggregate(string syncBits, string syncCommitteeSignature)
        {
            return new SyncAggregate(Utility.StringToBitArray(syncBits), Utility.ConvertStringToBlsSignature(syncCommitteeSignature));
        }
    }
}
