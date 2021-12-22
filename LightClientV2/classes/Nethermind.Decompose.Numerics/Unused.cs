using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace Nethermind.Decompose.Numerics
{
#if false
#if false
        private BigInteger ProcessRegionChecked(long w, long h, long m1n, long m1d, long m0n, long m0d, BigInteger x01, BigInteger y01)
        {
            var expected = (BigInteger)0;
            if (diag)
            {
                expected = ProcessRegionGrid(w, h, m1n, m1d, m0n, m0d, x01, y01, false);
                var region = ProcessRegion(w, h, m1n, m1d, m0n, m0d, x01, y01);
                if (region != expected)
                {
                    Console.WriteLine("failed validation: actual = {0}, expected = {1}", region, expected);
                }
                return region;
            }
            return ProcessRegion(w, h, m1n, m1d, m0n, m0d, x01, y01);
        }

        private BigInteger ProcessRegionGrid(long w, long h, long m1n, long m1d, long m0n, long m0d, BigInteger x01, BigInteger y01, bool verbose)
        {
            // Just count the remaining lattice points inside the parallelogram.
            var count = 0;
            for (var u = 1; u <= w; u++)
            {
                var xrow = x01 + u * m0d;
                var yrow = y01 - u * m0n;
                for (var v = 1; v <= h; v++)
                {
                    var x = xrow - v * m1d;
                    var y = yrow + v * m1n;
                    if (x * y <= n)
                        ++count;
                }
            }
            if (verbose)
                Console.WriteLine("region: count = {0}", count);
            return count;
        }

        private void UV2XY(ref Region r, BigInteger u, BigInteger v, out BigInteger x, out BigInteger y)
        {
            x = r.x01 - r.m1d * v + r.m0d * u;
            y = r.y01 + r.m1n * v - r.m0n * u;
        }

        private void XY2UV(ref Region r, BigInteger x, BigInteger y, out BigInteger u, out BigInteger v)
        {
            var dx = x - r.x01;
            var dy = y - r.y01;
            u = r.m1d * dy + r.m1n * dx;
            v = r.m0d * dy + r.m0n * dx;
        }

        private BigInteger ProcessRegionLine(BigInteger x1, BigInteger y1, Rational m1, Rational r1, BigInteger x0, BigInteger y0, Rational m0, Rational r0, bool verbose)
        {
            var sum = (BigInteger)0;
            for (var x = x1; x <= x0; x++)
            {
                var y = n / x;
                sum += IntegerMath.Min(IntegerMath.Max(y - Rational.Floor(r0 - m0 * x), 0), IntegerMath.Max(y - Rational.Floor(r1 - m1 * x), 0));
            }
            if (verbose)
                Console.WriteLine("region: sum = {0}", sum);
            return sum;
        }

        private void PrintValuesInRange()
        {
            if (xmax < 100)
            {
                for (var x = xmin; x <= xmax; x++)
                {
                    var y = n / x;
                    var s = "";
                    for (var i = 0; i < y; i++)
                        s += "*";
                    Console.WriteLine("{0,5} {1}", x, s);
                }
                for (var x = xmin; x <= xmax; x++)
                {
                    var y = n / x;
                    Console.WriteLine("x = {0}, y = {1}", x, y);
                }
            }
        }
#endif
#endif
#if false
        public static BigInteger AddMod(BigInteger a, BigInteger b, BigInteger n)
        {
            Debug.Assert(a >= BigInteger.Zero && a < n);
            Debug.Assert(b >= BigInteger.Zero && b < n);
            var sum = a + b;
            if (sum >= n)
                sum -= n;
            return sum;
        }

        public static BigInteger SubAbsMod(BigInteger a, BigInteger b, BigInteger n)
        {
            Debug.Assert(a >= BigInteger.Zero && a < n);
            Debug.Assert(b >= BigInteger.Zero && b < n);
            if (a > b)
                return a - b;
            return b - a;
        }

        public static BigInteger MulMod(BigInteger a, BigInteger b, BigInteger n)
        {
            Debug.Assert(a >= BigInteger.Zero && a < n);
            Debug.Assert(b >= BigInteger.Zero && b < n);
            if (a.IsZero || b.IsZero)
                return BigInteger.Zero;
            int compare = a.CompareTo(b);
            if (compare < 0)
                return MulModInternal(b, a, n);
            if (compare > 0)
                return MulModInternal(a, b, n);
            return SquareMod(a, n);
        }

        private static BigInteger MulModInternal(BigInteger a, BigInteger b, BigInteger n)
        {
            // a * (c + 1) = a * c + a
            // a * 2d = (a * d) + (a * d)
            if (b.IsEven)
            {
                var x = MulModInternal(a, b >> 1, n);
                return AddMod(x, x, n);
            }
            if (b.IsOne)
                return a;
            return AddMod(MulModInternal(a, b - BigInteger.One, n), a, n);
        }

        public static BigInteger SquareMod(BigInteger a, BigInteger n)
        {
            Debug.Assert(a >= BigInteger.Zero && a < n);
            return MulModInternal(a, a, n);
        }

        public static BigInteger ModPow(BigInteger b, BigInteger e, BigInteger m)
        {
            return ModPowInternal(b, e, 1, m);
        }

        private static BigInteger ModPowInternal(BigInteger b, BigInteger e, BigInteger p, BigInteger modulus)
        {
            if (e == 0)
                return p;
            if (e % 2 == 0)
                return ModPowInternal(b * b % modulus, e / 2, p, modulus);
            return ModPowInternal(b, e - 1, b * p % modulus, modulus);
        }
#endif
}
