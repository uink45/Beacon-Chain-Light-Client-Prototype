using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Numerics;
using System.Diagnostics;

namespace Nethermind.Decompose.Numerics
{
    public class DivisorSummatoryFunctionArticle
    {
        private struct Region
        {
            public Region(BigInteger w, BigInteger h, BigInteger a1, BigInteger b1, BigInteger c1, BigInteger a2, BigInteger b2, BigInteger c2)
            {
                this.w = w;
                this.h = h;
                this.a1 = a1;
                this.b1 = b1;
                this.c1 = c1;
                this.a2 = a2;
                this.b2 = b2;
                this.c2 = c2;
            }

            public BigInteger w;
            public BigInteger h;
            public BigInteger a1;
            public BigInteger b1;
            public BigInteger c1;
            public BigInteger a2;
            public BigInteger b2;
            public BigInteger c2;
        }

        public static readonly BigInteger C1 = 1000;
        public static readonly BigInteger C2 = 20;

        private static readonly BigInteger nmax = (BigInteger)1 << 94;
        private const ulong tmax = (ulong)1 << 62;

        private BigInteger n;
        private Stack<Region> stack = new Stack<Region>();

        public BigInteger Evaluate(BigInteger n)
        {
            this.n = n;
            var x0 = (BigInteger)1;
            var xmax = FloorSquareRoot(n);
            var ymin = n / xmax;
            var xmin = BigInteger.Min(C1 * CeilingCubeRoot(2 * n), xmax);
            var s = (BigInteger)0;
            var a2 = (BigInteger)1;
            var x2 = xmax;
            var y2 = ymin;
            var c2 = a2 * x2 + y2;
            while (true)
            {
                var a1 = a2 + 1;
                var x4 = FloorSquareRoot(n / a1);
                if (x4 == 0)
                    break;
                var y4 = n / x4;
                var c4 = a1 * x4 + y4;
                var x5 = x4 + 1;
                var y5 = n / x5;
                var c5 = a1 * x5 + y5;
                if (x4 < xmin)
                    break;
                s += Triangle(c4 - c2 - x0) - Triangle(c4 - c2 - x5) + Triangle(c5 - c2 - x5);
                s += ProcessRegion(a1 * x2 + y2 - c5, a2 * x5 + y5 - c2, a1, 1, c5, a2, 1, c2);
                while (stack.Count > 0)
                {
                    var r = stack.Pop();
                    s += ProcessRegion(r.w, r.h, r.a1, r.b1, r.c1, r.a2, r.b2, r.c2);
                }
                a2 = a1;
                x2 = x4;
                y2 = y4;
                c2 = c4;
            }
            s += (xmax - x0 + 1) * ymin + Triangle(xmax - x0);
            var rest = x2 - x0;
            s -= y2 * rest + a2 * Triangle(rest);
            s += S1(n, 1, x2 - 1);
            return 2 * s - xmax * xmax;
        }

        public BigInteger ProcessRegion(BigInteger w, BigInteger h, BigInteger a1, BigInteger b1, BigInteger c1, BigInteger a2, BigInteger b2, BigInteger c2)
        {
            var s = (BigInteger)0;
            var a3 = a1 + a2;
            var b3 = b1 + b2;
            if (h > 0 && H(w, 1, a1, b1, c1, a2, b2, c2) <= n)
            {
                s += w;
                ++c2;
                --h;
            }
            if (w > 0 && H(1, h, a1, b1, c1, a2, b2, c2) <= n)
            {
                s += h;
                ++c1;
                --w;
            }
            var u4 = UTan(a1, b1, c1, a2, b2, c2);
            if (u4 <= 0)
                return s + ProcessRegionManual(w, h, a1, b1, c1, a2, b2, c2);
            var v4 = VFloor(u4, a1, b1, c1, a2, b2, c2);
            var u5 = u4 + 1;
            var v5 = VFloor(u5, a1, b1, c1, a2, b2, c2);
            var v6 = u4 + v4;
            var u7 = u5 + v5;
            if (u4 <= C2 || v5 <= C2 || v6 >= h || u7 >= w)
                return s + ProcessRegionManual(w, h, a1, b1, c1, a2, b2, c2);
            s += Triangle(v6 - 1) - Triangle(v6 - u5) + Triangle(u7 - u5);
            stack.Push(new Region(u4, h - v6, a1, b1, c1, a3, b3, c1 + c2 + v6));
            stack.Push(new Region(w - u7, v5, a3, b3, c1 + c2 + u7, a2, b2, c2));
            return s;
        }

        public BigInteger ProcessRegionManual(BigInteger w, BigInteger h, BigInteger a1, BigInteger b1, BigInteger c1, BigInteger a2, BigInteger b2, BigInteger c2)
        {
            return w < h ? ProcessRegionManual(w, a1, b1, c1, a2, b2, c2) : ProcessRegionManual(h, b2, a2, c2, b1, a1, c1);
        }

        public BigInteger ProcessRegionManual(BigInteger w, BigInteger a1, BigInteger b1, BigInteger c1, BigInteger a2, BigInteger b2, BigInteger c2)
        {
            if (w <= 1)
                return 0;

            var s = (BigInteger)0;
            var umax = w - 1;
            var t1 = a1 * b2 + b1 * a2;
            var t2 = 1 + c1;
            var t3 = 2 * t2 + 1;
            var t4 = 2 * a1 * b1;
            var t5 = t1 * t2 - t4 * c2;
            var t6 = t2 * t2 - 2 * t4 * n;

            var u = (BigInteger)1;
            while (true)
            {
                s += (t5 - CeilingSquareRoot(t6)) / t4;
                if (u >= umax)
                    break;
                t5 += t1;
                t6 += t3;
                t3 += 2;
                ++u;
            }

            return s;
        }

        public BigInteger ProcessRegionHorizontal(BigInteger w, BigInteger h, BigInteger a1, BigInteger b1, BigInteger c1, BigInteger a2, BigInteger b2, BigInteger c2)
        {
            var s = (BigInteger)0;
            for (var u = (BigInteger)1; u < w; u++)
                s += VFloor(u, a1, b1, c1, a2, b2, c2);
            return s;
        }

        public BigInteger ProcessRegionVertical(BigInteger w, BigInteger h, BigInteger a1, BigInteger b1, BigInteger c1, BigInteger a2, BigInteger b2, BigInteger c2)
        {
            var s = (BigInteger)0;
            for (var v = (BigInteger)1; v < h; v++)
                s += UFloor(v, a1, b1, c1, a2, b2, c2);
            return s;
        }

        public BigInteger H(BigInteger u, BigInteger v, BigInteger a1, BigInteger b1, BigInteger c1, BigInteger a2, BigInteger b2, BigInteger c2)
        {
            var uu = u + c1;
            var vv = v + c2;
            return (b2 * uu - b1 * vv) * (a1 * vv - a2 * uu);
        }

        public BigInteger UTan(BigInteger a1, BigInteger b1, BigInteger c1, BigInteger a2, BigInteger b2, BigInteger c2)
        {
            return FloorSquareRoot(BigInteger.Pow(a1 * b2 + b1 * a2 + 2 * a1 * b1, 2) * n / ((a1 + a2) * (b1 + b2))) - c1;
        }

        public BigInteger UFloor(BigInteger v, BigInteger a1, BigInteger b1, BigInteger c1, BigInteger a2, BigInteger b2, BigInteger c2)
        {
            return ((a1 * b2 + b1 * a2) * (v + c2) - CeilingSquareRoot(BigInteger.Pow(v + c2, 2) - 4 * a2 * b2 * n)) / (2 * a2 * b2) - c1;
        }

        public BigInteger VFloor(BigInteger u, BigInteger a1, BigInteger b1, BigInteger c1, BigInteger a2, BigInteger b2, BigInteger c2)
        {
            return ((a1 * b2 + b1 * a2) * (u + c1) - CeilingSquareRoot(BigInteger.Pow(u + c1, 2) - 4 * a1 * b1 * n))/(2 * a1 * b1) - c2;
        }

        public static BigInteger Triangle(BigInteger a)
        {
            return a * (a + 1) / 2;
        }

        public static BigInteger S1(BigInteger n, BigInteger x1, BigInteger x2)
        {
            if (x1 > x2)
                return 0;
            return n <= nmax ? S1Fast(n, (long)x1, (long)x2) : S1Slow(n, x1, x2);
        }

        public static BigInteger S1Fast(BigInteger n, long x1, long x2)
        {
            var s = (BigInteger)0;
            var t = (ulong)0;
            var x = (long)x2;
            var beta = (long)(n / (x + 1));
            var eps = (long)(n % (x + 1));
            var delta = (long)(n / x - beta);
            var gamma = (long)(beta - x * delta);
            while (x >= x1)
            {
                eps += gamma;
                if (eps >= x)
                {
                    ++delta;
                    gamma -= x;
                    eps -= x;
                    if (eps >= x)
                    {
                        ++delta;
                        gamma -= x;
                        eps -= x;
                        if (eps >= x)
                            break;
                    }
                }
                else if (eps < 0)
                {
                    --delta;
                    gamma += x;
                    eps += x;
                }
                beta += delta;
                gamma += delta << 1;
                t += (ulong)beta;
                if (t >= tmax)
                {
                    s += t;
                    t = 0;
                }
                --x;
            }
            return s + t + S1Slow(n, x1, x);
        }

        public static BigInteger S1Slow(BigInteger n, BigInteger x1, BigInteger x2)
        {
            var s = (BigInteger)0;
            for (var x = x1; x <= x2; x++)
                s += n / x;
            return s;
        }

        public static BigInteger FloorSquareRoot(BigInteger a)
        {
            return (BigInteger)Math.Floor(Math.Sqrt((double)a));
        }

        public static BigInteger CeilingSquareRoot(BigInteger a)
        {
            return (BigInteger)Math.Ceiling(Math.Sqrt((double)a));
        }

        public static BigInteger FloorCubeRoot(BigInteger a)
        {
            return (BigInteger)Math.Floor(Math.Pow((double)a, (double)1 / 3));
        }

        public static BigInteger CeilingCubeRoot(BigInteger a)
        {
            return (BigInteger)Math.Ceiling(Math.Pow((double)a, (double)1 / 3));
        }
    }
}
