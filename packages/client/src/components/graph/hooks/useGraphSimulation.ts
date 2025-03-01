import { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import { Container, Graphics } from "pixi.js";
import { SIMULATION_SETTINGS } from "../constants";
import {
  createGraphElements,
  updateColors,
  updatePositions,
} from "./useGraphElements";
import { ShowNode, LinkNode, GraphData } from "@/lib/types";
import { ComputedTheme, useTheme } from "@/components/theme-provider";

export function useGraphSimulation(
  graphData: GraphData,
  initialised: boolean,
  nodeContainer: Container | null,
  linkContainer: Container | null,
  tooltipHandlers: {
    showTooltip: (text: string, x: number, y: number) => void;
    moveTooltip: (x: number, y: number) => void;
    hideTooltip: () => void;
  },
  theme: ComputedTheme
) {
  const simulationRef = useRef<d3.Simulation<any, any> | null>(null);

  useEffect(() => {
    if (!initialised || !nodeContainer || !linkContainer) return;

    const { nodes, links } = graphData;

    createGraphElements(
      nodes,
      links,
      nodeContainer,
      linkContainer,
      tooltipHandlers,
      theme === "dark"
    );

    updatePositions(
      nodes,
      links,
      nodeContainer,
      linkContainer,
      theme === "dark"
    );
  }, [graphData, theme]);

  useEffect(() => {
    if (!initialised || !nodeContainer || !linkContainer) return;

    if (simulationRef.current) {
      console.log("why bro");
      simulationRef.current.stop();
    }

    const { nodes, links } = graphData;

    // reset nodes
    for (const node of nodes) {
      node.x = Number.NaN; // "If either x or y is NaN, the position is initialized in a phyllotaxis arrangement, so chosen to ensure a deterministic, uniform distribution"
      node.y = Number.NaN; // https://d3js.org/d3-force/simulation#simulation_nodes

      node.vx = 0;
      node.vy = 0;
    }

    // Initialize graph (create all nodes and links)
    createGraphElements(
      nodes,
      links,
      nodeContainer,
      linkContainer,
      tooltipHandlers,
      theme === "dark"
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

    let animating = true;
    let tick = 0;

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
        d3.forceManyBody().strength(SIMULATION_SETTINGS.chargeStrength)
      )
      // keep stuff centered
      .force("center", d3.forceCenter())
      .alphaDecay(0)
      .on("tick", () => {
        tick++; // why should i have to keep track of this.

        updatePositions(nodes, links, nodeContainer, linkContainer);

        if (tick > SIMULATION_SETTINGS.alphaDecayDelayTicks && animating) {
          animating = false;

          simulation.alphaDecay(SIMULATION_SETTINGS.alphaDecayValue);
        }
      });

    // force simulation works better starting with all nodes really far away then they come towards the center plus it looks cool
    // im a genius?
    for (const node of nodes) {
      node.x = node.x! * SIMULATION_SETTINGS.startDistance; // expand outwards, they're already distributed circularly
      node.y = node.y! * SIMULATION_SETTINGS.startDistance;
    }

    // skip initial frames for smoother animation
    simulation.tick(SIMULATION_SETTINGS.initialTicks);

    // Initial update
    if (nodeContainer && linkContainer) {
      updatePositions(nodes, links, nodeContainer, linkContainer);
    }

    graphData.simulation = simulation;

    return () => {
      simulation.stop();
    };
  }, [
    graphData,
    initialised,
    nodeContainer,
    linkContainer,
    // tooltipHandlers,
  ]);
}
