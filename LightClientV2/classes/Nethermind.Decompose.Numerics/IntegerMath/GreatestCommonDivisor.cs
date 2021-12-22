using System;
using System.Diagnostics;
using System.Numerics;

namespace Nethermind.Decompose.Numerics
{
    public static partial class IntegerMath
    {
        public static int GreatestCommonDivisor(int a, int b)
        {
            while (b != 0)
            {
                var t = b;
                b = a % b;
                a = t;
            }
            return Math.Abs(a);
        }

        public static uint GreatestCommonDivisor(uint a, uint b)
        {
            while (b != 0)
            {
                var t = b;
                b = a % b;
                a = t;
            }
            return a;
        }

        public static long GreatestCommonDivisor(long a, long b)
        {
            while (b != 0)
            {
                var t = b;
                b = a % b;
                a = t;
            }
            return Math.Abs(a);
        }

        public static ulong GreatestCommonDivisor(ulong a, ulong b)
        {
            while (b != 0)
            {
                var t = b;
                b = a % b;
                a = t;
            }
            return a;
        }

        public static BigInteger GreatestCommonDivisor(BigInteger a, BigInteger b)
        {
            return BigInteger.GreatestCommonDivisor(a, b);
        }

        public static void ExtendedEuclideanAlgorithm(int a, int b, out int c, out int d)
        {
            var x = 0;
            var lastx = 1;
            var y = 1;
            var lasty = 0;
            while (b != 0)
            {
                var quotient = a / b;
                var tmpa = a;
                a = b;
                b = tmpa - quotient * b;
                var tmpx = x;
                x = lastx - quotient * x;
                lastx = tmpx;
                var tmpy = y;
                y = lasty - quotient * y;
                lasty = tmpy;
            }
            c = lastx;
            d = lasty;
        }

        public static void ExtendedEuclideanAlgorithm(uint a, uint b, out uint c, out uint d)
        {
            long cLong;
            long dLong;
            ExtendedEuclideanAlgorithm(a, b, out cLong, out dLong);
            if (cLong < 0)
                cLong += b;
            if (dLong < 0)
                dLong += a;
            c = (uint)cLong;
            d = (uint)dLong;
        }

        public static void ExtendedEuclideanAlgorithm(long a, long b, out long c, out long d)
        {
            var x = (long)0;
            var lastx = (long)1;
            var y = (long)1;
            var lasty = (long)0;

            if (a < b)
            {
                var tmpa = a;
                a = b;
                b = tmpa;
                x = 1;
                lastx = 0;
                y = 0;
                lasty = 1;
            }
            while (b != 0)
            {
                Debug.Assert(a >= b);
                var b2 = b << 1;
                if (a < b2)
                {
                    Debug.Assert(a / b == 1);
                    var tmpa = a;
                    a = b;
                    b = tmpa - b;
                    var tmpx = x;
                    x = lastx - x;
                    lastx = tmpx;
                    var tmpy = y;
                    y = lasty - y;
                    lasty = tmpy;
                }
                else if (a < b2 + b)
                {
                    Debug.Assert(a / b == 2);
                    var tmpa = a;
                    a = b;
                    b = tmpa - (b << 1);
                    var tmpx = x;
                    x = lastx - (x << 1);
                    lastx = tmpx;
                    var tmpy = y;
                    y = lasty - (y << 1);
                    lasty = tmpy;
                }
                else
                {
                    if (a < int.MaxValue)
                        break;
                    var quotient = a / b;
                    var tmpa = a;
                    a = b;
                    b = tmpa - quotient * b;
                    var tmpx = x;
                    x = lastx - quotient * x;
                    lastx = tmpx;
                    var tmpy = y;
                    y = lasty - quotient * y;
                    lasty = tmpy;
                }
            }
            if (b != 0)
            {
                var aa = (uint)a;
                var bb = (uint)b;
                while (bb != 0)
                {
                    Debug.Assert(aa >= bb);
                    var bb2 = bb << 1;
                    if (aa < bb2)
                    {
                        Debug.Assert(aa / bb == 1);
                        var tmpa = aa;
                        aa = bb;
                        bb = tmpa - bb;
                        var tmpx = x;
                        x = lastx - x;
                        lastx = tmpx;
                        var tmpy = y;
                        y = lasty - y;
                        lasty = tmpy;
                    }
                    else if (aa < bb2 + bb)
                    {
                        Debug.Assert(aa / bb == 2);
                        var tmpa = aa;
                        aa = bb;
                        bb = tmpa - (bb << 1);
                        var tmpx = x;
                        x = lastx - (x << 1);
                        lastx = tmpx;
                        var tmpy = y;
                        y = lasty - (y << 1);
                        lasty = tmpy;
                    }
                    else
                    {
                        var quotient = aa / bb;
                        var tmpa = aa;
                        aa = bb;
                        bb = tmpa - quotient * bb;
                        var tmpx = x;
                        x = lastx - quotient * x;
                        lastx = tmpx;
                        var tmpy = y;
                        y = lasty - quotient * y;
                        lasty = tmpy;
                    }
                }
            }
            c = lastx;
            d = lasty;
        }

        public static void ExtendedEuclideanAlgorithm(ulong p, ulong q, out ulong c, out ulong d)
        {
            var x = (Int65)0;
            var lastx = (Int65)1;
            var y = (Int65)1;
            var lasty = (Int65)0;
            var a = p;
            var b = q;
            var tmpx = (Int65)0;
            var tmpy = (Int65)0;
            while (q != 0)
            {
                var quotient = p / q;
                var tmpa = p;
                p = q;
                q = tmpa - quotient * q;
                tmpx = x;
                x.Multiply(quotient);
                x.SetDifference(ref lastx, ref x);
                lastx = tmpx;
                tmpy = y;
                y.Multiply(quotient);
                y.SetDifference(ref lasty, ref y);
                lasty = tmpy;
            }
            if (lastx.Sign != 1)
                lastx += b;
            if (lasty.Sign != 1)
                lasty += a;
            c = (ulong)lastx;
            d = (ulong)lasty;
        }

        public static void ExtendedEuclideanAlgorithm(BigInteger a, BigInteger b, out BigInteger c, out BigInteger d)
        {
            var x = BigInteger.Zero;
            var lastx = BigInteger.One;
            var y = BigInteger.One;
            var lasty = BigInteger.Zero;

            while (!b.IsZero)
            {
                var quotient = a / b;
                var tmpa = a;
                a = b;
                b = tmpa - quotient * b;
                var tmpx = x;
                x = lastx - quotient * x;
                lastx = tmpx;
                var tmpy = y;
                y = lasty - quotient * y;
                lasty = tmpy;
            }
            c = lastx;
            d = lasty;
        }
    }
}
