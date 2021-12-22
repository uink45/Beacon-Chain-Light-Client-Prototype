using Nethermind.Core2.Types;
namespace LightClientV2
{
    public class GweiValues
    {
        public Gwei EffectiveBalanceIncrement { get; set; }
        public Gwei EjectionBalance { get; set; }
        public Gwei MaximumEffectiveBalance { get; set; }
    }
}
