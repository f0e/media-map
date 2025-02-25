import React, { useEffect } from "react";
import ForceGraph2D from "react-force-graph-2d";
import { GraphData } from "@/lib/types";
import { renderNode, nodeSize } from "@/lib/rendering";

interface GraphProps {
  graphData: GraphData;
  logoMap: Map<string, HTMLImageElement> | null;
  width: number;
  height: number;
  graphRef: React.RefObject<any>;
}

const Graph: React.FC<GraphProps> = ({
  graphData,
  logoMap,
  width,
  height,
  graphRef,
}) => {
  useEffect(() => {
    const graph = graphRef.current;
    if (!graph) return;

    // make links space themselves out
    graph.d3Force("link").distance(50);
  }, [graphRef]);

  return (
    <ForceGraph2D
      ref={graphRef}
      width={width}
      height={height}
      graphData={graphData}
      nodeRelSize={4}
      nodeLabel={(node) => node.name}
      linkColor={() => "#999"}
      // workaround for poo charting. todo custom implementation or smth
      d3AlphaDecay={0}
      cooldownTime={2000}
      nodeCanvasObject={(node, ctx, globalScale) => {
        if (logoMap) {
          renderNode(node, ctx, globalScale, logoMap, nodeSize);
        }
      }}
    />
  );
};

export default Graph;
