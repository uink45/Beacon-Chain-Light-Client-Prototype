namespace Lantern
{
    public class StoreObject
    {
        public class FinalizedHeader
        {
            public string slot { get; set; }
            public string proposer_index { get; set; }
            public string block_root { get; set; }
            public string parent_root { get; set; }
            public string state_root { get; set; }
            public string body_root { get; set; }
        }
    }
}
