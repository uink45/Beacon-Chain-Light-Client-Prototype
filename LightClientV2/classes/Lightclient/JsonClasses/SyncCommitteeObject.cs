using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LightClientV2
{
    public class SyncCommitteeObject
    {
        //// Root myDeserializedClass = JsonConvert.DeserializeObject<SyncCommitteeObject.Root>(myJsonResponse);  

        public class Header
        {
            public string slot { get; set; }
            public string proposer_index { get; set; }
            public string parent_root { get; set; }
            public string state_root { get; set; }
            public string body_root { get; set; }
        }

        public class Data
        {
            public Header header { get; set; }
            public List<string> current_sync_committee_pubkeys { get; set; }
            public string current_sync_committee_aggregate_pubkey { get; set; }
            public List<string> current_sync_committee_branch { get; set; }
            public List<string> next_sync_committee_pubkeys { get; set; }
            public string next_sync_committee_aggregate_pubkey { get; set; }
            public List<string> next_sync_committee_branch { get; set; }
        }

        public class Root
        {
            public Data data { get; set; }
        }
    }
}
