import { Container, Graphics, Text, Circle } from "pixi.js";
import { NODE_SIZE, MAX_ZOOM, stringToColor } from "../constants";
import type { GraphNode, LinkNode } from "@/lib/types";
import { getNetworkColor } from "@/lib/networks";

export function createGraphElements(
	nodes: GraphNode[],
	links: LinkNode[],
	nodeContainer: Container,
	linkContainer: Container,
	tooltipHandlers: {
		showTooltip: (text: string, x: number, y: number) => void;
		moveTooltip: (x: number, y: number) => void;
		hideTooltip: () => void;
	},
	isDarkTheme: boolean,
) {
	// Theme-dependent colors
	const textColor = isDarkTheme ? 0xffffff : 0x000000;
	const linkColor = isDarkTheme ? 0x777777 : 0xbbbbbb;
	const nodeStrokeColor = isDarkTheme ? 0xffffff : 0x222222;
	const nodeStrokeAlpha = isDarkTheme ? 0.75 : 0.85;

	// Clear existing containers
	nodeContainer.removeChildren();
	linkContainer.removeChildren();

	const font =
		getComputedStyle(document.body).getPropertyValue("--font-main") || "Arial";

	// Create links first (for better batching)
	for (const _link of links) {
		const linkGraphics = new Graphics();
		linkGraphics.stroke({ width: 1, color: linkColor });
		linkContainer.addChild(linkGraphics);
	}

	// Create nodes
	for (const node of nodes) {
		const nodeItem = new Container();

		// Position the node if coordinates are available
		if (node.x !== undefined && node.y !== undefined) {
			nodeItem.position.set(node.x, node.y);
		}

		// Create base circle for the node
		const radius = node.val * NODE_SIZE;
		const circle = new Graphics();

		// Fill color based on node type, with theme consideration
		let fillColor;
		if (node.type !== "person") {
			if (node.topText?.length) {
				// Apply theme-specific color adjustment to network colors
				const baseColor = stringToColor(getNetworkColor(node.topText[0]));
				fillColor = isDarkTheme
					? baseColor
					: adjustColorBrightness(baseColor, -15);
			} else {
				fillColor = isDarkTheme ? 0xff6b6b : 0xff8080;
			}
		} else {
			fillColor = isDarkTheme ? 0x4ecdc4 : 0x5ad8cf;
		}

		// Draw circle
		circle.circle(0, 0, radius);
		circle.fill({ color: fillColor });
		circle.stroke({ width: 2, color: nodeStrokeColor, alpha: nodeStrokeAlpha });
		nodeItem.addChild(circle);

		// Add node label for show type
		if (node.type !== "person") {
			const label = createLabel(
				`${node.name} (${node.year})`,
				font,
				0,
				radius + 3,
				textColor,
			);
			nodeItem.addChild(label);

			// Add network name if available
			if (node.topText?.length) {
				const networkText = createLabel(
					node.topText[0],
					font,
					0,
					-radius - 3,
					textColor,
					true,
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
			tooltipHandlers.showTooltip(node.name, e.clientX, e.clientY);
		});

		nodeItem.on("pointermove", (e) => {
			tooltipHandlers.moveTooltip(e.clientX, e.clientY);
		});

		nodeItem.on("pointerout", () => {
			tooltipHandlers.hideTooltip();
		});

		nodeContainer.addChild(nodeItem);
	}
}

// Helper function to adjust color brightness
function adjustColorBrightness(hexColor: number, percent: number): number {
	// Convert hex to RGB
	const r = (hexColor >> 16) & 0xff;
	const g = (hexColor >> 8) & 0xff;
	const b = hexColor & 0xff;

	// Adjust brightness
	const adjustR = Math.max(0, Math.min(255, r + (r * percent) / 100));
	const adjustG = Math.max(0, Math.min(255, g + (g * percent) / 100));
	const adjustB = Math.max(0, Math.min(255, b + (b * percent) / 100));

	// Convert back to hex
	return (adjustR << 16) + (adjustG << 8) + adjustB;
}

function createLabel(
	text: string,
	fontFamily: string,
	x: number,
	y: number,
	textColor: number,
	anchorTop = false,
) {
	const label = new Text({
		text,
		style: {
			fontFamily,
			fontSize: 8 * MAX_ZOOM, // render higher res text & downscale for sharp text https://pixijs.com/8.x/guides/components/text#caveats-and-gotchas
			fill: textColor,
			align: "center",
		},
	});

	label.scale.set(1 / MAX_ZOOM, 1 / MAX_ZOOM); // downscale ^
	label.anchor.set(0.5, anchorTop ? 1 : 0);
	label.position.set(x, y);

	return label;
}

export function updatePositions(
	nodes: GraphNode[],
	links: LinkNode[],
	nodeContainerInput: Container,
	linkContainerInput: Container,
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
		// Use existing stroke settings (color is now managed by updateColors)
		linkGraphics.stroke();
	}
}
