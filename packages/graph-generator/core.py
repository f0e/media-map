from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
import igraph as ig
import logging
from enum import Enum
import time

logger = logging.getLogger(__name__)


class Node(BaseModel):
    id: str
    label: Optional[str] = None
    weight: Optional[float] = None
    value: Optional[float] = 1.0


class Link(BaseModel):
    source: str
    target: str
    weight: Optional[float] = 1.0


class GraphData(BaseModel):
    nodes: List[Node]
    links: List[Link]
    options: Optional[Dict[str, Any]] = Field(default_factory=dict)


class LayoutResponse(BaseModel):
    positions: Dict[str, Dict[str, Any]]  # Map of node ID to position data
    metadata: Dict[str, Any]


NODE_SIZE = 5
MULT = 100


def generate_layout(data: GraphData):
    start_time = time.time()

    # Create an undirected graph instead of directed
    g = ig.Graph(directed=False)

    # Add vertices with names
    node_ids = [node.id for node in data.nodes]
    g.add_vertices(len(node_ids))

    # Add node values/sizes
    node_dict = {node.id: node for node in data.nodes}
    g.vs["value"] = [
        node_dict[node_id].value if node_dict[node_id].value is not None else 1.0
        for node_id in node_ids
    ]
    g.vs["vertex_size"] = [500 for i in range(len(g.vs))]

    # Create a mapping from node id to vertex index
    node_map = {node_id: idx for idx, node_id in enumerate(node_ids)}

    # Add edges
    edges = [(node_map[link.source], node_map[link.target]) for link in data.links]
    g.add_edges(edges)

    # Add weights if provided
    g.es["weight"] = [link.weight for link in data.links]

    # Generate layout
    logger.info("Generating layout...")

    layout = g.layout_drl(weights=g.es["weight"], options={"init_attraction": 30})

    # Create a map of node IDs to positions with community and radius data
    position_map = {
        node_ids[i]: {
            "x": layout[i][0] * MULT,
            "y": layout[i][1] * MULT,
        }
        for i in range(len(node_ids))
    }

    # Calculate execution time
    execution_time = time.time() - start_time

    # Prepare metadata
    metadata = {
        "num_nodes": len(node_ids),
        "num_edges": len(edges),
        "execution_time_seconds": execution_time,
    }

    logger.info(f"Layout generated in {execution_time:.2f} seconds")

    return LayoutResponse(positions=position_map, metadata=metadata)
