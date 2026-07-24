"use client";

import React, { useEffect, useRef, useMemo } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useScrollStore } from '../lib/store/useScrollStore';

gsap.registerPlugin(ScrollTrigger);

const SPRITE_SHEET_PATH = '/png/spritesheet.png';
const FRAME_COUNT = 120;
const COLS = 120;

const RefractionMaterial = new THREE.ShaderMaterial({
  uniforms: {
    tBeauty: { value: null },
    tNormal: { value: null }, // Optional: If we had a normal pass
    tAlpha: { value: null },  // Optional: If we had an alpha pass
    uFrame: { value: 0 },
    uCols: { value: COLS },
    uAberration: { value: 0 },
    resolution: { value: new THREE.Vector2() },
  },
  vertexShader: `
    varying vec2 vUv;
    varying vec4 vScreenPos;
    void main() {
      vUv = uv;
      vec4 pos = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      vScreenPos = pos;
      gl_Position = pos;
    }
  `,
  fragmentShader: `
    uniform sampler2D tBeauty;
    uniform float uFrame;
    uniform float uCols;
    uniform float uAberration;
    uniform vec2 resolution;

    varying vec2 vUv;
    varying vec4 vScreenPos;

    void main() {
      // 1. Sprite Sheet UV Calculation
      // Only take a fraction of the width (1/uCols)
      vec2 spriteUv = vUv;
      spriteUv.x = (spriteUv.x + uFrame) / uCols;
      
      vec4 texColor = texture2D(tBeauty, spriteUv);
      
      // If the texture is transparent, discard early (optimization)
      if (texColor.a < 0.05) {
        discard;
      }

      // 2. Screen space UV for background sampling
      vec2 screenUv = (vScreenPos.xy / vScreenPos.w) * 0.5 + 0.5;
      
      // 3. Fake Normal calculation from luminosity (since we lack a real normal map)
      float luma = dot(texColor.rgb, vec3(0.299, 0.587, 0.114));
      // Use gradient of luma to approximate bump (very simple fake)
      // For a real normal map, we would sample tNormal
      vec2 fakeNormal = (spriteUv - vec2(0.5)) * luma * 0.1;
      
      // 4. Refraction distortion
      vec2 refractedUv = screenUv + fakeNormal;

      // 5. Chromatic Aberration based on uAberration (driven by velocity)
      float ab = uAberration * 0.05;
      
      // Procedural Background (instead of sampling a massive 10MB NPOT texture 3 times which kills FPS)
      vec2 rUv = refractedUv + fakeNormal * ab;
      vec2 gUv = refractedUv;
      vec2 bUv = refractedUv - fakeNormal * ab;
      
      // Simple grid pattern to show refraction
      float r = mod(floor(rUv.x * 20.0) + floor(rUv.y * 20.0), 2.0) * 0.2;
      float g = mod(floor(gUv.x * 20.0) + floor(gUv.y * 20.0), 2.0) * 0.2;
      float b = mod(floor(bUv.x * 20.0) + floor(bUv.y * 20.0), 2.0) * 0.2;
      
      vec3 bgColor = vec3(r, g, b) + vec3(0.05); // slight base color

      // Blend the background and the beauty pass
      // texColor acts as the "glass" specular highlights / tint
      vec3 finalColor = mix(bgColor, texColor.rgb, texColor.a * 0.5);

      gl_FragColor = vec4(finalColor, texColor.a);
    }
  `,
  transparent: true,
  depthWrite: false,
});

interface RefractionSpriteProps {
  startIntro?: boolean;
}

function Scene({ startIntro }: { startIntro: boolean }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(RefractionMaterial.clone());
  
  const { viewport, size } = useThree();
  const completeIntro = useScrollStore((state) => state.completeIntro);
  const isIntroComplete = useScrollStore((state) => state.isIntroComplete);

  // Load textures
  const [beautyTex] = useTexture([SPRITE_SHEET_PATH]);

  useEffect(() => {
    materialRef.current.uniforms.tBeauty.value = beautyTex;
    materialRef.current.uniforms.resolution.value.set(size.width, size.height);
  }, [beautyTex, size]);

  // Trajectory Math (replicated from SpriteAnimation)
  const getTrajectory = (scrollY: number) => {
    const cycleLength = size.height * 6; // We use screen height * 6
    const progressCycle = scrollY / cycleLength; 
    
    // Convert to WebGL coordinates. viewport.width is the width in 3D space.
    const moveX = Math.sin(progressCycle * Math.PI * 2 * 3) * (viewport.width * 0.35); 
    const moveY = -Math.sin(progressCycle * Math.PI * 2 * 4) * (viewport.height * 0.25); // Invert Y for 3D space
    
    const spriteP = (progressCycle * 12) % 1;
    const frame = Math.floor(spriteP * (FRAME_COUNT - 1));
    
    return { x: moveX, y: moveY, frame };
  };

  useEffect(() => {
    const mesh = meshRef.current;
    if (!mesh) return;

    if (!startIntro) {
      mesh.visible = false;
      return;
    }
    
    mesh.visible = true;

    const state = { frame: 0 };
    const initialScrollY = 0;
    const START_POINT = getTrajectory(initialScrollY);

    // Initial state
    mesh.position.set(0, 0, 0);
    mesh.scale.set(2.5, 2.5, 2.5);
    materialRef.current.uniforms.uFrame.value = 0;

    let scrollTriggerInst: ScrollTrigger | null = null;

    if (!isIntroComplete) {
      const tl = gsap.timeline({
        onComplete: () => {
          completeIntro();
          initScrollJourney();
        }
      });

      tl.to(state, {
        frame: FRAME_COUNT * 2 - 1,
        duration: 2.2,
        ease: 'power2.inOut',
        onUpdate: () => {
          materialRef.current.uniforms.uFrame.value = Math.floor(state.frame) % COLS;
        },
      }, 0);

      tl.to(mesh.scale, {
        x: 1, y: 1, z: 1,
        duration: 2.2,
        ease: 'power3.inOut',
      }, 0);

      tl.to(mesh.position, {
        x: START_POINT.x,
        y: START_POINT.y,
        duration: 2.2,
        ease: 'power3.inOut',
        onUpdate: () => {
          const domEl = document.getElementById('cube-sprite');
          if (domEl) {
            const screenX = (mesh.position.x / viewport.width) * window.innerWidth + window.innerWidth / 2;
            const screenY = -(mesh.position.y / viewport.height) * window.innerHeight + window.innerHeight / 2;
            domEl.style.transform = `translate(${screenX}px, ${screenY}px)`;
          }
        }
      }, 0);
    } else {
      mesh.scale.set(1, 1, 1);
      mesh.position.set(START_POINT.x, START_POINT.y, 0);
      
      const domEl = document.getElementById('cube-sprite');
      if (domEl) {
        const screenX = (START_POINT.x / viewport.width) * window.innerWidth + window.innerWidth / 2;
        const screenY = -(START_POINT.y / viewport.height) * window.innerHeight + window.innerHeight / 2;
        domEl.style.transform = `translate(${screenX}px, ${screenY}px)`;
      }
      
      initScrollJourney();
    }

    function initScrollJourney() {
      scrollTriggerInst = ScrollTrigger.create({
        start: 0,
        end: 'max',
        scrub: 0,
        onUpdate: (self) => {
          const scrollY = self.scroll();
          const stateData = getTrajectory(scrollY);
          
          materialRef.current.uniforms.uFrame.value = stateData.frame;
          mesh.position.set(stateData.x, stateData.y, 0);
          
          const domEl = document.getElementById('cube-sprite');
          if (domEl) {
            const screenX = (stateData.x / viewport.width) * window.innerWidth + window.innerWidth / 2;
            const screenY = -(stateData.y / viewport.height) * window.innerHeight + window.innerHeight / 2;
            domEl.style.transform = `translate(${screenX}px, ${screenY}px)`;
          }
        },
      });
    }

    return () => {
      if (scrollTriggerInst) scrollTriggerInst.kill();
      gsap.killTweensOf(state);
      gsap.killTweensOf(mesh.scale);
      gsap.killTweensOf(mesh.position);
    };
  }, [startIntro, completeIntro, isIntroComplete, size]);

  // Wire up velocity for Chromatic Aberration (T008)
  useFrame(() => {
    const velocity = useScrollStore.getState().velocity;
    // Smooth aberration return to zero (FR-004)
    const absVel = Math.abs(velocity);
    // target ab is based on velocity (cap at 50)
    const targetAb = Math.min(absVel / 50, 1.0);
    
    // Lerp towards target
    materialRef.current.uniforms.uAberration.value += (targetAb - materialRef.current.uniforms.uAberration.value) * 0.1;
  });

  // Calculate base size: 20vw max 200px equivalent in 3D units
  const baseSize = Math.min((viewport.width * 0.2), 2); // Approximation

  return (
    <mesh ref={meshRef} material={materialRef.current}>
      <planeGeometry args={[baseSize, baseSize]} />
    </mesh>
  );
}

export function RefractionSprite({ startIntro = false }: RefractionSpriteProps) {
  return (
    <div className="fixed top-0 left-0 w-full h-full z-[60] pointer-events-none">
      {/* Dummy element for CustomCursor to track */}
      <div id="cube-sprite" className="absolute top-0 left-0 w-4 h-4 -ml-2 -mt-2 pointer-events-none opacity-0" />
      
      <Canvas orthographic camera={{ position: [0, 0, 5], zoom: 100 }} style={{ pointerEvents: 'none' }}>
        <React.Suspense fallback={null}>
          <Scene startIntro={startIntro} />
        </React.Suspense>
      </Canvas>
    </div>
  );
}
