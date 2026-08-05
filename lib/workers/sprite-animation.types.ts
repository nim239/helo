export interface SpriteWorkerInMessageInit {
  type: "INIT";
  canvas: OffscreenCanvas;
  width: number; // Logical canvas width
  height: number;
}

export interface SpriteWorkerInMessageFrame {
  type: "FRAME";
  frame: number;
}

export type SpriteWorkerInMessage =
  | SpriteWorkerInMessageInit
  | SpriteWorkerInMessageFrame;

export interface SpriteWorkerState {
  ctx: OffscreenCanvasRenderingContext2D | null;
  width: number;
  height: number;
  rafId: number | null;
  baseImages: (ImageBitmap | null)[];
  glowImages: (ImageBitmap | null)[];
  targetFrame: number;
  lastRenderedFrame: number;
}
