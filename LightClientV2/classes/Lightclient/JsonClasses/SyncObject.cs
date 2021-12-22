using System.Collections.Generic;

namespace LightClientV2
{
    public class Data
    {
        public List<string> validators { get; set; }
        public List<List<string>> validator_aggregates { get; set; }
    }
    public class SyncRoot
    {
        public Data data { get; set; }
    }
}
