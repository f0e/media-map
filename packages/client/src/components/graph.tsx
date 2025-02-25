import React, { useEffect, useState } from "react";
import ForceGraph2D from "react-force-graph-2d";
import { GraphData } from "@/lib/types";
import { renderNode, nodeSize } from "@/lib/rendering";
import { preloadNetworkLogos } from "@/lib/networks";

interface GraphProps {
  graphData: GraphData;
  graphRef: React.RefObject<any>;
}

const Graph: React.FC<GraphProps> = ({ graphData, graphRef }) => {
  const [displayWidth, setDisplayWidth] = useState(window.innerWidth);
  const [displayHeight, setDisplayHeight] = useState(window.innerHeight);

  const [logoMap, setLogoMap] = useState<Map<string, HTMLImageElement> | null>(
    null
  );

  useEffect(() => {
    const handleResize = () => {
      setDisplayWidth(window.innerWidth);
      setDisplayHeight(window.innerHeight);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const graph = graphRef.current;
    if (!graph) return;

    // make links space themselves out
    graph.d3Force("link").distance(50);
  }, [graphRef]);

  // preload network logos
  useEffect(() => {
    const networksArray: string[] = [];

    // doing this like this for typescript's sake, filter & map has type errors for some reason
    for (const node of graphData.nodes) {
      if (node.type === "show" && node.networks && node.networks.length > 0) {
        networksArray.push(node.networks[0]);
      }
    }

    const uniqueNetworks = [...new Set(networksArray)];

    preloadNetworkLogos(uniqueNetworks).then((map) => setLogoMap(map));
  }, [graphData.nodes]);

  return (
    <ForceGraph2D
      ref={graphRef}
      width={displayWidth}
      height={displayHeight}
      graphData={graphData}
      nodeRelSize={4}
      nodeLabel={(node) => node.name}
      linkColor={() => "#999"}
      // workaround for poo charting. todo custom implementation or smth
      d3AlphaDecay={0}
      cooldownTime={2000}
      nodeCanvasObject={(node, ctx, globalScale) => {
        renderNode(node, ctx, globalScale, nodeSize, logoMap);
      }}
    />
  );
};

export default Graph;
