using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LightClientV2
{
    public class HeaderObject
    {
        public class SyncAggregate
        {
            public string sync_committee_bits { get; set; }
            public string sync_committee_signature { get; set; }
        }

        public class AttestedHeader
        {
            public string slot { get; set; }
            public string proposer_index { get; set; }
            public string parent_root { get; set; }
            public string state_root { get; set; }
            public string body_root { get; set; }
        }

        public class Data
        {
            public SyncAggregate sync_aggregate { get; set; }
            public AttestedHeader attested_header { get; set; }
        }

        public class Root
        {
            public Data data { get; set; }
        }
    }
}
