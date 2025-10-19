import type { GraphData, GraphNode } from "@music-map/shared";

export async function processGraph(data: GraphData) {
	// const positionsRes = await fetch("http://localhost:8000/api/generate", {
	// 	method: "POST",
	// 	body: JSON.stringify({
	// 		nodes: data.nodes.map((node) => ({
	// 			id: node.id.toString(),
	// 			value: node.val,
	// 		})),
	// 		links: data.links.map((link) => ({
	// 			source: link.source.toString(),
	// 			target: link.target.toString(),
	// 		})),
	// 	}),
	// });

	// const positionsData = await positionsRes.json();

	const contentNodeIds = new Set(
		data.nodes.filter((node) => node.type !== "person").map((node) => node.id),
	);

	const groupMap = calculateGroups(data.nodes, data.links, contentNodeIds);

	data.nodes = data.nodes
		.map((node) => ({
			...node,
			groupLinks: groupMap.get(node.id) ?? 0,
		}))
		.filter((node) => node.groupLinks > 1); // filter out movies that dont connect to another movie at some point

	const nodeMap = new Map<string, GraphNode>();
	for (const node of data.nodes) {
		nodeMap.set(node.id, node);
	}

	data.links = data.links.filter(
		(link) => nodeMap.has(link.source) && nodeMap.has(link.target), // remove links to filtered nodes
	);

	return data;
}

function calculateGroups(
	nodes: GraphData["nodes"],
	links: GraphData["links"],
	mainIds: Set<string>,
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
			const nodeId = queue.shift();
			if (!nodeId) break; // typescript

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
