import { useState } from "react";
import type { TooltipState } from "../types";

export function useTooltip() {
	const [tooltip, setTooltip] = useState<TooltipState>({
		visible: false,
		text: "",
		x: 0,
		y: 0,
	});

	const showTooltip = (text: string, x: number, y: number) => {
		setTooltip({
			visible: true,
			text,
			x,
			y,
		});
	};

	const moveTooltip = (x: number, y: number) => {
		setTooltip((prev) => ({
			...prev,
			x,
			y,
		}));
	};

	const hideTooltip = () => {
		setTooltip((prev) => ({ ...prev, visible: false }));
	};

	return {
		tooltip,
		showTooltip,
		moveTooltip,
		hideTooltip,
	};
}
