import type { Viewport } from "pixi-viewport";
import { useEffect } from "react";
import { ANIMATION_DURATION, ANIMATION_EASING } from "../constants";
import type { GraphMethods } from "../types";

export function useGraphMethods(
	viewport: Viewport | null,
	graphRef: React.MutableRefObject<GraphMethods | null>,
) {
	useEffect(() => {
		graphRef.current = {
			centerAt: (
				x: number,
				y: number,
				zoomLevel?: number,
				duration: number = ANIMATION_DURATION,
			) => {
				if (!viewport) return;

				const targetScale =
					zoomLevel !== undefined ? zoomLevel : viewport.scale.x;

				viewport.animate({
					position: { x, y },
					scale: targetScale,
					time: duration,
					ease: ANIMATION_EASING,
				});
			},

			zoom: (factor: number, duration: number = ANIMATION_DURATION) => {
				if (!viewport) return;

				viewport.animate({
					scale: factor,
					time: duration,
					ease: ANIMATION_EASING,
				});
			},
		};

		return () => {
			graphRef.current = null;
		};
	}, [graphRef, viewport]);
}
