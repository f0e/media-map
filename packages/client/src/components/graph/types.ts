import { Container, Graphics, Application } from "pixi.js";
import { Viewport } from "pixi-viewport";
import { GraphData } from "@/lib/types";

export interface GraphProps {
  graphData: GraphData;
  graphRef: React.MutableRefObject<GraphMethods | null>;
}

export interface GraphMethods {
  centerAt: (
    x: number,
    y: number,
    zoomLevel?: number,
    duration?: number
  ) => void;
  zoom: (factor: number, duration?: number) => void;
}

export interface GraphState {
  initialised: boolean;
  dimensions: {
    width: number;
    height: number;
    pixelRatio: number;
  };
  logoMap: Record<string, HTMLImageElement> | null;
}

export interface PixiRefs {
  app: Application | null;
  viewport: Viewport | null;
  nodeContainer: Container | null;
  linkContainer: Container | null;
}

export interface TooltipState {
  visible: boolean;
  text: string;
  x: number;
  y: number;
}
