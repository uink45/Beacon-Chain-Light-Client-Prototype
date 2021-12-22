using System.Numerics;

namespace Nethermind.Decompose.Numerics
{
    public static partial class IntegerMath
    {
        public static int ModularSquareRoot(BigInteger n, int p)
        {
            return (int)ModularSquareRoot(n, (BigInteger)p);
        }

        public static BigInteger ModularSquareRoot(BigInteger n, BigInteger p)
        {
            var r = ModularSquareRootCore(n, p);
            if (r > p / 2)
                return p - r;
            return r;
        }

        private static BigInteger ModularSquareRootCore(BigInteger n, BigInteger p)
        {
            if (p == 2)
                return BigInteger.One;
            var q = p - 1;
            var s = 0;
            while (q.IsEven)
            {
                q >>= 1;
                ++s;
            }
            if (s == 1)
                return ModularPower(n, (p + 1) / 4, p);
            var z = (BigInteger)2;
            while (JacobiSymbol(z, p) != -1)
                ++z;
            var c = ModularPower(z, q, p);
            var r = ModularPower(n, (q + 1) / 2, p);
            var t = ModularPower(n, q, p);
            var m = s;
            while (!t.IsOne)
            {
                int i = 0;
                var k = t;
                while (!k.IsOne)
                {
                    k = k * k % p;
                    ++i;
                }
                var b = ModularPower(c, BigInteger.Pow(2, m - i - 1), p);
                r = r * b % p;
                var b2 = b * b % p;
                t = t * b2 % p;
                c = b2;
                m = i;
            }
            return r;
        }
    }
}
