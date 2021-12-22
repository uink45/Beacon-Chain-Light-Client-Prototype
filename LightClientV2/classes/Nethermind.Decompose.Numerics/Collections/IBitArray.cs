using System.Collections.Generic;

namespace Nethermind.Decompose.Numerics
{
    public interface IBitArray : IArray<bool>
    {
        IEnumerable<int> GetNonZeroIndices();
    }
}
