using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace Nethermind.Decompose.Numerics
{
    public static class MutableIntegerExtensions
    {
        public static MutableInteger SetGreatestCommonDivisor(this MutableInteger c, MutableInteger a, MutableInteger b, MutableIntegerStore store)
        {
            var reg1 = store.Allocate();
            if (a.IsZero)
                c.Set(b);
            else if (b.IsZero)
                c.Set(a);
            else
            {
                reg1.Set(a);
                c.Set(b);
                while (true)
                {
                    reg1.Modulo(c);
                    if (reg1.IsZero)
                        break;
                    c.Modulo(reg1);
                    if (c.IsZero)
                    {
                        c.Set(reg1);
                        break;
                    }
                }
            }
            store.Release(reg1);
            return c;
        }

        public static MutableInteger SetModularInverse(this MutableInteger c, MutableInteger a, MutableInteger b, MutableIntegerStore store)
        {
            var p = store.Allocate().Set(a);
            var q = store.Allocate().Set(b);
            var x0 = store.Allocate().Set(1);
            var x1 = store.Allocate().Set(0);
            var quotient = store.Allocate();
            var remainder = store.Allocate();
            var product = store.Allocate();

            while (!q.IsZero)
            {
                remainder.Set(p).ModuloWithQuotient(q, quotient);
                var tmpp = p;
                p = q;
                q = tmpp.Set(remainder);
                var tmpx = x1;
                x1 = x0.Subtract(product.SetProduct(quotient, x1));
                x0 = tmpx;
            }
            c.Set(x0);
            if (c.Sign == -1)
                c.Add(b);

            store.Release(p);
            store.Release(q);
            store.Release(x0);
            store.Release(x1);
            store.Release(quotient);
            store.Release(remainder);
            return c;
        }

        public static MutableInteger SetModularInversePowerOfTwoModulus(this MutableInteger c, MutableInteger d, int n, MutableIntegerStore store)
        {
            // See 9.2 in: http://gmplib.org/~tege/divcnst-pldi94.pdf
            c.Set(d);
            var two = store.Allocate().Set(2);
            var reg1 = store.Allocate();
            var reg2 = store.Allocate();
            for (int m = 3; m < n; m *= 2)
            {
                reg1.Set(c);
                reg2.SetProduct(reg1, d);
                reg2.Mask(n);
                reg2.SetDifference(two, reg2);
                c.SetProduct(reg1, reg2);
                c.Mask(n);
            }
            if (c.Sign == -1)
                c.Add(reg1.Set(1).LeftShift(n));
            store.Release(two);
            store.Release(reg1);
            store.Release(reg2);
            return c;
        }
    }
}
