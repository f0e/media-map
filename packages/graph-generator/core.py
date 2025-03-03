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


class Link(BaseModel):
    source: str
    target: str
    weight: Optional[float] = 1.0


class NodePosition(BaseModel):
    id: str
    x: float
    y: float
    community: int  # Community ID from Leiden algorithm


class LayoutAlgorithm(str, Enum):
    DRL = "drl"  # Distributed Recursive Layout
    FR = "fruchterman_reingold"
    KK = "kamada_kawai"
    CIRCLE = "circle"
    GRID = "grid"


class GraphData(BaseModel):
    nodes: List[Node]
    links: List[Link]
    options: Optional[Dict[str, Any]] = Field(default_factory=dict)


class LayoutResponse(BaseModel):
    positions: Dict[str, Dict[str, Any]]  # Map of node ID to position data
    metadata: Dict[str, Any]


def generate_layout(data: GraphData):
    start_time = time.time()

    # Create an undirected graph instead of directed
    g = ig.Graph(directed=False)

    # Add vertices with names
    node_ids = [node.id for node in data.nodes]
    g.add_vertices(len(node_ids))
    g.vs["name"] = node_ids

    # Create a mapping from node id to vertex index
    node_map = {node_id: idx for idx, node_id in enumerate(node_ids)}

    # Add edges
    edges = [(node_map[link.source], node_map[link.target]) for link in data.links]
    g.add_edges(edges)

    # Add weights if provided
    g.es["weight"] = [link.weight for link in data.links]

    # Get layout options
    layout_options = data.options.get("layout", {})
    algorithm_name = layout_options.get("algorithm", "drl")  # Default to DrL

    # # Run community detection using Leiden algorithm
    # logger.info("Running Leiden community detection...")
    # communities = g.community_leiden(
    #     objective_function="modularity",
    #     weights=g.es["weight"],
    #     resolution_parameter=layout_options.get("resolution", 1.0),
    #     beta=layout_options.get("beta", 0.01),
    #     n_iterations=layout_options.get("community_iterations", 10),
    # )

    # # Add community membership to vertices
    # membership = communities.membership
    # g.vs["community"] = membership

    # # Get number of communities
    # num_communities = len(communities)
    # logger.info(f"Found {num_communities} communities")

    # Generate layout based on specified algorithm
    logger.info(f"Generating layout using {algorithm_name} algorithm...")

    if algorithm_name == LayoutAlgorithm.DRL:
        # DrL (Distributed Recursive Layout) parameters
        drl_options = {
            "edge_cut": layout_options.get("edge_cut", 32),
            "init_iterations": layout_options.get("init_iterations", 100),
            "init_temperature": layout_options.get("init_temperature", 2000),
            "cool_factor": layout_options.get("cool_factor", 0.95),
            "init_attraction": layout_options.get("init_attraction", 10),
            "init_damping_mult": layout_options.get("init_damping_mult", 1.0),
            "weights": g.es["weight"],
        }
        layout = g.layout_drl()

    elif algorithm_name == LayoutAlgorithm.FR:
        layout = g.layout_fruchterman_reingold(
            weights=g.es["weight"],
            maxiter=layout_options.get("iterations", 500),
            area=layout_options.get("area", len(node_ids) * 100),
        )

    elif algorithm_name == LayoutAlgorithm.KK:
        layout = g.layout_kamada_kawai(weights=g.es["weight"])

    elif algorithm_name == LayoutAlgorithm.CIRCLE:
        layout = g.layout_circle()

    elif algorithm_name == LayoutAlgorithm.GRID:
        layout = g.layout_grid()

    else:
        # Default to DrL if algorithm is not recognized
        layout = g.layout_drl(weights=g.es["weight"])

    # Create a map of node IDs to positions with community data
    position_map = {
        node_ids[i]: {"x": coords[0], "y": coords[1]}  # , "community": membership[i]
        for i, coords in enumerate(layout)
    }

    # Calculate execution time
    execution_time = time.time() - start_time

    # Prepare metadata
    metadata = {
        "algorithm": algorithm_name,
        "num_nodes": len(node_ids),
        "num_edges": len(edges),
        # "num_communities": num_communities,
        "execution_time_seconds": execution_time,
        # "modularity": communities.modularity,
    }

    logger.info(f"Layout generated in {execution_time:.2f} seconds")

    return LayoutResponse(positions=position_map, metadata=metadata)
