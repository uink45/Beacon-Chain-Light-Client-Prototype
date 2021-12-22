using System.Numerics;
using System.Diagnostics;

namespace Nethermind.Decompose.Numerics
{
    public class Int64Reduction : IReductionAlgorithm<long>
    {
        private class Reducer : IReducer<long>
        {
            private class Residue : IResidue<long>
            {
                private Reducer reducer;
                private long r;

                public IReducer<long> Reducer { get { return reducer; } }
                public bool IsZero { get { return r == 0; } }
                public bool IsOne { get { return r == 1; } }

                protected Residue(Reducer reducer)
                {
                    this.reducer = reducer;
                }

                public Residue(Reducer reducer, long x)
                    : this(reducer)
                {
                    this.r = x % reducer.Modulus;
                }

                public IResidue<long> Set(long x)
                {
                    r = x;
                    return this;
                }

                public IResidue<long> Set(IResidue<long> x)
                {
                    r = ((Residue)x).r;
                    return this;
                }

                public IResidue<long> Copy()
                {
                    var residue = new Residue(reducer);
                    residue.r = r;
                    return residue;
                }

                public IResidue<long> Multiply(IResidue<long> x)
                {
                    r = IntegerMath.ModularProduct(r, ((Residue)x).r, reducer.Modulus);
                    return this;
                }

                public IResidue<long> Add(IResidue<long> x)
                {
                    r += ((Residue)x).r;
                    if (r >= reducer.Modulus)
                        r -= reducer.Modulus;
                    return this;
                }

                public IResidue<long> Subtract(IResidue<long> x)
                {
                    var xr = ((Residue)x).r;
                    if (r < xr)
                        r += reducer.Modulus - xr;
                    else
                        r -= xr;
                    return this;
                }

                public IResidue<long> Power(long x)
                {
                    r = IntegerMath.ModularPower(r, x, reducer.Modulus);
                    return this;
                }

                public long Value
                {
                    get { return r; }
                }

                public override string ToString()
                {
                    return Value.ToString();
                }

                public bool Equals(IResidue<long> other)
                {
                    return r == ((Residue)other).r;
                }

                public int CompareTo(IResidue<long> other)
                {
                    return r.CompareTo(((Residue)other).r);
                }
            }

            private IReductionAlgorithm<long> reduction;
            private long n;

            public IReductionAlgorithm<long> Reduction { get { return reduction; } }
            public long Modulus { get { return n; } }

            public Reducer(IReductionAlgorithm<long> reduction, long n)
            {
                this.reduction = reduction;
                this.n = n;
            }

            public IResidue<long> ToResidue(long x)
            {
                return new Residue(this, x);
            }

            public IResidue<long> ToResidue(int x)
            {
                return new Residue(this, x);
            }
        }

        public IReducer<long> GetReducer(long n)
        {
            return new Reducer(this, n);
        }
    }
}
