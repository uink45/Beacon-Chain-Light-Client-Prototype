using System;
using System.Diagnostics;
using System.Numerics;

namespace Nethermind.Decompose.Numerics
{
    public class UInt32MontgomeryReduction : IReductionAlgorithm<uint>
    {
        private class Reducer : Reducer<UInt32MontgomeryReduction, uint>
        {
            private class Residue : Residue<Reducer, uint, uint>
            {
                public override bool IsZero { get { return r == 0; } }

                public override bool IsOne
                {
                    get
                    {
                        if (reducer.oneRep == 0)
                            reducer.oneRep = reducer.Reduce(1, reducer.rSquaredModN);
                        return r == reducer.oneRep;
                    }
                }

                public Residue(Reducer reducer)
                    : base(reducer)
                {
                }

                public Residue(Reducer reducer, uint x)
                    : base(reducer)
                {
                    Set(x);
                }

                public override IResidue<uint> Set(uint x)
                {
                    r = reducer.Reduce(x % reducer.modulus, reducer.rSquaredModN);
                    return this;
                }

                public override IResidue<uint> Set(IResidue<uint> x)
                {
                    r = GetRep(x);
                    return this;
                }

                public override IResidue<uint> Copy()
                {
                    var residue = new Residue(reducer);
                    residue.r = r;
                    return residue;
                }

                public override IResidue<uint> Multiply(IResidue<uint> x)
                {
                    r = reducer.Reduce(r, GetRep(x));
                    return this;
                }

                public override IResidue<uint> Power(uint exponent)
                {
                    if (exponent == 0)
                        return One();
                    var value = r;
                    var result = r;
                    --exponent;
                    while (exponent != 0)
                    {
                        if ((exponent & 1) != 0)
                            result = reducer.Reduce(result, value);
                        if (exponent != 1)
                            value = reducer.Reduce(value, value);
                        exponent >>= 1;
                    }
                    r = result;
                    return this;
                }

                private IResidue<uint> One()
                {
                    if (reducer.oneRep == 0)
                        reducer.oneRep = reducer.Reduce(1, reducer.rSquaredModN);
                    r = reducer.oneRep;
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

                public override uint Value
                {
                    get { return reducer.Reduce(r, 1); }
                }
            }

            private uint k0;
            private uint rSquaredModN;
            private uint oneRep;

            public Reducer(UInt32MontgomeryReduction reduction, uint modulus)
                : base(reduction, modulus)
            {
                if ((modulus & 1) == 0)
                    throw new InvalidOperationException("not relatively prime");
                var nInv = IntegerMath.ModularInversePowerOfTwoModulus(modulus, 32);
                k0 = IntegerMath.TwosComplement(nInv);
                var rModN = uint.MaxValue % modulus + 1;
                rSquaredModN = IntegerMath.ModularProduct(rModN, rModN, modulus);
            }

            public override IResidue<uint> ToResidue(uint x)
            {
                return new Residue(this, x);
            }

            private uint Reduce(uint u, uint v)
            {
                Debug.Assert(MontgomeryHelper.Reduce(u, v, modulus, k0) < modulus);
                return MontgomeryHelper.Reduce(u, v, modulus, k0);
            }
        }

        public IReducer<uint> GetReducer(uint modulus)
        {
            return new Reducer(this, modulus);
        }
    }
}
