using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace Nethermind.Decompose.Numerics
{
    public abstract class Reducer<TReduction, TValue> : IReducer<TValue>
        where TReduction : IReductionAlgorithm<TValue>
    {
        protected TReduction reduction;
        protected TValue modulus;
        protected Operations<TValue> ops;

        protected Reducer(TReduction reduction, TValue modulus)
        {
            this.reduction = reduction;
            this.modulus = modulus;
            this.ops = Operations.Get<TValue>();
        }

        public IReductionAlgorithm<TValue> Reduction
        {
            get { return reduction; }
        }

        public TValue Modulus
        {
            get { return modulus; }
        }

        public IResidue<TValue> ToResidue(int x)
        {
            return ToResidue(ops.Convert(x));
        }

        public abstract IResidue<TValue> ToResidue(TValue x);
    }
}
