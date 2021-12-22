using System;
using Nethermind.Dirichlet.Numerics;
using System.Diagnostics;

namespace Nethermind.Decompose.Numerics
{
    public class UInt128MontgomeryReduction : IReductionAlgorithm<UInt128>
    {
        private class Reducer : Reducer<UInt128MontgomeryReduction, UInt128>
        {
            private class Residue : Residue<Reducer, UInt128, UInt128>
            {
                public override bool IsZero { get { return r == 0; } }

                public override bool IsOne
                {
                    get
                    {
                        if (reducer.oneRep == 0)
                            reducer.Reduce(out reducer.oneRep, ref reducer.rSquaredModN);
                        return r == reducer.oneRep;
                    }
                }

                public Residue(Reducer reducer)
                    : base(reducer)
                {
                }

                public Residue(Reducer reducer, UInt128 x)
                    : base(reducer)
                {
                    Set(x);
                }

                public override IResidue<UInt128> Set(UInt128 x)
                {
                    if (x >= reducer.modulus)
                        x %= reducer.Modulus;
                    reducer.Reduce(out r, ref x, ref reducer.rSquaredModN);
                    return this;
                }

                public override IResidue<UInt128> Set(IResidue<UInt128> x)
                {
                    r = GetRep(x);
                    return this;
                }

                public override IResidue<UInt128> Copy()
                {
                    var residue = new Residue(reducer);
                    residue.r = r;
                    return residue;
                }

                public override IResidue<UInt128> Multiply(IResidue<UInt128> x)
                {
                    var xRep = GetRep(x);
                    var rRep = r;
                    reducer.Reduce(out r, ref rRep, ref xRep);
                    return this;
                }

                public override IResidue<UInt128> Power(UInt128 exponent)
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
                            reducer.Reduce(out result, ref result, ref value);
                        if (exponent != 1)
                            reducer.Reduce(out value, ref value, ref value);
                        exponent >>= 1;
                    }
                    r = result;
                    return this;
                }

                public override IResidue<UInt128> Add(IResidue<UInt128> x)
                {
                    var rRep = r;
                    var xRep = GetRep(x);
                    UInt128.ModAdd(out r, ref rRep, ref xRep, ref reducer.modulus);
                    return this;
                }

                public override IResidue<UInt128> Subtract(IResidue<UInt128> x)
                {
                    var rRep = r;
                    var xRep = GetRep(x);
                    UInt128.ModSub(out r, ref rRep, ref xRep, ref reducer.modulus);
                    return this;
                }

                public override UInt128 Value
                {
                    get
                    {
                        UInt128 value;
                        reducer.Reduce(out value, ref r);
                        return value;
                    }
                }
            }

            private ulong k0;
            private UInt128 rSquaredModN;
            private UInt128 oneRep;

            public Reducer(UInt128MontgomeryReduction reduction, UInt128 modulus)
                : base(reduction, modulus)
            {
                if ((modulus & 1) == 0)
                    throw new InvalidOperationException("not relatively prime");
                var rModN = UInt128.MaxValue % modulus + 1;
                rSquaredModN = IntegerMath.ModularProduct(rModN, rModN, modulus);
                var nInv = IntegerMath.ModularInversePowerOfTwoModulus(modulus, 128);
                k0 = (ulong)IntegerMath.TwosComplement(nInv);
                oneRep = 0;
            }

            public override IResidue<UInt128> ToResidue(UInt128 x)
            {
                return new Residue(this, x);
            }

            private void Reduce(out UInt128 result, ref UInt128 u, ref UInt128 v)
            {
                UInt128.Reduce(out result, ref u, ref v, ref modulus, k0);
            }

            private void Reduce(out UInt128 result, ref UInt128 t)
            {
                UInt128.Reduce(out result, ref t, ref modulus, k0);
            }
        }

        public IReducer<UInt128> GetReducer(UInt128 modulus)
        {
            return new Reducer(this, modulus);
        }
    }
}
