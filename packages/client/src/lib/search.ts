import type { GraphData, GraphNode } from "@music-map/shared";
import Fuse from "fuse.js";

export const initFuseSearch = (nodes: GraphNode[]) => {
	return new Fuse(nodes, {
		keys: ["label"],
		threshold: 0.4,
		includeScore: true,
		shouldSort: true,
	});
};

export const performSearch = (
	query: string,
	graphData: GraphData,
	graphRef: any, // todo: type
) => {
	if (!graphRef || !query) return;

	const fuse = initFuseSearch(graphData.nodes);
	const results = fuse.search(query);

	if (results.length === 0) return;

	const node = results[0].item;
	if (!node) return;

	graphRef.centerAt(node.x, node.y, 1.35, 700);
};
