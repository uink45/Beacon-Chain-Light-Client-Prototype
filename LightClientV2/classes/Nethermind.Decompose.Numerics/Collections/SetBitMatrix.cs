using System;
using System.Collections;
using System.Collections.Generic;

#if false
using Set = System.Collections.Generic.HashSet<int>;
#endif
#if true
using Set= Nethermind.Decompose.Numerics.IntegerSet;
#endif

namespace Nethermind.Decompose.Numerics
{
    public class SetBitMatrix : IBitMatrix
    {
        private int rows;
        private int cols;

        private Set[] rowSets;
        private Set[] colSets;

        public int WordLength
        {
            get { return 1; }
        }

        public bool IsRowMajor
        {
            get { return true; }
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

        public SetBitMatrix(int rows, int cols)
        {
            this.rows = rows;
            this.cols = cols;
            rowSets = new Set[rows];
            for (int i = 0; i < rows; i++)
                rowSets[i] = new Set();
            colSets = new Set[cols];
            for (int i = 0; i < cols; i++)
                colSets[i] = new Set();
        }

        public bool this[int row, int col]
        {
            get { return colSets[col].Contains(row); }
            set
            {
                if (value)
                {
                    rowSets[row].Add(col);
                    colSets[col].Add(row);
                }
                else
                {
                    rowSets[row].Remove(col);
                    colSets[col].Remove(row);
                }
            }
        }

        public void XorRows(int dst, int src, int col)
        {
            BitMatrixHelper.XorRows(this, dst, src, col);
        }

        public void Clear()
        {
            for (int i = 0; i < rows; i++)
                rowSets[i].Clear();
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
            return rowSets[row];
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
            return rowSets[row].Count;
        }

        public int GetColWeight(int col)
        {
            return colSets[col].Count;
        }

        public IEnumerable<int> GetRowWeights()
        {
            return BitMatrixHelper.GetRowWeights(this);
        }

        public IEnumerable<int> GetColWeights()
        {
            return BitMatrixHelper.GetColWeights(this);
        }
    }
}
