using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Numerics;

namespace Nethermind.Decompose.Numerics
{
    public class MertensFunction
    {
        private static BigInteger[] data10 = new BigInteger[]
        {
            BigInteger.Parse("0"),
            BigInteger.Parse("-1"),
            BigInteger.Parse("1"),
            BigInteger.Parse("2"),
            BigInteger.Parse("-23"),
            BigInteger.Parse("-48"),
            BigInteger.Parse("212"),
            BigInteger.Parse("1037"),
            BigInteger.Parse("1928"),
            BigInteger.Parse("-222"),
            BigInteger.Parse("-33722"),
            BigInteger.Parse("-87856"),
            BigInteger.Parse("62366"),
            BigInteger.Parse("599582"),
            BigInteger.Parse("-875575"),
            BigInteger.Parse("-3216373"),
            BigInteger.Parse("-3195437"),
            BigInteger.Parse("-21830254"), // vs. -21830259 in http://oeis.org/A084237
            BigInteger.Parse("-46758740"),
            BigInteger.Parse("899990187"),
            BigInteger.Parse("461113106"), // from http://arxiv.org/pdf/1108.0135v1.pdf
            BigInteger.Parse("3395895277"), // from http://arxiv.org/pdf/1108.0135v1.pdf
            BigInteger.Parse("-2061910120"), // from http://arxiv.org/pdf/1108.0135v1.pdf
        };

        public static BigInteger PowerOfTen(int i)
        {
            return data10[i];
        }
    }
}
