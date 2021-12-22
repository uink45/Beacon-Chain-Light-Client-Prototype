using System.Numerics;
using System.Diagnostics;

namespace Nethermind.Decompose.Numerics
{
    public class Int32Reduction : IReductionAlgorithm<int>
    {
        private class Reducer : IReducer<int>
        {
            private class Residue : IResidue<int>
            {
                private Reducer reducer;
                private int r;

                public IReducer<int> Reducer { get { return reducer; } }
                public bool IsZero { get { return r == 0; } }
                public bool IsOne { get { return r == 1; } }

                protected Residue(Reducer reducer)
                {
                    this.reducer = reducer;
                }

                public Residue(Reducer reducer, int x)
                    : this(reducer)
                {
                    this.r = x % reducer.Modulus;
                }

                public IResidue<int> Set(int x)
                {
                    r = x;
                    return this;
                }

                public IResidue<int> Set(IResidue<int> x)
                {
                    r = ((Residue)x).r;
                    return this;
                }

                public IResidue<int> Copy()
                {
                    var residue = new Residue(reducer);
                    residue.r = r;
                    return residue;
                }

                public IResidue<int> Multiply(IResidue<int> x)
                {
                    r = IntegerMath.ModularProduct(r, ((Residue)x).r, reducer.Modulus);
                    return this;
                }

                public IResidue<int> Add(IResidue<int> x)
                {
                    r += ((Residue)x).r;
                    if (r >= reducer.Modulus)
                        r -= reducer.Modulus;
                    return this;
                }

                public IResidue<int> Subtract(IResidue<int> x)
                {
                    var xr = ((Residue)x).r;
                    if (r < xr)
                        r += reducer.Modulus - xr;
                    else
                        r -= xr;
                    return this;
                }

                public IResidue<int> Power(int x)
                {
                    r = IntegerMath.ModularPower(r, x, reducer.Modulus);
                    return this;
                }

                public int Value
                {
                    get { return r; }
                }

                public override string ToString()
                {
                    return Value.ToString();
                }

                public bool Equals(IResidue<int> other)
                {
                    return r == ((Residue)other).r;
                }

                public int CompareTo(IResidue<int> other)
                {
                    return r.CompareTo(((Residue)other).r);
                }
            }

            private IReductionAlgorithm<int> reduction;
            private int n;

            public IReductionAlgorithm<int> Reduction { get { return reduction; } }
            public int Modulus { get { return n; } }

            public Reducer(IReductionAlgorithm<int> reduction, int n)
            {
                this.reduction = reduction;
                this.n = n;
            }

            public IResidue<int> ToResidue(int x)
            {
                return new Residue(this, x);
            }
        }

        public IReducer<int> GetReducer(int n)
        {
            return new Reducer(this, n);
        }
    }
}
