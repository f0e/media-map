export const MIN_ZOOM = 0.07;
export const MAX_ZOOM = 5;
export const START_ZOOM = MIN_ZOOM;
export const NODE_SIZE = 5;

export const ANIMATION_DURATION = 700;
export const ANIMATION_EASING = "easeInOutCubic";

export const SIMULATION_SETTINGS = {
  linkDistance: 50,
  chargeStrength: -1000,
  initialTicks: 2,
  alphaDecayDelayTicks: 150,
  alphaDecayValue: 0.05,
  startDistance: 1000,
};

export const stringToColor = (color: string): number =>
  Number.parseInt(color.replace("#", "0x"));
