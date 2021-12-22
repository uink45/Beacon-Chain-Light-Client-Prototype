using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Numerics;
using Integer = System.Numerics.BigInteger;

namespace Nethermind.Decompose.Numerics
{
    public class DivisorSummatoryFunction2
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
        private readonly Integer minimumMultiplier = 10;

        private bool diag;
        private Integer n;
        private Integer xmin;
        private Integer xmax;

        private Stack<Region> stack;

        public DivisorSummatoryFunction2(bool diag)
        {
            this.diag = diag;
            stack = new Stack<Region>();
        }

        public Integer Evaluate(Integer n)
        {
            this.n = n;

            // Count lattice points under the hyperbola x*y = n.
            var sum = (Integer)0;

            // Compute the range of values over which we will apply the
            // geometric algorithm.
            xmax = IntegerMath.FloorRoot(n, 2);
            xmin = IntegerMath.Min(IntegerMath.FloorRoot(n, 3) * minimumMultiplier, xmax);

            // Calculate the line tangent to the hyperbola at the x = sqrt(n).
            var m2 = (Integer)1;
            var x2 = xmax;
            var y2 = n / x2;
            var r2 = y2 + m2 * x2;
            var width = x2 - xmin;
            Debug.Assert(r2 - m2 * x2 == y2);

            // Add the bottom rectangle.
            sum += (width + 1) * y2;

            // Add the isosceles right triangle corresponding to the initial
            // line L2 with -slope = 1.
            sum += width * (width + 1) / 2;

            // Process regions between tangent lines with integral slopes 1 & 2,
            // 2 & 3, etc. until we reach xmin.  This provides a first
            // approximation to the hyperbola and accounts for the majority
            // of the lattice points between xmin and max.  The remainder of
            // the points are computed by processing the regions bounded
            // by the two tangent lines and the hyperbola itself.
            while (true)
            {
                // Find the pair of points (x3, y3) and (x1, y1) where:
                // -H'(x3) >= the new slope
                // -H'(x1) <= the new slope
                // x1 = x3 + 1
                var m1 = m2 + 1;
                var x3 = IntegerMath.FloorSquareRoot(n / m1);
                var y3 = n / x3;
                var r3 = y3 + m1 * x3;
                var x1 = x3 + 1;
                var y1 = n / x1;
                var r1 = y1 + m1 * x1;
                Debug.Assert(r3 - m1 * x3 == y3);
                Debug.Assert(r1 - m1 * x1 == y1);

                // Handle left-overs.
                if (x3 < xmin)
                {
                    // Process the last few values above xmin as the number of
                    // points above the last L2.
                    for (var x = xmin; x < x2; x++)
                        sum += n / x - (r2 - m2 * x);
                    break;
                }

                // Invariants:
                // The value before x3 along L3 is on or below the hyperbola.
                // The value after x1 along L1 is on or below the hyperbola.
                // The new slope is one greater than the old slope.
                Debug.Assert((x3 - 1) * (r3 - m1 * (x3 - 1)) <= n);
                Debug.Assert((x1 + 1) * (r1 - m1 * (x1 + 1)) <= n);
                Debug.Assert(m1 - m2 == 1);

                // Add the triangular wedge above the previous slope and below the new one
                // and bounded on the left by xmin.
                var x0 = r3 - r2;
                width = x0 - xmin;
                sum += width * (width + 1) / 2;

                // Account for a drop or rise from L3 to L1.
                if (r3 != r1 && x3 < x0)
                {
                    // Remove the old triangle and add the new triangle.
                    // The formula is (ow+dr)*(ow+dr+1)/2 - ow*(ow+1)/2.
                    var ow = x3 - x0;
                    var dr = r3 - r1;
                    sum += dr * (2 * ow + dr + 1) / 2;
                }

                // Determine intersection of L2 and L1.
                x0 = r1 - r2;
                var y0 = r2 - m2 * x0;
                Debug.Assert(r2 - m2 * x0 == r1 - m1 * x0);

                // Calculate width and height of parallelogram counting only lattice points.
                var w = (y2 - y0) + m1 * (x2 - x0);
                var h = (y1 - y0) + m2 * (x1 - x0);

                // Process the hyperbolic region bounded by L1 and L2.
                sum += ProcessRegion(w, h, m1, 1, m2, 1, x0, y0);

                // Advance to the next region.
                m2 = m1;
                x2 = x3;
                y2 = y3;
                r2 = r3;
            }

            // Process values one up to xmin.
            for (var x = (Integer)1; x < xmin; x++)
                sum += n / x;

            // Account for sqrt(n) < x <= n using the Dirichlet hyperbola method.
            sum = 2 * sum - xmax * xmax;

            return sum;
        }

        private Integer ProcessRegion(Integer w, Integer h, Integer a1, Integer b1, Integer a2, Integer b2, Integer x0, Integer y0)
        {
            // The hyperbola is defined by H(x, y): x*y = n.
            // Line L1 has -slope m1 = a1/b1.
            // Line L2 has -slope m2 = a2/b2.
            // Both lines pass through P0 = (x0, y0).
            // The region is a parallelogram with the left side bounded L1,
            // the bottom bounded by L2, with width w (along L2) and height h
            // (along L1).  The lower-left corner is P0 (the intersection of
            // L2 and L1) and represents (u, v) = (0, 0).
            // Both w and h are counted in terms of lattice points, not length.

            // For the purposes of counting, the lattice points on lines L1 and L2
            // have already been counted.

            // Note that a1*b2 - b1*a2 = 1 because
            // m2 and m1 are Farey neighbors, e.g. 1 & 2 or 3/2 & 2 or 8/5 & 5/3

            // The equations that define (u, v) in terms of (x, y) are:
            // u = b1*(y-y0)+a1*(x-x0)
            // v = b2*(y-y0)+a2*(x-x0)

            // And therefore the equations that define (x, y) in terms of (u, v) are:
            // x = x0-b1*v+b2*u
            // y = y0+a1*v-a2*u

            // Since all parameters are integers and a1*b2 - b1*a2 = 1,
            // every lattice point in (x, y) is a lattice point in (u, v)
            // and vice-versa.

            // Geometrically, the UV coordinate system is the composition
            // of a translation and two shear mappings.  The UV-based hyperbola
            // is essentially a "mini" hyperbola that resembles the full
            // hyperbola in that:
            // - The equation is still a hyperbola (although it is now a quadratic in two variables)
            // - The endpoints of the curve are roughly tangent to the axes

            // We process the region by "lopping off" the maximal isosceles
            // right triangle in the lower-left corner and then process
            // the two remaining "slivers" in the upper-left and lower-right,
            // which creates two smaller "micro" hyperbolas, which we then
            // process recursively.

            // When we are in the region of the original hyperbola where
            // the curvature is roughly constant, the deformed hyperbola
            // will in fact resemble a circular arc.

            // A line with -slope = 1 in UV-space has -slope = (a1+a2)/(b1+b2)
            // in XY-space.  We call this m3 and the line defining the third side
            // of the triangle as L3 containing point P3 tangent to the hyperbola.

            // This is all slightly complicated by the fact that diagonal that
            // defines the region that we "lop off" may be broken and shifted
            // up or down near the tangent point.  As a result we actually have
            // P3 and P4 and L3 and L4.

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
            // hyperbola method (which we also use).  The cubrt(n)
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
                    // from the axis at P1 and P2 and the distance from the axis
                    // to the hyperbola increases monotonically as you approach
                    // (u, v) = (0, 0).
                    Debug.Assert((b2 - b1 * h + x0) * (a1 * h - a2 + y0) > n);
                    Debug.Assert((b2 * w - b1 + x0) * (a1 - a2 * w + y0) > n);
                    Debug.Assert(b2 * a1 - a2 * b1 == 1);

                    // Find the pair of points (u3, v3) and (u4, v4) below H(u,v) where:
                    // -dv/du at u=u3 >= 1
                    // -dv/du at u=u4 <= 1
                    // u4 = u3 + 1
                    // Specifically, solve:
                    // (a1*(v+c2)-a2*(u+c1))*(b2*(u+c1)-b1*(v+c2)) = n at dv/du = -1
                    // Then u3 = floor(u) and u4 = u3 + 1.
                    // Note that there are two solutions, one negative and one positive.
                    // We take the positive solution.

                    // We use the identity (a >= 0, b >= 0; a, b, elements of Z):
                    // floor(b*sqrt(a/c)) = floor(sqrt(floor(b^2*a/c)))
                    // to enable using integer arithmetic.

                    // Formula:
                    // u = (a1*b2+a2*b1+2*a1*b1)*sqrt(n/(a3*b3))-c1
                    var c1 = a1 * x0 + b1 * y0;
                    var c2 = a2 * x0 + b2 * y0;
                    var a3 = a1 + a2;
                    var b3 = b1 + b2;
                    var coef = a1 * b2 + b1 * a2;
                    var denom = 2 * a1 * b1;
                    var sqrtcoef = coef + denom;
                    var u3 = IntegerMath.FloorSquareRoot(sqrtcoef * sqrtcoef * n / (a3 * b3)) - c1;
                    var u4 = u3 + 1;

                    // Finally compute v3 and v4 from u3 and u4 by solving
                    // the hyperbola for v.
                    // Note that there are two solutions, both positive.
                    // We take the smaller solution (nearest the u axis).

                    // Formulas:
                    // v = ((a1*b2+a2*b1)*(u+c1)-sqrt((u+c1)^2-4*a1*b1*n))/(2*a1*b1)-c2
                    // u = ((a1*b2+a2*b1)*(v+c2)-sqrt((v+c2)^2-4*a2*b2*n))/(2*a2*b2)-c1
                    var uc1 = u3 + c1;
                    var a = uc1 * uc1 - 2 * denom * n;
                    var b = uc1 * coef;
                    var v3 = u3 != 0 ? (b - IntegerMath.CeilingSquareRoot(a)) / denom - c2 : h;
                    var v4 = (b + coef - IntegerMath.CeilingSquareRoot(a + 2 * uc1 + 1)) / denom - c2;
                    Debug.Assert(u3 < w);

                    // Compute the V intercept of L3 and L4.  Since the lines are diagonal the intercept
                    // is the same on both U and V axes and v13 = u03 and v14 = u04.
                    var r3 = u3 + v3;
                    var r4 = u4 + v4;
                    Debug.Assert(IntegerMath.Abs(r3 - r4) <= 1);

                    // Count points horizontally or vertically if one axis collapses (or is below our cutoff)
                    // or if the triangle exceeds the bounds of the rectangle.
                    if (u3 <= smallRegionCutoff || v4 <= smallRegionCutoff || r3 > h || r4 > w)
                    {
                        if (h > w)
                            sum += CountPoints(w, c1, c2, coef, denom);
                        else
                            sum += CountPoints(h, c2, c1, coef, 2 * a2 * b2);
                        break;
                    }

                    // Add the triangle defined L1, L2, and smaller of L3 and L4.
                    var size = IntegerMath.Min(r3, r4);
                    sum += size * (size - 1) / 2;

                    // Adjust for the difference (if any) between L3 and L4.
                    if (r3 != r4)
                        sum += r3 > r4 ? u3 : v4;

                    // Push left region onto the stack.
                    stack.Push(new Region(u3, h - r3, a1, b1, a3, b3, x0 - b1 * r3, y0 + a1 * r3));

                    // Process right region iteratively (no change to a2 and b2).
                    w -= r4;
                    h = v4;
                    a1 = a3;
                    b1 = b3;
                    x0 = x0 + b2 * r4;
                    y0 = y0 - a2 * r4;
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

        private Integer CountPoints(Integer max, Integer c1, Integer c2, Integer coef, Integer denom)
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
            // v = ((a1*b2+a2*b1)*(u+c1)-sqrt((u+c1)^2-4*a1*b1*n))/(2*a1*b1)-c2
            // u = ((a1*b2+a2*b1)*(v+c2)-sqrt((v+c2)^2-4*a2*b2*n))/(2*a2*b2)-c1
            var sum = (Integer)0;
            var a = c1 * c1 - 2 * denom * n;
            var b = c1 * coef;
            var da = 2 * c1 - 1;
            for (var i = (Integer)1; i < max; i++)
            {
                da += 2;
                a += da;
                b += coef;
                sum += (b - IntegerMath.CeilingSquareRoot(a)) / denom;
            }
            return sum - (max - 1) * c2;
        }
    }
}
