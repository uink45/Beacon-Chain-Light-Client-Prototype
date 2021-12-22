using System.Diagnostics;
using System.Numerics;
using Nethermind.Dirichlet.Numerics;

namespace Nethermind.Decompose.Numerics
{
    public class OldMillerRabin : IPrimalityAlgorithm<int>, IPrimalityAlgorithm<uint>, IPrimalityAlgorithm<long>, IPrimalityAlgorithm<ulong>, IPrimalityAlgorithm<UInt128>, IPrimalityAlgorithm<BigInteger>
    {
        private IRandomNumberGenerator generator = new MersenneTwister(0);
        private int k;

        public OldMillerRabin(int k)
        {
            this.k = k;
        }

        public bool IsPrime(int n)
        {
            return IsPrime((BigInteger)n);
        }

        public bool IsPrime(uint n)
        {
            return IsPrime((BigInteger)n);
        }

        public bool IsPrime(long n)
        {
            return IsPrime((BigInteger)n);
        }

        public bool IsPrime(ulong n)
        {
            return IsPrime((BigInteger)n);
        }

        public bool IsPrime(UInt128 n)
        {
            return IsPrime((BigInteger)n);
        }

        public bool IsPrime(BigInteger n)
        {
            if (n < 2)
                return false;
            if (n != 2 && n.IsEven)
                return false;
            var nMinusOne = n - 1;
            var s = nMinusOne;
            while (s.IsEven)
                s >>= 1;
            var random = generator.Create<BigInteger>();
            for (int i = 0; i < k; i++)
            {
                var a = random.Next(n - 4) + 2;
                var temp = s;
                var mod = BigInteger.ModPow(a, temp, n);
                while (temp != nMinusOne && mod != 1 && mod != nMinusOne)
                {
                    mod = mod * mod % n;
                    temp *= 2;
                }
                if (mod != nMinusOne && temp.IsEven)
                    return false;
            }
            return true;
        }
    }
}
