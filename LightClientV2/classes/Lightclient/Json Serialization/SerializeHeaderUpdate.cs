﻿
using Nethermind.Core2.Containers;
using Nethermind.Core2.Types;
using Newtonsoft.Json;
namespace LightClientV2
{
    public class SerializeHeaderUpdate
    {
        public LightClientUtility Utility;
        public BeaconBlockHeaderObject.Root Contents;

        public SerializeHeaderUpdate()
        {
            Utility = new LightClientUtility();
        }

        public BeaconBlockHeaderObject.Root ParseBeaconBlockHeaderUpdate(string text)
        {
            return JsonConvert.DeserializeObject<BeaconBlockHeaderObject.Root>(text);
        }

        public SyncAggregate CreateSyncAggregate(string syncBits, string syncCommitteeSignature)
        {
            return new SyncAggregate(Utility.StringToBitArray(syncBits), Utility.ConvertStringToBlsSignature(syncCommitteeSignature));
        }

        public BeaconBlockHeader CreateBeaconBlockHeader(string slot, string validatorIndex, string parentRoot, string stateRoot, string bodyRoot)
        {
            return new BeaconBlockHeader(
                new Slot(ulong.Parse(slot)),
                new ValidatorIndex(ulong.Parse(validatorIndex)),
                Utility.ConvertHexStringToRoot(parentRoot),
                Utility.ConvertHexStringToRoot(stateRoot),
                Utility.ConvertHexStringToRoot(bodyRoot));
        }
    }
}
