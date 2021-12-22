using System;
using System.Collections;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;

namespace Nethermind.Decompose.Numerics
{
    public class IntegerSet : IEnumerable<int>
    {
        private struct Entry
        {
            public int Bucket { get; set; }
            public int Value { get; set; }
            public int Next { get; set; }
            public override string ToString()
            {
                return string.Format("Bucket = {0}, Value = {1}, Next = {2}", Bucket, Value, Next);
            }
        }

        private const int initialCapacity = 64;

        private Entry[] entries;
        private int count;
        private int used;
        private int freeList;
        private int nMask;

        public IntegerSet()
        {
            Clear();
        }

        public int Count
        {
            get { return count; }
        }

        public void Clear()
        {
            entries = new Entry[initialCapacity];
            for (int bucket = 0; bucket < entries.Length; bucket++)
                entries[bucket].Bucket = -1;
            count = 0;
            used = 0;
            freeList = -1;
            nMask = entries.Length - 1;
        }

        public bool Contains(int value)
        {
            return ContainsEntry(value);
        }

        public void Add(int value)
        {
            if (ContainsEntry(value))
                return;
            var bucket = value & nMask;
            var entry = freeList;
            if (entry == -1)
            {
                if (used + 1 == entries.Length)
                {
                    Resize();
                    bucket = value & nMask;
                }
                entry = used++;
            }
            else
                freeList = GetFreeListEntry(entries[freeList].Next);
            entries[entry].Value = value;
            entries[entry].Next = entries[bucket].Bucket;
            entries[bucket].Bucket = entry;
            ++count;
        }

        public void Remove(int value)
        {
            if (!ContainsEntry(value))
                return;
            var bucket = value & nMask;
            var prev = -1;
            var entry = entries[bucket].Bucket;
            while (entries[entry].Value != value)
            {
                prev = entry;
                entry = entries[entry].Next;
            }
            if (prev == -1)
                entries[bucket].Bucket = entries[entry].Next;
            else
                entries[prev].Next = entries[entry].Next;
            entries[entry].Next = GetFreeListEntry(freeList);
            freeList = entry;
            --count;
        }

        public IEnumerator<int> GetEnumerator()
        {
            for (int entry = 0; entry < used; entry++)
            {
                if (entries[entry].Next >= -1)
                    yield return entries[entry].Value;
            }
        }

        IEnumerator IEnumerable.GetEnumerator()
        {
            return GetEnumerator();
        }

        private bool ContainsEntry(int value)
        {
            var bucket = value & nMask;
            for (var index = entries[bucket].Bucket; index != -1; index = entries[index].Next)
            {
                if (entries[index].Value == value)
                    return true;
            }
            return false;
        }

        private int GetFreeListEntry(int entry)
        {
            return -3 - entry;
        }

        private void Resize()
        {
            int n = entries.Length;
            Array.Resize(ref entries, entries.Length * 2);
            nMask = entries.Length - 1;
            for (int bucket = 0; bucket < n; bucket++)
            {
                var list1 = -1;
                var list2 = -1;
                var next = -1;
                for (var entry = entries[bucket].Bucket; entry != -1; entry = next)
                {
                    next = entries[entry].Next;
                    int value = entries[entry].Value;
                    if ((value & nMask) == bucket)
                    {
                        entries[entry].Next = list1;
                        list1 = entry;
                    }
                    else
                    {
                        Debug.Assert((value & nMask) == bucket + n);
                        entries[entry].Next = list2;
                        list2 = entry;
                    }
                }
                entries[bucket].Bucket = list1;
                entries[bucket + n].Bucket = list2;
            }
        }
    }
}
