import React, { useEffect, useRef, useState } from "react";
import { GraphProps, GraphState } from "./types";
import { usePixiApp } from "./hooks/usePixiApp";
import { useTooltip } from "./hooks/useTooltip";
import { useGraphMethods } from "./hooks/useGraphMethods";
import { useGraphSimulation } from "./hooks/useGraphSimulation";
import { preloadNetworkLogos } from "@/lib/networks";

interface ExtendedGraphProps extends GraphProps {
  onInitialized?: () => void;
}

const Graph: React.FC<ExtendedGraphProps> = ({
  graphData,
  graphRef,
  onInitialized,
}) => {
  const { nodes, links } = graphData;
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // State
  const [state, setState] = useState<GraphState>({
    initialised: false,
    dimensions: {
      width: window.innerWidth,
      height: window.innerHeight,
      pixelRatio: window.devicePixelRatio || 1,
    },
    logoMap: null,
  });

  // Handle resize
  useEffect(() => {
    const handleResize = () => {
      setState((prev) => ({
        ...prev,
        dimensions: {
          width: window.innerWidth,
          height: window.innerHeight,
          pixelRatio: window.devicePixelRatio || 1,
        },
      }));
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Preload network logos
  useEffect(() => {
    const uniqueNetworks = [
      ...new Set(
        nodes
          .filter(
            (node) =>
              node.type === "show" && node.networks && node.networks.length > 0
          )
          .map((node) => node.networks[0])
      ),
    ];

    preloadNetworkLogos(uniqueNetworks).then((map) => {
      setState((prev) => ({ ...prev, logoMap: map }));
    });
  }, [nodes]);

  // Notify parent when graph is initialized
  useEffect(() => {
    if (state.initialised && onInitialized) {
      onInitialized();
    }
  }, [state.initialised, onInitialized]);

  // Setup PixiJS
  const pixiRefs = usePixiApp(canvasRef, state.dimensions, (initialised) =>
    setState((prev) => ({ ...prev, initialised }))
  );

  // Setup tooltip
  const { tooltip, showTooltip, moveTooltip, hideTooltip } = useTooltip();

  // Setup graph methods
  useGraphMethods(pixiRefs.viewport, graphRef);

  // Setup graph simulation
  useGraphSimulation(
    nodes,
    links,
    state.initialised,
    pixiRefs.nodeContainer,
    pixiRefs.linkContainer,
    { showTooltip, moveTooltip, hideTooltip }
  );

  return (
    <>
      <canvas
        ref={canvasRef}
        width={state.dimensions.width}
        height={state.dimensions.height}
      ></canvas>
      {tooltip.visible && (
        <div
          className="absolute bg-black bg-opacity-75 text-white px-2 py-1 rounded-md text-sm pointer-events-none z-[1000]"
          style={{
            left: `${tooltip.x}px`,
            top: `${tooltip.y + 5}px`,
          }}
        >
          {tooltip.text}
        </div>
      )}
    </>
  );
};

export default Graph;
