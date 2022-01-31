using System.Collections.Generic;

namespace LightClientV2
{
    public class LightClientUpdateObject
    {
        public class AttestedHeader
        {
            public string slot { get; set; }
            public string proposer_index { get; set; }
            public string parent_root { get; set; }
            public string state_root { get; set; }
            public string body_root { get; set; }
        }

        public class NextSyncCommittee
        {
            public List<string> pubkeys { get; set; }
            public string aggregate_pubkey { get; set; }
        }

        public class FinalizedHeader
        {
            public string slot { get; set; }
            public string proposer_index { get; set; }
            public string parent_root { get; set; }
            public string state_root { get; set; }
            public string body_root { get; set; }
        }

        public class SyncCommitteeAggregate
        {
            public string sync_committee_bits { get; set; }
            public string sync_committee_signature { get; set; }
        }

        public class Datum
        {
            public AttestedHeader attested_header { get; set; }
            public NextSyncCommittee next_sync_committee { get; set; }
            public List<string> next_sync_committee_branch { get; set; }
            public FinalizedHeader finalized_header { get; set; }
            public List<string> finality_branch { get; set; }
            public SyncCommitteeAggregate sync_committee_aggregate { get; set; }
            public string fork_version { get; set; }
        }

        public class Root
        {
            public List<Datum> data { get; set; }
        }
    }
}
