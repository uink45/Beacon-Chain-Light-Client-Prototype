using System.Numerics;

namespace Nethermind.Decompose.Numerics
{
    public interface IReducer<T>
    {
        IReductionAlgorithm<T> Reduction { get; }
        T Modulus { get; }
        IResidue<T> ToResidue(T x);
        IResidue<T> ToResidue(int x);
    }
}
