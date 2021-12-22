using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace Nethermind.Decompose.Numerics
{
    public class Edge<TVertex>
    {
        public TVertex Vertex1 { get; set; }
        public TVertex Vertex2 { get; set; }
        public override string ToString()
        {
            return string.Format("Vertex1 = {0}, Vertex2 = {1}", Vertex1, Vertex2);
        }
    }

    public class Graph<TVertex, TEdge> where TEdge : Edge<TVertex>, new()
    {
        private Dictionary<TVertex, List<TEdge>> graph;
        private IEqualityComparer<TVertex> comparer;

        public Graph()
        {
            graph = new Dictionary<TVertex, List<TEdge>>();
            comparer = EqualityComparer<TVertex>.Default;
        }

        public void AddEdge(TVertex vertex1, TVertex vertex2)
        {
            var edge = new TEdge { Vertex1 = vertex1, Vertex2 = vertex2 };
            AddToVertex(edge, edge.Vertex1);
            AddToVertex(edge, edge.Vertex2);
        }

        public void AddEdge(TEdge edge)
        {
            AddToVertex(edge, edge.Vertex1);
            AddToVertex(edge, edge.Vertex2);
        }

        public void RemoveEdge(TEdge edge)
        {
            RemoveFromVertex(edge, edge.Vertex1);
            RemoveFromVertex(edge, edge.Vertex2);
        }

        public bool ContainsEdge(TVertex vertex1, TVertex vertex2)
        {
            List<TEdge> edges;
            if (!graph.TryGetValue(vertex1, out edges))
                return false;
            foreach (var edge in edges)
            {
                if (comparer.Equals(edge.Vertex1, vertex2))
                    return true;
                if (comparer.Equals(edge.Vertex2, vertex2))
                    return true;
            }
            return false;
        }

        public List<TEdge> FindPath(TVertex start, TVertex end)
        {
#if true
            return FindPathRecursive(start, end, null);
#else
            return FindPathGeneral(start, end);
#endif
        }

        private void AddToVertex(TEdge edge, TVertex vertex)
        {
            List<TEdge> value;
            if (graph.TryGetValue(vertex, out value))
                value.Add(edge);
            else
                graph.Add(vertex, new List<TEdge> { edge });
        }

        private void RemoveFromVertex(TEdge edge, TVertex vertex)
        {
            var edges = graph[vertex];
            edges.Remove(edge);
            if (edges.Count == 0)
                graph.Remove(vertex);
        }

        private List<TEdge> FindPathRecursive(TVertex start, TVertex end, TEdge previous)
        {
            List<TEdge> edges;
            if (!graph.TryGetValue(start, out edges))
                return null;
            foreach (var edge in edges)
            {
                if (edge == previous)
                    continue;
                var next = comparer.Equals(edge.Vertex1, start) ? edge.Vertex2: edge.Vertex1;
                if (comparer.Equals(next, end))
                    return new List<TEdge> { edge };
                var result = FindPathRecursive(next, end, edge);
                if (result != null)
                {
                    result.Add(edge);
                    return result;
                }
            }
            return null;
        }

        private List<TEdge> FindPathGeneral(TVertex start, TVertex end)
        {
            var queue = new Queue<TVertex>();
            queue.Enqueue(start);
            var distance = new Dictionary<TVertex, int>();
            distance[start] = 0;
            while (queue.Count != 0)
            {
                var current = queue.Dequeue();
                if (comparer.Equals(current, end))
                {
                    var result = new List<TEdge>();
                    while (distance[current] > 0)
                    {
                        foreach (var edge in graph[current])
                        {
                            var neighbor = comparer.Equals(edge.Vertex1, current) ? edge.Vertex2 : edge.Vertex1;
                            if (distance.ContainsKey(neighbor) && distance[neighbor] == distance[current] - 1)
                            {
                                result.Add(edge);
                                current = neighbor;
                                break;
                            }
                        }
                    }
                    return result;
                }
                List<TEdge> edges;
                if (!graph.TryGetValue(current, out edges))
                    continue;
                foreach (var edge in edges)
                {
                    var neighbor = comparer.Equals(edge.Vertex1, current) ? edge.Vertex2 : edge.Vertex1;
                    if (!distance.ContainsKey(neighbor))
                    {
                        queue.Enqueue(neighbor);
                        distance[neighbor] = distance[current] + 1;
                    }
                }
            }
            return null;
        }
    }
}
