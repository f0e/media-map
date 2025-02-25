import { Show, GraphData } from './types';

export const fetchShowsData = async (): Promise<GraphData> => {
  try {
    const response = await fetch("http://localhost:3001/api/shows"); // todo: proper
    const shows: Show[] = await response.json();

    const nodes: GraphData["nodes"] = [];
    const links: GraphData["links"] = [];

    for (const show of shows) {
      nodes.push({
        id: show.id,
        name: show.title,
        type: "show",
        networks: show.networks,
        val: 2,
      });

      show.people.forEach((person) => {
        if (!nodes.find((n) => n.id === person.id)) {
          nodes.push({
            id: person.id,
            name: person.name,
            type: "person",
            val: 1,
          });
        }

        links.push({
          source: show.id,
          target: person.id,
          type: person.role,
        });
      });
    }

    return { nodes, links };
  } catch (error) {
    console.error("Error fetching shows:", error);
    return { nodes: [], links: [] };
  }
};