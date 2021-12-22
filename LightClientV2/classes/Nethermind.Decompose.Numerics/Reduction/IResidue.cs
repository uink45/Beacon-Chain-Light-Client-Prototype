using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Numerics;

namespace Nethermind.Decompose.Numerics
{
    public interface IResidue<T> : IComparable<IResidue<T>>, IEquatable<IResidue<T>>
    {
        IReducer<T> Reducer { get; }
        bool IsZero { get; }
        bool IsOne { get; }
        IResidue<T> Set(T x);
        IResidue<T> Set(IResidue<T> x);
        IResidue<T> Copy();
        IResidue<T> Multiply(IResidue<T> x);
        IResidue<T> Add(IResidue<T> x);
        IResidue<T> Subtract(IResidue<T> x);
        IResidue<T> Power(T x);
        T Value { get; }
    }
}
