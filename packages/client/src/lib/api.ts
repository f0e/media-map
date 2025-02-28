import type { GraphData, MediaType, Movie, Show } from "@/lib/types";
import { useQuery } from "@tanstack/react-query";

function calculateGroups(
  nodes: GraphData["nodes"],
  links: GraphData["links"],
  mainIds: Set<string>
): Map<string, number> {
  const visited = new Set<string>();
  const groupMap = new Map<string, number>();

  const getConnectedNodes = (nodeId: string) => {
    return links
      .filter((link) => link.source === nodeId || link.target === nodeId)
      .map((link) => (link.source === nodeId ? link.target : link.source));
  };

  const bfs = (startNodeId: string) => {
    const queue = [startNodeId];
    const thisVisited = new Set<string>();
    const groupNodeIds = new Set<string>();

    while (queue.length > 0) {
      const nodeId = queue.shift()!;

      if (!visited.has(nodeId)) {
        visited.add(nodeId);
        thisVisited.add(nodeId);

        if (mainIds.has(nodeId)) {
          groupNodeIds.add(nodeId);
        }

        const connectedNodes = getConnectedNodes(nodeId);
        queue.push(...connectedNodes.filter((n) => !visited.has(n)));
      }
    }

    for (const nodeId of thisVisited) {
      groupMap.set(nodeId, groupNodeIds.size);
    }
  };

  for (const node of nodes) {
    if (!visited.has(node.id)) {
      bfs(node.id);
    }
  }

  return groupMap;
}

function transformShows(shows: Show[]): GraphData {
  const nodes: GraphData["nodes"] = [];
  const links: GraphData["links"] = [];
  const showIds = new Set(shows.map((show) => show.id));

  // Create nodes and links
  for (const show of shows) {
    nodes.push({
      id: show.id,
      name: show.title,
      type: "show",
      topText: show.networks,
      val: 2,
      groupLinks: 0,
    });

    for (const person of show.people) {
      if (!nodes.find((n) => n.id === person.id)) {
        nodes.push({
          id: person.id,
          name: person.name,
          type: "person",
          val: 1,
          groupLinks: 0,
        });
      }

      links.push({
        source: show.id,
        target: person.id,
        type: person.role,
      });
    }
  }

  // Calculate groups based on connectivity
  const groupMap = calculateGroups(nodes, links, showIds);

  // Assign group size to each node
  for (const node of nodes) {
    node.groupLinks = groupMap.get(node.id) ?? 0;
  }

  return { nodes, links };
}

function transformMovies(movies: Movie[]): GraphData {
  const nodes: GraphData["nodes"] = [];
  const links: GraphData["links"] = [];
  const movieIds = new Set(movies.map((movie) => movie.id));

  // Create nodes and links
  for (const movie of movies) {
    nodes.push({
      id: movie.id,
      name: movie.title,
      type: "movie",
      topText: movie.production_companies,
      val: 2,
      groupLinks: 0,
    });

    for (const person of movie.people) {
      if (!nodes.find((n) => n.id === person.id)) {
        nodes.push({
          id: person.id,
          name: person.name,
          type: "person",
          val: 1,
          groupLinks: 0,
        });
      }

      links.push({
        source: movie.id,
        target: person.id,
        type: person.role,
      });
    }
  }

  // Calculate groups based on connectivity
  const groupMap = calculateGroups(nodes, links, movieIds);

  // Assign group size to each node
  for (const node of nodes) {
    node.groupLinks = groupMap.get(node.id) ?? 0;
  }

  return { nodes, links };
}

export const useMediaData = (mediaType: MediaType) => {
  switch (mediaType) {
    case "shows": {
      return useQuery({
        queryKey: ["shows"],
        queryFn: async () => {
          const response = await fetch("http://localhost:3001/api/shows");

          if (!response.ok)
            throw new Error(`Failed to fetch shows: ${response.status}`);

          const shows = await response.json();

          return transformShows(shows);
        },
        staleTime: 5 * 60 * 1000, // 5 minutes
      });
    }

    case "movies": {
      return useQuery({
        queryKey: ["movies"],
        queryFn: async () => {
          const response = await fetch("http://localhost:3001/api/movies");

          if (!response.ok)
            throw new Error(`Failed to fetch movies: ${response.status}`);

          const movies = await response.json();

          return transformMovies(movies);
        },
        staleTime: 5 * 60 * 1000, // 5 minutes
      });
    }
  }
};
