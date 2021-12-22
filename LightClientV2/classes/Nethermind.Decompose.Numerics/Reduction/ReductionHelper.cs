using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace Nethermind.Decompose.Numerics
{
    public static class ReductionHelper
    {
        public static void Power<T>(IResidue<T> value, T exponent)
        {
            var reducer = value.Reducer;
            var ops = Operations.Get<T>();
            var result = reducer.ToResidue(ops.One);
            while (!ops.IsZero(exponent))
            {
                var word = ops.LeastSignificantWord(exponent);
                exponent = ops.RightShift(exponent, 32);
                if (!ops.IsZero(exponent))
                {
                    for (int i = 0; i < 32; i++)
                    {
                        if ((word & 1) != 0)
                            result.Multiply(value);
                        value.Multiply(value);
                        word >>= 1;
                    }
                }
                else
                {
                    while (word != 0)
                    {
                        if ((word & 1) != 0)
                            result.Multiply(value);
                        if (word != 1)
                            value.Multiply(value);
                        word >>= 1;
                    }
                }
            }
            value.Set(result);
        }
    }
}
