using Nethermind.Core2.Crypto;
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
            proofs.Leaf = Utility.ToObject(Contents.stringLeaf, "Root");
            proofs.Proof = CreateLeaves(Contents.proof);
            proofs.Gindex = ulong.Parse(Contents.index);
            proofs.Balance = Contents.value;
            return proofs;
        }


        public List<Root> CreateLeaves(List<string> proof)
        {
            List<Root> result = new List<Root>();
            for(int i = 0; i < proof.Count; i++)
            {
                result.Add(Utility.ToObject(proof[i], "Root"));
            }
            return result;
        }
    }
}
