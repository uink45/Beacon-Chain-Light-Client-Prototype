using System;
using System.Diagnostics;
using System.Numerics;
using Nethermind.Dirichlet.Numerics;

namespace Nethermind.Decompose.Numerics
{
    public static partial class IntegerMath
    {
        public static int ModularInverse(int a, int b)
        {
            Debug.Assert(GreatestCommonDivisor(a, b) == 1);
            int x;
            int y;
            ExtendedEuclideanAlgorithm(a, b, out x, out y);
            if (x == 0)
                throw new InvalidOperationException("not relatively prime");
            if (x < 0)
                x += b;
            Debug.Assert((BigInteger)a * x % b == 1);
            return x;
        }

        public static uint ModularInverse(uint a, uint b)
        {
            Debug.Assert(GreatestCommonDivisor(a, b) == 1);
            var x0 = (long)0;
            var x1 = (long)1;
            var p = b;
            var q = a < b ? a : a % b;
            var tmpx = (long)0;
            while (q != 0)
            {
                Debug.Assert(p >= q);
                var quotient = p / q;
                var tmpp = p;
                p = q;
                q = tmpp - quotient * q;
                tmpx = x1;
                x1 = x0 - quotient * x1;
                x0 = tmpx;
            }
            if (x0 == 0)
                throw new InvalidOperationException("not relatively prime");
            if (x0 < 0)
                x0 += b;
            var result = (uint)x0;
            Debug.Assert((BigInteger)a * result % b == 1);
            return result;
        }

        public static long ModularInverse(long a, long b)
        {
            Debug.Assert(GreatestCommonDivisor(a, b) == 1);
            long x;
            long y;
            ExtendedEuclideanAlgorithm(a, b, out x, out y);
            if (x == 0)
                throw new InvalidOperationException("not relatively prime");
            if (x < 0)
                x += b;
            Debug.Assert((BigInteger)a * x % b == 1);
            return x;
        }

        public static ulong ModularInverse(ulong a, ulong b)
        {
            Debug.Assert(GreatestCommonDivisor(a, b) == 1);
            var x0 = (Int65)0;
            var x1 = (Int65)1;
            var p = b;
            var q = a < b ? a : a % b;
            var tmpx = (Int65)0;
            while (q != 0)
            {
                Debug.Assert(p >= q);
                var quotient = p / q;
                var tmpp = p;
                p = q;
                q = tmpp - quotient * q;
                tmpx = x1;
                x1.Multiply(quotient);
                x1.SetDifference(ref x0, ref x1);
                x0 = tmpx;
            }
            if (x0.IsZero)
                throw new InvalidOperationException("not relatively prime");
            if (x0.Sign != 1)
                x0 += b;
            var result = (ulong)x0;
            Debug.Assert((BigInteger)a * result % b == 1);
            return result;
        }

        public static int ModularInverse(BigInteger a, int b)
        {
            Debug.Assert(GreatestCommonDivisor(a, b) == 1);
            if (b == 0)
                return 1;
            int r = (int)(a % b);
            int x;
            int y;
            ExtendedEuclideanAlgorithm(r, b, out x, out y);
            if (x == 0)
                throw new InvalidOperationException("not relatively prime");
            if (x < 0)
                x += b;
            Debug.Assert((BigInteger)a * x % b == 1);
            return x;
        }

        public static BigInteger ModularInverse(BigInteger a, BigInteger b)
        {
            Debug.Assert(GreatestCommonDivisor(a, b) == 1);
            var x0 = BigInteger.Zero;
            var x1 = BigInteger.One;
            var p = b;
            var q = a < b ? a : a % b;
            ModularInverseCore(ref p, ref q, ref x0, ref x1);
            ModularInverseCore((ulong)p, (ulong)q, ref x0, ref x1);
            if (x0 == 0)
                throw new InvalidOperationException("not relatively prime");
            if (x0 < 0)
                x0 += b;
            Debug.Assert(a * x0 % b == 1);
            return x0;
        }

        private static void ModularInverseCore(ref BigInteger p, ref BigInteger q, ref BigInteger x0, ref BigInteger x1)
        {
            while (p > ulong.MaxValue)
            {
                Debug.Assert(p >= q);
                var quotient = p / q;
                var tmpp = p;
                p = q;
                q = tmpp - quotient * q;
                var tmpx = x1;
                x1 = x0 - quotient * x1;
                x0 = tmpx;
            }
        }

        private static void ModularInverseCore(ulong p, ulong q, ref BigInteger x0, ref BigInteger x1)
        {
            while (q != 0)
            {
                Debug.Assert(p >= q);
                var quotient = p / q;
                var tmpp = p;
                p = q;
                q = tmpp - quotient * q;
                var tmpx = x1;
                x1 = x0 - quotient * x1;
                x0 = tmpx;
            }
        }

        public static int ModularInversePowerOfTwoModulus(int d, int n)
        {
            return (int)ModularInversePowerOfTwoModulus((uint)d, n);
        }

        public static uint ModularInversePowerOfTwoModulus(uint d, int n)
        {
            // See 9.2 in: http://gmplib.org/~tege/divcnst-pldi94.pdf
            if ((d & 1) == 0)
                throw new InvalidOperationException("not relatively prime");
            Debug.Assert(d > 0 && n > 0 && n <= 32);
            var dInv = d;
            for (int m = 3; m < n; m *= 2)
                dInv = dInv * (2 - dInv * d);
            if (n < 32)
                dInv &= ((uint)1 << n) - 1;
            return dInv;
        }

        public static long ModularInversePowerOfTwoModulus(long d, int n)
        {
            return (long)ModularInversePowerOfTwoModulus((ulong)d, n);
        }

        public static ulong ModularInversePowerOfTwoModulus(ulong d, int n)
        {
            // See 9.2 in: http://gmplib.org/~tege/divcnst-pldi94.pdf
            if ((d & 1) == 0)
                throw new InvalidOperationException("not relatively prime");
            Debug.Assert(d > 0 && n > 0 && n <= 64);
            var dInv = d;
            for (int m = 3; m < n; m *= 2)
                dInv *= 2 - dInv * d;
            if (n < 64)
                dInv &= ((ulong)1 << n) - 1;
            return dInv;
        }

        public static UInt128 ModularInversePowerOfTwoModulus(UInt128 d, int n)
        {
            // See 9.2 in: http://gmplib.org/~tege/divcnst-pldi94.pdf
            if ((d & 1) == 0)
                throw new InvalidOperationException("not relatively prime");
            Debug.Assert(d > 0 && n > 0 && n <= 128);
            var dInv = d;
            for (int m = 3; m < n; m *= 2)
                dInv *= 2 - dInv * d;
            if (n < 128)
                dInv &= ((UInt128)1 << n) - 1;
            return dInv;
        }

        public static BigInteger ModularInversePowerOfTwoModulus(BigInteger d, int n)
        {
            // See 9.2 in: http://gmplib.org/~tege/divcnst-pldi94.pdf
            Debug.Assert(d > 0 && n > 0);
            if ((d & 1) == 0)
                throw new InvalidOperationException("not relatively prime");
            var dInv = d;
            var mask = ((BigInteger)1 << n) - 1;
            for (int m = 3; m < n; m *= 2)
                dInv = (dInv * (2 - dInv * d)) & mask;
            if (dInv.Sign == -1)
                dInv += mask + 1;
            return dInv;
        }
    }
}
