using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;
using Word = System.Int64;
using System.Diagnostics;

namespace Nethermind.Decompose.Numerics
{
    public class Word64BitMatrix : IBitMatrix
    {
        private const int wordShift = 6;
        private const int wordLength = 1 << wordShift;
        private const int wordMask = wordLength - 1;

        private int rows;
        private int cols;
        private int words;
        private Word[][] bits;

        public int WordLength
        {
            get { return wordLength; }
        }

        public bool IsRowMajor
        {
            get { return true; }
        }

        public bool IsColMajor
        {
            get { return false; }
        }

        public int Rows
        {
            get { return rows; }
        }

        public int Cols
        {
            get { return cols; }
        }

        public Word64BitMatrix(int rows, int cols)
        {
            this.rows = rows;
            this.cols = cols;
            words = (cols + wordLength - 1) / wordLength;
            bits = new Word[rows][];
            for (int i = 0; i < rows; i++)
                bits[i] = new Word[words];
        }

        public Word64BitMatrix(IBitMatrix matrix)
            : this(matrix.Rows, matrix.Cols)
        {
            BitMatrixHelper.CopyNonZero(this, matrix);
        }

        public bool this[int i, int j]
        {
            get
            {
                return (bits[i][j >> wordShift] & (Word)1 << (j & wordMask)) != 0;
            }
            set
            {
                if (value)
                    bits[i][j >> wordShift] |= (Word)1 << (j & wordMask);
                else
                    bits[i][j >> wordShift] &= ~((Word)1 << (j & wordMask));
            }
        }

        public void XorRows(int dst, int src, int col)
        {
            var dstRow = bits[dst];
            var srcRow = bits[src];
            for (int word = col / wordLength; word < words; word++)
                dstRow[word] ^= srcRow[word];
        }

        public void Clear()
        {
            int size = rows * words;
            for (int i = 0; i < rows; i++)
            {
                var row = bits[i];
                for (int j = 0; j < words; j++)
                    row[j] = 0;
            }
        }

        public void Copy(IBitMatrix other, int row, int col)
        {
            if (other is Word64BitMatrix)
            {
                CopySubMatrix((Word64BitMatrix)other, row, col);
                return;
            }
            for (int i = 0; i < other.Rows; i++)
            {
                for (int j = 0; j < other.Cols; j++)
                    this[row + i, col + j] = other[i, j];
            }
        }

        public void CopySubMatrix(Word64BitMatrix other, int row, int col)
        {
            for (int i = 0; i < other.rows; i++)
                other.bits[i].CopyTo(bits[row + i], col);
        }

        public IEnumerable<bool> GetRow(int row)
        {
            return BitMatrixHelper.GetRow(this, row);
        }

        public IEnumerable<int> GetNonZeroCols(int row)
        {
            var srcRow = bits[row];
            for (int word = 0; word < words; word++)
            {
                var value = srcRow[word];
                if (value != 0)
                {
                    int col = word * wordLength;
                    for (int j = 0; j < wordLength; j++)
                    {
                        if ((value & (Word)1 << j) != 0)
                            yield return col + j;
                    }
                }
            }
        }

        public IEnumerable<bool> GetCol(int col)
        {
            return BitMatrixHelper.GetCol(this, col);
        }

        public IEnumerable<int> GetNonZeroRows(int col)
        {
            return BitMatrixHelper.GetNonZeroRows(this, col);
        }

        public int GetRowWeight(int row)
        {
            int weight = 0;
            var srcRow = bits[row];
            for (int word = 0; word < words; word++)
            {
                var value = srcRow[word];
                if (value != 0)
                    weight += value.GetBitCount();
            }
            Debug.Assert(weight == GetRow(row).Select(bit => bit ? 1 : 0).Sum());
            return weight;
        }

        public int GetColWeight(int col)
        {
            return BitMatrixHelper.GetColWeight(this, col);
        }

        public IEnumerable<int> GetRowWeights()
        {
            return BitMatrixHelper.GetRowWeights(this);
        }

        public IEnumerable<int> GetColWeights()
        {
            return BitMatrixHelper.GetColWeights(this);
        }

        public override string ToString()
        {
            return string.Format("Rows = {0}, Cols = {1}", Rows, Cols);
        }
    }
}
