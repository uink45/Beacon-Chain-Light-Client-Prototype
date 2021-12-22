using System.Collections.Generic;

namespace LightClientV2
{
        public class validator
        {
            public string pubkey { get; set; }
            public string withdrawal_credentials { get; set; }
            public string effective_balance { get; set; }
            public bool slashed { get; set; }
            public string activation_eligibility_epoch { get; set; }
            public string activation_epoch { get; set; }
            public string exit_epoch { get; set; }
            public string withdrawable_epoch { get; set; }
        }

        public class Datum
        {
            public string index { get; set; }
            public string balance { get; set; }
            public string status { get; set; }
            public validator validator { get; set; }
        }

        public class PubKeyRoot
        {
            public List<Datum> data { get; set; }
        }

}
