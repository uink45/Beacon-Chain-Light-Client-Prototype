using Nethermind.Dirichlet.Numerics;
namespace Nethermind.Decompose.Numerics
{
    public class UInt128Reduction : IReductionAlgorithm<UInt128>
    {
        private class Reducer : Reducer<UInt128Reduction, UInt128>
        {
            private class Residue : Residue<Reducer, UInt128, UInt128>
            {
                public override bool IsZero { get { return r == 0; } }
                public override bool IsOne { get { return r == 1; } }

                public Residue(Reducer reducer, UInt128 x)
                    : base(reducer, x % reducer.modulus)
                {
                }

                public override IResidue<UInt128> Set(UInt128 x)
                {
                    r = x % reducer.modulus;
                    return this;
                }

                public override IResidue<UInt128> Set(IResidue<UInt128> x)
                {
                    r = GetRep(x);
                    return this;
                }

                public override IResidue<UInt128> Copy()
                {
                    return new Residue(reducer, r);
                }

                public override IResidue<UInt128> Multiply(IResidue<UInt128> x)
                {
                    r = IntegerMath.ModularProduct(r, GetRep(x), reducer.modulus);
                    return this;
                }

                public override IResidue<UInt128> Add(IResidue<UInt128> x)
                {
                    r = IntegerMath.ModularSum(r, GetRep(x), reducer.modulus);
                    return this;
                }

                public override IResidue<UInt128> Subtract(IResidue<UInt128> x)
                {
                    r = IntegerMath.ModularDifference(r, GetRep(x), reducer.modulus);
                    return this;
                }

                public override IResidue<UInt128> Power(UInt128 x)
                {
                    r = IntegerMath.ModularPower(r, x, reducer.modulus);
                    return this;
                }

                public override UInt128 Value
                {
                    get { return r; }
                }
            }

            public Reducer(UInt128Reduction reduction, UInt128 modulus)
                : base(reduction, modulus)
            {
            }

            public override IResidue<UInt128> ToResidue(UInt128 x)
            {
                return new Residue(this, x);
            }
        }

        public IReducer<UInt128> GetReducer(UInt128 modulus)
        {
            return new Reducer(this, modulus);
        }
    }
}
