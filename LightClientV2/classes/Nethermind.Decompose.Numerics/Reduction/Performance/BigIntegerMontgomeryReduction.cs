using System;
using System.Diagnostics;
using System.Numerics;

namespace Nethermind.Decompose.Numerics
{
    public class BigIntegerMontgomeryReduction : IReductionAlgorithm<BigInteger>
    {
        private class Reducer : Reducer<BigIntegerMontgomeryReduction, BigInteger>
        {
            private class Residue : Residue<Reducer, BigInteger, MutableInteger>
            {
                public override bool IsZero { get { return r == 0; } }
                public override bool IsOne { get { return r == reducer.oneRep; } }

                public Residue(Reducer reducer)
                    : base(reducer, reducer.CreateRep())
                {
                }

                public Residue(Reducer reducer, BigInteger x)
                    : base(reducer, reducer.CreateRep())
                {
                    Set(x);
                }

                public override IResidue<BigInteger> Set(BigInteger x)
                {
                    r.Set(x).Multiply(reducer.rSquaredModNRep, reducer.store);
                    reducer.Reduce(r);
                    return this;
                }

                public override IResidue<BigInteger> Set(IResidue<BigInteger> x)
                {
                    r.Set(GetRep(x));
                    return this;
                }

                public override IResidue<BigInteger> Copy()
                {
                    var residue = new Residue(reducer);
                    residue.r.Set(r);
                    return residue;
                }

#if false
                public override IResidue<BigInteger> Multiply(IResidue<BigInteger> x)
                {
                    // Use SOS for everything.
                    r.Multiply(GetRep(x), reducer.store);
                    reducer.Reduce(r);
                    return this;
                }
#endif

#if false
                public override IResidue<BigInteger> Multiply(IResidue<BigInteger> x)
                {
                    // Use SOS for squaring and CIOS otherwise.
                    if (x == this)
                    {
                        r.Multiply(r, reducer.store);
                        reducer.Reduce(r);
                    }
                    else
                    {
                        var reg1 = reducer.store.Allocate().Set(r);
                        reg1.Set(r);
                        reducer.Reduce(r, reg1, GetRep(x));
                        reducer.store.Release(reg1);
                    }
                    return this;
                }
#endif

#if true
                public override IResidue<BigInteger> Multiply(IResidue<BigInteger> x)
                {
                    // Use CIOS for everything.
                    var reg1 = reducer.store.Allocate().Set(r);
                    if (x == this)
                        reducer.Reduce(r, reg1, reg1);
                    else
                        reducer.Reduce(r, reg1, GetRep(x));
                    reducer.store.Release(reg1);
                    return this;
                }
#endif

                public override IResidue<BigInteger> Add(IResidue<BigInteger> x)
                {
                    r.AddModulo(GetRep(x), reducer.nRep);
                    return this;
                }

                public override IResidue<BigInteger> Subtract(IResidue<BigInteger> x)
                {
                    r.Subtract(GetRep(x));
                    return this;
                }

                public override BigInteger Value
                {
                    get
                    {
                        var reg1 = reducer.store.Allocate().Set(r);
                        reg1.Set(r);
                        reducer.Reduce(reg1);
                        var result = (BigInteger)reg1;
                        reducer.store.Release(reg1);
                        return result;
                    }
                }
            }

            private int length;
            private uint k0;
            private MutableIntegerStore store;

            private MutableInteger nRep;
            private MutableInteger rSquaredModNRep;
            private MutableInteger oneRep;

            public Reducer(BigIntegerMontgomeryReduction reduction, BigInteger modulus)
                : base(reduction, modulus)
            {
                if (modulus.IsEven)
                    throw new InvalidOperationException("not relatively prime");
                var rLength = (modulus.GetBitLength() + 31) / 32 * 32;
                length = 2 * (int)rLength / 32 + 1;
                store = new MutableIntegerStore(length);
                nRep = store.Allocate().Set(modulus);
                var rRep = store.Allocate().Set(1).LeftShift((int)rLength);
                var nInv = store.Allocate().SetModularInversePowerOfTwoModulus(nRep, (int)rLength, store);
                var kRep = store.Allocate().Set(rRep).Subtract(nInv);
                k0 = kRep.LeastSignificantWord;
                rSquaredModNRep = store.Allocate().SetSquare(rRep).Modulo(nRep);
                oneRep = store.Allocate().Set(1).Multiply(rSquaredModNRep, store);
                store.Release(rRep);
                store.Release(nInv);
                store.Release(kRep);
                Reduce(oneRep);
            }

            public override IResidue<BigInteger> ToResidue(BigInteger x)
            {
                return new Residue(this, x);
            }

            private MutableInteger CreateRep()
            {
                return new MutableInteger(length);
            }

            private void Reduce(MutableInteger t, MutableInteger u, MutableInteger v)
            {
                t.MontgomeryCIOS(u, v, nRep, k0);
                if (t >= nRep)
                    t.Subtract(nRep);
                Debug.Assert(t < nRep);
            }

            private void Reduce(MutableInteger t)
            {
                t.MontgomerySOS(nRep, k0);
                if (t >= nRep)
                    t.Subtract(nRep);
                Debug.Assert(t < nRep);
            }
        }

        public IReducer<BigInteger> GetReducer(BigInteger n)
        {
            return new Reducer(this, n);
        }
    }
}
