using System.Numerics;

namespace Nethermind.Decompose.Numerics
{
    public interface IReductionAlgorithm<T>
    {
        IReducer<T> GetReducer(T n);
    }
}
