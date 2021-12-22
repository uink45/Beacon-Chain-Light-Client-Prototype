using System;
using System.Collections.Generic;
using System.Linq;
using System.Numerics;
using System.Text;

namespace Nethermind.Decompose.Numerics
{
    public class ShanksSquareForms : IFactorizationAlgorithm<long>
    {
        public ShanksSquareForms()
        {
            data = new squfof_data_t(MAX_MULTIPLIERS, QSIZE);
        }

        public IEnumerable<long> Factor(long n)
        {
            if (n == 1)
            {
                yield return 1;
                yield break;
            }
            while (!IntegerMath.IsPrime(n))
            {
                var divisor = GetDivisor(n);
                if (divisor == 0 || divisor == 1)
                    yield break;
                foreach (var factor in Factor(divisor))
                    yield return factor;
                n /= divisor;
            }
            yield return n;
        }

        public long GetDivisor(long n)
        {
            return squfof((ulong)n);
        }

        /*--------------------------------------------------------------------
        This source distribution is placed in the public domain by its author,
        Jason Papadopoulos. You may use it for any purpose, free of charge,
        without having to notify anyone. I disclaim any responsibility for any
        errors.

        Optionally, please be nice and tell me if you find this source to be
        useful. Again optionally, if you add to the functionality present here
        please consider making those additions public too, so that others may 
        benefit from your work.	

        $Id: squfof.c 23 2009-07-20 02:59:07Z jasonp_sf $
        --------------------------------------------------------------------*/

        /* This SQUFOF implementation will race as many multipliers
           of the input as will fit into 62 bits */

        private static readonly uint[] multipliers = {1, 3, 5, 7, 
                        11, 3*5, 3*7, 3*11, 
                        5*7, 5*11, 7*11, 
                        3*5*7, 3*5*11, 3*7*11, 
                        5*7*11, 3*5*7*11 };

        private readonly int MAX_MULTIPLIERS = multipliers.Length;
        private const int QSIZE = 50;

        /* the maximum number of inner loop iterations for all 
           multipliers combined */

        private const int MAX_CYCLES = 100000;

        /* the number of iterations to do before switching to the
           next multiplier */

        private const int ONE_CYCLE_ITER = 300;

        private readonly BigInteger MAX_VALUE = BigInteger.Pow(2, 62);
        private readonly ulong MAX_VALUE_ALL_MULTIPLIERS = ((ulong)1 << 62) / (3*5*7*11);

        private class squfof_data_t
        {
            public ulong n;
            public uint[] sqrtn;
            public uint[] cutoff;
            public uint[] q0;
            public uint[] p1;
            public uint[] q1;
            public uint[] num_saved;
            public ushort[][] saved;
            public bool[] failed;

            public squfof_data_t(int MAX_MULTIPLIERS, int QSIZE)
            {
                sqrtn = new uint[MAX_MULTIPLIERS]; 
                cutoff = new uint[MAX_MULTIPLIERS];
                q0 = new uint[MAX_MULTIPLIERS];
                p1 = new uint[MAX_MULTIPLIERS];
                q1 = new uint[MAX_MULTIPLIERS];
                num_saved = new uint[MAX_MULTIPLIERS];
                saved = new ushort[MAX_MULTIPLIERS][];
                for (int i = 0; i < MAX_MULTIPLIERS; i++)
                    saved[i] = new ushort[QSIZE];
                failed = new bool[MAX_MULTIPLIERS];
            }
        }

        private squfof_data_t data;

        /*-----------------------------------------------------------------------*/
        uint squfof_one_cycle(squfof_data_t data, uint mult_idx, 
                    uint num_iter, out uint factor) {

            /* Perform one unit of work for SQUFOF with one multiplier */

            uint sqrtn = data.sqrtn[mult_idx];
            uint cutoff = data.cutoff[mult_idx];
            uint num_saved = data.num_saved[mult_idx];
            uint multiplier = 2 * multipliers[mult_idx];
            uint coarse_cutoff = cutoff * multiplier;
            ushort[] saved = data.saved[mult_idx];
            uint q0 = data.q0[mult_idx];
            uint p1 = data.p1[mult_idx];
            uint q1 = data.q1[mult_idx];

            uint i, j;
            uint p0 = 0;
            uint sqrtq = 0;
            ulong scaledn;

            factor = 0;
            for (i = 0; i < num_iter; i++) {		
                uint q, bits, tmp;

                /* compute (sqrtn+p1)/q1; since this is unity
                   more than half the time, special case the
                   division to save some effort */

                tmp = sqrtn + p1 - q1;
                q = 1;
                if (tmp >= q1)
                    q += tmp / q1;

                /* compute the next numerator and denominator */
        
                p0 = q * q1 - p1;
                q0 = q0 + (p1 - p0) * q;

                /* In order to avoid trivial factorizations,
                   save q1 values that are small in a list. Only
                   values that do not contain factors of the
                   multiplier must be saved; however, the GCD
                   is 5x more expensive than all the rest of the
                   work performed in the loop. To avoid most GCDs,
                   only attempt one if q1 is less than the cutoff
                   times the full multiplier 
           
                   If the queue overflows (very rare), signal that
                   this multiplier failed and move on to another one */

                if (q1 < coarse_cutoff) {
                    tmp = q1 / IntegerMath.GreatestCommonDivisor(q1, multiplier);

                    if (tmp < cutoff) {
                        if (num_saved >= QSIZE) {
                            data.failed[mult_idx] = true;
                            return i;
                        }
                        saved[num_saved++] = (ushort)tmp;
                    }
                }

                /* if q0 is a perfect square, then the factorization
                   has probably succeeded. Most of the squareness
                   tests out there require multiple divisions and 
                   complicated loops. We can approximate these tests
                   by doing two things: testing that the number of
                   trailing zeros in q0 is even, and then testing
                   if q0 shifted right this many places is 1 mod 8. */

                bits = 0; 
                tmp = q0;
                while((tmp & 1) == 0) {
                    bits++;
                    tmp >>= 1;
                }
                if ((bits & 1) == 0 && ((tmp & 7) == 1)) {

                    /* q0 is probably a perfect square. Take the
                       square root by cheating */

                    sqrtq = (uint)(Math.Sqrt((double)q0));

                    if (sqrtq * sqrtq == q0) {

                        /* it *is* a perfect square. If it has
                           not appeared previously in the list
                           for this multiplier, then we're almost
                           finished */

                        for (j = 0; j < num_saved; j++) {
                            if (saved[j] == sqrtq)
                                break;
                        }

                        if (j == num_saved)
                            break;
                    }
                }

                /* perform the odd half of the SQUFOF cycle */

                tmp = sqrtn + p0 - q0;
                q = 1;
                if (tmp >= q0)
                    q += tmp / q0;

                p1 = q * q0 - p0;
                q1 = q1 + (p0 - p1) * q;

                if (q0 < coarse_cutoff) {
                    tmp = q0 / IntegerMath.GreatestCommonDivisor(q0, multiplier);

                    if (tmp < cutoff) {
                        if (num_saved >= QSIZE) {
                            data.failed[mult_idx] = true;
                            return i;
                        }
                        saved[num_saved++] = (ushort)tmp;
                    }
                }
            }

            if (sqrtq == 1) {

                /* the above found a trivial factor, so this
                   multiplier has failed */

                data.failed[mult_idx] = true;
                return i;
            }
            else if (i == num_iter) {
    
                /* no square root found; save the parameters
                   and go on to the next multiplier */

                data.q0[mult_idx] = q0;
                data.p1[mult_idx] = p1;
                data.q1[mult_idx] = q1;
                data.num_saved[mult_idx] = num_saved;
                return i;
            }

            /* square root found; the algorithm cannot fail now.
               Compute the inverse quadratic form and iterate */

            q0 = sqrtq;
            p1 = p0 + sqrtq * ((sqrtn - p0) / sqrtq);
            scaledn = data.n * (ulong)multipliers[mult_idx];
            q1 = (uint)((scaledn - (ulong)p1 * (ulong)p1) / (ulong)q0);

            while (true) {
                uint q, tmp;

                tmp = sqrtn + p1 - q1;
                q = 1;
                if (tmp >= q1)
                    q += tmp / q1;

                p0 = q * q1 - p1;
                q0 = q0 + (p1 - p0) * q;

                if (p0 == p1) {
                    q0 = q1;
                    break;
                }

                tmp = sqrtn + p0 - q0;
                q = 1;
                if (tmp >= q0)
                    q += tmp / q0;

                p1 = q * q0 - p0;
                q1 = q1 + (p0 - p1) * q;

                if (p0 == p1)
                    break;
            }

            /* q0 is the factor of n. Remove factors that exist
               in the multiplier and save whatever's left */

            q0 = q0 / IntegerMath.GreatestCommonDivisor(q0, multiplier);
            factor = q0;
            return i;
        }

        /*-----------------------------------------------------------------------*/
        uint squfof(ulong n) {

            /* Factor a number up to 62 bits in size using SQUFOF.
               For n the product of two primes, this routine will
               succeed with very high probability, although the
               likelihood of failure goes up as n increases in size.
               Empirically, 62-bit factorizations fail about 5% of the
               time; for smaller n the failure rate is nearly zero. 
       
               If a factor is found, it is returned. If it is a trivial
               factor, the return value is one. If SQUFOF failed, the
               return value is zero */

            uint num_mult;
            uint factor_found = 0;
            ulong scaledn;
            uint sqrt_scaledn;
            uint i, num_iter, num_failed;

            /* turn n into a ulong */

            data.n = n;

            /* for each multiplier */

            for (i = 0; i < MAX_MULTIPLIERS; i++) {

                /* use the multiplier if the multiplier times n
                   will fit in 62 bits. Because multipliers are
                   initialized in order of increasing size, when
                   one is too big then all the rest are also too big */

                if (n < MAX_VALUE_ALL_MULTIPLIERS)
                    scaledn = n * multipliers[i];
                else
                {
                    var nk = (BigInteger)n * multipliers[i];
                    if (nk > MAX_VALUE)
                        break;
                    scaledn = (ulong)nk;
                }

                sqrt_scaledn = (uint)Math.Sqrt(scaledn);

                /* initialize the rest of the fields for this
                   multiplier */

                data.sqrtn[i] = sqrt_scaledn;
                data.cutoff[i] = (uint)(Math.Sqrt(2.0 * (double)data.sqrtn[i]));
                data.num_saved[i] = 0;
                data.failed[i] = false;

                data.q0[i] = 1;
                data.p1[i] = data.sqrtn[i];
                data.q1[i] = (uint)((ulong)scaledn - (ulong)data.p1[i] * data.p1[i]);

                /* if n is a perfect square, don't run the algorithm;
                   the factorization has already taken place */

                if (data.q1[i] == 0)
                    return data.p1[i];
            }
            if (i == 0)
                return 0;

            /* perform a block of work using each multiplier in
               turn, until our budget of work for factoring n is
               exhausted */

            num_mult = i;
            num_iter = 0;
            num_failed = 0;
            while (num_iter < MAX_CYCLES) {
        
                /* for each cycle of multipliers, begin with the
                   multiplier that is largest. These have a higher
                   probability of factoring n quickly */

                for (i = num_mult - 1; (int)i >= 0 ; i--) {
                    if (data.failed[i])
                        continue;

                    /* work on this multiplier for a little while */

                    num_iter += squfof_one_cycle(data, i, ONE_CYCLE_ITER,
                                    out factor_found);

                    /* if all multipliers have failed, then SQUFOF
                       has failed */

                    if (data.failed[i]) {
                        if (++num_failed == num_mult)
                            return 0;
                    }
                    if (factor_found != 0)
                        return factor_found;
                }
            }

            return 0;
        }
    }
}
