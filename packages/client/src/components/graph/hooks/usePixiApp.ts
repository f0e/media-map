import { useEffect, useRef, useState } from "react";
import { Application, Graphics } from "pixi.js";
import { Viewport } from "pixi-viewport";
import { Container } from "pixi.js";
import type { GraphState, PixiRefs } from "../types";
import { MIN_ZOOM, MAX_ZOOM, START_ZOOM } from "../constants";

export function usePixiApp(
  canvasRef: React.RefObject<HTMLCanvasElement>,
  dimensions: GraphState["dimensions"],
  setInitialised: (value: boolean) => void
): PixiRefs {
  const appRef = useRef<Application | null>(null);
  const viewportRef = useRef<Viewport | null>(null);
  const nodeContainerRef = useRef<Container | null>(null);
  const linkContainerRef = useRef<Container | null>(null);

  // Initialize PixiJS app with pixi-viewport
  const initPixi = async () => {
    // Create PixiJS application with optimized settings
    const app = new Application();
    await app.init({
      width: dimensions.width,
      height: dimensions.height,
      resolution: dimensions.pixelRatio,
      backgroundAlpha: 0,
      antialias: true,
      autoDensity: true,
      canvas: canvasRef.current,
    });

    // Create viewport
    const viewport = new Viewport({
      screenWidth: dimensions.width,
      screenHeight: dimensions.height,
      worldWidth: dimensions.width * 2,
      worldHeight: dimensions.height * 2,
      events: app.renderer.events,
    });

    // Add viewport to stage
    app.stage.addChild(viewport);
    viewport.moveCenter(0, 0);
    viewport.setZoom(START_ZOOM);

    // Activate viewport plugins for smooth experience
    viewport
      .drag({ pressDrag: true })
      .pinch({})
      .wheel({ interrupt: true })
      .decelerate({ friction: 0.95 })
      .clampZoom({
        minScale: MIN_ZOOM,
        maxScale: MAX_ZOOM,
      });

    // Prevent wheel events from propagating to the document
    canvasRef.current.addEventListener(
      "wheel",
      (e) => {
        e.preventDefault();
      },
      { passive: false }
    );

    // Create separate containers for links and nodes
    const linkContainer = new Container();
    const nodeContainer = new Container();
    viewport.addChild(linkContainer);
    viewport.addChild(nodeContainer);

    // Performance optimization: links don't need interactivity
    linkContainer.interactiveChildren = false;

    setInitialised(true);

    return { app, viewport, linkContainer, nodeContainer };
  };

  useEffect(() => {
    if (!canvasRef.current) return;

    const app = initPixi();

    app.then(({ app, viewport, linkContainer, nodeContainer }) => {
      appRef.current = app;

      viewportRef.current = viewport;

      linkContainerRef.current = linkContainer;
      nodeContainerRef.current = nodeContainer;
    });

    return async () => {
      const appInstance = await app;
      appInstance.app.stop();
    };
  }, [canvasRef]);

  // Handle window resize
  useEffect(() => {
    if (!appRef.current || !viewportRef.current) return;

    appRef.current.renderer.resize(dimensions.width, dimensions.height);
    viewportRef.current.resize(dimensions.width, dimensions.height);
  }, [dimensions]);

  return {
    app: appRef.current,
    viewport: viewportRef.current,
    nodeContainer: nodeContainerRef.current,
    linkContainer: linkContainerRef.current,
  };
}
