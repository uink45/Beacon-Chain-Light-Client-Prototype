using System.Numerics;

namespace Nethermind.Decompose.Numerics
{
    public static partial class IntegerMath
    {
        public static int Binomial(int n, int k)
        {
            if (n < k)
                return 0;
            if (k == 0 || n == k)
                return 1;

            int delta;
            int max;

            if (k < n - k)
            {
                delta = n - k;
                max = k;
            }
            else
            {
                delta = k;
                max = n - k;
            }

            int result = delta + 1;
            for (int i = 2; i <= max; i++)
                result = (result * (delta + i)) / i;

            return result;
        }

        public static BigInteger Binomial(BigInteger n, BigInteger k)
        {
            if (n < k)
                return 0;
            if (k == 0 || n == k)
                return 1;

            var delta = (BigInteger)0;
            var max = (BigInteger)0;

            if (k < n - k)
            {
                delta = n - k;
                max = k;
            }
            else
            {
                delta = k;
                max = n - k;
            }

            var result = delta + 1;
            for (int i = 2; i <= max; i++)
                result = (result * (delta + i)) / i;

            return result;
        }
    }
}
