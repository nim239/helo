import { WorkerInMessage, WorkerInternalState, StringDef, Particle } from './kinetic-strings.types';

const SCALE = 0.25;
const STRING_COUNT = 3;
const LERP_IN = 0.05;
const LERP_OUT = 0.02;
const MAX_PER_CLUSTER = 5;
const M = 1.8; // Particle velocity multiplier

const CHROMA_PAIRS = [
  { left: { r: 0, g: 242, b: 255 }, right: { r: 255, g: 0, b: 127 } },
  { left: { r: 0, g: 102, b: 255 }, right: { r: 178, g: 0, b: 255 } },
  { left: { r: 0, g: 255, b: 136 }, right: { r: 255, g: 0, b: 85 } },
  { left: { r: 0, g: 191, b: 255 }, right: { r: 255, g: 60, b: 0 } },
  { left: { r: 0, g: 242, b: 255 }, right: { r: 210, g: 0, b: 255 } },
];

const state: WorkerInternalState = {
  ctx: null,
  width: 0,
  height: 0,
  time: 0,
  velocity: 0,
  ampLerp: 1,
  collapseX: 0,
  glowLerp: 1,
  margins: { left: 0, right: 0 },
  stringDefs: [],
  particles: [],
  pointsCache: [],
  isVisible: true,
  rafId: null,
};

const getMargins = (width: number) => {
  const isMobile = width < 768;
  const ratio = isMobile ? 0.04 : 0.08;
  return { left: width * ratio, right: width * (1 - ratio) };
};

// Trigonometry Caches (hoisted out of state to avoid type changes)
let envelopeCache: number[] = [];
let sinALeftCache: number[][] = [];
let cosALeftCache: number[][] = [];
let sinARightCache: number[][] = [];
let cosARightCache: number[][] = [];

const buildCaches = (height: number) => {
  envelopeCache = [];
  sinALeftCache = [[], [], []];
  cosALeftCache = [[], [], []];
  sinARightCache = [[], [], []];
  cosARightCache = [[], [], []];

  for (let y = 0; y <= height; y += 10) {
    envelopeCache.push(Math.sin((y / height) * Math.PI));
  }
  if (height % 10 !== 0) {
    envelopeCache.push(0); // sin(PI) = 0
  }

  for (let i = 0; i < STRING_COUNT; i++) {
    const spatialFreq = (Math.PI * (i + 1)) / height;
    
    for (let y = 0; y <= height; y += 10) {
      sinALeftCache[i].push(Math.sin(y * spatialFreq * 1.0));
      cosALeftCache[i].push(Math.cos(y * spatialFreq * 1.0));
      sinARightCache[i].push(Math.sin(y * spatialFreq * 1.25));
      cosARightCache[i].push(Math.cos(y * spatialFreq * 1.25));
    }
    if (height % 10 !== 0) {
      sinALeftCache[i].push(Math.sin(height * spatialFreq * 1.0));
      cosALeftCache[i].push(Math.cos(height * spatialFreq * 1.0));
      sinARightCache[i].push(Math.sin(height * spatialFreq * 1.25));
      cosARightCache[i].push(Math.cos(height * spatialFreq * 1.25));
    }
  }
};

const initStringDefs = (height: number): StringDef[] => {
  return Array.from({ length: STRING_COUNT }).map((_, i) => {
    const harmonicOrder = (i + 1) as 1 | 2 | 3;
    return {
      harmonicOrder,
      amplitude: 65 - i * 14,
      spatialFrequency: (Math.PI * harmonicOrder) / height,
      temporalSpeed: 1 + i * 0.4,
      phaseOffset: (i * Math.PI) / 3,
      xOffset: (i - 1) * 14,
    };
  });
};

const initParticles = (height: number): Particle[] => {
  const p: Particle[] = [];
  for (const cluster of ["left", "right"] as const) {
    for (let i = 0; i < MAX_PER_CLUSTER; i++) {
      p.push({
        y: (height / MAX_PER_CLUSTER) * i + Math.random() * 60,
        baseSpeed: 0.3 + Math.random() * 0.15,
        cluster,
        stringIndex: i % STRING_COUNT,
      });
    }
  }
  return p;
};

const getSingleStringX = (
  baseX: number,
  idx: number,
  y: number,
  t: number,
  amp: number,
  collapse: number,
  isLeft: boolean
): number => {
  const def = state.stringDefs[idx];
  const clampedY = Math.max(0, Math.min(state.height, y));
  const fixedEndEnvelope = Math.sin((clampedY / state.height) * Math.PI);
  const clusterFreqMult = isLeft ? 1.0 : 1.25;
  const clusterSpeedMult = isLeft ? 1.0 : 0.82;
  const clusterPhase = isLeft ? 0 : Math.PI * 0.9;
  const wave = Math.sin(
    clampedY * def.spatialFrequency * clusterFreqMult +
      t * def.temporalSpeed * clusterSpeedMult +
      def.phaseOffset +
      clusterPhase
  );
  const effectiveXOffset = def.xOffset * (1 - collapse) * fixedEndEnvelope;
  const effectiveAmp = def.amplitude * amp * fixedEndEnvelope * (isLeft ? 1.0 : 0.88);
  return baseX + effectiveXOffset + wave * effectiveAmp;
};

const drawWavePathBezier = (
  targetCtx: OffscreenCanvasRenderingContext2D,
  baseX: number,
  idx: number,
  t: number,
  amp: number,
  collapse: number,
  isLeft: boolean,
  offsetX: number,
  scale: number = 1.0
) => {
  targetCtx.beginPath();
  const Y_STEP = 10;
  let pointCount = 0;

  const def = state.stringDefs[idx];
  const clusterFreqMult = isLeft ? 1.0 : 1.25;
  const clusterSpeedMult = isLeft ? 1.0 : 0.82;
  const clusterPhase = isLeft ? 0 : Math.PI * 0.9;
  
  const phase = t * def.temporalSpeed * clusterSpeedMult + def.phaseOffset + clusterPhase;
  const baseAmp = def.amplitude * amp * (isLeft ? 1.0 : 0.88);
  const baseXOffset = def.xOffset * (1 - collapse);

  // Trig identities: sin(A + B) = sin(A)cos(B) + cos(A)sin(B)
  const sinPhase = Math.sin(phase);
  const cosPhase = Math.cos(phase);
  const sinACache = isLeft ? sinALeftCache[idx] : sinARightCache[idx];
  const cosACache = isLeft ? cosALeftCache[idx] : cosARightCache[idx];

  let cacheIdx = 0;
  
  // Pre-calculate path
  for (let y = 0; y <= state.height; y += Y_STEP) {
    const fixedEndEnvelope = envelopeCache[cacheIdx];
    const wave = sinACache[cacheIdx] * cosPhase + cosACache[cacheIdx] * sinPhase;
    const effectiveXOffset = baseXOffset * fixedEndEnvelope;
    const effectiveAmp = baseAmp * fixedEndEnvelope;
    const x = baseX + effectiveXOffset + wave * effectiveAmp + offsetX;
    
    state.pointsCache[pointCount].x = x * scale;
    state.pointsCache[pointCount].y = y * scale;
    pointCount++;
    cacheIdx++;
  }
  
  if (state.height % Y_STEP !== 0) {
    const y = state.height;
    const fixedEndEnvelope = envelopeCache[cacheIdx];
    const wave = sinACache[cacheIdx] * cosPhase + cosACache[cacheIdx] * sinPhase;
    const effectiveXOffset = baseXOffset * fixedEndEnvelope;
    const effectiveAmp = baseAmp * fixedEndEnvelope;
    const x = baseX + effectiveXOffset + wave * effectiveAmp + offsetX;
    
    state.pointsCache[pointCount].x = x * scale;
    state.pointsCache[pointCount].y = y * scale;
    pointCount++;
    cacheIdx++;
  }

  if (pointCount === 0) return;

  targetCtx.moveTo(state.pointsCache[0].x, state.pointsCache[0].y);

  for (let i = 1; i < pointCount - 1; i++) {
    const xc = (state.pointsCache[i].x + state.pointsCache[i + 1].x) / 2;
    const yc = (state.pointsCache[i].y + state.pointsCache[i + 1].y) / 2;
    targetCtx.quadraticCurveTo(state.pointsCache[i].x, state.pointsCache[i].y, xc, yc);
  }

  if (pointCount > 1) {
    const last = state.pointsCache[pointCount - 1];
    targetCtx.lineTo(last.x, last.y);
  }
};

const render = () => {
  if (!state.ctx || !state.isVisible) return;

  state.time += 0.007;

  const ctx = state.ctx;
  ctx.clearRect(0, 0, state.width, state.height);

  const absVel = Math.abs(state.velocity);
  const isTension = absVel > 0.08;

  const lerpSpeed = isTension ? LERP_IN : LERP_OUT;
  const target = isTension ? 0 : 1;

  state.ampLerp += (target - state.ampLerp) * lerpSpeed;
  state.collapseX += ((isTension ? 1 : 0) - state.collapseX) * lerpSpeed;
  state.glowLerp += (target - state.glowLerp) * lerpSpeed;

  state.ampLerp = Math.max(0, Math.min(1, state.ampLerp));
  state.collapseX = Math.max(0, Math.min(1, state.collapseX));
  state.glowLerp = Math.max(0, Math.min(1, state.glowLerp));

  // ── 2. RENDER SHARP CORE WHITE LINES DIRECTLY (1.0x scale) ──
  ctx.save();
  ctx.globalCompositeOperation = "source-over";
  ctx.filter = "none";

  for (const cluster of ["left", "right"] as const) {
    const baseX = cluster === "left" ? state.margins.left : state.margins.right;
    const isLeft = cluster === "left";

    for (let i = STRING_COUNT - 1; i >= 0; i--) {
      drawWavePathBezier(ctx, baseX, i, state.time, state.ampLerp, state.collapseX, isLeft, 0, 1.0);
      ctx.strokeStyle = "rgba(255, 255, 255, 0.98)";
      ctx.lineWidth = 0.8;
      ctx.stroke();
    }
  }
  ctx.restore();

  // ── 3. PARTICLES (Zero Blur Filter) ──
  for (const p of state.particles) {
    const isLeft = p.cluster === "left";
    const baseX = isLeft ? state.margins.left : state.margins.right;
    const dotSpeed = p.baseSpeed - state.velocity * M;
    p.y += dotSpeed;
    if (p.y < 0) p.y = state.height;
    else if (p.y > state.height) p.y = 0;

    const px = getSingleStringX(baseX, p.stringIndex, p.y, state.time, state.ampLerp, state.collapseX, isLeft);

    ctx.save();
    ctx.globalCompositeOperation = "source-over";
    ctx.filter = "none";

    ctx.beginPath();
    ctx.arc(px, p.y, 3.0, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(255, 255, 255, 1)";
    ctx.fill();

    ctx.restore();
  }
};

const loop = () => {
  if (state.isVisible) {
    render();
  }
  if (typeof self.requestAnimationFrame !== 'undefined') {
    state.rafId = self.requestAnimationFrame(loop);
  } else {
    // Fallback if requestAnimationFrame is not available in worker
    state.rafId = setTimeout(loop, 1000 / 60) as any;
  }
};

self.onmessage = (e: MessageEvent<WorkerInMessage>) => {
  const data = e.data;

  switch (data.type) {
    case "INIT": {
      state.ctx = data.canvas.getContext("2d") as OffscreenCanvasRenderingContext2D;
      state.ctx.canvas.width = data.width;
      state.ctx.canvas.height = data.height;
      
      state.width = data.width;
      state.height = data.height;
      state.margins = getMargins(data.width);
      state.stringDefs = initStringDefs(data.height);
      state.particles = initParticles(data.height);
      
      buildCaches(data.height);

      const maxPoints = Math.ceil(data.height / 10) + 2;
      state.pointsCache = Array.from({ length: maxPoints }, () => ({ x: 0, y: 0 }));

      console.log("[KineticStrings Worker] Initialized");
      loop();
      break;
    }
    case "FRAME": {
      state.velocity = data.velocity;
      break;
    }
    case "RESIZE": {
      state.width = data.width;
      state.height = data.height;
      
      // We don't need to resize the canvas object here directly if it's already an OffscreenCanvas
      // that is tied to the element, but if it is, we would set width/height. 
      // Actually, OffscreenCanvas width/height MUST be updated for it to render correctly.
      if (state.ctx) {
        state.ctx.canvas.width = data.width;
        state.ctx.canvas.height = data.height;
      }

      state.margins = getMargins(data.width);
      for (let i = 0; i < STRING_COUNT; i++) {
        const harmonicOrder = i + 1;
        state.stringDefs[i].spatialFrequency = (Math.PI * harmonicOrder) / data.height;
      }
      buildCaches(data.height);
      
      const maxPoints = Math.ceil(data.height / 10) + 2;
      if (state.pointsCache.length < maxPoints) {
          state.pointsCache = Array.from({ length: maxPoints }, () => ({ x: 0, y: 0 }));
      }
      break;
    }
    case "VISIBILITY": {
      state.isVisible = data.visible;
      // Note: loop handles skipping render if !isVisible
      break;
    }
  }
};

export {};
