import {
  SpriteWorkerInMessage,
  SpriteWorkerState,
} from "./sprite-animation.types";

const FRAME_COUNT = 120;

const state: SpriteWorkerState = {
  ctx: null,
  width: 0,
  height: 0,
  rafId: null,
  baseImages: Array(FRAME_COUNT).fill(null),
  glowImages: Array(FRAME_COUNT).fill(null),
  targetFrame: 0,
  lastRenderedFrame: -1,
};

// --- IMAGE LOADING PIPELINE ---
const loadImages = async () => {
  for (let i = 0; i < FRAME_COUNT; i++) {
    const idx = i.toString().padStart(5, "0");

    // Load Base Image
    fetch(`/sprite_cubi/cubi/cubi_${idx}.webp`)
      .then((res) => res.blob())
      .then((blob) => createImageBitmap(blob))
      .then((bmp) => {
        state.baseImages[i] = bmp;
      })
      .catch((err) => console.warn(`Failed to load base frame ${idx}`, err));

    // Load Glow Image
    fetch(`/sprite_cubi/cubi_glow/cubi_glow_${idx}.webp`)
      .then((res) => res.blob())
      .then((blob) => createImageBitmap(blob))
      .then((bmp) => {
        state.glowImages[i] = bmp;
      })
      .catch((err) => console.warn(`Failed to load glow frame ${idx}`, err));
  }
};

// --- RENDER LOOP ---
const render = () => {
  if (!state.ctx) return;
  
  const frameIndex = Math.floor(state.targetFrame) % FRAME_COUNT;

  if (frameIndex !== state.lastRenderedFrame) {
    let bImg = state.baseImages[frameIndex];
    let validIdx = frameIndex;
    
    while (validIdx > 0 && !bImg) {
      validIdx--;
      bImg = state.baseImages[validIdx];
    }

    if (bImg) {
      const ctx = state.ctx;
      ctx.clearRect(0, 0, state.width, state.height);
      
      ctx.globalCompositeOperation = "source-over";
      ctx.drawImage(bImg, 0, 0, state.width, state.height);

      const gImg = state.glowImages[validIdx];
      if (gImg) {
        ctx.globalCompositeOperation = "lighter";
        ctx.drawImage(gImg, 0, 0, state.width, state.height);
      }

      state.lastRenderedFrame = frameIndex;
    }
  }
};

const loop = () => {
  render();
  if (typeof self.requestAnimationFrame !== "undefined") {
    state.rafId = self.requestAnimationFrame(loop);
  } else {
    state.rafId = setTimeout(loop, 1000 / 60) as any;
  }
};

// --- MESSAGE HANDLER ---
self.onmessage = (e: MessageEvent<SpriteWorkerInMessage>) => {
  const data = e.data;

  switch (data.type) {
    case "INIT": {
      state.ctx = data.canvas.getContext("2d") as OffscreenCanvasRenderingContext2D;
      state.ctx.canvas.width = data.width;
      state.ctx.canvas.height = data.height;
      state.width = data.width;
      state.height = data.height;

      console.log("[SpriteWorker] Initialized");
      loadImages();
      loop();
      break;
    }
    case "FRAME": {
      state.targetFrame = data.frame;
      break;
    }
  }
};

export {};
