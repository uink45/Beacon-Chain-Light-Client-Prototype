using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Numerics;
using Nethermind.Dirichlet.Numerics;

namespace Nethermind.Decompose.Numerics
{
    public static class NumericExtensions
    {
        public static int ModularSum(this IEnumerable<int> source, int n)
        {
            return source.Aggregate(0, (sofar, current) => sofar + current) % n;
        }

        public static int Product(this IEnumerable<int> source)
        {
            return source.Aggregate(1, (sofar, current) => sofar * current);
        }

        public static int ModularProduct(this IEnumerable<int> source, int n)
        {
            return (int)source.Aggregate((long)1, (sofar, current) => sofar * current % n);
        }

        public static BigInteger Sum(this IEnumerable<BigInteger> source)
        {
            return source.Aggregate(BigInteger.Zero, (sofar, current) => sofar + current);
        }

        public static BigInteger ModularSum(this IEnumerable<BigInteger> source, BigInteger n)
        {
            return source.Aggregate(BigInteger.Zero, (sofar, current) => sofar + current) % n;
        }

        public static BigInteger Product(this IEnumerable<BigInteger> source)
        {
            return source.Aggregate(BigInteger.One, (sofar, current) => sofar * current);
        }

        public static BigInteger ModularProduct(this IEnumerable<BigInteger> source, BigInteger n)
        {
            var product = BigInteger.One;
            foreach (var factor in source)
            {
                var f = factor;
                if (f >= n)
                    f %= n;
                else if (f.Sign == -1)
                    f = f % n + n;
                product *= f;
                if (product >= n)
                    product %= n;
                else if (product.Sign == -1)
                    product = product % n + n;
            }
            return product;
        }

        public static int GetBitLength(this Int128 value)
        {
            if (value.S0 != 0)
                return value.S1.GetBitLength() + 64;
            return value.S0.GetBitLength();
        }

        public static int GetBitCount(this Int128 value)
        {
            return value.S0.GetBitCount() + value.S0.GetBitCount();
        }

        public static int GetBitLength(this UInt128 value)
        {
            if (value.S0 != 0)
                return value.S1.GetBitLength() + 64;
            return value.S0.GetBitLength();
        }

        public static int GetBitCount(this UInt128 value)
        {
            return value.S0.GetBitCount() + value.S0.GetBitCount();
        }

        public static int GetBitLength(this long value)
        {
            return GetBitLength((ulong)Math.Abs(value));
        }

        public static int GetBitLength(this int value)
        {
            return GetBitLength((uint)Math.Abs(value));
        }

        public static int GetBitLength(this ulong value)
        {
            if ((value & 0xffffffff00000000) != 0)
                return GetBitLength((uint)(value >> 32)) + 32;
            return GetBitLength((uint)value);
        }

        public static int GetBitLength(this uint value)
        {
            if ((value & 0xffff0000) != 0)
            {
                if ((value & 0xff000000) != 0)
                    return GetBitLength((byte)(value >> 24)) + 24;
                return GetBitLength((byte)(value >> 16)) + 16;
            }
            if ((value & 0xff00) != 0)
                return GetBitLength((byte)(value >> 8)) + 8;
            return GetBitLength((byte)value);
        }

        public static int GetBitLength(this byte value)
        {
            return bitLength[value];
        }

        private static byte[] bitLength = Enumerable.Range(0, byte.MaxValue + 1)
            .Select(value => (byte)GetBitLengthSlow((byte)value)).ToArray();

        public static int GetBitLengthSlow(this byte value)
        {
            int i = 0;
            if ((value & 0xf0) != 0)
            {
                i += 4;
                value >>= 4;
            }
            if ((value & 0xc) != 0)
            {
                i += 2;
                value >>= 2;
            }
            if ((value & 0x2) != 0)
                return i + 2;
            if ((value & 0x1) != 0)
                return i + 1;
            return 0;
        }

        public static int GetBitLength(this BigInteger n)
        {
            var bytes = n.ToByteArray();
            for (int i = bytes.Length - 1; i >= 0; i--)
            {
                var b = bytes[i];
                if (b == 0)
                    continue;
                return 8 * i + b.GetBitLength();
            }
            return 0;
        }

        public static int GetBitCount(this long word)
        {
            return GetBitCount((ulong)word);
        }

        public static int GetBitCount(this int word)
        {
            return GetBitCount((uint)word);
        }

        public static int GetBitCount(this short word)
        {
            return GetBitCount((ushort)word);
        }

        public static int GetBitCount(this ulong word)
        {
            return GetBitCount((uint)word) + GetBitCount((uint)(word >> 32));
        }

        public static int GetBitCount(this uint word)
        {
            return GetBitCount((ushort)word) + GetBitCount((ushort)(word >> 16));
        }

        public static int GetBitCount(this ushort word)
        {
            return GetBitCount((byte)word) + GetBitCount((byte)(word >> 8));
        }

        public static int GetBitCount(this byte word)
        {
            return bitCounts[word & ((1 << 4) - 1)] + bitCounts[word >> 4];
        }

        private static int[] bitCounts = new[]
        {
            0, 1, 1, 2, 1, 2, 2, 3,
            1, 2, 2, 3, 2, 3, 3, 4,
        };

#if false
        // http://www.luschny.de/math/factorial/scala/FactorialScalaCsharp.htm
        public static uint BitCount(uint w)
        {
            w = w - ((0xaaaaaaaa & w) >> 1);
            w = (w & 0x33333333) + ((w >> 2) & 0x33333333);
            w = w + (w >> 4) & 0x0f0f0f0f;
            w += w >> 8;
            w += w >> 16;
 
            return w & 0xff;
        }
#endif
    }
}
