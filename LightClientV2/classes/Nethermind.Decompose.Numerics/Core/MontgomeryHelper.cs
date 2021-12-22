namespace Nethermind.Decompose.Numerics
{
    public class MontgomeryHelper
    {
        public static ulong Reduce(ulong u, ulong v, ulong n, uint k0)
        {
            var u0 = (uint)u;
            var u1 = (uint)(u >> 32);
            var v0 = (uint)v;
            var v1 = (uint)(v >> 32);
            var n0 = (uint)n;
            var n1 = (uint)(n >> 32);

            if (n1 == 0)
                return Reduce(u0, v0, n0, k0);

            var carry = (ulong)u0 * v0;
            var t0 = (uint)carry;
            carry = (carry >> 32) + (ulong)u1 * v0;
            var t1 = (uint)carry;
            var t2 = (uint)(carry >> 32);

            var m = t0 * k0;
            carry = t0 + (ulong)m * n0;
            carry = (carry >> 32) + t1 + (ulong)m * n1;
            t0 = (uint)carry;
            carry = (carry >> 32) + t2;
            t1 = (uint)carry;
            t2 = (uint)(carry >> 32);

            carry = t0 + (ulong)u0 * v1;
            t0 = (uint)carry;
            carry = (carry >> 32) + t1 + (ulong)u1 * v1;
            t1 = (uint)carry;
            carry = (carry >> 32) + t2;
            t2 = (uint)carry;
            var t3 = (uint)(carry >> 32);

            m = t0 * k0;
            carry = t0 + (ulong)m * n0;
            carry = (carry >> 32) + t1 + (ulong)m * n1;
            t0 = (uint)carry;
            carry = (carry >> 32) + t2;
            t1 = (uint)carry;
            t2 = t3 + (uint)(carry >> 32);

            var t = (ulong)t1 << 32 | t0;
            if (t2 != 0 || t >= n)
                t -= n;
            return t;
        }

        public static ulong Reduce(ulong t, ulong n, uint k0)
        {
            var t0 = (uint)t;
            var t1 = (uint)(t >> 32);
            var t2 = (uint)0;
            var n0 = (uint)n;
            var n1 = (uint)(n >> 32);

            if (n1 == 0)
                return Reduce(t0, n0, k0);

            for (var i = 0; i < 2; i++)
            {
                var m = t0 * k0;
                var carry = t0 + (ulong)m * n0;
                carry = (carry >> 32) + t1 + (ulong)m * n1;
                t0 = (uint)carry;
                carry = (carry >> 32) + t2;
                t1 = (uint)carry;
                t2 = (uint)(carry >> 32);
            }

            t = (ulong)t1 << 32 | t0;
            if (t2 != 0 || t >= n)
                t -= n;
            return t;
        }

        public static uint Reduce(uint u, uint v, uint n, uint k)
        {
            var uv = (ulong)u * v;
            var mn = (ulong)(0 - (uint)uv * k) * n;
            if (uv < mn)
                return (uint)(n - ((mn - uv) >> 32));
            return (uint)((uv - mn) >> 32);
        }

        public static uint Reduce(uint t, uint n, uint k)
        {
            var mn = (ulong)(0 - (uint)t * k) * n;
            if (t < mn)
                return (uint)(n - ((mn - t) >> 32));
            return (uint)((t - mn) >> 32);
        }
    }
}
