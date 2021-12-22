using System.Numerics;
using System.Diagnostics;

namespace Nethermind.Decompose.Numerics
{
    public class MutableIntegerReduction : IReductionAlgorithm<BigInteger>
    {
        private class Reducer : Reducer<MutableIntegerReduction, BigInteger>
        {
            private class Residue : Residue<Reducer, BigInteger, MutableInteger>
            {
                public override bool IsZero { get { return r.IsZero; } }
                public override bool IsOne { get { return r.IsOne; } }

                protected Residue(Reducer reducer)
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
                    r.Set(x).Modulo(reducer.modulus);
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

                public override IResidue<BigInteger> Multiply(IResidue<BigInteger> x)
                {
                    var reg1 = reducer.store.Allocate().Set(r);
                    if (x == this)
                        r.SetSquare(reg1);
                    else
                        r.SetProduct(reg1, GetRep(x));
                    r.Modulo(reducer.modulus);
                    reducer.store.Release(reg1);
                    return this;
                }

                public override IResidue<BigInteger> Add(IResidue<BigInteger> x)
                {
                    r.AddModulo(GetRep(x), reducer.nRep);
                    return this;
                }

                public override IResidue<BigInteger> Subtract(IResidue<BigInteger> x)
                {
                    r.SubtractModulo(GetRep(x), reducer.nRep);
                    return this;
                }

                public override BigInteger Value
                {
                    get { return r; }
                }

                public override string ToString()
                {
                    return Value.ToString();
                }
            }

            private int length;
            private MutableIntegerStore store;

            private MutableInteger nRep;

            public Reducer(MutableIntegerReduction reduction, BigInteger n)
                : base(reduction, n)
            {
                length = ((int)n.GetBitLength() + 31) / 32 * 2 + 1;
                store = new MutableIntegerStore(length);
                nRep = store.Allocate();
                nRep.Set(n);
            }

            public override IResidue<BigInteger> ToResidue(BigInteger x)
            {
                return new Residue(this, x);
            }

            private MutableInteger CreateRep()
            {
                return new MutableInteger(length);
            }
        }

        public IReducer<BigInteger> GetReducer(BigInteger n)
        {
            return new Reducer(this, n);
        }
    }
}
