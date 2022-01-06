using System.Collections;

namespace LightClientV2
{
    public class MetaData
    {
        private ulong seqNumber;
        private BitArray attNets;

        public MetaData()
        {
            seqNumber = 0;
            attNets = new BitArray(new NetworkConstants().AttestationSubnetCount);
        }

        public MetaData(ulong _seqNumber, BitArray _attNets)
        {
            seqNumber = _seqNumber;
            attNets = _attNets;
        }

        public ulong SeqNumber { get { return seqNumber; } }
        public BitArray AttNets { get { return attNets; } }
    }
}
