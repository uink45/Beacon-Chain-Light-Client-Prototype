namespace Nethermind.Decompose.Numerics
{
    public interface IPrimalityAlgorithm<T>
    {
        bool IsPrime(T n);
    }
}
