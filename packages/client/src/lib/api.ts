import { GraphData } from "@/lib/types";
import { useQuery } from "@tanstack/react-query";

type Show = {
  id: string;
  title: string;
  networks: string[];
  people: {
    id: string;
    name: string;
    role: string;
  }[];
};

const transformToGraphData = (shows: Show[]): GraphData => {
  const nodes: GraphData["nodes"] = [];
  const links: GraphData["links"] = [];
  const showIds = new Set(shows.map((show) => show.id));

  // Create nodes and links
  for (const show of shows) {
    nodes.push({
      id: show.id,
      name: show.title,
      type: "show",
      networks: show.networks,
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
};

const calculateGroups = (
  nodes: GraphData["nodes"],
  links: GraphData["links"],
  showIds: Set<string>
): Map<string, number> => {
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

        if (showIds.has(nodeId)) {
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
};

const fetchShows = async (): Promise<Show[]> => {
  const response = await fetch("http://localhost:3001/api/shows");

  if (!response.ok) {
    throw new Error(`Failed to fetch shows: ${response.status}`);
  }

  return response.json();
};

export const useShowsData = () => {
  return useQuery({
    queryKey: ["shows"],
    queryFn: async () => {
      const shows = await fetchShows();
      return transformToGraphData(shows);
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
