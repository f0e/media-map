export const MIN_ZOOM = 0.07;
export const MAX_ZOOM = 5;
export const START_ZOOM = MIN_ZOOM;
export const NODE_SIZE = 5;

export const ANIMATION_DURATION = 700;
export const ANIMATION_EASING = "easeInOutCubic";

export const SIMULATION_SETTINGS = {
  linkDistance: 50,
  manyBodyStrength: -1000,
  initialTicks: 2,
  alphaDecayDelay: 2000,
  alphaDecayValue: 0.05,
};

export const stringToColor = (color: string): number =>
  parseInt(color.replace("#", "0x"));
