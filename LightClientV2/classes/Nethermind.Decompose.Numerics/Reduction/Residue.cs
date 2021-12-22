using System;

namespace Nethermind.Decompose.Numerics
{
    public abstract class Residue<TReducer, TValue, TRep> : IResidue<TValue>
        where TReducer : IReducer<TValue>
        where TRep : IEquatable<TRep>, IComparable<TRep>
    {
        protected TReducer reducer;
        protected TRep r;

        public IReducer<TValue> Reducer { get { return reducer; } }

        protected Residue(TReducer reducer)
        {
            this.reducer = reducer;
        }

        protected Residue(TReducer reducer, TRep r)
        {
            this.reducer = reducer;
            this.r = r;
        }

        public bool Equals(IResidue<TValue> other)
        {
            return r.Equals(GetRep(other));
        }

        public int CompareTo(IResidue<TValue> other)
        {
            return r.CompareTo(GetRep(other));
        }

        public static TRep GetRep(IResidue<TValue> x)
        {
            return ((Residue<TReducer, TValue, TRep>)x).r;
        }

        public virtual IResidue<TValue> Power(TValue x)
        {
            ReductionHelper.Power(this, x);
            return this;
        }

        public override string ToString()
        {
            return Value.ToString();
        }

        public abstract bool IsZero { get; }
        public abstract bool IsOne { get; }
        public abstract IResidue<TValue> Set(TValue x);
        public abstract IResidue<TValue> Set(IResidue<TValue> x);
        public abstract IResidue<TValue> Copy();
        public abstract IResidue<TValue> Multiply(IResidue<TValue> x);
        public abstract IResidue<TValue> Add(IResidue<TValue> x);
        public abstract IResidue<TValue> Subtract(IResidue<TValue> x);
        public abstract TValue Value { get; }
    }
}
