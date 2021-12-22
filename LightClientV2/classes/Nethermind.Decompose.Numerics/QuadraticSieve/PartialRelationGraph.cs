using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Text;

namespace Nethermind.Decompose.Numerics
{
    /// <summary>
    /// A specialized graph that can contain either partial relations or
    /// partial partial relations.
    /// </summary>
    /// <remarks>
    /// The data structure is optimized for both kinds internally but exposes a
    /// unified interface.  It is essential that the graph be maintained so
    /// that it doesn't contain any cycles.  Instead of finding cycles, the
    /// client requests a path between two vertices when it has the edge that
    /// will complete the cycle.  If so, the client then removes that path from
    /// the graph, always preserving the fact that the graph is acyclic.
    /// </remarks>
    /// <typeparam name="Edge"></typeparam>
    public class PartialRelationGraph<TValue>
    {
        public class Edge
        {
            public long Vertex1 { get; set; }
            public long Vertex2 { get; set; }
            public TValue Value { get; set; }
            public override string ToString()
            {
                return string.Format("Vertex1 = {0}, Vertex2 = {1}", Vertex1, Vertex2);
            }
        }

        /// <summary>
        /// A vertex map is a specialized dictionary
        /// that can get very large.  The contents of the
        /// map are distributed across a number of
        /// smaller dictionaries.  This facilitates memory
        /// management and increases the maximum size.
        /// </summary>
        /// <typeparam name="T">The dictionary value type.</typeparam>
        private class VertexMap<T>
        {
            private const int n = 16;
            private const int shift = 1;
            private const int mask = (n - 1) << shift;
            public Dictionary<long, T>[] dictionaries;
            public int Count
            {
                get
                {
                    int count = 0;
                    for (int i = 0; i < n; i++)
                        count += dictionaries[i].Count;
                    return count;
                }
            }
            public VertexMap()
            {
                dictionaries = new Dictionary<long, T>[n];
                for (int i = 0; i < n; i++)
                    dictionaries[i] = new Dictionary<long, T>();
            }
            public bool ContainsKey(long vertex)
            {
                return dictionaries[GetSlot(vertex)].ContainsKey(vertex);
            }
            public void Add(long vertex, T value)
            {
                dictionaries[GetSlot(vertex)].Add(vertex, value);
            }
            public void AddRef(long vertex, ref T value)
            {
                dictionaries[GetSlot(vertex)].Add(vertex, value);
            }
            public void Remove(long vertex)
            {
                dictionaries[GetSlot(vertex)].Remove(vertex);
            }
            public T this[long vertex]
            {
                get { return dictionaries[GetSlot(vertex)][vertex]; }
                set { dictionaries[GetSlot(vertex)][vertex] = value; }
            }
            public bool TryGetValue(long vertex, out T value)
            {
                return dictionaries[GetSlot(vertex)].TryGetValue(vertex, out value);
            }
            private int GetSlot(long vertex)
            {
                return ((int)vertex & mask) >> shift;
            }
        }

        /// <summary>
        /// Dictionary mapping vertices to edges.  A vertex with a single
        /// edge is treated specially to conserve memory.
        /// </summary>
        private class EdgeMap
        {
            private VertexMap<object> map;
            public EdgeMap()
            {
                map = new VertexMap<object>();
            }
            public void Add(long vertex, Edge edge)
            {
                object value;
                if (map.TryGetValue(vertex, out value))
                {
                    if (value is Edge)
                        map[vertex] = new List<Edge> { (Edge)value, edge };
                    else
                        (value as List<Edge>).Add(edge);
                }
                else
                    map.Add(vertex, edge);
            }
            public void Remove(long vertex, Edge edge)
            {
                var value = map[vertex];
                if (value is Edge)
                    map.Remove(vertex);
                else
                {
                    var list = value as List<Edge>;
                    list.Remove(edge);
                    if (list.Count == 1)
                        map[vertex] = list[0];
                }
            }
            public bool HasEdges(long vertex)
            {
                return map.ContainsKey(vertex);
            }
            public bool GetEdges(long vertex, out Edge edge, out List<Edge> edges)
            {
                if (!map.ContainsKey(vertex))
                {
                    edge = null;
                    edges = null;
                    return false;
                }
                edge = map[vertex] as Edge;
                edges = map[vertex] as List<Edge>;
                return true;
            }
        }

        private VertexMap<TValue> prMap;
        private EdgeMap pprMap;
        private int count;

        public int Count { get { return count; } }
        public int PartialRelations { get { return prMap.Count; } }
        public int PartialPartialRelations { get { return count - prMap.Count; } }

        public PartialRelationGraph()
        {
            prMap = new VertexMap<TValue>();
            pprMap = new EdgeMap();
        }

        public void AddEdge(long vertex1, long vertex2, ref TValue value)
        {
            if (vertex2 == 1)
                prMap.AddRef(vertex1, ref value);
            else
            {
                var edge = new Edge { Vertex1 = vertex1, Vertex2 = vertex2, Value = value };
                pprMap.Add(vertex1, edge);
                pprMap.Add(vertex2, edge);
            }
            ++count;
        }

        public void RemoveEdge(Edge edge)
        {
            if (edge.Vertex2 == 1)
                prMap.Remove(edge.Vertex1);
            else
            {
                pprMap.Remove(edge.Vertex1, edge);
                pprMap.Remove(edge.Vertex2, edge);
            }
            --count;
        }

        public Edge FindEdge(long vertex)
        {
            TValue value;
            if (prMap.TryGetValue(vertex, out value))
                return new Edge { Vertex1 = vertex, Vertex2 = 1, Value = value };
            return null;
        }

        public Edge FindEdge(long vertex1, long vertex2)
        {
            Edge edge;
            List<Edge> edges;
            if (vertex2 == 1)
                return FindEdge(vertex1);
            if (!pprMap.GetEdges(vertex1, out edge, out edges))
                return null;
            if (edge != null)
            {
                if (edge.Vertex1 == vertex2 || edge.Vertex2 == vertex2)
                    return edge;
                return null;
            }
            for (int i = 0; i < edges.Count; i++)
            {
                edge = edges[i];
                if (edge.Vertex1 == vertex2 || edge.Vertex2 == vertex2)
                    return edge;
            }
            return null;
        }

        /// <summary>
        /// Find a path between two vertices of the graph.
        /// </summary>
        /// <param name="start">The starting vertex.</param>
        /// <param name="end">The ending vertex.</param>
        /// <returns>A collection of edges comprising the path.</returns>
        public ICollection<Edge> FindPath(long start, long end)
        {
            // Handle the special case of partial relations.
            if (end == 1)
            {
                // Look for a matching partial relation.
                var edge = FindEdge(start);
                if (edge != null)
                    return new List<Edge> { edge };

                // Look for a route that terminates with a partial.
                return FindPathRecursive(start, 1, null);
            }

            // Check whether the path start or ends in the
            // partial relation map.
            var prHasStart = prMap.ContainsKey(start);
            var prHasEnd = prMap.ContainsKey(end);

            // If both do so, then we have a path using the
            // two partial relations.
            if (prHasStart && prHasEnd)
                return new List<Edge> { FindEdge(start), FindEdge(end) };

            var result = null as List<Edge>;

            // First try to find a direct path from start to
            // end just using the partial relation map, which
            // is only possible if there are edges to the end
            // vertex.
            if (pprMap.HasEdges(end))
            {
                result  = FindPathRecursive(start, end, null);
                if (result != null)
                    return result;
            }

            // If the path neither starts nor ends in the
            // partial relation map, try to find a path
            // from the start of the partial relation map
            // and another from the end to the partial
            // relation map.  Then combine them.
            if (!prHasStart && !prHasEnd)
            {
                var part1 = FindPathRecursive(start, 1, null);
                if (part1 != null)
                {
                    var part2 = FindPathRecursive(end, 1, null);
                    if (part2 != null)
                    {
                        foreach (var edge in part2)
                            part1.Add(edge);
                        return part1;
                    }
                }
            }

            // If the path starts in the partial relation map,
            // try to find a path from the end to the partial
            // relation map.
            if (prHasStart)
            {
                result = FindPathRecursive(end, 1, null);
                if (result != null)
                    result.Add(FindEdge(start));
            }

            // If the path ends in the partial relation map,
            // try to find a path from the start to the partial
            // relation map.
            if (prHasEnd)
            {
                result = FindPathRecursive(start, 1, null);
                if (result != null)
                    result.Add(FindEdge(end));
            }
            return result;
        }

        private List<Edge> FindPathRecursive(long start, long end, Edge previous)
        {
            Edge edge;
            List<Edge> edges;
            if (end == 1)
            {
                edge = FindEdge(start);
                if (edge != null)
                    return new List<Edge> { edge };
            }
            if (!pprMap.GetEdges(start, out edge, out edges))
                return null;
            if (edge != null)
                return CheckEdge(start, end, previous, edge);
            for (int i = 0; i < edges.Count; i++)
            {
                var result = CheckEdge(start, end, previous, edges[i]);
                if (result != null)
                    return result;
            }
            return null;
        }

        private List<Edge> CheckEdge(long start, long end, Edge previous, Edge edge)
        {
            if (edge == previous)
                return null;
            var next = edge.Vertex1 == start ? edge.Vertex2 : edge.Vertex1;
            if (next == end)
                return new List<Edge> { edge };
            var result = FindPathRecursive(next, end, edge);
            if (result != null)
            {
                result.Add(edge);
                return result;
            }
            return null;
        }
    }
}
