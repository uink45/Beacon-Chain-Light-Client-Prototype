namespace Nethermind.Decompose.Numerics
{
    public class UInt32Reduction : IReductionAlgorithm<uint>
    {
        private class Reducer : Reducer<UInt32Reduction, uint>
        {
            private class Residue : Residue<Reducer, uint, uint>
            {
                public override bool IsZero { get { return r == 0; } }
                public override bool IsOne { get { return r == 1; } }

                public Residue(Reducer reducer, uint x)
                    : base(reducer, x % reducer.modulus)
                {
                }

                public override IResidue<uint> Set(uint x)
                {
                    r = x;
                    return this;
                }

                public override IResidue<uint> Set(IResidue<uint> x)
                {
                    r = GetRep(x);
                    return this;
                }

                public override IResidue<uint> Copy()
                {
                    return new Residue(reducer, r);
                }

                public override IResidue<uint> Multiply(IResidue<uint> x)
                {
                    r = IntegerMath.ModularProduct(r, GetRep(x), reducer.modulus);
                    return this;
                }

                public override IResidue<uint> Add(IResidue<uint> x)
                {
                    r = IntegerMath.ModularSum(r, GetRep(x), reducer.modulus);
                    return this;
                }

                public override IResidue<uint> Subtract(IResidue<uint> x)
                {
                    r = IntegerMath.ModularDifference(r, GetRep(x), reducer.modulus);
                    return this;
                }

                public override IResidue<uint> Power(uint x)
                {
                    r = IntegerMath.ModularPower(r, x, reducer.modulus);
                    return this;
                }

                public override uint Value
                {
                    get { return r; }
                }
            }

            public Reducer(UInt32Reduction reduction, uint modulus)
                : base(reduction, modulus)
            {
            }

            public override IResidue<uint> ToResidue(uint x)
            {
                return new Residue(this, x);
            }
        }

        public IReducer<uint> GetReducer(uint modulus)
        {
            return new Reducer(this, modulus);
        }
    }
}
