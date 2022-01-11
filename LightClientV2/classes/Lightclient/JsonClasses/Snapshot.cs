using System.Collections.Generic;

namespace LightClientV2
{
    public class Snapshot
    {
        public class Header
        {
            public string slot { get; set; }
            public string proposer_index { get; set; }
            public string parent_root { get; set; }
            public string state_root { get; set; }
            public string body_root { get; set; }
        }

        public class CurrentSyncCommittee
        {
            public List<string> pubkeys { get; set; }
            public string aggregate_pubkey { get; set; }
        }

        public class Data
        {
            public Header header { get; set; }
            public CurrentSyncCommittee current_sync_committee { get; set; }
            public List<string> current_sync_committee_branch { get; set; }
        }

        public class Root
        {
            public Data data { get; set; }
        }
    }
}
