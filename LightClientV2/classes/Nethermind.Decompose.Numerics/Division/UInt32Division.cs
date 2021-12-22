using System;
using System.Diagnostics;

namespace Nethermind.Decompose.Numerics
{
    public struct UInt32Division0 : IDivisionAlgorithm<uint, uint>
    {
        private uint d;

        public uint Divisor
        {
            get { return d; }
        }

        public UInt32Division0(uint d)
        {
            this.d = d;
        }

        public uint Divide(uint k)
        {
            return k / d;
        }

        public uint Modulus(uint k)
        {
            return (uint)(k % d);
        }

        public bool IsDivisible(uint k)
        {
            return k % d == 0;
        }
    }

    public struct UInt32Division1 : IDivisionAlgorithm<uint, uint>
    {
        private uint d;
        private uint m;
        private int sh1;
        private int sh2;

        public uint Divisor
        {
            get { return d; }
        }

        public UInt32Division1(uint d)
        {
            this.d = d;
            var l = (int)Math.Ceiling(Math.Log(d, 2));
            m = (uint)((((1ul << l) - d) << 32) / d + 1);
            sh1 = Math.Min(l, 1);
            sh2 = Math.Max(l - 1, 0);
        }

        public uint Divide(uint k)
        {
            var t = (uint)(((ulong)m * k) >> 32);
            return (((k - t) >> sh1) + t) >> sh2;
        }

        public uint Modulus(uint k)
        {
            var t = (uint)(((ulong)m * k) >> 32);
            return k - ((((k - t) >> sh1) + t) >> sh2) * d;
        }

        public bool IsDivisible(uint k)
        {
            return Modulus(k) == 0;
        }
    }

    public struct UInt32Division2 : IDivisionAlgorithm<uint, uint>
    {
        private ulong recip;
        private uint rcorrect;
        private uint d;

        public uint Divisor
        {
            get { return d; }
        }

        public UInt32Division2(uint d)
        {
            this.d = d;
            recip = ((ulong)1 << 32) / d;
            rcorrect = (uint)1;
            if ((ulong)Math.Round((double)((ulong)1 << 32) / d + 0.5) != recip)
            {
                ++recip;
                --rcorrect;
            }
        }

        public uint Divide(uint k)
        {
            return (uint)((recip * (k + rcorrect)) >> 32);
        }

        public uint Modulus(uint k)
        {
            return k - (uint)((recip * (k + rcorrect)) >> 32) * d;
        }

        public bool IsDivisible(uint k)
        {
            return Modulus(k) == 0;
        }
    }

    public struct UInt32Division3 : IDivisionAlgorithm<uint, uint>
    {
        private const int shift = 42;
        private ulong recip;
        private uint d;

        public uint Divisor
        {
            get { return d; }
        }

        public UInt32Division3(uint d)
        {
            this.d = d;
            recip = ((ulong)1 << shift) / d + 1;
        }

        public uint Divide(uint k)
        {
            return (uint)((recip * k) >> shift);
        }

        public uint Modulus(uint k)
        {
            return k - (uint)((recip * k) >> shift) * d;
        }

        public bool IsDivisible(uint k)
        {
            return Modulus(k) == 0;
        }
    }

    public struct UInt32Division4 : IDivisionAlgorithm<uint, uint>
    {
        private uint d;

        public uint Divisor
        {
            get { return d; }
        }

        public UInt32Division4(uint d)
        {
            this.d = d;
        }

        public uint Divide(uint k)
        {
            var q = (uint)0;
            while (k >= d)
            {
                k -= d;
                ++q;
            }
            return q;
        }

        public uint Modulus(uint k)
        {
            while (k >= d)
                k -= d;
            return k;
        }

        public bool IsDivisible(uint k)
        {
            return Modulus(k) == 0;
        }
    }

    public struct UInt32Division5 : IDivisionAlgorithm<uint, uint>
    {
        private uint dInv;
        private uint qmax;
        private uint d;

        public uint Divisor
        {
            get { return d; }
        }

        public UInt32Division5(uint d)
        {
            Debug.Assert(d % 2 == 0);
            this.d = d;
            this.dInv = IntegerMath.ModularInversePowerOfTwoModulus(d, 32);
            this.qmax = uint.MaxValue / d;
        }

        public uint Divide(uint k)
        {
            return k / d;
        }

        public uint Modulus(uint k)
        {
            return k % d;
        }

        public bool IsDivisible(uint k)
        {
            return dInv * k <= qmax;
        }
    }
}
