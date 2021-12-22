using System;

namespace Nethermind.Decompose.Numerics
{
    public class UInt64MontgomeryReduction : IReductionAlgorithm<ulong>
    {
        private class Reducer : Reducer<UInt64MontgomeryReduction, ulong>
        {
            private class Residue : Residue<Reducer, ulong, ulong>
            {
                public override bool IsZero { get { return r == 0; } }

                public override bool IsOne
                {
                    get
                    {
                        if (reducer.oneRep == 0)
                            reducer.oneRep = reducer.Reduce(reducer.rSquaredModN);
                        return r == reducer.oneRep;
                    }
                }

                public Residue(Reducer reducer)
                    : base(reducer)
                {
                }

                public Residue(Reducer reducer, ulong x)
                    : base(reducer)
                {
                    Set(x);
                }

                public override IResidue<ulong> Set(ulong x)
                {
                    if (x >= reducer.modulus)
                        x %= reducer.modulus;
                    r = reducer.Reduce(x, reducer.rSquaredModN);
                    return this;
                }

                public override IResidue<ulong> Set(IResidue<ulong> x)
                {
                    r = GetRep(x);
                    return this;
                }

                public override IResidue<ulong> Copy()
                {
                    var residue = new Residue(reducer);
                    residue.r = r;
                    return residue;
                }

                public override IResidue<ulong> Multiply(IResidue<ulong> x)
                {
                    r = reducer.Reduce(r, GetRep(x));
                    return this;
                }

                public override IResidue<ulong> Power(ulong exponent)
                {
                    if (exponent == 0)
                    {
                        r = reducer.oneRep;
                        return this;
                    }
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

                public override ulong Value
                {
                    get { return reducer.Reduce(r); }
                }
            }

            private uint k0;
            private ulong rSquaredModN;
            private ulong oneRep;

            public Reducer(UInt64MontgomeryReduction reduction, ulong modulus)
                : base(reduction, modulus)
            {
                if ((modulus & 1) == 0)
                    throw new InvalidOperationException("not relatively prime");
                int rLength = modulus == (uint)modulus ? 32 : 64;
                var rMinusOne = rLength == 32 ? uint.MaxValue : ulong.MaxValue;
                var rModN = rMinusOne % modulus + 1;
                rSquaredModN = IntegerMath.ModularProduct(rModN, rModN, modulus);
                var nInv = IntegerMath.ModularInversePowerOfTwoModulus(modulus, rLength);
                k0 = (uint)IntegerMath.TwosComplement(nInv);
                oneRep = 0;
            }

            public override IResidue<ulong> ToResidue(ulong x)
            {
                return new Residue(this, x);
            }

            private ulong Reduce(ulong u, ulong v)
            {
                return MontgomeryHelper.Reduce(u, v, modulus, k0);
            }

            private ulong Reduce(ulong t)
            {
                return MontgomeryHelper.Reduce(t, modulus, k0);
            }
        }

        public IReducer<ulong> GetReducer(ulong modulus)
        {
            return new Reducer(this, modulus);
        }
    }
}
