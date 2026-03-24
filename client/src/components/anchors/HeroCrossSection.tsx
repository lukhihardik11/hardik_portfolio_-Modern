/**
 * HeroCrossSection — anchors/HeroCrossSection.tsx
 *
 * Renders a SDF rounded rectangular slab with real optical properties:
 * Fresnel, Beer-Lambert, specular, deformation-coupled light response.
 *
 * Two render tiers:
 * 1. WebGPU canvas (jelly mode + WebGPU available) — full GPU ray march
 * 2. Canvas 2D CPU ray march (jelly mode + no WebGPU) — same optics, CPU-rendered
 *
 * Standard mode: inert placeholder (near-invisible).
 *
 * Source boundary: this file lives in anchors/ only.
 */

import { useRef, useEffect, useCallback, useState } from "react";
import { useJellyMode } from "@/contexts/JellyModeContext";
import { useTheme } from "@/contexts/ThemeContext";
import { getGPUDevice, isWebGPUAvailable } from "./lib/gpu";
import {
  crossSectionVertexCode,
  crossSectionFragmentCode,
} from "./lib/crossSectionShader.wgsl";
import { Spring } from "./lib/spring";
import { renderCrossSectionCPU, type CrossSectionUniforms } from "./lib/crossSectionCPU";

// Uniform buffer layout: 18 floats, padded to 80 bytes (20 x f32)
const UNIFORM_COUNT = 20;
const UNIFORM_SIZE = UNIFORM_COUNT * 4;

// CPU render resolution (lower for performance, upscaled by canvas CSS)
const CPU_RENDER_W = 200;
const CPU_RENDER_H = 125;

// Theme colors — read from CSS custom properties
function getThemeBgColor(isDark: boolean): [number, number, number] {
  if (typeof document === "undefined") return isDark ? [0.06, 0.06, 0.08] : [0.98, 0.98, 0.97];
  const el = document.documentElement;
  const style = getComputedStyle(el);
  const bg = style.getPropertyValue("--background").trim();
  if (bg) {
    const temp = document.createElement("div");
    temp.style.color = `oklch(${bg})`;
    document.body.appendChild(temp);
    const computed = getComputedStyle(temp).color;
    document.body.removeChild(temp);
    const match = computed.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
    if (match) {
      return [parseInt(match[1]) / 255, parseInt(match[2]) / 255, parseInt(match[3]) / 255];
    }
  }
  return isDark ? [0.06, 0.06, 0.08] : [0.98, 0.98, 0.97];
}

function getJellyColor(isDark: boolean): [number, number, number] {
  return isDark ? [0.45, 0.88, 0.85] : [0.35, 0.8, 0.75];
}

type RenderTier = "webgpu" | "canvas2d";

export default function HeroCrossSection() {
  const { jellyMode: isJellyMode } = useJellyMode();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number>(0);
  const pipelineRef = useRef<GPURenderPipeline | null>(null);
  const uniformBufferRef = useRef<GPUBuffer | null>(null);
  const deviceRef = useRef<GPUDevice | null>(null);
  const contextRef = useRef<GPUCanvasContext | null>(null);
  const uniformDataRef = useRef(new Float32Array(UNIFORM_COUNT));
  const isInitializedRef = useRef(false);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const isVisibleRef = useRef(true);

  // Render tier
  const [tier, setTier] = useState<RenderTier | null>(null);

  // Spring for pointer-responsive deformation (overdamped, ζ≈1.2)
  const deformSpringRef = useRef(new Spring(0, 200, 28, 1.0));

  // Pointer position in SDF space
  const pointerRef = useRef({ x: 99, y: 99 }); // off-screen default

  // CPU render refs
  const cpuCtxRef = useRef<CanvasRenderingContext2D | null>(null);
  const cpuImageDataRef = useRef<ImageData | null>(null);
  const cpuNeedsRenderRef = useRef(true);
  const lastRenderParamsRef = useRef("");

  // Reduced motion check
  const prefersReducedMotion =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Detect render tier
  useEffect(() => {
    if (isWebGPUAvailable()) {
      getGPUDevice().then((device) => {
        setTier(device ? "webgpu" : "canvas2d");
      });
    } else {
      setTier("canvas2d");
    }
  }, []);

  // Initialize WebGPU pipeline
  const initGPU = useCallback(async () => {
    if (isInitializedRef.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const device = await getGPUDevice();
    if (!device) {
      setTier("canvas2d");
      return;
    }

    deviceRef.current = device;

    const ctx = canvas.getContext("webgpu");
    if (!ctx) {
      setTier("canvas2d");
      return;
    }
    contextRef.current = ctx;

    const format = navigator.gpu.getPreferredCanvasFormat();
    ctx.configure({ device, format, alphaMode: "opaque" });

    const uniformBuffer = device.createBuffer({
      size: UNIFORM_SIZE,
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    });
    uniformBufferRef.current = uniformBuffer;

    const bindGroupLayout = device.createBindGroupLayout({
      entries: [
        {
          binding: 0,
          visibility: GPUShaderStage.FRAGMENT,
          buffer: { type: "uniform" as GPUBufferBindingType },
        },
      ],
    });

    try {
      const vertexModule = device.createShaderModule({ code: crossSectionVertexCode });
      const fragmentModule = device.createShaderModule({ code: crossSectionFragmentCode });

      const pipeline = device.createRenderPipeline({
        layout: device.createPipelineLayout({ bindGroupLayouts: [bindGroupLayout] }),
        vertex: { module: vertexModule, entryPoint: "main" },
        fragment: {
          module: fragmentModule,
          entryPoint: "main",
          targets: [{ format }],
        },
        primitive: { topology: "triangle-strip" },
      });

      pipelineRef.current = pipeline;
      isInitializedRef.current = true;
    } catch (err) {
      console.error("[HeroCrossSection] Shader compilation failed:", err);
      setTier("canvas2d");
    }
  }, []);

  // Init Canvas 2D for CPU rendering
  const initCanvas2D = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = CPU_RENDER_W;
    canvas.height = CPU_RENDER_H;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;
    cpuCtxRef.current = ctx;
    cpuImageDataRef.current = ctx.createImageData(CPU_RENDER_W, CPU_RENDER_H);
  }, []);

  // Render frame (WebGPU)
  const renderWebGPU = useCallback(() => {
    const device = deviceRef.current;
    const ctx = contextRef.current;
    const pipeline = pipelineRef.current;
    const uniformBuffer = uniformBufferRef.current;
    const canvas = canvasRef.current;

    if (!device || !ctx || !pipeline || !uniformBuffer || !canvas) return;

    const bg = getThemeBgColor(isDark);
    const jc = getJellyColor(isDark);

    const deformSpring = deformSpringRef.current;
    if (!prefersReducedMotion) {
      deformSpring.update(1 / 60);
    }

    const ud = uniformDataRef.current;
    ud[0] = canvas.width;
    ud[1] = canvas.height;
    ud[2] = performance.now() / 1000;
    ud[3] = pointerRef.current.x;
    ud[4] = pointerRef.current.y;
    ud[5] = prefersReducedMotion ? 0 : deformSpring.value;
    ud[6] = bg[0]; ud[7] = bg[1]; ud[8] = bg[2];
    ud[9] = isDark ? 2.0 : 1.5;
    ud[10] = isDark ? 1.8 : 2.5;
    ud[11] = isDark ? 0.6 : 0.4;
    ud[12] = jc[0]; ud[13] = jc[1]; ud[14] = jc[2];
    ud[15] = 48;
    ud[16] = 0.05;

    device.queue.writeBuffer(uniformBuffer, 0, ud);

    const bindGroup = device.createBindGroup({
      layout: pipeline.getBindGroupLayout(0),
      entries: [{ binding: 0, resource: { buffer: uniformBuffer } }],
    });

    const texture = ctx.getCurrentTexture();
    const encoder = device.createCommandEncoder();
    const pass = encoder.beginRenderPass({
      colorAttachments: [
        {
          view: texture.createView(),
          loadOp: "clear" as GPULoadOp,
          storeOp: "store" as GPUStoreOp,
          clearValue: { r: bg[0], g: bg[1], b: bg[2], a: 1 },
        },
      ],
    });

    pass.setPipeline(pipeline);
    pass.setBindGroup(0, bindGroup);
    pass.draw(4);
    pass.end();
    device.queue.submit([encoder.finish()]);
  }, [isDark, prefersReducedMotion]);

  // Render frame (Canvas 2D CPU ray march)
  const renderCanvas2D = useCallback(() => {
    const ctx = cpuCtxRef.current;
    const imageData = cpuImageDataRef.current;
    if (!ctx || !imageData) return;

    const bg = getThemeBgColor(isDark);
    const jc = getJellyColor(isDark);

    const deformSpring = deformSpringRef.current;
    if (!prefersReducedMotion) {
      deformSpring.update(1 / 60);
    }

    // Build params key to detect if re-render needed (for static state optimization)
    const deformVal = prefersReducedMotion ? 0 : deformSpring.value;
    const paramsKey = `${isDark}|${pointerRef.current.x.toFixed(2)}|${pointerRef.current.y.toFixed(2)}|${deformVal.toFixed(4)}`;
    
    // Always render during spring animation; skip only when fully settled and unchanged
    const isSettled = deformSpring.isSettled(0.0005);
    if (isSettled && paramsKey === lastRenderParamsRef.current && !cpuNeedsRenderRef.current) {
      return;
    }
    lastRenderParamsRef.current = paramsKey;
    cpuNeedsRenderRef.current = false;

    const uniforms: CrossSectionUniforms = {
      width: CPU_RENDER_W,
      height: CPU_RENDER_H,
      pointerX: pointerRef.current.x,
      pointerY: pointerRef.current.y,
      deformAmount: deformVal,
      bgColor: bg,
      fresnelMul: isDark ? 2.0 : 1.5,
      scatterStrength: isDark ? 1.8 : 2.5,
      specularIntensity: isDark ? 0.6 : 0.4,
      jellyColor: jc,
      maxSteps: 32, // Reduced from 48 for CPU performance
      presetDeform: 0.05,
    };

    renderCrossSectionCPU(imageData, uniforms);
    ctx.putImageData(imageData, 0, 0);
  }, [isDark, prefersReducedMotion]);

  // Animation loop
  const animate = useCallback(() => {
    if (!isVisibleRef.current) {
      animFrameRef.current = requestAnimationFrame(animate);
      return;
    }
    if (tier === "webgpu") {
      renderWebGPU();
    } else if (tier === "canvas2d") {
      renderCanvas2D();
    }
    animFrameRef.current = requestAnimationFrame(animate);
  }, [tier, renderWebGPU, renderCanvas2D]);

  // Init on jelly mode activation
  useEffect(() => {
    if (!isJellyMode || !tier) return;

    if (tier === "webgpu") {
      initGPU().then(() => {
        if (isInitializedRef.current) {
          cpuNeedsRenderRef.current = true;
          animFrameRef.current = requestAnimationFrame(animate);
        }
      });
    } else if (tier === "canvas2d") {
      initCanvas2D();
      cpuNeedsRenderRef.current = true;
      animFrameRef.current = requestAnimationFrame(animate);
    }

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [isJellyMode, tier, initGPU, initCanvas2D, animate]);

  // Force re-render on theme change
  useEffect(() => {
    cpuNeedsRenderRef.current = true;
  }, [isDark]);

  // Intersection observer for visibility gating
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    observerRef.current = new IntersectionObserver(
      ([entry]) => {
        isVisibleRef.current = entry.isIntersecting;
      },
      { threshold: 0.1 }
    );
    observerRef.current.observe(canvas);

    return () => {
      observerRef.current?.disconnect();
    };
  }, []);

  // Pointer events for desktop deformation
  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      if (prefersReducedMotion) return;
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2.4;
      const y = ((e.clientY - rect.top) / rect.height - 0.5) * 1.4;
      pointerRef.current = { x, y };
      deformSpringRef.current.target = 0.04;
      cpuNeedsRenderRef.current = true;
    },
    [prefersReducedMotion]
  );

  const handlePointerLeave = useCallback(() => {
    pointerRef.current = { x: 99, y: 99 };
    deformSpringRef.current.target = 0;
    cpuNeedsRenderRef.current = true;
  }, []);

  // Container classes
  const containerClass = "w-full aspect-[8/5] max-w-[400px] rounded-3xl overflow-hidden";

  // Standard mode — near-invisible placeholder
  if (!isJellyMode) {
    return (
      <div
        className={`${containerClass} transition-opacity duration-300`}
        style={{
          background: isDark ? "rgba(255,255,255,0.02)" : "rgba(255,255,255,0.04)",
          border: isDark
            ? "1px solid rgba(255,255,255,0.03)"
            : "1px solid rgba(0,0,0,0.04)",
        }}
        aria-hidden="true"
      />
    );
  }

  // Jelly mode — full 3D rendering (WebGPU or Canvas 2D CPU ray march)
  return (
    <canvas
      ref={canvasRef}
      width={tier === "webgpu" ? 800 : CPU_RENDER_W}
      height={tier === "webgpu" ? 500 : CPU_RENDER_H}
      className={containerClass}
      style={{ imageRendering: tier === "canvas2d" ? "auto" : "auto" }}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      role="img"
      aria-label="Interactive jelly material cross-section showing Fresnel reflections, subsurface scattering, and deformation response"
    />
  );
}
