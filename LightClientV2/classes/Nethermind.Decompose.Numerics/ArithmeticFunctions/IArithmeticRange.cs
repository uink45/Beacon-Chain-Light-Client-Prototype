using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace Nethermind.Decompose.Numerics
{
    public interface IArithmeticRange<TValue, TSum>
    {
        long Size { get; }
        void GetValues(long kmin, long kmax, TValue[] values);
        void GetValues(long kmin, long kmax, TValue[] values, long offset);
        TSum GetSums(long kmin, long kmax, TSum[] sums, TSum sum0);
        TSum GetSums(long kmin, long kmax, TSum[] sums, TSum sum0, long offset);
        TSum GetValuesAndSums(long kmin, long kmax, TValue[] values, TSum[] sums, TSum sum0);
        TSum GetValuesAndSums(long kmin, long kmax, TValue[] values, TSum[] sums, TSum sum0, long offset);
        void GetValues(long kmin, long kmax, Action<long, long, TValue[]> action);
    }
}
