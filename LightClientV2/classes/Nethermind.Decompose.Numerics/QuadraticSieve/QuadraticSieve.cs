#define USE_RECIPROCAL
#undef USE_INVERSE

using System;
using System.Collections;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Numerics;
using System.Threading;
using System.Threading.Tasks;
using CountInt = System.Byte;

#if false
using BitMatrix= Nethermind.Decompose.Numerics.Word64BitMatrix;
using Solver= Nethermind.Decompose.Numerics.GaussianElimination<Nethermind.Decompose.Numerics.Word64BitArray>;
#endif

#if false
using BitMatrix= Nethermind.Decompose.Numerics.Word64BitMatrix;
using Solver= Nethermind.Decompose.Numerics.StructuredGaussianElimination<Nethermind.Decompose.Numerics.Word64BitArray, Nethermind.Decompose.Numerics.Word64BitMatrix>;
#endif

#if true
using BitMatrix= Nethermind.Decompose.Numerics.SetBitMatrix;
using Solver= Nethermind.Decompose.Numerics.StructuredGaussianElimination<Nethermind.Decompose.Numerics.Word64BitArray, Nethermind.Decompose.Numerics.Word64BitMatrix>;
#endif

namespace Nethermind.Decompose.Numerics
{
    public class QuadraticSieve : IFactorizationAlgorithm<BigInteger>
    {
        private const int maximumCycleLenth = 16 * 1024;
        private const int thresholdInterval = 1024;
        private const int thresholdShift = 10;
        private const double thresholdExponentDefault = 1.4;
        private const double thresholdExponentPartialPartialRelationsDefault = 2.25;
        private const double errorLimitDefault = 0.1;
        private const int cofactorCutoffDefault = 1024;
        private const int surplusRelations = 12;
        private const int reportingIntervalDefault = 10;
        private const int maximumMultiplier = 73;
        private const int maximumScorePrimes = 100;
        private readonly BigInteger smallFactorCutoff = (BigInteger)int.MaxValue;
        private const int minimumAFactor = 2000;
        private const int maximumAfactor = 4000;
        private const int maximumNumberOfFactors = 20;
        private const int minimumCounTableDigits = 85;
#if USE_RECIPROCAL
        private const int reciprocalShift = 42;
#endif

        [Flags]
        public enum Diag
        {
            None = 0x0,
            Summary = 0x1,
            Solutions = 0x2,
            Sieve = 0x4,
            Timing = 0x8,
            Solving = 0x10,
            SaveMatrix = 0x20,
            Polynomials = 0x40,
            Verbose = Summary | Sieve | Timing | Solving,
        }

        public enum Algorithm
        {
            None = 0,
            SelfInitializingQuadraticSieve = 1,
        }

        public class Config
        {
            public Algorithm Algorithm { get; set; }
            public Diag Diagnostics { get; set; }
            public int Threads { get; set; }
            public int FactorBaseSize { get; set; }
            public int BlockSize { get; set; }
            public int IntervalSize { get; set; }
            public double ThresholdExponent { get; set; }
            public int Multiplier { get; set; }
            public int ReportingInterval { get; set; }
            public int MergeLimit { get; set; }
            public int SieveTimeLimit { get; set; }
            public int CofactorCutoff { get; set; }
            public double ErrorLimit { get; set; }
            public int NumberOfFactors { get; set; }
            public bool? ProcessPartialPartialRelations { get; set; }
            public bool? UseCountTable { get; set; }
            public TextWriter DiagnosticsOutput { get; set; }
        }

        public class Parameters
        {
            public int Digits { get; private set; }
            public int FactorBaseSize { get; private set; }
            public double PPRRatio { get; private set; }
            public int BlockSize { get; private set; }
            public int IntervalSize { get; private set; }
            public Parameters(int digits, int factorBaseSize, double pprRatio, int blockSize, int intervalSize)
            {
                Digits = digits;
                FactorBaseSize = factorBaseSize;
                PPRRatio = pprRatio;
                BlockSize = blockSize;
                IntervalSize = intervalSize;
            }
        }

        public QuadraticSieve(Config config)
        {
            this.config = config;
            diag = config.Diagnostics;
            output = config.DiagnosticsOutput ?? Console.Out;
            sieveTimeLimit = config.SieveTimeLimit;
            random = new MersenneTwister(0).Create<int>();
            smallIntegerFactorer = new TrialDivisionFactorization();
            allPrimes = new SieveOfEratosthenes();
            solver = new Solver(config.Threads, config.MergeLimit, (diag & Diag.Solving) != 0);
            multiplierCandidates = Enumerable.Range(1, maximumMultiplier)
                .Where(value => IntegerMath.IsSquareFree(value)).ToArray();
        }

        public IEnumerable<BigInteger> Factor(BigInteger n)
        {
            if (n.IsOne)
            {
                yield return BigInteger.One;
                yield break;
            }
            while (!IntegerMath.IsPrime(n))
            {
                if (n <= int.MaxValue)
                {
                    foreach (var factor in smallIntegerFactorer.Factor((int)n))
                        yield return factor;
                    yield break;
                }
                var divisor = GetDivisor(n);
                if (divisor.IsZero || divisor.IsOne)
                    yield break;
                foreach (var factor in Factor(divisor))
                    yield return factor;
                n /= divisor;
            }
            yield return n;
        }

        private struct ExponentEntry : IComparable<ExponentEntry>
        {
            public int Row { get; set; }
            public int Exponent { get; set; }
            public int CompareTo(ExponentEntry other)
            {
                return Row - other.Row;
            }
            public override string ToString()
            {
                return string.Format("Row[{0}] ^ {1}", Row, Exponent);
            }
        }

        private class ExponentEntries : IEnumerable<ExponentEntry>, IEquatable<ExponentEntries>
        {
            private ExponentEntry[] entries;
            private bool sorted = false;
            public ExponentEntries(ExponentEntry[] entries) { this.entries = entries; }
            public int Count { get { return entries.Length; } }
            public ExponentEntry this[int index] { get { Sort(); return entries[index]; } }
            public IEnumerator<ExponentEntry> GetEnumerator() { Sort(); return (entries as IEnumerable<ExponentEntry>).GetEnumerator(); }
            IEnumerator IEnumerable.GetEnumerator() { return GetEnumerator(); }
            public bool Equals(ExponentEntries other)
            {
                Sort();
                other.Sort();
                if (Count != other.Count)
                    return false;
                for (int i = 0; i < Count; i++)
                {
                    if (entries[i].Row != other.entries[i].Row)
                        return false;
                    if (entries[i].Exponent != other.entries[i].Exponent)
                        return false;
                }
                return true;
            }
            public override int GetHashCode()
            {
                Sort();
                var hashCode = 0;
                for (int i = 0; i < Count; i++)
                    hashCode = (hashCode << 5) ^ ((entries[i].Row << 8) | entries[i].Exponent);
                return hashCode;
            }
            private void Sort()
            {
                if (sorted)
                    return;
                Array.Sort(entries);
                sorted = true;
            }
        }

        private class FactorBaseEntry
        {
            public int P { get; set; }
            public long PSquared { get; set; }
            public CountInt LogP { get; set; }
            public int Root { get; set; }
            public int RootDiff { get; set; }
#if USE_RECIPROCAL
            public long Reciprocal { get; set; }
#endif
#if USE_INVERSE
            public uint PInv { get; set; }
            public uint QMax { get; set; }
#endif
            public FactorBaseEntry(int p, BigInteger n)
            {
                P = p;
                PSquared = (long)P * P;
                LogP = LogScale(p);
                Root = n % p == 0 ? 0 : IntegerMath.ModularSquareRoot(n, p);
                Debug.Assert(((BigInteger)Root * Root - n) % p == 0);
                RootDiff = ((P - Root) - Root) % p;
#if USE_RECIPROCAL
                if (p < 1 << reciprocalShift / 2)
                {
                    Reciprocal = ((long)1 << reciprocalShift) / p + 1;
                    Debug.Assert(Reciprocal * p >= (long)1 << reciprocalShift);
                    Debug.Assert(Reciprocal * p <= ((long)1 << reciprocalShift) + (1 << reciprocalShift / 2));
                }
#endif
#if USE_INVERSE
                PInv = IntegerMath.ModularInversePowerOfTwoModulus((uint)P, 32);
                QMax = uint.MaxValue / (uint)P;
#endif
            }
            public override string ToString()
            {
                return string.Format("P = {0}", P);
            }
        }

        private struct OffsetEntry
        {
            public int P { get; set; }
            public CountInt LogP { get; set; }
            public int Offset1 { get; set; }
            public int Offset2 { get; set; }
#if USE_RECIPROCAL
            public long Reciprocal { get; set; }
#endif
#if USE_INVERSE
            public uint PInv { get; set; }
            public uint QMax { get; set; }
            public uint OffsetDiffInv { get; set; }
#endif
        }

        private struct CountEntry
        {
            public int I { get; set; }
            public int K { get; set; }
            public CountInt Count { get; set; }
            public static void SetEntry(ref CountEntry entry, int i, int k, CountInt count)
            {
                entry.I = i;
                entry.K = k;
                entry.Count = count;
            }
        }

        private interface ICountTable
        {
            void Clear();
            void AddEntry(int i, int k, CountInt count);
            void AddToCounts(int k0, CountInt[] counts);
            BigInteger AddExponents(BigInteger y, int k, Exponents exponents, int[] primes);
        }

        private class CountTableBase
        {
            protected Interval interval;
            protected int numberOfBlocks;
            protected int blockShift;
            protected int blockMask;
            protected int intervalSize;
            protected int capacity;
            public CountTableBase(Interval interval, int numberOfBlocks, int blockSize, int intervalSize)
            {
                this.interval = interval;
                this.intervalSize = intervalSize;
                this.numberOfBlocks = numberOfBlocks;
                blockShift = blockSize.GetBitLength() - 1;
                if (1 << blockShift < blockSize)
                    ++blockShift;
                blockMask = (1 << blockShift) - 1;
                capacity = blockSize * numberOfBlocks;
            }
        }

        private class SingleBlockCountTable : CountTableBase, ICountTable
        {
            private CountEntry[] list;
            private int used;
            public SingleBlockCountTable(Interval interval, int numberOfBlocks, int blockSize, int intervalSize)
                : base(interval, numberOfBlocks, blockSize, intervalSize)
            {
                list = new CountEntry[capacity];
            }
            public void Clear()
            {
                used = 0;
            }
            public void AddEntry(int i, int k, CountInt count)
            {
                CountEntry.SetEntry(ref list[used++], i, k, count);
            }
            public void AddToCounts(int k0, CountInt[] counts)
            {
                for (int l = 0; l < used; l++)
                    counts[list[l].K] += list[l].Count;
            }
            public BigInteger AddExponents(BigInteger y, int k, Exponents exponents, int[] primes)
            {
                for (int l = 0; l < used; l++)
                {
                    if (list[l].K != k)
                        continue;
                    var i = list[l].I;
                    var p = primes[i];
                    Debug.Assert(y % p == 0);
                    while ((y % p).IsZero)
                    {
                        exponents.Add(i + 1, 1);
                        y /= p;
                    }
                }
                return y;
            }
        }

        private class MultiBlockCountTable : CountTableBase, ICountTable
        {
            private CountEntry[][] lists;
            private int[] used;
            public MultiBlockCountTable(Interval interval, int numberOfBlocks, int blockSize, int intervalSize)
                : base(interval, numberOfBlocks, blockSize, intervalSize)
            {
                var listCapacity = capacity / numberOfBlocks;
                lists = new CountEntry[numberOfBlocks][];
                used = new int[numberOfBlocks];
                for (int block = 0; block < numberOfBlocks; block++)
                    lists[block] = new CountEntry[listCapacity];
            }
            public void Clear()
            {
                for (int block = 0; block < numberOfBlocks; block++)
                    used[block] = 0;
            }
            public void AddEntry(int i, int k, CountInt count)
            {
                var block = k >> blockShift;
                var slot = used[block]++;
                CountEntry.SetEntry(ref lists[block][slot], i, k & blockMask, count);
            }
            public void AddToCounts(int k0, CountInt[] counts)
            {
                var block = k0 >> blockShift;
                var list = lists[block];
                var length = used[block];
                for (int l = 0; l < length; l++)
                    counts[list[l].K] += list[l].Count;
            }
            public BigInteger AddExponents(BigInteger y, int k, Exponents exponents, int[] primes)
            {
                var block = k >> blockShift;
                k &= blockMask;
                var list = lists[block];
                var length = used[block];
                for (int l = 0; l < length; l++)
                {
                    if (list[l].K != k)
                        continue;
                    var i = list[l].I;
                    var p = primes[i];
                    Debug.Assert(y % p == 0);
                    while ((y % p).IsZero)
                    {
                        exponents.Add(i + 1, 1);
                        y /= p;
                    }
                }
                return y;
            }
        }

        private class Polynomial
        {
            public BigInteger A { get; set; }
            public BigInteger B { get; set; }
            public BigInteger N { get; set; }
            public BigInteger EvaluateMapping(long x)
            {
                return A * x + B;
            }
            public BigInteger Evaluate(long x)
            {
                var xPrime = EvaluateMapping(x);
                var yPrime = xPrime * xPrime - N;
                Debug.Assert(yPrime % A == 0);
                return yPrime / A;
            }
        }

        private class Relation
        {
            public BigInteger X { get; set; }
            public ExponentEntries Entries { get; set; }
            public BigInteger Cofactor { get; set; }
            public override string ToString()
            {
                return string.Format("X = {0}", X);
            }
        }

        private class Exponents
        {
            private Dictionary<int, int> exponents;
            public Exponents(int size)
            {
                exponents = new Dictionary<int, int>();
            }
            public void Add(int index, int increment)
            {
                int value;
                if (exponents.TryGetValue(index, out value))
                    exponents[index] = value + increment;
                else
                    exponents[index] = increment;
            }
            public void Clear()
            {
                exponents.Clear();
            }
            public ExponentEntries Entries
            {
                get
                {
                    int size = 16;
                    var entries = new ExponentEntry[size];
                    int k = 0;
                    foreach (var pair in exponents)
                    {
                        entries[k++] = new ExponentEntry { Row = pair.Key, Exponent = pair.Value };
                        if (k == size)
                        {
                            size *= 2;
                            Array.Resize(ref entries, size);
                        }
                    }
                    Array.Resize(ref entries, k);
                    return new ExponentEntries(entries);
                }
            }
        }

        private struct Offset
        {
            public int Offset1 { get; set; }
            public int Offset2 { get; set; }
        }

        private class Interval
        {
            public int Id { get; set; }
            public int X { get; set; }
            public Polynomial Polynomial { get; set; }
            public int Size { get; set; }
            public Exponents Exponents { get; set; }
            public CountInt[] Cycle { get; set; }
            public int CycleOffset { get; set; }
            public CountInt[] Counts { get; set; }
            public SingleBlockCountTable SingleBlockCountTable { get; set; }
            public MultiBlockCountTable MultiBlockCountTable { get; set; }
            public ICountTable CountTable { get; set; }
            public int[] Increments { get; set; }
            public int RelationsFound { get; set; }
            public int PartialRelationsFound { get; set; }
            public IFactorizationAlgorithm<long> CofactorFactorer { get; set; }
            public Siqs Siqs { get; set; }
            public override string ToString()
            {
                return string.Format("X = {0}, Size = {1}", X, Size);
            }
        }

        private struct PartialRelation
        {
            public Polynomial Polynomial { get; set; }
            public int X { get; set; }
            public ExponentEntries Entries { get; set; }
            public override string ToString()
            {
                return string.Format("X = {0}", X);
            }
        }

        private class Siqs
        {
            public int Index { get; set; }
            public int[] QMap { get; set; }
            public bool[] IsQIndex { get; set; }
            public int S { get; set; }
            public BigInteger[] CapB { get; set; }
            public int[][] Bainv2 { get; set; }
            public int[] Bainv2v { get; set; }
            public OffsetEntry[] Offsets { get; set; }
            public Polynomial Polynomial { get; set; }
            public int X { get; set; }
            public double Error { get; set; }
            public CountInt[] Threshold { get; set; }
        }

        private readonly Parameters[] parameters =
        {
            new Parameters(1, 2, 0.67, 64 * 1024, 64 * 1024),
            new Parameters(6, 5, 0.67, 64 * 1024, 64 * 1024),
            new Parameters(10, 30, 0.67, 64 * 1024, 64 * 1024),
            new Parameters(20, 60, 0.67, 64 * 1024, 64 * 1024),
            new Parameters(30, 300, 0.67, 128 * 1024, 128 * 1024),
            new Parameters(40, 900, 0.67, 128 * 1024, 128 * 1024),
            new Parameters(50, 2500, 0.67, 128 * 1024, 128 * 1024),
            new Parameters(60, 4000, 0.67, 128 * 1024, 128 * 1024),
            new Parameters(70, 15000, 0.67, 128 * 1024, 128 * 1024),
            new Parameters(80, 50000, 0.67, 256 * 1024, 256 * 1024),
            new Parameters(90, 100000, 0.67, 256 * 1024, 256 * 1024),
            new Parameters(100, 170000, 0.80, 512 * 1024, 512 * 1024),

            // Untested.
            new Parameters(110, 300000, 0.80, 512 * 1024, 512 * 1024),
            new Parameters(120, 600000, 0.80, 512 * 1024, 512 * 1024),
        };

        private Config config;
        private IRandomNumberAlgorithm<int> random;
        private IFactorizationAlgorithm<int> smallIntegerFactorer;
        private IEnumerable<int> allPrimes;
        private INullSpaceAlgorithm<IBitArray, IBitMatrix> solver;
        private int[] multiplierCandidates;

        private Diag diag;
        private TextWriter output;
        private bool processPartialPartialRelations;
        private bool useCountTable;
        private bool savePartialRelationFactorizations;
        private bool savePartialPartialRelationFactorizations;
        private bool useSingleThreshold;
        private int sieveTimeLimit;
        private Algorithm algorithm;
        private int multiplier;
        private int[] multiplierFactors;
        private BigInteger nOrig;
        private BigInteger n;
        private BigInteger sqrtN;
        private int powerOfTwo;
        private int factorBaseSize;
        private int desired;
        private volatile bool sievingAborted;
        private double digits;
        private FactorBaseEntry[] factorBase;
        private int[] primes;
        private Dictionary<int, int> primeMap;
        private int maximumDivisor;
        private long maximumDivisorSquared;
        private long maximumCofactor;
        private long maximumCofactorSquared;
        private int mediumPrimeIndex;
        private int largePrimeIndex;
        private double thresholdExponent;
        private int reportingInterval;
        private int cofactorCutoff;
        private double errorLimit;
        private int blockSize;
        private int intervalSize;
        private int[][] intervalIncrements;
        private int numberOfBlocks;

        private int[] candidateMap;
        private double[] candidateSizes;
        private int numberOfFactors;
        private double targetSize;

        private int threads;
        private Dictionary<ExponentEntries, Relation> relationBuffer;
        private Relation[] relations;
        private Dictionary<long, PartialRelation> partialRelations;
        private PartialRelationGraph<PartialRelation> partialPartialRelations;
        private IBitMatrix matrix;
        private Stopwatch timer;

        private int cycleLength;

        private int intervalsProcessed;
        private int valuesChecked;
        private int cofactorsGreaterThan64Bits;
        private int cofactorsExceedingCutoff1;
        private int cofactorsExceedingCutoff2;
        private int cofactorsPrimalityTested;
        private int cofactorsFactored;
        private int partialRelationsProcessed;
        private int partialRelationsConverted;
        private int partialPartialRelationsProcessed;
        private int partialPartialRelationsConverted;
        private int duplicateRelationsFound;
        private int duplicatePartialRelationsFound;
        private int duplicatePartialPartialRelationsFound;

        public BigInteger GetDivisor(BigInteger nOrig)
        {
            if (nOrig.IsEven)
                return 2;

            var power = IntegerMath.PerfectPower(nOrig);
            if (power != 1)
                return IntegerMath.Root(nOrig, power);

            if ((diag & Diag.Timing) != 0)
            {
                timer = new Stopwatch();
                timer.Start();
            }

            Initialize(nOrig);

            if ((diag & Diag.Timing) != 0)
            {
                var elapsed = timer.ElapsedTicks;
                timer.Restart();
                output.WriteLine("Initialization: {0:F3} msec", 1000.0 * elapsed / Stopwatch.Frequency);
            }

            if ((diag & Diag.Summary) != 0)
            {
                output.WriteLine("algorithm = {0}", algorithm);
                output.WriteLine("digits = {0:F1}; factorBaseSize = {1:N0}; desired = {2:N0}", digits, factorBaseSize, desired);
                output.WriteLine("block size = {0:N0}; interval size = {1:N0}; threads = {2}", blockSize, intervalSize, threads);
                output.WriteLine("error limit = {0}, cofactor cutoff = {1}; threshold exponent = {2}", errorLimit, cofactorCutoff, thresholdExponent);
                output.WriteLine("first few factors: {0}", string.Join(", ", primes.Take(15)));
                output.WriteLine("last few factors: {0}", string.Join(", ", primes.Skip(factorBaseSize - 5)));
                output.WriteLine("small prime cycle length = {0}, last small prime = {1}", cycleLength, primes[mediumPrimeIndex - 1]);
                output.WriteLine("multiplier = {0}; power of two = {1}", multiplier, powerOfTwo);
                output.WriteLine("use count table = {0}; process partial partial relations = {1}", useCountTable, processPartialPartialRelations);
                output.WriteLine("save factorizations: partial = {0}; partial partial = {1}", savePartialRelationFactorizations, savePartialPartialRelationFactorizations);
            }

            Sieve();

            if (relations.Length < desired)
                return BigInteger.Zero;

            if ((diag & Diag.Timing) != 0)
            {
                var elapsed = timer.ElapsedTicks;
                timer.Restart();
                output.WriteLine("Sieving: {0:F3} msec", 1000.0 * elapsed / Stopwatch.Frequency);
            }

            if ((diag & Diag.Summary) != 0)
            {
                output.WriteLine("intervals processed = {0:N0}; values processsed = {1:N0}; values checked = {2:N0}", intervalsProcessed, (long)intervalsProcessed * intervalSize, valuesChecked);
                output.WriteLine("cofactors: exceeding 64 bits = {0:N0}; exceeding cutoff1 = {1:N0}; exceeding cutoff2 = {2:N0}", cofactorsGreaterThan64Bits, cofactorsExceedingCutoff1, cofactorsExceedingCutoff2);
                output.WriteLine("cofactors primality tested = {0:N0}; factored = {1:N0}", cofactorsPrimalityTested, cofactorsFactored);
                output.WriteLine("partial relations processed = {0:N0}; converted = {1:N0}", partialRelationsProcessed, partialRelationsConverted);
                output.WriteLine("partial partial relations processed = {0:N0}; converted = {1:N0}", partialPartialRelationsProcessed, partialPartialRelationsConverted);
                output.WriteLine("duplicate relations found = {0:N0}; duplicate partial relations found = {1:N0}", duplicateRelationsFound, duplicatePartialRelationsFound);
                output.WriteLine("duplicate partial partial relations found = {0:N0}", duplicatePartialPartialRelationsFound);
            }

            ProcessRelations();

            if ((diag & Diag.Timing) != 0)
            {
                var elapsed = timer.ElapsedTicks;
                timer.Restart();
                output.WriteLine("Processing relations: {0:F3} msec", 1000.0 * elapsed / Stopwatch.Frequency);
            }

            var result = Solve();

            if ((diag & Diag.Timing) != 0)
            {
                var elapsed = timer.ElapsedTicks;
                timer.Stop();
                output.WriteLine("Solving: {0:F3} msec", 1000.0 * elapsed / Stopwatch.Frequency);
            }

            return result;
        }

        private void Initialize(BigInteger nOrig)
        {
            algorithm = config.Algorithm != Algorithm.None ? config.Algorithm : Algorithm.SelfInitializingQuadraticSieve;

            this.nOrig = nOrig;
            ChooseMultiplier();
            n = nOrig * multiplier;
            digits = BigInteger.Log(n, 10);

            processPartialPartialRelations = config.ProcessPartialPartialRelations.HasValue ? config.ProcessPartialPartialRelations.Value : (config.ThresholdExponent >= 2);
            if (config.ThresholdExponent != 0)
                thresholdExponent = config.ThresholdExponent;
            else if (!processPartialPartialRelations)
                thresholdExponent = thresholdExponentDefault;
            else
                thresholdExponent = thresholdExponentPartialPartialRelationsDefault;
            reportingInterval = config.ReportingInterval != 0 ? config.ReportingInterval : reportingIntervalDefault;
            errorLimit = config.ErrorLimit != 0 ? config.ErrorLimit : errorLimitDefault;
            useCountTable = config.UseCountTable.HasValue ? config.UseCountTable.Value : (digits >= minimumCounTableDigits);
            savePartialRelationFactorizations = true;
            savePartialPartialRelationFactorizations = digits < 100;
            useSingleThreshold = thresholdExponent >= 2;

            sqrtN = IntegerMath.FloorSquareRoot(n);
            powerOfTwo = IntegerMath.Modulus(n, 8) == 1 ? 3 : IntegerMath.Modulus(n, 8) == 5 ? 2 : 1;
            factorBaseSize = CalculateFactorBaseSize();
            factorBase = allPrimes
                .Where(p => p == 2 || multiplier % p == 0 || IntegerMath.JacobiSymbol(n, p) == 1)
                .Take(factorBaseSize)
                .Select(p => new FactorBaseEntry(p, n))
                .ToArray();
            primes = factorBase.Select(entry => entry.P).ToArray();
            primeMap = Enumerable.Range(0, factorBaseSize).ToDictionary(index => primes[index]);
            desired = factorBaseSize + 1 + surplusRelations;
            maximumDivisor = factorBase[factorBaseSize - 1].P;
            maximumDivisorSquared = (long)maximumDivisor * maximumDivisor;
            cofactorCutoff = config.CofactorCutoff != 0 ? config.CofactorCutoff : cofactorCutoffDefault;
            maximumCofactor = Math.Min((long)maximumDivisor * cofactorCutoff, maximumDivisorSquared);
            maximumCofactorSquared = (long)BigInteger.Min((BigInteger)maximumCofactor * maximumCofactor, long.MaxValue);

            intervalsProcessed = 0;
            valuesChecked = 0;

            partialRelationsProcessed = 0;
            partialRelationsConverted = 0;
            partialPartialRelationsProcessed = 0;
            partialPartialRelationsConverted = 0;

            duplicateRelationsFound = 0;
            duplicatePartialRelationsFound = 0;
            duplicatePartialPartialRelationsFound = 0;

            cofactorsGreaterThan64Bits = 0;
            cofactorsExceedingCutoff1 = 0;
            cofactorsExceedingCutoff2 = 0;
            cofactorsPrimalityTested = 0;
            cofactorsFactored = 0;

            CalculateNumberOfThreads();
            SetupIntervals();
            SetupSmallPrimeCycle();

            InitializeSiqs();

            largePrimeIndex = Enumerable.Range(0, factorBaseSize + 1)
                .Where(index => index == factorBaseSize ||
                    index >= mediumPrimeIndex && primes[index] >= intervalSize)
                .First();
        }

        private void ChooseMultiplier()
        {
            if (config.Multiplier != 0)
                multiplier = config.Multiplier;
            else
            {
                multiplier = multiplierCandidates
                    .OrderByDescending(value => ScoreMultiplier(value))
                    .First();
            }
            multiplierFactors = smallIntegerFactorer.Factor(multiplier).ToArray();
        }

        private double ScoreMultiplier(int multiplier)
        {
            var n = nOrig * multiplier;
            var score = -0.5 * Math.Log(multiplier);
            var log2 = Math.Log(2);
            switch (IntegerMath.Modulus(n, 8))
            {
                case 1:
                    score += 2 * log2;
                    break;
                case 5:
                    score += log2;
                    break;
                case 3:
                case 7:
                    score += 0.5 * log2;
                    break;
                default:
                    break;
            }
            foreach (var p in allPrimes.Skip(1).Take(maximumScorePrimes))
            {
                if (n % p == 0 || IntegerMath.JacobiSymbol(n, p) == 1)
                {
                    var contribution = Math.Log(p) / (p - 1);
                    if (n % p == 0)
                        score += contribution;
                    else
                        score += 2 * contribution;
                }
            }
            return score;
        }

        private void InitializeSiqs()
        {
            // Choose minum and maximum factors of A so that M is near
            // the correct size for a product of those primes.
            var min = minimumAFactor;
            var max = maximumAfactor;
            if (min > maximumDivisor || max > maximumDivisor)
            {
                min = primes[factorBaseSize / 2];
                max = primes[factorBaseSize - 1];
            }
            var m = (intervalSize - 1) / 2;
            var logSqrt2N = BigInteger.Log(n * 2) / 2;
            targetSize = logSqrt2N - Math.Log(m);
            var preliminaryAverageSize = (Math.Log(min) + Math.Log(max)) / 2;
            var preliminaryNumberOfFactors = Math.Min((int)Math.Ceiling(targetSize / preliminaryAverageSize), maximumNumberOfFactors);
            numberOfFactors = config.NumberOfFactors != 0 ? config.NumberOfFactors : preliminaryNumberOfFactors;
            var averageSize = targetSize / numberOfFactors;
            var center = Math.Exp(averageSize);
            var ratio = Math.Sqrt((double)max / min);
            min = (int)Math.Round(center / ratio);
            max = (int)Math.Round(center * ratio);

            candidateMap = Enumerable.Range(0, factorBaseSize)
                .Where(index => primes[index] >= min && primes[index] <= max)
                .ToArray();
            if (candidateMap.Length < 10)
                candidateMap = Enumerable.Range(factorBaseSize / 2, factorBaseSize / 2).ToArray();
            candidateSizes = candidateMap
                .Select(index => Math.Log(primes[index]))
                .ToArray();

            if ((diag & Diag.Summary) != 0)
                output.WriteLine("number of factors of A = {0}, min = {1}, max = {2}", numberOfFactors, min, max);
        }

        private Siqs FirstPolynomial(Siqs siqs)
        {
            var s = numberOfFactors;
            var permutation = null as int[];
            var error = 0.0;
            for (int i = 0; i < 10; i++)
            {
                var numbers = random.Sequence(candidateMap.Length)
                    .Take(candidateMap.Length)
                    .ToArray();
                permutation = Enumerable.Range(0, candidateMap.Length)
                    .OrderBy(index => numbers[index])
                    .Take(s)
                    .OrderBy(index => index)
                    .ToArray();

                error = permutation.Select(index => candidateSizes[index]).Sum() - targetSize;
                if (Math.Abs(error) < errorLimit)
                    break;
            }

            // Allocate and initialize one-time memory.
            if (siqs == null)
            {
                siqs = new Siqs
                {
                    IsQIndex = new bool[factorBaseSize],
                    Threshold = new CountInt[intervalSize >> thresholdShift],
                    Offsets = new OffsetEntry[factorBaseSize],
                };
            }
            else
            {
                for (int i = 0; i < factorBaseSize; i++)
                    siqs.IsQIndex[i] = false;
            }
            if (siqs.Bainv2 == null || siqs.S != s)
            {
                var length = 2 * (s - 1);
                siqs.Bainv2 = new int[length][];
                for (int i = 0; i < length; i++)
                    siqs.Bainv2[i] = new int[factorBaseSize];
            }

            var qMap = permutation
                .Select(index => candidateMap[index])
                .ToArray();
            var q = qMap
                .Select(index => primes[index])
                .ToArray();
            var a = q.Select(p => (BigInteger)p).Product();
            var capB = new BigInteger[s];
            var b = BigInteger.Zero;
            for (int l = 0; l < s; l++)
            {
                var j = qMap[l];
                siqs.IsQIndex[j] = true;
                var r = q.Where(p => p != q[l]).ModularProduct(q[l]);
                var rInv = IntegerMath.ModularInverse(r, q[l]);
                Debug.Assert((long)r * rInv % q[l] == 1);
                var tSqrt = factorBase[j].Root;
                var gamma = (long)tSqrt * rInv % q[l];
                if (gamma > q[l] / 2)
                    gamma = q[l] - gamma;
                capB[l] = q.Where(p => p != q[l]).Select(p => (BigInteger)p).Product() * gamma;
                Debug.Assert((capB[l] * capB[l] - n) % q[l] == 0);
                b += capB[l];
            }
            b %= a;
            Debug.Assert((b * b - n) % a == 0);
            var polynomial = new Polynomial { A = a, B = b, N = n };

#if true
            var words = IntegerMath.MultipleOfCeiling(a.GetBitLength(), MutableInteger.WordLength) / MutableInteger.WordLength;
            var capBRep = capB.Select(value => new MutableInteger((int)words).Set(value)).ToArray();
#endif

            var bainv2 = siqs.Bainv2;
            var offsets = siqs.Offsets;
            var x = -intervalSize / 2;
            for (int i = 0; i < factorBaseSize; i++)
            {
                if (siqs.IsQIndex[i])
                    continue;
                var entry = factorBase[i];
                var p = entry.P;
                var aInv = (long)IntegerMath.ModularInverse(a, p);
                Debug.Assert(a * aInv % p == 1);
#if false
                for (int l = 0; l < s - 1; l++)
                    bainv2[l][i] = (int)(2 * (long)(capB[l] % p) * aInv % p);
#else
                for (int l = 0; l < s - 1; l++)
                    bainv2[l][i] = (int)(2 * (long)capBRep[l].GetRemainder((uint)p) * aInv % p);
#endif
                for (int l = 0; l < s - 1; l++)
                    bainv2[l + s - 1][i] = (p - bainv2[l][i]) % p;
                var root1 = entry.Root - (int)(b % p);
                if (root1 < 0)
                    root1 += p;
                var root2 = root1 + entry.RootDiff;
                offsets[i].P = entry.P;
                offsets[i].LogP = entry.LogP;
                offsets[i].Offset1 = (int)((aInv * root1 - x) % p);
                offsets[i].Offset2 = (int)((aInv * root2 - x) % p);
#if USE_RECIPROCAL
                offsets[i].Reciprocal = entry.Reciprocal;
#endif
#if USE_INVERSE
                offsets[i].PInv = entry.PInv;
                offsets[i].QMax = entry.QMax;
                offsets[i].OffsetDiffInv = (uint)(offsets[i].P + offsets[i].Offset1 - offsets[i].Offset2) * offsets[i].PInv;
#endif
                Debug.Assert(offsets[i].Offset1 >= 0 && polynomial.Evaluate(x + offsets[i].Offset1) % p == 0);
                Debug.Assert(offsets[i].Offset2 >= 0 && polynomial.Evaluate(x + offsets[i].Offset2) % p == 0);
            }

            var threshold = siqs.Threshold;
            var logMaximumDivisor = Math.Log(maximumDivisor, 2);
            var numerator = Math.Log(intervalSize / 2, 2) + BigInteger.Log(n, 2) / 2;
            var denominator = thresholdExponent * logMaximumDivisor;
            var m = intervalSize / 2;
            for (int k = 0; k < intervalSize; k += thresholdInterval)
            {
                var y1 = BigInteger.Abs(polynomial.Evaluate(x + k + 0));
                var y2 = BigInteger.Abs(polynomial.Evaluate(x + k + thresholdInterval - 1));
                var logY = BigInteger.Log(BigInteger.Max(y1, y2), 2);
                threshold[k >> thresholdShift] = (CountInt)Math.Round(logY - denominator);
            }

            siqs.Index = 0;
            siqs.QMap = qMap;
            siqs.S = s;
            siqs.CapB = capB;
            siqs.Polynomial = polynomial;
            siqs.X = x;
            siqs.Bainv2v = null;
            siqs.Error = error;

            return siqs;
        }

        private Siqs ChangePolynomial(Siqs siqs)
        {
            if (siqs == null || siqs.Index == (1 << (siqs.S - 1)) - 1)
                return FirstPolynomial(siqs);

            int index = siqs.Index;
            var a = siqs.Polynomial.A;
            var b = siqs.Polynomial.B;
            var capB = siqs.CapB;

            // Advance index; calculate v & e.
            var v = 0;
            int ii = index + 1;
            while ((ii & 1) == 0)
            {
                ++v;
                ii >>= 1;
            }
            var e = (ii & 2) == 0 ? -1 : 1;

            // Advance b and record new polynomial.
            b += 2 * e * capB[v];
            var polynomial = new Polynomial { A = a, B = b, N = n };
            Debug.Assert((b * b - n) % a == 0);

            // Calculate new offsets.
            var m = intervalSize;
            var x = -m / 2;
            var offsets = siqs.Offsets;
            var bainv2v = siqs.Bainv2[v + (e == -1 ? 0 : siqs.S - 1)];
            for (int i = 0; i < mediumPrimeIndex; i++)
            {
                if (siqs.IsQIndex[i])
                    continue;
                var p = primes[i];
                var step = bainv2v[i];
                var s1 = offsets[i].Offset1 + step;
                if (s1 >= p)
                    s1 -= p;
                offsets[i].Offset1 = s1;
                Debug.Assert(s1 >= 0 && s1 < p && polynomial.Evaluate(x + s1) % p == 0);
                var s2 = offsets[i].Offset2 + step;
                if (s2 >= p)
                    s2 -= p;
                offsets[i].Offset2 = s2;
                Debug.Assert(s2 >= 0 && s2 < p && polynomial.Evaluate(x + s2) % p == 0);
            }
            siqs.Bainv2v = bainv2v;

            // Update siqs.
            siqs.Index = index + 1;
            siqs.Polynomial = polynomial;

            return siqs;
        }

        private BigInteger Solve()
        {
            if ((diag & Diag.SaveMatrix) != 0)
            {
                using (var stream = new StreamWriter(File.OpenWrite("matrix.txt")))
                {
                    stream.WriteLine("{0} {1}", matrix.Rows, matrix.Cols);
                    for (int i = 0; i < matrix.Rows; i++)
                        stream.WriteLine(string.Join(" ", matrix.GetNonZeroCols(i)));
                }
            }

            if ((diag & Diag.Solving) == 0)
            {
                return solver.Solve(matrix)
                    .Select(v => ComputeFactor(v))
                    .Where(factor => !factor.IsZero)
                    .FirstOrDefault();
            }

            var timer = new Stopwatch();
            timer.Start();
            var solutions = solver.Solve(matrix).GetEnumerator();
            var next = solutions.MoveNext();
            var elapsed = (double)timer.ElapsedTicks / Stopwatch.Frequency * 1000;
            output.WriteLine("first solution: {0:F3} msec", elapsed);
            if (!next)
            {
                output.WriteLine("no solutions!");
                return BigInteger.Zero;
            }
            do
            {
                var v = solutions.Current;
                if ((diag & Diag.Solutions) != 0)
                    output.WriteLine("v = {0}", string.Join(", ", v.GetNonZeroIndices().ToArray()));
                int numberOfIndices = v.GetNonZeroIndices().Count();
                timer.Restart();
                var factor = ComputeFactor(v);
                elapsed = (double)timer.ElapsedTicks / Stopwatch.Frequency * 1000;
                output.WriteLine("compute factor: {0:F3} msec ({1} indices)", elapsed, numberOfIndices);
                if (!factor.IsZero)
                    return factor;
            }
            while (solutions.MoveNext());
            output.WriteLine("failed!");
            return BigInteger.Zero;
        }

        private void CalculateNumberOfThreads()
        {
#if DEBUG
            threads = config.Threads != 0 ? config.Threads : 0;
#else
            threads = config.Threads != 0 ? config.Threads : 1;
            if (digits < 10)
                threads = 1;
#endif
        }

        private int CalculateFactorBaseSize()
        {
            if (config.FactorBaseSize != 0)
                return config.FactorBaseSize;
            var size = LookupValue(parameters => parameters.FactorBaseSize);
            if (processPartialPartialRelations)
                size = (int)Math.Round(size * LookupValue(parameters => parameters.PPRRatio));
            return size;
        }

        private T LookupValue<T>(Func<Parameters, T> getter) where T : IConvertible
        {
            for (int i = 0; i < parameters.Length - 1; i++)
            {
                var pair = parameters[i];
                if (digits >= parameters[i].Digits && digits <= parameters[i + 1].Digits)
                {
                    // Interpolate.
                    double x0 = parameters[i].Digits;
                    double y0 = getter(parameters[i]).ToDouble(null);
                    double x1 = parameters[i + 1].Digits;
                    double y1 = getter(parameters[i + 1]).ToDouble(null);
                    double x = y0 + (digits - x0) * (y1 - y0) / (x1 - x0);
                    return (T)Convert.ChangeType(x, typeof(T));
                }
            }
            throw new InvalidOperationException("table entry not found");
        }

        private BigInteger ComputeFactor(IBitArray v)
        {
            var indices = v.GetNonZeroIndices().ToArray();
            Debug.Assert(indices
                .Select(index => relations[index])
                .All(relation => (relation.X * relation.X - MultiplyFactors(relation)) % n == 0));
            var xPrime = indices
                .Select(index => relations[index].X)
                .ModularProduct(n);
            var exponents = SumExponents(indices);
            var yFactorBase = new[] { -1 }
                .Concat(factorBase.Select(entry => entry.P))
                .Zip(exponents, (p, exponent) => IntegerMath.ModularPower(p, exponent, n));
            var yCofactors = indices
                .Select(index => (BigInteger)relations[index].Cofactor)
                .Where(cofactor => cofactor != 1);
            var yPrime = yFactorBase
                .Concat(yCofactors)
                .ModularProduct(n);
            var factor = BigInteger.GreatestCommonDivisor(xPrime + yPrime, n);
            foreach (var multiplierFactor in multiplierFactors)
            {
                if (factor % multiplierFactor == 0)
                    factor /= multiplierFactor;
            }
            return !factor.IsOne && factor != nOrig ? factor : BigInteger.Zero;
        }

        private int[] SumExponents(IEnumerable<int> indices)
        {
            var results = new int[factorBaseSize + 1];
            foreach (int index in indices)
            {
                foreach (var entry in relations[index].Entries)
                    results[entry.Row] += entry.Exponent;
            }
            Debug.Assert(results.All(exponent => exponent % 2 == 0));
            for (int i = 0; i < results.Length; i++)
                results[i] /= 2;
            return results;
        }

        private static CountInt LogScale(int n)
        {
            return (CountInt)Math.Round(Math.Log(Math.Abs(n), 2));
        }

        private static CountInt LogScale(long n)
        {
            return (CountInt)Math.Round(Math.Log(Math.Abs(n), 2));
        }

        private static CountInt LogScale(BigInteger n)
        {
            return (CountInt)Math.Round(BigInteger.Log(BigInteger.Abs(n), 2));
        }

        private void Sieve()
        {
            sievingAborted = false;
            relationBuffer = new Dictionary<ExponentEntries, Relation>();
            partialRelations = new Dictionary<long, PartialRelation>();
            partialPartialRelations = new PartialRelationGraph<PartialRelation>();

            if (threads == 0)
                SieveTask();
            else
            {
                var tasks = new Task[threads];
                for (int i = 0; i < threads; i++)
                    tasks[i] = Task.Factory.StartNew(SieveTask);
                WaitForTasks(tasks);
            }

            relations = relationBuffer.Values.ToArray();
            relationBuffer = null;
            partialRelations = null;
            partialPartialRelations = null;
        }

        private bool SievingCompleted
        {
            get { return sievingAborted || relationBuffer.Count >= desired; }
        }

        private void SieveTask()
        {
            var interval = CreateInterval();
            while (!SievingCompleted)
            {
                Sieve(interval);
                Interlocked.Increment(ref intervalsProcessed);
            }
        }

        private void WaitForTasks(Task[] tasks)
        {
            if ((diag & Diag.Sieve) == 0 && sieveTimeLimit == 0)
            {
                Task.WaitAll(tasks);
                return;
            }

            var timer = new Stopwatch();
            timer.Start();
            var percentCompleteSofar = 0.0;
            var totalTime = 0;
            var lastIntervalsProcessed = 0;
            while (!Task.WaitAll(tasks, reportingInterval * 1000))
            {
                var current = relationBuffer.Count;
                var percentComplete = (double)current / desired * 100;
                var percentLatest = percentComplete - percentCompleteSofar;
                var percentRemaining = 100 - percentComplete;
                var percentRate = (double)percentLatest / reportingInterval;
                var timeRemainingSeconds = percentRate == 0 ? 0 : percentRemaining / percentRate;
                var timeRemaining = TimeSpan.FromSeconds(Math.Ceiling(timeRemainingSeconds));
                var intervals = intervalsProcessed - lastIntervalsProcessed;
                var elapsed = (double)timer.ElapsedTicks / Stopwatch.Frequency;
                var overallPercentRate = (double)relationBuffer.Count / desired * 100 / elapsed;
                var pr = processPartialPartialRelations ? partialPartialRelations.PartialRelations : partialRelations.Count;
                var ppr = processPartialPartialRelations ? partialPartialRelations.PartialPartialRelations : partialPartialRelations.Count;
                if ((diag & Diag.Sieve) != 0)
                {
                    output.WriteLine("{0:F3}% complete, {1:F6}/{2:F6} %/sec, {3}/{4}/{5}, remaining = {6}",
                        percentComplete, percentRate, overallPercentRate,
                        current, pr, ppr, timeRemaining);
                }
                percentCompleteSofar = percentComplete;
                lastIntervalsProcessed = intervalsProcessed;
                totalTime += reportingInterval;
                if (sieveTimeLimit != 0 && totalTime >= sieveTimeLimit)
                {
                    sievingAborted = true;
                    Task.WaitAll(tasks);
                    break;
                }
            }
            var finalElapsed = (double)timer.ElapsedTicks / Stopwatch.Frequency;
            var finalOverallPercentRate = (double)relationBuffer.Count / desired * 100 / finalElapsed;
            output.WriteLine("overall rate = {0:F6} %/sec", finalOverallPercentRate);
        }

        private Interval CreateInterval()
        {
            var interval = new Interval();
            interval.Exponents = new Exponents(factorBaseSize + 1);
            interval.Cycle = new CountInt[cycleLength];
            interval.Counts = new CountInt[Math.Min(intervalSize, blockSize)];
            if (useCountTable)
            {
                if (blockSize == intervalSize)
                {
                    interval.SingleBlockCountTable = new SingleBlockCountTable(interval, numberOfBlocks, blockSize, intervalSize);
                    interval.CountTable = interval.SingleBlockCountTable;
                }
                else
                {
                    interval.MultiBlockCountTable = new MultiBlockCountTable(interval, numberOfBlocks, blockSize, intervalSize);
                    interval.CountTable = interval.MultiBlockCountTable;
                }
            }
            if (processPartialPartialRelations)
                interval.CofactorFactorer = CreateCofactorFactorer();
            return interval;
        }

        private IFactorizationAlgorithm<long> CreateCofactorFactorer()
        {
            return new ShanksSquareForms();
        }

        private void SetupIntervals()
        {
            if (config.BlockSize != 0)
                blockSize = config.BlockSize;
            else
                blockSize = LookupValue(parameters => parameters.BlockSize);
            if (config.IntervalSize != 0)
                intervalSize = config.IntervalSize;
            else
                intervalSize = LookupValue(parameters => parameters.IntervalSize);
#if USE_RECIPROCAL
            Debug.Assert(intervalSize <= 1 << reciprocalShift / 2);
#endif
            blockSize = IntegerMath.MultipleOfCeiling(blockSize, thresholdInterval);
            intervalSize = IntegerMath.MultipleOfCeiling(intervalSize, blockSize);
            int numberOfIncrements = intervalSize / blockSize;
            intervalIncrements = new int[numberOfIncrements + 1][];
            for (int j = 1; j < numberOfIncrements; j++)
            {
                intervalIncrements[j] = new int[factorBaseSize];
                var offset = -blockSize * j;
                for (int i = 0; i < factorBaseSize; i++)
                {
                    var p = primes[i];
                    intervalIncrements[j][i] = (offset % p + p) % p;
                }
            }
            Debug.Assert(intervalSize % blockSize == 0);
            numberOfBlocks = intervalSize / blockSize;
        }

        private Interval GetNextInterval(Interval interval)
        {
            if ((diag & Diag.Polynomials) != 0 && interval.Siqs != null && interval.Siqs.Index == (1 << (interval.Siqs.S - 1)) - 1)
            {
                output.WriteLine("polynomial results: relations found = {0}, partial relations found = {1}, error = {2:F3}",
                    interval.RelationsFound, interval.PartialRelationsFound, interval.Siqs.Error);
                interval.RelationsFound = 0;
                interval.PartialRelationsFound = 0;
            }
            interval.Siqs = ChangePolynomial(interval.Siqs);
            if ((diag & Diag.Polynomials) != 0 && interval.Siqs.Index == 0)
                output.WriteLine("A = {0}", interval.Siqs.Polynomial.A);
            var x = -intervalSize / 2;
            interval.X = x;
            interval.Polynomial = interval.Siqs.Polynomial;
            interval.Size = intervalSize;
            return interval;
        }

        private void SetupSmallPrimeCycle()
        {
            int c = 1;
            int i = 0;
            while (i < factorBaseSize && c * factorBase[i].P < maximumCycleLenth)
            {
                var p = primes[i];
                c *= p;
                ++i;
            }
            mediumPrimeIndex = i;
            cycleLength = c;
        }

        private void Sieve(Interval interval)
        {
            GetNextInterval(interval);
            int intervalSize = interval.Size;
            SetupLargePrimesSieving(interval, blockSize);
            for (int k0 = 0; k0 < intervalSize; k0 += blockSize)
            {
                int size = Math.Min(blockSize, intervalSize - k0);
                interval.Increments = intervalIncrements[k0 / blockSize];
                SieveSmallPrimes(interval, k0, size);
                SieveMediumPrimes(interval, k0, size);
                SieveLargePrimes(interval, k0, size);
                CheckForSmooth(interval, k0, size);
                if (SievingCompleted)
                    break;
            }
        }

        private void SieveSmallPrimes(Interval interval, int k0, int size)
        {
            var cycle = interval.Cycle;
            var counts = interval.Counts;

            if (k0 == 0)
                InitializeSmallPrimeCycle(interval);

            // Initialize the remainder of the counts array with the cycle.
            int k = interval.CycleOffset;
            Array.Copy(cycle, cycleLength - k, counts, 0, Math.Min(k, size));
            while (k < size)
            {
                Array.Copy(cycle, 0, counts, k, Math.Min(cycleLength, size - k));
                k += cycleLength;
            }
            interval.CycleOffset = k - size;
        }

        private void InitializeSmallPrimeCycle(Interval interval)
        {
            var cycle = interval.Cycle;
            var counts = interval.Counts;
            var offsets = interval.Siqs.Offsets;
            var log2 = factorBase[0].LogP;
            var count1 = (CountInt)(log2 * powerOfTwo);
            var count2 = (CountInt)(log2 * powerOfTwo);
            if (offsets[0].Offset1 == 1)
                count1 = 0;
            else
                count2 = 0;
            int k;
            Debug.Assert(Enumerable.Range(0, cycleLength)
                .All(k2 => k2 % 2 != offsets[0].Offset1 ||
                    interval.Polynomial.Evaluate(interval.X + k2) % IntegerMath.Power(2, powerOfTwo) == 0));
            for (k = 0; k < cycleLength; k += 2)
            {
                cycle[k] = count1;
                Debug.Assert(count1 == 0 || interval.Polynomial.Evaluate(interval.X + k) % 2 == 0);
                cycle[k + 1] = count2;
                Debug.Assert(count2 == 0 || interval.Polynomial.Evaluate(interval.X + k + 1) % 2 == 0);
            }
            for (int i = 1; i < mediumPrimeIndex; i++)
            {
                var p = offsets[i].P;
                var logP = offsets[i].LogP;
                var offset1 = offsets[i].Offset1;
                var offset2 = offsets[i].Offset2;
                for (k = 0; k < cycleLength; k += p)
                {
                    cycle[k + offset1] += logP;
                    Debug.Assert(interval.Polynomial.Evaluate(interval.X + k + offset1) % p == 0);
                    if (offset1 == offset2)
                        continue;
                    cycle[k + offset2] += logP;
                    Debug.Assert(interval.Polynomial.Evaluate(interval.X + k + offset2) % p == 0);
                }
            }
            interval.CycleOffset = 0;
        }

        private void SieveMediumPrimes(Interval interval, int k0, int size)
        {
            var siqs = interval.Siqs;
            var offsets = siqs.Offsets;
            var counts = interval.Counts;
            var increments = interval.Increments;
            var bainv2v = interval.Siqs.Bainv2v;
            if (bainv2v == null || k0 != 0)
            {
                for (int i = mediumPrimeIndex; i < largePrimeIndex; i++)
                {
                    if (siqs.IsQIndex[i])
                        continue;
                    int p = offsets[i].P;
                    var logP = offsets[i].LogP;
                    int k1 = offsets[i].Offset1;
                    int k2 = offsets[i].Offset2;
                    if (k0 != 0)
                    {
                        var increment = increments[i];
                        k0 += increment;
                        if (k1 >= p)
                            k1 -= p;
                        k1 += increment;
                        if (k2 >= p)
                            k2 -= p;
                    }
                    if (k1 == k2)
                    {
                        while (k1 < size)
                        {
                            Debug.Assert(interval.Polynomial.Evaluate(interval.X + k0 + k1) % p == 0);
                            counts[k1] += logP;
                            k1 += p;
                        }
                        continue;
                    }
                    if (k1 > k2)
                    {
                        var tmp = k1;
                        k1 = k2;
                        k2 = tmp;
                    }
                    var kDiff = k2 - k1;
                    int kLimit = size - kDiff;
                    while (k1 < kLimit)
                    {
                        Debug.Assert(interval.Polynomial.Evaluate(interval.X + k0 + k1) % p == 0);
                        counts[k1] += logP;
                        Debug.Assert(interval.Polynomial.Evaluate(interval.X + k0 + k1 + kDiff) % p == 0);
                        counts[k1 + kDiff] += logP;
                        k1 += p;
                    }
                    if (k1 < size)
                    {
                        counts[k1] += logP;
                        k1 += p;
                    }
                }
            }
            else
            {
                for (int i = mediumPrimeIndex; i < largePrimeIndex; i++)
                {
                    if (siqs.IsQIndex[i])
                        continue;
                    int p = offsets[i].P;
                    var logP = offsets[i].LogP;
                    var increment = bainv2v[i];
                    int k1 = offsets[i].Offset1 + increment;
                    if (k1 >= p)
                        k1 -= p;
                    offsets[i].Offset1 = k1;
                    int k2 = offsets[i].Offset2 + increment;
                    if (k2 >= p)
                        k2 -= p;
                    offsets[i].Offset2 = k2;
                    if (k1 == k2)
                    {
                        while (k1 < size)
                        {
                            Debug.Assert(interval.Polynomial.Evaluate(interval.X + k0 + k1) % p == 0);
                            counts[k1] += logP;
                            k1 += p;
                        }
                        continue;
                    }
                    if (k1 > k2)
                    {
                        var tmp = k1;
                        k1 = k2;
                        k2 = tmp;
                    }
                    var kDiff = k2 - k1;
                    int kLimit = size - kDiff;
                    while (k1 < kLimit)
                    {
                        Debug.Assert(interval.Polynomial.Evaluate(interval.X + k0 + k1) % p == 0);
                        counts[k1] += logP;
                        Debug.Assert(interval.Polynomial.Evaluate(interval.X + k0 + k1 + kDiff) % p == 0);
                        counts[k1 + kDiff] += logP;
                        k1 += p;
                    }
                    if (k1 < size)
                    {
                        counts[k1] += logP;
                        k1 += p;
                    }
                }
            }
        }

        private void SetupLargePrimesSieving(Interval interval, int size)
        {
            if (!useCountTable)
                return;
            var counts = interval.Counts;
            var offsets = interval.Siqs.Offsets;
            var bainv2v = interval.Siqs.Bainv2v;
            int intervalSize = interval.Size;
            if (interval.SingleBlockCountTable != null)
            {
                var countTable = interval.SingleBlockCountTable;
                countTable.Clear();
                for (int i = largePrimeIndex; i < factorBaseSize; i++)
                {
                    var p = offsets[i].P;
                    var logP = offsets[i].LogP;
                    var increment = bainv2v != null ? bainv2v[i] : 0;
                    int k1 = offsets[i].Offset1 + increment;
                    if (k1 >= p)
                        k1 -= p;
                    if (k1 < intervalSize)
                    {
                        Debug.Assert(interval.Polynomial.Evaluate(interval.X + k1) % p == 0);
                        countTable.AddEntry(i, k1, logP);
                    }
                    offsets[i].Offset1 = k1;
                    int k2 = offsets[i].Offset2 + increment;
                    if (k2 >= p)
                        k2 -= p;
                    if (k2 < intervalSize)
                    {
                        Debug.Assert(interval.Polynomial.Evaluate(interval.X + k2) % p == 0);
                        countTable.AddEntry(i, k2, logP);
                    }
                    offsets[i].Offset2 = k2;
                }
            }
            else
            {
                var countTable = interval.MultiBlockCountTable;
                countTable.Clear();
                for (int i = largePrimeIndex; i < factorBaseSize; i++)
                {
                    var p = offsets[i].P;
                    var logP = offsets[i].LogP;
                    var step = bainv2v != null ? bainv2v[i] : 0;
                    int k1 = offsets[i].Offset1 + step;
                    if (k1 >= p)
                        k1 -= p;
                    if (k1 < intervalSize)
                    {
                        Debug.Assert(interval.Polynomial.Evaluate(interval.X + k1) % p == 0);
                        countTable.AddEntry(i, k1, logP);
                    }
                    offsets[i].Offset1 = k1;
                    int k2 = offsets[i].Offset2 + step;
                    if (k2 >= p)
                        k2 -= p;
                    if (k2 < intervalSize)
                    {
                        Debug.Assert(interval.Polynomial.Evaluate(interval.X + k2) % p == 0);
                        countTable.AddEntry(i, k2, logP);
                    }
                    offsets[i].Offset2 = k2;
                }
            }
        }

        private void SieveLargePrimes(Interval interval, int k0, int size)
        {
            if (useCountTable)
            {
                interval.CountTable.AddToCounts(k0, interval.Counts);
                return;
            }
            var counts = interval.Counts;
            var offsets = interval.Siqs.Offsets;
            var bainv2v = interval.Siqs.Bainv2v;
            if (bainv2v == null || k0 != 0)
            {
                var increments = interval.Increments;
                for (int i = largePrimeIndex; i < factorBaseSize; i++)
                {
                    var p = offsets[i].P;
                    var logP = offsets[i].LogP;
                    int k1 = offsets[i].Offset1;
                    int k2 = offsets[i].Offset2;
                    if (k0 != 0)
                    {
                        var increment = increments[i];
                        k1 += increment;
                        if (k1 >= p)
                            k1 -= p;
                        k2 += increment;
                        if (k2 >= p)
                            k2 -= p;
                    }
                    if (k1 < size)
                    {
                        Debug.Assert(interval.Polynomial.Evaluate(interval.X + k1) % p == 0);
                        counts[k1] += logP;
                    }
                    if (k2 < size)
                    {
                        Debug.Assert(interval.Polynomial.Evaluate(interval.X + k2) % p == 0);
                        counts[k2] += logP;
                    }
                }
            }
            else
            {
                for (int i = largePrimeIndex; i < factorBaseSize; i++)
                {
                    var p = offsets[i].P;
                    var logP = offsets[i].LogP;
                    var step = bainv2v[i];
                    int k1 = offsets[i].Offset1 + step;
                    if (k1 >= p)
                        k1 -= p;
                    if (k1 < size)
                    {
                        Debug.Assert(interval.Polynomial.Evaluate(interval.X + k1) % p == 0);
                        counts[k1] += logP;
                    }
                    offsets[i].Offset1 = k1;
                    int k2 = offsets[i].Offset2 + step;
                    if (k2 >= p)
                        k2 -= p;
                    if (k2 < size)
                    {
                        Debug.Assert(interval.Polynomial.Evaluate(interval.X + k2) % p == 0);
                        counts[k2] += logP;
                    }
                    offsets[i].Offset2 = k2;
                }
            }
        }

        private void CheckForSmooth(Interval interval, int k0, int size)
        {
            var counts = interval.Counts;
            var threshold = interval.Siqs.Threshold;
            if (useSingleThreshold)
            {
                var limit = threshold[0];
                for (int k = 0; k < size; k++)
                {
                    if (counts[k] >= limit)
                    {
                        CheckValue(interval, k0 + k);
                        if (SievingCompleted)
                            return;
                    }
                }
                return;
            }
            for (int k = 0; k < size; k += thresholdInterval)
            {
                var limit = threshold[(k0 + k) >> thresholdShift];
                int jMax = k + thresholdInterval;
                for (int j = k; j < jMax; j++)
                {
                    if (counts[j] >= limit)
                    {
                        CheckValue(interval, k0 + j);
                        if (SievingCompleted)
                            return;
                    }
                }
            }
        }

        private void CheckValue(Interval interval, int k)
        {
#if false
            var count = interval.Counts[k];
            if (count >= threshold1 && count < threshold2)
                return;
#endif
            Interlocked.Increment(ref valuesChecked);
            interval.Exponents.Clear();
            long cofactor = FactorOverBase(interval, k);
            if (cofactor == 0)
            {
                Interlocked.Increment(ref cofactorsGreaterThan64Bits);
                return;
            }
            if (cofactor == 1)
            {
                var relation = CreateRelation(
                    interval.Polynomial.EvaluateMapping(interval.X + k),
                    interval.Exponents.Entries,
                    1);
                ++interval.RelationsFound;
                AddRelation(relation);
                return;
            }
            if (cofactor < maximumCofactor)
            {
                ++interval.PartialRelationsFound;
                ProcessPartialRelation(interval, k, cofactor);
                return;
            }
            if (!processPartialPartialRelations)
                return;
            if (cofactor < maximumDivisorSquared)
            {
                // Must be prime and exceeds maximum cofactor.
                Interlocked.Increment(ref cofactorsExceedingCutoff1);
                return;
            }
            if (cofactor > maximumCofactorSquared)
            {
                Interlocked.Increment(ref cofactorsExceedingCutoff2);
                return;
            }
            Interlocked.Increment(ref cofactorsPrimalityTested);
            if (IntegerMath.IsProbablePrime(cofactor))
                return;
            Interlocked.Increment(ref cofactorsFactored);
            var factor1 = interval.CofactorFactorer.GetDivisor(cofactor);
            if (factor1 <= 1)
                return;
            var factor2 = cofactor / factor1;
            if (factor1 >= maximumCofactor || factor2 >= maximumCofactor)
            {
                // One of the two factors exceeds maximum cofactor.
                Interlocked.Increment(ref cofactorsExceedingCutoff1);
            }
            ProcessPartialPartialRelation(interval, k, factor1, factor2);
        }

        private long FactorOverBase(Interval interval, int k)
        {
            var y = interval.Polynomial.Evaluate(interval.X + k);
            var exponents = interval.Exponents;
            var siqs = interval.Siqs;
            var offsets = siqs.Offsets;

            // Handle negative values.
            if (y.Sign == -1)
            {
                exponents.Add(0, 1);
                y = -y;
            }

            // Handle factors of two.
            while (y.IsEven)
            {
                exponents.Add(1, 1);
                y >>= 1;
            }

            for (int i = 0; i < siqs.S; i++)
            {
                var j = siqs.QMap[i];
                var q = factorBase[j].P;

                // The first factor of q has already been divided out
                // when the polynomial was evaluated.
                exponents.Add(j + 1, 1);

                // Check for any other factors.
                while (y % q == 0)
                {
                    exponents.Add(j + 1, 1);
                    y /= q;
                }
            }

            // Divide out the medium primes.
            for (int i = 1; i < largePrimeIndex; i++)
            {
                if (siqs.IsQIndex[i])
                    continue;
                var p = offsets[i].P;
#if false
                var offset = k % p;
                if (offset != offsets[i].Offset1 && offset != offsets[i].Offset2)
                {
                    Debug.Assert(y % p != 0);
                    continue;
                }
#endif
#if USE_RECIPROCAL
                var offset = k - (int)((offsets[i].Reciprocal * k) >> reciprocalShift) * p;
                if (offset != offsets[i].Offset1 && offset != offsets[i].Offset2)
                {
                    Debug.Assert(y % p != 0);
                    continue;
                }
#endif
#if USE_INVERSE
#if false
                var pInv = offsets[i].PInv;
                var qMax = offsets[i].QMax;
                var kp = k + p;
                if ((uint)(kp - offsets[i].Offset1) * pInv > qMax && (uint)(kp - offsets[i].Offset2) * pInv > qMax)
                {
                    Debug.Assert(y % p != 0);
                    continue;
                }
#endif
#if true
                var kpInv1 = (uint)(k + p - offsets[i].Offset1) * offsets[i].PInv;
                if (kpInv1 > offsets[i].QMax && kpInv1 + offsets[i].OffsetDiffInv > offsets[i].QMax)
                {
                    Debug.Assert(y % p != 0);
                    continue;
                }
#endif
#endif
                Debug.Assert(y % p == 0);
                do
                {
                    exponents.Add(i + 1, 1);
                    y /= p;
                }
                while ((y % p).IsZero);
                long cofactor = CheckPrime(interval, ref y, i);
                if (cofactor != 0)
                    return cofactor;
            }

            // Divide out the large primes.
            if (!useCountTable)
            {
                for (int i = largePrimeIndex; i < factorBaseSize; i++)
                {
                    if (k != offsets[i].Offset1 && k != offsets[i].Offset2)
                    {
                        Debug.Assert(y % offsets[i].P != 0);
                        continue;
                    }
                    var p = offsets[i].P;
                    Debug.Assert(y % p == 0);
                    do
                    {
                        exponents.Add(i + 1, 1);
                        y /= p;
                    }
                    while ((y % p).IsZero);
                    long cofactor = CheckPrime(interval, ref y, i);
                    if (cofactor != 0)
                        return cofactor;
                }
            }
            else
                y = interval.CountTable.AddExponents(y, k, exponents, primes);
            return y < long.MaxValue ? (long)y : 0;
        }

        private long CheckPrime(Interval interval, ref BigInteger y, int i)
        {
            if (y < factorBase[i].PSquared)
            {
                var cofactor = (long)y;
                int index;
                if (cofactor < int.MaxValue && primeMap.TryGetValue((int)cofactor, out index))
                {
                    Debug.Assert(cofactor == primes[index]);
                    interval.Exponents.Add(index + 1, 1);
                    cofactor = 1;
                }
                return cofactor;
            }
            return 0;
        }

        private long FactorOverBase(Exponents exponents, Polynomial polynomial, long x)
        {
            var y = polynomial.A * polynomial.Evaluate(x);
            if (y < 0)
            {
                exponents.Add(0, 1);
                y = -y;
            }
            while (y.IsEven)
            {
                exponents.Add(1, 1);
                y >>= 1;
            }
            for (int i = 1; i < factorBaseSize; i++)
            {
                var p = primes[i];
                while (y % p == 0)
                {
                    exponents.Add(i + 1, 1);
                    y /= p;
                }
            }
            return y < long.MaxValue ? (long)y : 0;
        }


        private void ProcessPartialRelation(Interval interval, int k, long cofactor)
        {
            if (processPartialPartialRelations)
            {
                ProcessPartialPartialRelation(interval, k, cofactor, 1);
                return;
            }
            Interlocked.Increment(ref partialRelationsProcessed);
            var relation = new PartialRelation
            {
                X = interval.X + k,
                Polynomial = interval.Polynomial,
                Entries = savePartialRelationFactorizations ? interval.Exponents.Entries : null,
            };
            CheckValidPartialRelation(relation, cofactor);
            PartialRelation other;
            while (true)
            {
                lock (partialRelations)
                {
                    if (partialRelations.TryGetValue(cofactor, out other))
                        partialRelations.Remove(cofactor);
                    else
                        partialRelations.Add(cofactor, relation);
                }
                if (other.Polynomial == null)
                    return;
                if (!other.Entries.Equals(relation.Entries))
                    break;
                Interlocked.Increment(ref duplicatePartialRelationsFound);
            }
            Interlocked.Increment(ref partialRelationsConverted);
            if (other.Entries != null)
                AddEntries(interval.Exponents, other.Entries);
            else
                FactorOverBase(interval.Exponents, other.Polynomial, other.X);
            AddRelation(CreateRelation(
                interval.Polynomial.EvaluateMapping(interval.X + k) * other.Polynomial.EvaluateMapping(other.X),
                interval.Exponents.Entries,
                cofactor));
        }

#if false
        private List<Tuple<long, long>> pprs = new List<Tuple<long, long>>();
#endif

        private void ProcessPartialPartialRelation(Interval interval, int k, long cofactor1, long cofactor2)
        {
            if (cofactor2 == 1)
                Interlocked.Increment(ref partialRelationsProcessed);
            else
                Interlocked.Increment(ref partialPartialRelationsProcessed);
            if (cofactor1 == cofactor2)
            {
                Interlocked.Increment(ref partialPartialRelationsConverted);
                AddRelation(CreateRelation(
                    interval.Polynomial.EvaluateMapping(interval.X + k),
                    interval.Exponents.Entries,
                    cofactor1));
                return;
            }
            var saveFactorization = cofactor2 == 1 ? savePartialRelationFactorizations : savePartialPartialRelationFactorizations;
            var relation = new PartialRelation
            {
                Polynomial = interval.Polynomial,
                X = interval.X + k,
                Entries = saveFactorization ? interval.Exponents.Entries : null,
            };
            CheckValidPartialPartialRelation(relation, interval.Exponents, cofactor1, cofactor2);
#if false
            lock (pprs)
                pprs.Add(partialPartialRelation);
#endif
            var cycle = null as ICollection<PartialRelationGraph<PartialRelation>.Edge>;
            lock (partialPartialRelations)
            {
                // Duplicate check.
                if (IsDuplicate(relation, cofactor1, cofactor2))
                    return;

                // See if this edge will complete a cycle.
                cycle = partialPartialRelations.FindPath(cofactor1, cofactor2);
                if (cycle == null)
                {
                    // Nope, add it.
                    partialPartialRelations.AddEdge(cofactor1, cofactor2, ref relation);
                    return;
                }

                // Remove the remainder of the cyle from the graph.
                foreach (var other in cycle)
                    partialPartialRelations.RemoveEdge(other);
            }

            // We have a relation; record it.
            if (cofactor2 == 1 && cycle.Count == 1)
                Interlocked.Increment(ref partialRelationsConverted);
            else
                Interlocked.Increment(ref partialPartialRelationsConverted);

            // Create a relation from all the partial partials in the cycle.
            var x = interval.Polynomial.EvaluateMapping(interval.X + k);
            var allCofactors = new List<long> { cofactor1, cofactor2 };
            foreach (var edge in cycle)
            {
                var other = edge.Value;
                x *= other.Polynomial.EvaluateMapping(other.X);
                allCofactors.Add(edge.Vertex1);
                allCofactors.Add(edge.Vertex2);
                if (other.Entries != null)
                    AddEntries(interval.Exponents, other.Entries);
                else
                    FactorOverBase(interval.Exponents, other.Polynomial, other.X);
            }
            var cofactors = allCofactors.Distinct().ToArray();
            Debug.Assert(cofactors.Length == cycle.Count + 1);
            var cofactor = cofactors.Select(i => (BigInteger)i).Product();

            // Add the relation.
            AddRelation(CreateRelation(x, interval.Exponents.Entries, cofactor));
        }

        private bool IsDuplicate(PartialRelation relation, long cofactor1, long cofactor2)
        {
            var edge = partialPartialRelations.FindEdge(cofactor1, cofactor2);
            if (edge == null)
                return false;
            var other = edge.Value;
            if (other.Entries != null && relation.Entries != null)
            {
                if (!other.Entries.Equals(relation.Entries))
                    return false;
            }
            else
            {
                if (other.Polynomial.Evaluate(other.X) != relation.Polynomial.Evaluate(relation.X))
                    return false;
            }
            Interlocked.Increment(ref duplicatePartialPartialRelationsFound);
            return true;
        }

        private void AddEntries(Exponents exponents, ExponentEntries entries)
        {
            for (int i = 0; i < entries.Count; i++)
                exponents.Add(entries[i].Row, entries[i].Exponent);
        }

        private Relation CreateRelation(BigInteger x, ExponentEntries entries, BigInteger cofactor)
        {
            var relation = new Relation
            {
                X = x,
                Entries = entries,
                Cofactor = cofactor,
            };
            CheckValidRelation(relation);
            return relation;
        }

        private void AddRelation(Relation relation)
        {
            lock (relationBuffer)
            {
                if (relationBuffer.ContainsKey(relation.Entries))
                {
                    Interlocked.Increment(ref duplicateRelationsFound);
                    return;
                }
                relationBuffer.Add(relation.Entries, relation);
            }
        }

        private void ProcessRelations()
        {
#if false
            if (pprs.Count != 0)
            {
                using (var stream = new StreamWriter(File.OpenWrite("pprs.txt")))
                {
                    for (int i = 0; i < pprs.Count; i++)
                    {
                        var ppr = pprs[i];
                        stream.WriteLine("{0} {1}", ppr.Cofactor1, ppr.Cofactor2);
                    }
                }
            }
#endif
            matrix = new BitMatrix(factorBaseSize + 1, relations.Length);
            for (int j = 0; j < relations.Length; j++)
            {
                var entries = relations[j].Entries;
                for (int i = 0; i < entries.Count; i++)
                {
                    var entry = entries[i];
                    if (entry.Exponent % 2 != 0)
                        matrix[entry.Row, j] = true;
                }
            }
        }

        private BigInteger MultiplyFactors(ExponentEntries entries)
        {
            return entries
                .Select(entry => BigInteger.Pow(entry.Row == 0 ? -1 : factorBase[entry.Row - 1].P, entry.Exponent))
                .ModularProduct(n);
        }

        private BigInteger MultiplyFactors(Relation relation)
        {
            var result = MultiplyFactors(relation.Entries);
            if (relation.Cofactor == 1)
                return result;
            return result * relation.Cofactor % n * relation.Cofactor % n;
        }

        private BigInteger MultiplyFactors(ExponentEntries entries, params BigInteger[] cofactors)
        {
            var result = MultiplyFactors(entries);
            return result * cofactors.ModularProduct(n) % n;
        }

        [Conditional("DEBUG")]
        private void CheckValidRelation(Relation relation)
        {
            var x = relation.X;
            var y = MultiplyFactors(relation);
            if ((x * x - y) % n != 0)
                throw new InvalidOperationException("invalid relation");
        }

        [Conditional("DEBUG")]
        private void CheckValidPartialRelation(PartialRelation relation, long cofactor)
        {
            var x = relation.Polynomial.EvaluateMapping(relation.X);
            var y = MultiplyFactors(relation.Entries, cofactor);
            if ((x * x - y) % n != 0)
                throw new InvalidOperationException("invalid partial relation");
        }

        [Conditional("DEBUG")]
        private void CheckValidPartialPartialRelation(PartialRelation relation, Exponents exponents, long cofactor1, long cofactor2)
        {
            var x = relation.Polynomial.EvaluateMapping(relation.X);
            var y = MultiplyFactors(exponents.Entries, cofactor1, cofactor2);
            if ((x * x - y) % n != 0)
                throw new InvalidOperationException("invalid partial partial relation");
        }
    }
}
