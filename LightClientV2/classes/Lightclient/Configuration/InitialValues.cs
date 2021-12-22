using Nethermind.Core2.Types;

namespace LightClientV2
{
    public class InitialValues
    {
        public Epoch GenesisEpoch { get; set; }

        public byte BlsWithdrawalPrefix { get; set; }
    }
}
