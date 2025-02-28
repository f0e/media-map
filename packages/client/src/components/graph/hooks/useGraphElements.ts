import { Container, Graphics, Text, Circle } from "pixi.js";
import { NODE_SIZE, MAX_ZOOM, stringToColor } from "../constants";
import { ShowNode, LinkNode } from "@/lib/types";
import { getNetworkColor } from "@/lib/networks";

export function createGraphElements(
  nodes: ShowNode[],
  links: LinkNode[],
  nodeContainer: Container,
  linkContainer: Container,
  tooltipHandlers: {
    showTooltip: (text: string, x: number, y: number) => void;
    moveTooltip: (x: number, y: number) => void;
    hideTooltip: () => void;
  }
) {
  // Clear existing containers
  nodeContainer.removeChildren();
  linkContainer.removeChildren();

  const font =
    getComputedStyle(document.body).getPropertyValue("--font-main") || "Arial";

  // Create links first (for better batching)
  links.forEach(() => {
    const linkGraphics = new Graphics();
    linkContainer.addChild(linkGraphics);
  });

  // Create nodes
  nodes.forEach((node) => {
    const nodeItem = new Container();

    // Position the node if coordinates are available
    if (node.x !== undefined && node.y !== undefined) {
      nodeItem.position.set(node.x, node.y);
    }

    // Create base circle for the node
    const radius = node.val * NODE_SIZE;
    const circle = new Graphics();

    // Fill color based on node type
    const fillColor =
      node.type === "show"
        ? node.networks && node.networks.length
          ? stringToColor(getNetworkColor(node.networks[0]))
          : 0xff6b6b
        : 0x4ecdc4;

    // Draw circle
    circle.circle(0, 0, radius);
    circle.fill({ color: fillColor });
    circle.stroke({ width: 2, color: 0xffffff, alpha: 0.75 });
    nodeItem.addChild(circle);

    // Add node label for show type
    if (node.type === "show") {
      const label = createLabel(node.name || node.id, font, 0, radius + 3);
      nodeItem.addChild(label);

      // Add network name if available
      if (node.networks && node.networks.length) {
        const networkText = createLabel(
          node.networks[0],
          font,
          0,
          -radius - 3,
          true
        );
        nodeItem.addChild(networkText);
      }
    }

    // Set hitArea for interactivity (a bit larger than the visible circle)
    nodeItem.hitArea = new Circle(0, 0, radius * 1.5);

    // Make the container interactive
    nodeItem.eventMode = "static";
    nodeItem.cursor = "pointer";

    // Setup event handlers
    nodeItem.on("pointerover", (e) => {
      tooltipHandlers.showTooltip(node.name || node.id, e.clientX, e.clientY);
    });

    nodeItem.on("pointermove", (e) => {
      tooltipHandlers.moveTooltip(e.clientX, e.clientY);
    });

    nodeItem.on("pointerout", () => {
      tooltipHandlers.hideTooltip();
    });

    nodeContainer.addChild(nodeItem);
  });
}

function createLabel(
  text: string,
  fontFamily: string,
  x: number,
  y: number,
  anchorTop = false
) {
  const label = new Text({
    text,
    style: {
      fontFamily,
      fontSize: 8 * MAX_ZOOM, // render higher res text & downscale for sharp text https://pixijs.com/8.x/guides/components/text#caveats-and-gotchas
      fill: 0xffffff,
      align: "center",
    },
  });

  label.scale.set(1 / MAX_ZOOM, 1 / MAX_ZOOM); // downscale ^
  label.anchor.set(0.5, anchorTop ? 1 : 0);
  label.position.set(x, y);

  return label;
}

export function updatePositions(
  nodes: ShowNode[],
  links: LinkNode[],
  nodeContainerInput: Container,
  linkContainerInput: Container
) {
  if (!nodeContainerInput || !linkContainerInput || !nodes.length) return;

  // Update node positions
  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i];
    if (node.x === undefined || node.y === undefined) continue;

    // Find the node container by index (faster than searching by name)
    const nodeItem = nodeContainerInput.getChildAt(i) as Container;
    nodeItem.position.set(node.x, node.y);
  }

  // Update link positions
  for (let i = 0; i < links.length; i++) {
    const link = links[i];

    const source =
      typeof link.source === "object"
        ? link.source
        : nodes.find((n) => n.id === link.source);

    const target =
      typeof link.target === "object"
        ? link.target
        : nodes.find((n) => n.id === link.target);

    if (
      !source ||
      !target ||
      source.x === undefined ||
      source.y === undefined ||
      target.x === undefined ||
      target.y === undefined
    )
      continue;

    // Get link graphics by index
    const linkGraphics = linkContainerInput.getChildAt(i) as Graphics;
    linkGraphics.clear();
    linkGraphics.moveTo(source.x, source.y);
    linkGraphics.lineTo(target.x, target.y);
    linkGraphics.stroke({ width: 1, color: 0x999999 });
  }
}
