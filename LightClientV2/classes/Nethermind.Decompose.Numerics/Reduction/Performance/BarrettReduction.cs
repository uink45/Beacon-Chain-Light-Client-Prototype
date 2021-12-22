using System;
using System.Diagnostics;
using System.Numerics;

namespace Nethermind.Decompose.Numerics
{
    public class BarrettReduction : IReductionAlgorithm<BigInteger>
    {
        private class Reducer : IReducer<BigInteger>
        {
            private class Residue : IResidue<BigInteger>
            {
                private Reducer reducer;
                private MutableInteger r;

                public IReducer<BigInteger> Reducer { get { return reducer; } }
                public bool IsZero { get { return r.IsZero; } }
                public bool IsOne { get { return r.IsOne; } }

                protected Residue(Reducer reducer)
                {
                    this.reducer = reducer;
                }

                public Residue(Reducer reducer, BigInteger x)
                    : this(reducer)
                {
                    r = reducer.CreateRep();
                    r.Set(x);
                    reducer.Reduce(r);
                }

                public IResidue<BigInteger> Set(BigInteger x)
                {
                    r.Set(x);
                    return this;
                }

                public IResidue<BigInteger> Set(IResidue<BigInteger> x)
                {
                    r.Set(((Residue)x).r);
                    return this;
                }

                public IResidue<BigInteger> Copy()
                {
                    var residue = new Residue(reducer);
                    residue.r = reducer.CreateRep();
                    residue.r.Set(r);
                    return residue;
                }

                public IResidue<BigInteger> Multiply(IResidue<BigInteger> x)
                {
                    r.Multiply(((Residue)x).r, reducer.store);
                    reducer.Reduce(r);
                    return this;
                }

                public IResidue<BigInteger> Add(IResidue<BigInteger> x)
                {
                    r.AddModulo(((Residue)x).r, reducer.pRep);
                    return this;
                }

                public IResidue<BigInteger> Subtract(IResidue<BigInteger> x)
                {
                    r.Subtract(((Residue)x).r);
                    return this;
                }

                public IResidue<BigInteger> Power(BigInteger x)
                {
                    ReductionHelper.Power(this, x);
                    return this;
                }

                public bool Equals(IResidue<BigInteger> other)
                {
                    return r == ((Residue)other).r;
                }

                public int CompareTo(IResidue<BigInteger> other)
                {
                    return r.CompareTo(((Residue)other).r);
                }

                public BigInteger Value
                {
                    get { return r; }
                }

                public override string ToString()
                {
                    return Value.ToString();
                }
            }

            private IReductionAlgorithm<BigInteger> reduction;
            private BigInteger p;
            private int bLength;
            private BigInteger b;
            private int k;
            private BigInteger mu;

            private int length;
            private int bToTheKMinusOneLength;
            private int bToTheKPlusOneLength;
            private MutableIntegerStore store;

            private MutableInteger muRep;
            private MutableInteger pRep;

            public IReductionAlgorithm<BigInteger> Reduction { get { return reduction; } }
            public BigInteger Modulus { get { return p; } }

            public Reducer(IReductionAlgorithm<BigInteger> reduction, BigInteger p)
            {
                this.reduction = reduction;
                this.p = p;
                bLength = 32;
                b = BigInteger.One << bLength;
                var pLength = p.GetBitLength();
                k = ((int)pLength - 1) / bLength + 1;
                mu = BigInteger.Pow(b, 2 * k) / p;

                var muLength = mu.GetBitLength();
                length = ((int)pLength + 31) / 32 * 2 + ((int)muLength + 31) / 32;
                store = new MutableIntegerStore(length);
                muRep = store.Allocate();
                pRep = store.Allocate();
                muRep.Set(mu);
                pRep.Set(p);
                bToTheKMinusOneLength = bLength * (k - 1);
                bToTheKPlusOneLength = bLength * (k + 1);
            }

            public IResidue<BigInteger> ToResidue(BigInteger x)
            {
                return new Residue(this, x);
            }

            public IResidue<BigInteger> ToResidue(int x)
            {
                return new Residue(this, x);
            }

            private MutableInteger CreateRep()
            {
                return new MutableInteger(length);
            }

            private void Reduce(MutableInteger z)
            {
                // var qhat = (z >> (bLength * (k - 1))) * mu >> (bLength * (k + 1));
                var reg1 = store.Allocate().Set(z);
                reg1.RightShift(bToTheKMinusOneLength);
#if false
                var reg2.store.Allocate().SetProductShifted(reg1, muRep, bToTheKPlusOneLength);
#else
                var reg2 = store.Allocate().SetProduct(reg1, muRep);
                reg2.RightShift(bToTheKPlusOneLength);
#endif
                // var r = z % bToTheKPlusOne - qhat * p % bToTheKPlusOne;
                z.Mask(bToTheKPlusOneLength);
#if true
                reg1.SetProductMasked(reg2, pRep, bToTheKPlusOneLength);
#else
                reg1.SetProduct(reg2, pRep);
                reg1.Mask(bToTheKPlusOneLength);
#endif
                // if (r.Sign == -1) r += bToTheKPlusOne;
                if (z < reg1)
                    z.SetBit(bToTheKPlusOneLength, true);
                z.Subtract(reg1);
                // while (r >= p) r -= p;
                while (z >= pRep)
                    z.Subtract(pRep);
                store.Release(reg1);
                store.Release(reg2);
            }
        }

        public IReducer<BigInteger> GetReducer(BigInteger n)
        {
            return new Reducer(this, n);
        }
    }
}
