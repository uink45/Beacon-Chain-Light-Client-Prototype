using Nethermind.Core2.Types;

namespace Lantern
{
    /// <summary>
    /// Gwei values for beacon chain as defined in
    /// https://github.com/ethereum/consensus-specs/blob/dev/specs/phase0/beacon-chain.md.
    /// </summary>
    public class GweiValues
    {
        public Gwei EffectiveBalanceIncrement { get; set; }
        public Gwei EjectionBalance { get; set; }
        public Gwei MaximumEffectiveBalance { get; set; }
    }
}
