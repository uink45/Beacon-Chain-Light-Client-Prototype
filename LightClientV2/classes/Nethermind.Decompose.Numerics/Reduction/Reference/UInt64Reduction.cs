namespace Nethermind.Decompose.Numerics
{
    public class UInt64Reduction : IReductionAlgorithm<ulong>
    {
        private class Reducer : Reducer<UInt64Reduction, ulong>
        {
            private class Residue : Residue<Reducer, ulong, ulong>
            {
                public override bool IsZero { get { return r == 0; } }
                public override bool IsOne { get { return r == 1; } }

                public Residue(Reducer reducer, ulong x)
                    : base(reducer, x % reducer.modulus)
                {
                }

                public override IResidue<ulong> Set(ulong x)
                {
                    r = x % reducer.modulus;
                    return this;
                }

                public override IResidue<ulong> Set(IResidue<ulong> x)
                {
                    r = GetRep(x);
                    return this;
                }

                public override IResidue<ulong> Copy()
                {
                    return new Residue(reducer, r);
                }

                public override IResidue<ulong> Multiply(IResidue<ulong> x)
                {
                    r = IntegerMath.ModularProduct(r, GetRep(x), reducer.modulus);
                    return this;
                }

                public override IResidue<ulong> Add(IResidue<ulong> x)
                {
                    r = IntegerMath.ModularSum(r, GetRep(x), reducer.modulus);
                    return this;
                }

                public override IResidue<ulong> Subtract(IResidue<ulong> x)
                {
                    r = IntegerMath.ModularDifference(r, GetRep(x), reducer.modulus);
                    return this;
                }

                public override IResidue<ulong> Power(ulong x)
                {
                    r = IntegerMath.ModularPower(r, x, reducer.modulus);
                    return this;
                }

                public override ulong Value
                {
                    get { return r; }
                }
            }

            public Reducer(UInt64Reduction reduction, ulong modulus)
                : base(reduction, modulus)
            {
            }

            public override IResidue<ulong> ToResidue(ulong x)
            {
                return new Residue(this, x);
            }
        }

        public IReducer<ulong> GetReducer(ulong modulus)
        {
            return new Reducer(this, modulus);
        }
    }
}
