using System.Collections.Generic;

namespace Nethermind.Decompose.Numerics
{
    public interface INullSpaceAlgorithm<TArray, TMatrix>
    {
        IEnumerable<TArray> Solve(TMatrix matrix);
    }
}
