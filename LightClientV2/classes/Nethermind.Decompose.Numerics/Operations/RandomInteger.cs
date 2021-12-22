using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace Nethermind.Decompose.Numerics
{
    public class RandomInteger<T> : IRandomNumberAlgorithm<Number<T>>
    {
        IRandomNumberAlgorithm<T> random;

        public RandomInteger(uint seed)
        {
            random = new MersenneTwister(seed).Create<T>();
        }

        public Number<T> Next(Number<T> n)
        {
            return random.Next(n);
        }

        public IEnumerable<Number<T>> Sequence(Number<T> n)
        {
            while (true)
                yield return Next(n);
        }
    }
}
