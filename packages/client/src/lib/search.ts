import Fuse from "fuse.js";
import type { GraphData, GraphNode } from "@/lib/types";

export const initFuseSearch = (nodes: GraphNode[]) => {
  return new Fuse(nodes, {
    keys: ["name"],
    threshold: 0.4,
    includeScore: true,
    shouldSort: true,
  });
};

export const performSearch = (
  query: string,
  graphData: GraphData,
  graphRef: any // todo: type
) => {
  if (!graphRef || !query) return;

  const showNodes = graphData.nodes.filter((node) => node.type !== "person");
  const fuse = initFuseSearch(showNodes);
  const results = fuse.search(query);

  if (results.length === 0) return;

  const node = results[0].item;
  if (!node) return;

  graphRef.centerAt(node.x, node.y, 1.35, 700);
};
