#define USE_RELIABLE_RANDOM
#define DIAG

using System;
using System.Collections.Generic;
using System.Linq;
using System.Numerics;
using System.Threading;
using System.Diagnostics;

namespace Nethermind.Decompose.Numerics
{
    public static class PollardRhoReduction
    {
        private class FactorizationAlgorithm<T> : IFactorizationAlgorithm<T>, IFactorizationAlgorithm<Number<T>>
        {
            const int batchSize = 100;
#if USE_RELIABLE_RANDOM
            private IRandomNumberAlgorithm<BigInteger> random = new MersenneTwister(0).Create<BigInteger>();
#else
            private IRandomNumberAlgorithm<T> random = new MersenneTwister(0).Create<T>();
#endif
            private IReductionAlgorithm<T> reduction;
            private IPrimalityAlgorithm<T> primality;

            public FactorizationAlgorithm(IReductionAlgorithm<T> reduction)
            {
                this.reduction = reduction;
                this.primality = MillerRabin.Create<T>(20, reduction);
            }

            public IEnumerable<T> Factor(T n)
            {
                return Factor((Number<T>)n).Select(i => (T)i);
            }

            public T GetDivisor(T n)
            {
                return GetDivisor((Number<T>)n);
            }

            public IEnumerable<Number<T>> Factor(Number<T> n)
            {
                if (n == 1)
                {
                    yield return 1;
                    yield break;
                }
                while (!primality.IsPrime(n))
                {
                    var divisor = GetDivisor(n);
                    if (divisor == 0 || divisor == 1)
                        yield break;
                    foreach (var factor in Factor(divisor))
                        yield return factor;
                    n /= divisor;
                }
                yield return n;
            }

            public Number<T> GetDivisor(Number<T> n)
            {
                var xInit = (Number<T>)random.Next(n);
                var c = (Number<T>)random.Next(n - 1) + 1;
                var reducer = reduction.GetReducer(n);
                return Rho(n, xInit, c, reducer);
            }

            private Number<T> Rho(Number<T> n, Number<T> xInit, Number<T> c, IReducer<T> reducer)
            {
#if DIAG
                Console.WriteLine("xInit = {0}, c = {1}", xInit, c);
#endif
                if (n.IsEven)
                    return 2;

                var x = reducer.ToResidue(xInit);
                var y = x.Copy();
                var ys = x.Copy();
                var r = (long)1;
                var m = batchSize;
                var cPrime = reducer.ToResidue(c);
                var one = reducer.ToResidue(1);
                var diff = one.Copy();
                var q = one.Copy();
                var g = (Number<T>)1;
                var count = (long)0;

                do
                {
                    x.Set(y);
                    for (int i = 0; i < r; i++)
                    {
                        AdvanceF(y, cPrime);
                        ++count;
                    }
                    var k = (long)0;
                    while (k < r && g == 1)
                    {
                        ys.Set(y);
                        var limit = Math.Min(m, r - k);
                        q.Set(one);
                        for (int i = 0; i < limit; i++)
                        {
                            AdvanceF(y, cPrime);
                            q.Multiply(diff.Set(x).Subtract(y));
                        }
                        g = Number<T>.GreatestCommonDivisor(q.Value, n);
                        k += limit;
                        count += limit << 1;
                    }
                    r <<= 1;
                }
                while (g == 1);
#if DIAG
                Console.WriteLine("count = {0}", count);
#endif

                if (g.CompareTo(n) == 0)
                {
                    // Backtrack.
                    do
                    {
                        AdvanceF(ys, cPrime);
                        g = Number<T>.GreatestCommonDivisor(diff.Set(x).Subtract(ys).Value, n);
                    }
                    while (g == 1);
                }

                if (g.CompareTo(n) == 0)
                    return 0;

                return g;
            }

            private static void AdvanceF(IResidue<T> x, IResidue<T> c)
            {
                x.Multiply(x).Add(c);
            }
        }

        public static IFactorizationAlgorithm<T> Create<T>(IReductionAlgorithm<T> reduction)
        {
            return new FactorizationAlgorithm<T>(reduction);
        }
    }
}
