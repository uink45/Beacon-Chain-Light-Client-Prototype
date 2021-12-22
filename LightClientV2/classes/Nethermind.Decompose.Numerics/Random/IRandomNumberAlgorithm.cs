using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace Nethermind.Decompose.Numerics
{
    public interface IRandomNumberAlgorithm<T>
    {
        T Next(T n);
        IEnumerable<T> Sequence(T n);
    }
}
