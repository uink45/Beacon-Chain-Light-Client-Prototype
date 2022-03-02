using System.Collections.Generic;

namespace Lantern
{
    public class ProofsObject
    {
        public class Proofs
        {
            public string type { get; set; }
            public List<int> offsets { get; set; }
            public List<string> leaves { get; set; }
        }

        public class Root
        {
            public Proofs proofs { get; set; }
            public long value { get; set; }
        }
    }
}
