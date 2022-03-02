using Nethermind.Core2.Crypto;
using Nethermind.Core2.Types;
using Nethermind.Core2.Containers;
using Newtonsoft.Json;
using System.Collections.Generic;
using System;
namespace Lantern
{
    public class SerializeProofs
    {
        public LightClientUtility Utility;
        public ProofsObject.Root Contents;


        public SerializeProofs()
        {
            Utility = new LightClientUtility();
        }

        public void SerializeData(string text)
        {
            Contents = JsonConvert.DeserializeObject<ProofsObject.Root>(text);
        }

        public LightClientProofs InitializeProofs()
        {
            LightClientProofs proofs = new LightClientProofs();
            proofs.Offsets = Contents.proofs.offsets;
            proofs.Leaves = CreateLeaves(Contents.proofs.leaves);
            proofs.Balance = Contents.value;
            return proofs;
        }


        public List<Root> CreateLeaves(List<string> leaves)
        {
            List<Root> result = new List<Root>();
            for(int i = 0; i < leaves.Count; i++)
            {
                result.Add(Utility.ConvertHexStringToRoot(leaves[i]));
            }
            return result;
        }
    }
}
