namespace Nethermind.Decompose.Numerics
{
    public interface IDivisionAlgorithm<TDividend, TDivisor>
    {
        TDivisor Divisor { get; }
        TDividend Divide(TDividend k);
        TDivisor Modulus(TDividend k);
        bool IsDivisible(TDividend k);
    }
}
