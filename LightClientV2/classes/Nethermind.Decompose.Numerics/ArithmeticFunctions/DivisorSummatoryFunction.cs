using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Numerics;
using Integer = System.Numerics.BigInteger;

namespace Nethermind.Decompose.Numerics
{
    public class DivisorSummatoryFunction : IDivisorSummatoryFunction<BigInteger>
    {
        private struct Region
        {
            public Region(Integer w, Integer h, Integer a1, Integer b1, Integer a2, Integer b2, Integer x0, Integer y0)
            {
                this.w = w; this.h = h; this.a1 = a1; this.b1 = b1; this.a2 = a2; this.b2 = b2; this.x0 = x0; this.y0 = y0;
            }
            public Integer w;
            public Integer h;
            public Integer a1;
            public Integer b1;
            public Integer a2;
            public Integer b2;
            public Integer x0;
            public Integer y0;
        }

        private readonly Integer smallRegionCutoff = 10;
        private readonly Integer minimumMultiplier = 600;

        private Integer n;
        private Integer xmin;
        private Integer xmax;

        private Stack<Region> stack;
        private DivisionFreeDivisorSummatoryFunction manualAlgorithm;

        public DivisorSummatoryFunction()
        {
            stack = new Stack<Region>();
            manualAlgorithm = new DivisionFreeDivisorSummatoryFunction(0, false, false);
        }

        public Integer Evaluate(Integer n)
        {
            var xmax = IntegerMath.FloorSquareRoot(n);
            var s = Evaluate(n, 1, (long)xmax);
            return 2 * s - xmax * xmax;
        }

        public Integer Evaluate(Integer n, BigInteger xfirst, BigInteger xlast)
        {
            this.n = n;

            // Count lattice points under the hyperbola x*y = n.
            var sum = (Integer)0;

            // Compute the range of values over which we will apply the
            // geometric algorithm.
            xmax = (Integer)xlast;
            xmin = IntegerMath.Max(xfirst, IntegerMath.Min(IntegerMath.FloorRoot(n, 3) * minimumMultiplier, xmax));

            // Calculate the line tangent to the hyperbola at the x = sqrt(n).
            var m0 = (Integer)1;
            var x0 = xmax;
            var y0 = n / x0;
            var r0 = y0 + m0 * x0;
            Debug.Assert(r0 - m0 * x0 == y0);

            // Add the bottom rectangle.
            var width = x0 - xfirst;
            sum += (width + 1) * y0;

            // Add the isosceles right triangle corresponding to the initial
            // line L0 with -slope = 1.
            sum += width * (width + 1) / 2;

            // Process regions between tangent lines with integral slopes 1 & 2,
            // 2 & 3, etc. until we reach xmin.  This provides a first
            // approximation to the hyperbola and accounts for the majority
            // of the lattice points between xmin and max.  The remainder of
            // the points are computed by processing the regions bounded
            // by the two tangent lines and the hyperbola itself.
            while (true)
            {
                // Find the largest point (x1a, y1a) where -H'(X) >= the new slope.
                var m1 = m0 + 1;
                var x1a = IntegerMath.FloorSquareRoot(n / m1);
                var y1a = n / x1a;
                var r1a = y1a + m1 * x1a;
                var x1b = x1a + 1;
                var y1b = n / x1b;
                var r1b = y1b + m1 * x1b;
                Debug.Assert(r1a - m1 * x1a == y1a);
                Debug.Assert(r1b - m1 * x1b == y1b);

                // Handle left-overs.
                if (x1a < xmin)
                {
                    // Remove all the points we added between xfirst and x0.
                    var rest = x0 - xfirst;
                    sum -= (r0 - m0 * x0) * rest + m0 * rest * (rest + 1) / 2;
                    xmin = x0;
                    break;
                }

                // Invariants:
                // The value before x1a along L1a is on or below the hyperbola.
                // The value after x1b along L2b is on or below the hyperbola.
                // The new slope is one greater than the old slope.
                Debug.Assert((x1a - 1) * (r1a - m1 * (x1a - 1)) <= n);
                Debug.Assert((x1b + 1) * (r1b - m1 * (x1b + 1)) <= n);
                Debug.Assert(m1 - m0 == 1);

                // Add the triangular wedge above the previous slope and below the new one
                // and bounded on the left by xfirst.
                var x0a = r1a - r0;
                width = x0a - xfirst;
                sum += width * (width + 1) / 2;

                // Account for a drop or rise from L1a to L1b.
                if (r1a != r1b && x1a < x0a)
                {
                    // Remove the old triangle and add the new triangle.
                    // The formula is (ow+dr)*(ow+dr+1)/2 - ow*(ow+1)/2.
                    var ow = x1a - x0a;
                    var dr = r1a - r1b;
                    sum += dr * (2 * ow + dr + 1) / 2;
                }

                // Determine intersection of L0 and L1b.
                var x0b = r1b - r0;
                var y0b = r0 - m0 * x0b;
                Debug.Assert(r0 - m0 * x0b == r1b - m1 * x0b);

                // Calculate width and height of parallelogram counting only lattice points.
                var w = (y0 - y0b) + m1 * (x0 - x0b);
                var h = (y1b - y0b) + m0 * (x1b - x0b);

                // Process the hyperbolic region bounded by L1b and L0.
                sum += ProcessRegion(w, h, m1, 1, m0, 1, x0b, y0b);

                // Advance to the next region.
                m0 = m1;
                x0 = x1a;
                y0 = y1a;
                r0 = r1a;
            }

            // Process values from xfirst up to xmin.
            sum += manualAlgorithm.Evaluate(n, xfirst, xmin - 1);

            return sum;
        }

        private Integer ProcessRegion(Integer  w, Integer h, Integer a1, Integer b1, Integer a2, Integer b2, Integer x0, Integer y0)
        {
            // The hyperbola is defined by H(x, y): x*y = n.
            // Line L0 has slope m0 = -a2/b2.
            // Line L1 has slope m1 = -a1/b1.
            // Both lines pass through P01 = (x0, y0).
            // The region is a parallelogram with the left side bounded L1,
            // the bottom bounded by L0, with width w (along L0) and height h
            // (along L1).  The lower-left corner is P01 (the intersection of
            // L0 and L1) and represents (u, v) = (0, 0).
            // Both w and h are counted in terms of lattice points, not length.

            // For the purposes of counting, the lattice points on lines L0 and L1
            // have already been counted.

            // Note that b2*a1 - a2*b1 = 1 because
            // m0 and m1 are Farey neighbors, e.g. 1 & 2 or 3/2 & 2 or 8/5 & 5/3

            // The equations that define (u, v) in terms of (x, y) are:
            // u = b1*(y-y0)+a1*(x-x0)
            // v = b2*(y-y0)+a2*(x-x0)
 
            // And therefore the equations that define (x, y) in terms of (u, v) are:
            // x = x0-b1*v+b2*u
            // y = y0+a1*v-a2*u

            // Since all parameters are integers and b2*a1 - a2*b1 = 1,
            // every lattice point in (x, y) is a lattice point in (u, v)
            // and vice-versa.

            // Geometrically, the UV coordinate system is the composition
            // of a translation and two shear mappings.  The UV-based hyperbola
            // is essentially a "mini" hyperbola that resembles the full
            // hyperbola in that:
            // - The equation is still a hyperbola (although it is now a quadratic in two variables)
            // - The endpoints of the curve are roughly tangent to the axes

            // We process the region by "lopping off" the maximal isosceles
            // right triangle in the lower-left corner and then processing
            // the two remaining "slivers" in the upper-left and lower-right,
            // which creates two smaller "micro" hyperbolas, which we then
            // process recursively.

            // When we are in the region of the original hyperbola where
            // the curvature is roughly constant, the deformed hyperbola
            // will in fact resemble a circular arc.

            // A line with -slope = 1 in UV-space has -slope = (a2+a1)/(b2+b1)
            // in XY-space.  We call this m2 and the line defining the third side
            // of the triangle as L2 contain point P2 tangent to the hyperbola.

            // This is all slightly complicated by the fact that diagonal that
            // defines the region that we "lop off" may be broken and shifted
            // up or down near the tangent point.  As a result we actually have
            // P2a and P2b and L2a and L2b.

            // We can measure work in units of X because it is the short
            // axis and it ranges from cbrt(n) to sqrt(n).  If we did one
            // unit of work for each X coordinate we would have an O(sqrt(n))
            // algorithm.  But because there is only one lattice point on a
            // line with slope m per the denominator of m in X and because
            // the denominator of m roughly doubles for each subdivision,
            // there will be less than one unit of work for each unit of X.

            // As a result, each iteration reduces the work by about
            // a factor of two resulting in 1 + 2 + 4 + ... + sqrt(r) steps
            // or O(sqrt(r)).  Since the sum of the sizes of the top-level
            // regions is O(sqrt(n)), this gives a O(n^(1/4)) algorithm for
            // nearly constant curvature.

            // However, since the hyperbola is increasingly non-circular for small
            // values of x, the subdivision is not nearly as beneficial (and
            // also not symmetric) so it is only worthwhile to use region
            // subdivision on regions where cubrt(n) < n < sqrt(n).

            // The sqrt(n) bound comes from symmetry and the Dirichlet
            // hyperbola method, which we also use.  The cubrt(n)
            // bound comes from the fact that the second deriviative H''(x)
            // exceeds one at (2n)^(1/3) ~= 1.26*cbrt(n).  Since we process
            // regions with adjacent integral slopes at the top level, by the
            // time we get to cbrt(n), the size of the region is at most
            // one, so we might as well process those values using the
            // naive approach of summing y = n/x.

            // Finally, at some point the region becomes small enough and we
            // can just count points under the hyperbola using whichever axis
            // is shorter.  This is quite a bit harder than computing y = n/x
            // because the transformations we are using result in a general
            // quadratic in two variables.  Nevertheless, with some
            // preliminary calculations, each value can be calculated with
            // a few additions, a square root and a division.

            // Sum the lattice points.
            var sum = (Integer)0;

            // Process regions on the stack.
            while (true)
            {
                // Process regions iteratively.
                while (true)
                {
                    // Nothing left process.
                    if (w <= 0 || h <= 0)
                        break;

                    // Check whether the point at (w, 1) is inside the hyperbola.
                    if ((b2 * w - b1 + x0) * (a1 - a2 * w + y0) <= n)
                    {
                        // Remove the first row.
                        sum += w;
                        x0 -= b1;
                        y0 += a1;
                        --h;
                        if (h == 0)
                            break;
                    }

                    // Check whether the point at (1, h) is inside the hyperbola.
                    if ((b2 - b1 * h + x0) * (a1 * h - a2 + y0) <= n)
                    {
                        // Remove the first column.
                        sum += h;
                        x0 += b2;
                        y0 -= a2;
                        --w;
                        if (w == 0)
                            break;
                    }

                    // Invariants for the remainder of the processing of the region:
                    // H(u,v) at v=h, 0 <= u < 1
                    // H(u,v) at u=w, 0 <= v < 1
                    // -du/dv at v=h >= 0
                    // -dv/du at u=w >= 0
                    // In other words: the hyperbola is less than one unit away
                    // from the axis at P0 and P1 and the distance from the axis
                    // to the hyperbola increases monotonically as you approach
                    // (u, v) = (0, 0).
                    Debug.Assert((b2 - b1 * h + x0) * (a1 * h - a2 + y0) > n);
                    Debug.Assert((b2 * w - b1 + x0) * (a1 - a2 * w + y0) > n);
                    Debug.Assert(b2 * a1 - a2 * b1 == 1);

                    // Find the pair of points (u2a, v2a) and (u2b, v2b) below H(u,v) where:
                    // -dv/du at u=u2a >= 1
                    // -dv/du at u=u2b <= 1
                    // u2b = u2a + 1
                    // Specifically, solve:
                    // (x0 - b1*v + b2*u)*(y0 + a1*v - a2*u) = n at dv/du = -1
                    // and solve for the line tan = u + v tangent passing through that point.
                    // Then u2a = floor(u) and u2b = u2a + 1.
                    // Finally compute v2a and v2b from u2a and u2b using the tangent line
                    // which may result in a value too small by at most one.
                    // Note that there are two solutions, one negative and one positive.
                    // We take the positive solution.

                    // We use the identities (a >= 0, b >= 0, c > 0; a, b, c elements of Z):
                    // floor(b*sqrt(a)/c) = floor(floor(sqrt(b^2*a))/c)
                    // floor(b*sqrt(a*c)/c) = floor(sqrt(b^2*a/c))
                    // to enable using integer arithmetic.

                    // Formulas:
                    // a3b3 = b3*a3, mxy1 = b1*y0+a1*x0, mxy2 = b3*y0+a3*x0
                    // u = floor((2*b1*a3+1)*sqrt(a3b3*n)/a3b3-mxy1)
                    // v = floor(-u+2*sqrt(a3b3*n)-mxy2)
                    var a3 = a1 + a2;
                    var b3 = b1 + b2;
                    var a3b3 = a3 * b3;
                    var mxy1 = a1 * x0 + b1 * y0;
                    var mxy2 = a3 * x0 + b3 * y0;
                    var sqrtcoef = 2 * b1 * a3 + 1;
                    var tan = IntegerMath.FloorSquareRoot(2 * 2 * a3b3 * n) - mxy2;
                    var u2a = IntegerMath.FloorSquareRoot(sqrtcoef * sqrtcoef * n / a3b3) - mxy1;
                    var v2a = u2a != 0 ? tan - u2a : h;
                    var u2b = u2a < w ? u2a + 1 : w;
                    var v2b = tan - u2b;

                    // Check for under-estimate of v2a and/or v2b.
                    if (u2a != 0)
                    {
                        var v2aplus = v2a + 1;
                        if ((b2 * u2a - b1 * v2aplus + x0) * (a1 * v2aplus - a2 * u2a + y0) <= n)
                        ++v2a;
                    }
                    var v2bplus = v2b + 1;
                    if ((b2 * u2b - b1 * v2bplus + x0) * (a1 * v2bplus - a2 * u2b + y0) <= n)
                        ++v2b;

                    // Compute the V intercept of L2a and L2b.  Since the lines are diagonal the intercept
                    // is the same on both U and V axes and v12a = u02a and v12b = u02b.
                    var v12a = u2a + v2a;
                    var v12b = u2b + v2b;
                    Debug.Assert(IntegerMath.Abs(v12a - v12b) >= 0 && IntegerMath.Abs(v12a - v12b) <= 1);

                    // Count points horizontally or vertically if one axis collapses (or is below our cutoff)
                    // or if the triangle exceeds the bounds of the rectangle.
                    if (u2a <= smallRegionCutoff || v2b <= smallRegionCutoff || v12a > w || v12b > h)
                    {
                        if (h > w)
                            sum += CountPoints(true, w, a2, b2, a1, b1, x0, y0);
                        else
                            sum += CountPoints(false, h, a1, b1, a2, b2, x0, y0);
                        break;
                    }

                    // Add the triangle defined L0, L1, and smaller of L2a and L2b.
                    var v12 = IntegerMath.Min(v12a, v12b);
                    sum += v12 * (v12 - 1) / 2;

                    // Adjust for the difference (if any) between L2a and L2b.
                    if (v12a != v12b)
                        sum += v12a > v12b ? u2a : v2b;

                    // Push left region onto the stack.
                    stack.Push(new Region(u2a, h - v12a, a1, b1, a3, b3, x0 - b1 * v12a, y0 + a1 * v12a));

                    // Process right region iteratively (no change to a2 and b2).
                    w -= v12b;
                    h = v2b;
                    a1 = a3;
                    b1 = b3;
                    x0 = x0 + b2 * v12b;
                    y0 = y0 - a2 * v12b;
                }

                // Any more regions to process?
                if (stack.Count == 0)
                    break;

                // Pop a region off the stack for processing.
                var region = stack.Pop();
                w = region.w;
                h = region.h;
                a1 = region.a1;
                b1 = region.b1;
                a2 = region.a2;
                b2 = region.b2;
                x0 = region.x0;
                y0 = region.y0;
            }

            // Return the sum of lattice points in this region.
            return sum;
        }

        private Integer CountPoints(bool horizontal, Integer max, Integer a2, Integer b2, Integer a1, Integer b1, Integer x0, Integer y0)
        {
            // Count points under the hyperbola:
            // (x0 - b1*v + b2*u)*(y0 + a1*v - a2*u) = n
            // Horizontal: For u = 1 to max calculate v in terms of u.
            // vertical: For v = 1 to max calculate u in terms of v.
            // Note that there are two positive solutions and we
            // take the smaller of the two, the one nearest the axis.
            // By being frugal we can re-use most of the calculation
            // from the previous point.

            // We use the identity (a >= 0, b >= 0, c > 0; a, b, c elements of Z):
            // floor((b-sqrt(a)/c) = floor((b-ceiling(sqrt(a)))/c)
            // to enable using integer arithmetic.

            // Formulas:
            // a2d = b2*a2, a1d = b1*a1, 
            // m01s = b2*a1+a2*b1, mxy0d = b2*y0-a2*x0,
            // mxy1d = a1*x0-b1*y0,
            // mxy0 = b2*y0+a2*x0, mxy1 = b1*y0+a1*x0
            // v = floor((-sqrt((u+mxy1)^2-4*a1d*n)+m01s*u+mxy1d)/(2*a1d))
            // u = floor((-sqrt((v+mxy0)^2-4*a2d*n)+m01s*v+mxy0d)/(2*a2d))
            var sum = (Integer)0;
            var mx1 = a1 * x0;
            var my1 = b1 * y0;
            var mxy1 = mx1 + my1;
            var m01s = b2 * a1 + a2 * b1;
            var denom = 2 * a1 * b1;
            var a = mxy1 * mxy1 - 2 * denom * n;
            var b = horizontal ? mx1 - my1 : my1 - mx1;
            var da = 2 * mxy1 - 1;
            var imax = (long)max;
            for (var i = (long)1; i <= imax; i++)
            {
                da += 2;
                a += da;
                b += m01s;
                sum += (b - IntegerMath.CeilingSquareRoot(a)) / denom;
            }
            return sum;
        }

    }
}
