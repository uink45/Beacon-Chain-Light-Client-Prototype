using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Numerics;

namespace Nethermind.Decompose.Numerics
{
    public static partial class IntegerMath
    {
        private static BigInteger limit = (BigInteger)int.MaxValue;
        private static BigInteger four = (BigInteger)4;
        private static BigInteger eight = (BigInteger)8;

        public static int JacobiSymbol(BigInteger m, BigInteger n)
        {
            if (n == 2)
                throw new InvalidOperationException("not an odd prime");
            int result = 1;
            while (true)
            {
                m = m % n;
                if (n <= limit)
                    return result * JacobiSymbol((int)m, (int)n);
                if (m.IsZero)
                    return 0;
                if (m.IsEven)
                {
                    int k = (int)(n % eight);
                    var toggle = k == 1 || k == 7 ? 1 : -1;
                    do
                    {
                        m >>= 1;
                        result *= toggle;
                    }
                    while (m.IsEven);
                }
                if (m.IsOne)
                    return result;
                if (!n.IsEven)
                {
                    if ((int)(m % four) == 3 && (int)(n % four) == 3)
                        result *= -1;
                    var tmp = m;
                    m = n;
                    n = tmp;
                }
            }
        }

        public static int JacobiSymbol(int m, int n)
        {
            int result = 1;
            while (true)
            {
                m = m % n;
                if (m == 0)
                    return 0;
                if ((m & 1) == 0)
                {
                    int k = n & 7;
                    int toggle = k == 1 || k == 7 ? 1 : -1;
                    do
                    {
                        m >>= 1;
                        result *= toggle;
                    }
                    while ((m & 1) == 0);
                }
                if (m == 1)
                    return result;
                if ((n & 1) != 0)
                {
                    if ((m & 3) == 3 && (n & 3) == 3)
                        result *= -1;
                    var tmp = m;
                    m = n;
                    n = tmp;
                }
            }
        }
    }
}
