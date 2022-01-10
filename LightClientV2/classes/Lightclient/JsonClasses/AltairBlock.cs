using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LightClientV2
{
    public class AltairBlock
    {
        public class Eth1Data
        {
            public string deposit_root { get; set; }
            public string deposit_count { get; set; }
            public string block_hash { get; set; }
        }

        public class Source
        {
            public string epoch { get; set; }
            public string root { get; set; }
        }

        public class Target
        {
            public string epoch { get; set; }
            public string root { get; set; }
        }

        public class Data
        {
            public string slot { get; set; }
            public string index { get; set; }
            public string beacon_block_root { get; set; }
            public Source source { get; set; }
            public Target target { get; set; }
            public Message message { get; set; }
            public string signature { get; set; }
        }

        public class Attestation
        {
            public string aggregation_bits { get; set; }
            public Data data { get; set; }
            public string signature { get; set; }
        }

        public class SyncAggregate
        {
            public string sync_committee_bits { get; set; }
            public string sync_committee_signature { get; set; }
        }

        public class Body
        {
            public string randao_reveal { get; set; }
            public Eth1Data eth1_data { get; set; }
            public string graffiti { get; set; }
            public List<object> proposer_slashings { get; set; }
            public List<object> attester_slashings { get; set; }
            public List<Attestation> attestations { get; set; }
            public List<object> deposits { get; set; }
            public List<object> voluntary_exits { get; set; }
            public SyncAggregate sync_aggregate { get; set; }
        }

        public class Message
        {
            public string slot { get; set; }
            public string proposer_index { get; set; }
            public string parent_root { get; set; }
            public string state_root { get; set; }
            public Body body { get; set; }
        }

        public class Root
        {
            public string version { get; set; }
            public Data data { get; set; }
        }
    }
}
