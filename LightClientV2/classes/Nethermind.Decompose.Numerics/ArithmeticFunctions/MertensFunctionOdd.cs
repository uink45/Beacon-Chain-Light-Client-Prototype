using System;
using System.Diagnostics;
using System.Numerics;
using System.Threading;
using System.Threading.Tasks;

namespace Nethermind.Decompose.Numerics
{
    public class MertensFunctionOdd
    {
        private static BigInteger[] data10 = new BigInteger[]
        {
            BigInteger.Parse("1"),
            BigInteger.Parse("-2"),
            BigInteger.Parse("-4"),
            BigInteger.Parse("-14"),
            BigInteger.Parse("-40"),
            BigInteger.Parse("-57"),
            BigInteger.Parse("140"),
            BigInteger.Parse("569"),
            BigInteger.Parse("1076"),
            BigInteger.Parse("-2989"),
            BigInteger.Parse("-24032"),
            BigInteger.Parse("-41235"),
            BigInteger.Parse("114106"),
            BigInteger.Parse("191811"),
            BigInteger.Parse("-849354"),
            BigInteger.Parse("-5196"),
            BigInteger.Parse("1002624"),
        };

        public static BigInteger PowerOfTen(int i)
        {
            return data10[i];
        }
    }
}
