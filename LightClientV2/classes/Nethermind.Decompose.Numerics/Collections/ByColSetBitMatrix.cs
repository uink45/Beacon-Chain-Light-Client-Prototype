using System;
using System.Collections;
using System.Collections.Generic;

namespace Nethermind.Decompose.Numerics
{
    public class ByColSetBitMatrix : IBitMatrix
    {
        private int rows;
        private int cols;

        private HashSet<int>[] colSets;

        public int WordLength
        {
            get { return 1; }
        }

        public bool IsRowMajor
        {
            get { return false; }
        }

        public bool IsColMajor
        {
            get { return true; }
        }

        public int Rows
        {
            get { return rows; }
        }

        public int Cols
        {
            get { return cols; }
        }

        public ByColSetBitMatrix(int rows, int cols)
        {
            this.rows = rows;
            this.cols = cols;
            colSets = new HashSet<int>[cols];
            for (int i = 0; i < cols; i++)
                colSets[i] = new HashSet<int>();
        }

        public bool this[int row, int col]
        {
            get { return colSets[col].Contains(row); }
            set
            {
                if (value)
                    colSets[col].Add(row);
                else
                    colSets[col].Remove(row);
            }
        }

        public void XorRows(int dst, int src, int col)
        {
            BitMatrixHelper.XorRows(this, dst, src, col);
        }

        public void Clear()
        {
            for (int j = 0; j < cols; j++)
                colSets[j].Clear();
        }

        public void Copy(IBitMatrix other, int row, int col)
        {
            BitMatrixHelper.Copy(this, other, row, col);
        }

        public IEnumerable<bool> GetRow(int row)
        {
            return BitMatrixHelper.GetRow(this, row);
        }

        public IEnumerable<int> GetNonZeroCols(int row)
        {
            return BitMatrixHelper.GetNonZeroCols(this, row);
        }

        public IEnumerable<bool> GetCol(int col)
        {
            return BitMatrixHelper.GetCol(this, col);
        }

        public IEnumerable<int> GetNonZeroRows(int col)
        {
            return colSets[col];
        }

        public int GetRowWeight(int row)
        {
            return BitMatrixHelper.GetRowWeight(this, row);
        }

        public int GetColWeight(int col)
        {
            return colSets[col].Count;
        }

        public IEnumerable<int> GetRowWeights()
        {
            var weights = new int[rows];
            for (int col = 0; col < cols; col++)
            {
                foreach (var row in colSets[col])
                    ++weights[row];
            }
            return weights;
        }

        public IEnumerable<int> GetColWeights()
        {
            return BitMatrixHelper.GetColWeights(this);
        }
    }
}
