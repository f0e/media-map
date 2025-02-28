import { useEffect, useRef } from "react";
import * as d3 from "d3";
import { Container, Graphics } from "pixi.js";
import { SIMULATION_SETTINGS } from "../constants";
import { createGraphElements, updatePositions } from "./useGraphElements";
import { ShowNode, LinkNode } from "@/lib/types";

export function useGraphSimulation(
  nodes: ShowNode[],
  links: LinkNode[],
  initialised: boolean,
  nodeContainer: Container | null,
  linkContainer: Container | null,
  tooltipHandlers: {
    showTooltip: (text: string, x: number, y: number) => void;
    moveTooltip: (x: number, y: number) => void;
    hideTooltip: () => void;
  }
) {
  const simulationRef = useRef<d3.Simulation<any, any> | null>(null);

  useEffect(() => {
    if (!initialised || !nodeContainer || !linkContainer || !nodes.length)
      return;

    // Clean up previous simulation
    if (simulationRef.current) {
      simulationRef.current.stop();
    }

    // Initialize graph (create all nodes and links)
    createGraphElements(
      nodes,
      links,
      nodeContainer,
      linkContainer,
      tooltipHandlers
    );

    // Calculate center force based on node connections
    const mostLinks = nodes.reduce((maxNode, currentNode) =>
      currentNode.groupLinks > maxNode.groupLinks ? currentNode : maxNode
    ).groupLinks;

    const getCenterForce = (links: number) => {
      // Clamp link count to a reasonable range
      const minLinks = 1;
      const maxLinks = mostLinks;

      // Scale factor between min and max force
      const minForce = 0.05;
      const maxForce = 0.1;

      // Normalize link count within range
      const normalizedLink = Math.min(Math.max(links, minLinks), maxLinks);

      // Calculate force with interpolation
      const scale = (normalizedLink - minLinks) / (maxLinks - minLinks);
      return minForce + scale * (maxForce - minForce);
    };

    // Create new simulation
    const simulation = d3
      .forceSimulation(nodes)
      // link stuff together at the right distance
      .force(
        "link",
        d3
          .forceLink(links)
          .id((d: any) => d.id)
          .distance(SIMULATION_SETTINGS.linkDistance)
      )
      // Push things towards the center based on group size
      .force(
        "y",
        d3.forceY(0).strength((d) => getCenterForce(d.groupLinks))
      )
      .force(
        "x",
        d3.forceX(0).strength((d) => getCenterForce(d.groupLinks))
      )
      // initial push
      .force(
        "charge",
        d3.forceManyBody().strength(SIMULATION_SETTINGS.manyBodyStrength)
      )
      // keep stuff centered
      .force("center", d3.forceCenter())
      .alphaDecay(0)
      .on("tick", () => {
        if (nodeContainer && linkContainer) {
          updatePositions(nodes, links, nodeContainer, linkContainer);
        }
      });

    // Set timer to start decay after initial layout
    const stopTimer = setTimeout(() => {
      simulation.alphaDecay(SIMULATION_SETTINGS.alphaDecayValue);
    }, SIMULATION_SETTINGS.alphaDecayDelay);

    // Skip initial frames for smoother animation
    simulation.tick(SIMULATION_SETTINGS.initialTicks);

    simulationRef.current = simulation;

    // Initial update
    if (nodeContainer && linkContainer) {
      updatePositions(nodes, links, nodeContainer, linkContainer);
    }

    return () => {
      simulation.stop();
      clearTimeout(stopTimer);
    };
  }, [
    nodes,
    links,
    initialised,
    nodeContainer,
    linkContainer,
    // tooltipHandlers,
  ]);
}
