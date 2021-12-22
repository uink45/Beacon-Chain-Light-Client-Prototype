using System;
using System.Collections.Generic;
using System.Linq;
using System.Numerics;
using System.Text;

namespace Nethermind.Decompose.Numerics
{
    public interface IDivisorSummatoryFunction<T>
    {
        T Evaluate(T n);
        T Evaluate(T n, T x1, T x2);
    }
}
