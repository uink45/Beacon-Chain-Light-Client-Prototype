using System.Collections.Generic;

namespace Nethermind.Decompose.Numerics
{
    public interface IFactorizationAlgorithm<T>
    {
        IEnumerable<T> Factor(T n);
        T GetDivisor(T n);
    }
}
