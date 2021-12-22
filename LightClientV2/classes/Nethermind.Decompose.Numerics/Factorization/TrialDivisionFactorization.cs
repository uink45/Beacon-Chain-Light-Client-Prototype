using System;
using System.Collections.Generic;
using System.Linq;

namespace Nethermind.Decompose.Numerics
{
    public class TrialDivisionFactorization : IFactorizationAlgorithm<int>, IFactorizationAlgorithm<long>
    {
        /// <summary>
        /// Enumerates the prime factors, in order, of the supplied number.
        /// </summary>
        /// <param name="n">The number to be factored.</param>
        /// <returns>An enumeration of prime factors.</returns>
        public IEnumerable<int> Factor(int n)
        {
            if (n == 0)
                throw new ArgumentException("n");
            while ((n & 1) == 0)
            {
                yield return 2;
                n >>= 1;
            }
            while (n % 3 == 0)
            {
                yield return 3;
                n /= 3;
            }
            if (n == 1)
                yield break;
            int p = 5;
            int i = 2;
            while (true)
            {
                while (n % p == 0)
                {
                    yield return p;
                    n /= p;
                    if (n == 1)
                        yield break;
                }
                if (p * p > n)
                {
                    yield return n;
                    yield break;
                }
                p += i;
                i = 6 - i;
            }
        }

        public int GetDivisor(int n)
        {
            return Factor(n).First();
        }

        /// <summary>
        /// Enumerates the prime factors, in order, of the supplied number.
        /// </summary>
        /// <param name="n">The number to be factored.</param>
        /// <returns>An enumeration of prime factors.</returns>
        public IEnumerable<long> Factor(long n)
        {
            if (n < 2)
            {
                yield return n;
                yield break;
            }
            while ((n & 1) == 0)
            {
                yield return 2;
                n >>= 1;
            }
            while (n % 3 == 0)
            {
                yield return 3;
                n /= 3;
            }
            if (n == 1)
                yield break;
            long p = 5;
            long i = 2;
            while (true)
            {
                while (n % p == 0)
                {
                    yield return p;
                    n /= p;
                    if (n == 1)
                        yield break;
                }
                if (p * p > n)
                {
                    yield return n;
                    yield break;
                }
                p += i;
                i = 6 - i;
            }
        }

        public long GetDivisor(long n)
        {
            return Factor(n).First();
        }
    }
}
