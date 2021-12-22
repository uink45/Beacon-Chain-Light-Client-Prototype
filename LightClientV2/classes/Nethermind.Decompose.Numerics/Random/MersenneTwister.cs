using System;
using System.Numerics;
using System.Collections;
using System.Collections.Generic;

namespace Nethermind.Decompose.Numerics
{
    public class MersenneTwister : RandomNumberGenerator
    {
        private const int N = 624;
        private uint[] MT;
        private int index;

        public MersenneTwister(uint seed)
        {
            // Reference: http://en.wikipedia.org/wiki/Mersenne_twister
            // Create a length 624 array to store the state of the generator.
            MT = new uint[N];

            // Initialize the generator from a seed.
            MT[0] = seed;
            for (int i = 1; i < N; i++)
            {
                MT[i] = 0x6c078965u * (MT[i - 1] ^ ((MT[i - 1] >> 30))) + (uint)i;
            }

            index = 0;
        }

        public override uint Next()
        {
            // Extract a tempered pseudorandom number based on the index-th value,
            // calling GenerateNumbers() every 624 numbers.

            if (index == 0)
                GenerateNumbers();

            uint y = MT[index];
            y ^= y >> 11;
            y ^= (y << 7) & 0x9d2c5680u;
            y ^= (y << 15) & 0xefc60000u;
            y ^= y >> 18;

            index = (index + 1) % N;

            return y;
        }

        private void GenerateNumbers()
        {
            // Generate an array of 624 untempered numbers.
            for (int i = 0; i < N; i++)
            {
                uint y = (0x80000000u & MT[i]) | (0x7fffffffu & MT[(i + 1) % N]);
                MT[i] = MT[(i + 397) % N] ^ (y >> 1);
                if (y % 2 == 1)
                {
                    MT[i] ^= 0x9908b0dfu;
                }
            }
        }
    }
}
