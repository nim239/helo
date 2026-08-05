export interface StringDef {
  harmonicOrder: 1 | 2 | 3;
  amplitude: number;
  spatialFrequency: number;
  temporalSpeed: number;
  phaseOffset: number;
  xOffset: number;
}

export interface Particle {
  y: number;
  baseSpeed: number;
  cluster: "left" | "right";
  stringIndex: number;
}

export type WorkerInMessage =
  | { type: "INIT"; canvas: OffscreenCanvas; width: number; height: number }
  | { type: "FRAME"; velocity: number }
  | { type: "RESIZE"; width: number; height: number }
  | { type: "VISIBILITY"; visible: boolean };

export interface WorkerInternalState {
  ctx: OffscreenCanvasRenderingContext2D | null;
  width: number;
  height: number;
  time: number;
  velocity: number;
  ampLerp: number;
  collapseX: number;
  glowLerp: number;
  margins: { left: number; right: number };
  stringDefs: StringDef[];
  particles: Particle[];
  pointsCache: { x: number; y: number }[];
  isVisible: boolean;
  rafId: number | null;
}
