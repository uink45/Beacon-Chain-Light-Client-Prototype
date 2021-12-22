using System.Diagnostics;
using System.Numerics;

namespace Nethermind.Decompose.Numerics
{
    public static class MillerRabin
    {
        private class PrimalityAlgorithm<T> : IPrimalityAlgorithm<T>, IPrimalityAlgorithm<Number<T>>
        {
            private IReductionAlgorithm<T> reduction;
            private IRandomNumberAlgorithm<Number<T>> random = new RandomInteger<T>(0);
            private int k;

            public PrimalityAlgorithm(int k, IReductionAlgorithm<T> reduction)
            {
                this.k = k;
                this.reduction = reduction;
            }

            public bool IsPrime(T n)
            {
                return IsPrime((Number<T>)n);
            }

            public bool IsPrime(Number<T> n)
            {
                if (n < 2)
                    return false;
                if (n == 2 || n == 3)
                    return true;
                if (n.IsEven)
                    return false;
                var reducer = reduction.GetReducer(n);
                var s = 0;
                var d = n - 1;
                while (d.IsEven)
                {
                    d >>= 1;
                    ++s;
                }
                var nMinusOne = reducer.ToResidue(n - 1);
                var x = reducer.ToResidue(0);
                for (int i = 0; i < k; i++)
                {
                    var a = random.Next(n - 4) + 2;
                    x.Set(a).Power(d);
                    if (x.IsOne || x.Equals(nMinusOne))
                        continue;
                    for (int r = 1; r < s; r++)
                    {
                        x.Multiply(x);
                        if (x.IsOne)
                            return false;
                        if (x.Equals(nMinusOne))
                            break;
                    }
                    if (!x.Equals(nMinusOne))
                        return false;
                }
                return true;
            }
        }

        public static IPrimalityAlgorithm<T> Create<T>(int k, IReductionAlgorithm<T> reduction)
        {
            return new PrimalityAlgorithm<T>(k, reduction);
        }
    }
}
