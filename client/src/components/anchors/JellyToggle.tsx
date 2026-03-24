/**
 * JellyToggle — anchors/JellyToggle.tsx
 *
 * Source-based jelly toggle with three render tiers:
 * 1. TypeGPU WebGPU: SDF ellipsoid knob + rounded track, Fresnel, specular
 * 2. Canvas 2D: Same spring physics, simplified optics (radial gradient)
 * 3. CSS: Existing droplet button (functional, no spring physics)
 *
 * Spring physics: 3 independent springs (squashX ζ≈0.158, squashZ ζ≈0.200, position ζ≈0.87)
 * Source boundary: this file lives in anchors/ only.
 */

import { useRef, useEffect, useCallback, useState } from "react";
import { useJellyMode } from "@/contexts/JellyModeContext";
import { useTheme } from "@/contexts/ThemeContext";
import { getGPUDevice, isWebGPUAvailable } from "./lib/gpu";
import { toggleVertexCode, toggleFragmentCode } from "./lib/toggleShader.wgsl";
import { Spring } from "./lib/spring";

type RenderTier = "webgpu" | "canvas2d" | "css";

const CANVAS_W = 112; // 56px * 2 for retina
const CANVAS_H = 56;

export default function JellyToggle() {
  const { jellyMode, toggleJellyMode } = useJellyMode();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const [tier, setTier] = useState<RenderTier>("css");

  // Springs: position (ζ≈0.87), squashX (ζ≈0.158), squashZ (ζ≈0.200)
  const posSpringRef = useRef(new Spring(jellyMode ? 1 : 0, 600, 42, 1.0));
  const sqXSpringRef = useRef(new Spring(0, 600, 0, 1.0));
  const sqZSpringRef = useRef(new Spring(0, 600, 0, 1.0));

  // Set correct damping ratios
  useEffect(() => {
    posSpringRef.current.setDamping(0.87);
    sqXSpringRef.current.stiffness = 600;
    sqXSpringRef.current.setDamping(0.158);
    sqZSpringRef.current.stiffness = 600;
    sqZSpringRef.current.setDamping(0.200);
  }, []);

  // GPU refs
  const deviceRef = useRef<GPUDevice | null>(null);
  const pipelineRef = useRef<GPURenderPipeline | null>(null);
  const uniformBufferRef = useRef<GPUBuffer | null>(null);
  const contextRef = useRef<GPUCanvasContext | null>(null);
  const gpuInitRef = useRef(false);

  const prefersReducedMotion =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Detect render tier
  useEffect(() => {
    if (isWebGPUAvailable()) {
      getGPUDevice().then((device) => {
        if (device) {
          setTier("webgpu");
        } else {
          setTier("canvas2d");
        }
      });
    } else {
      // Check Canvas 2D
      const testCanvas = document.createElement("canvas");
      if (testCanvas.getContext("2d")) {
        setTier("canvas2d");
      } else {
        setTier("css");
      }
    }
  }, []);

  // Update spring targets on toggle
  useEffect(() => {
    const target = jellyMode ? 1 : 0;
    posSpringRef.current.target = target;
    // Velocity-coupled squash: apply impulse on toggle
    const velocity = posSpringRef.current.velocity;
    sqXSpringRef.current.target = 0;
    sqXSpringRef.current.velocity = velocity * 0.3;
    sqZSpringRef.current.target = 0;
    sqZSpringRef.current.velocity = -velocity * 0.2;
  }, [jellyMode]);

  // Init WebGPU pipeline
  const initWebGPU = useCallback(async () => {
    if (gpuInitRef.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const device = await getGPUDevice();
    if (!device) { setTier("canvas2d"); return; }
    deviceRef.current = device;

    const ctx = canvas.getContext("webgpu");
    if (!ctx) { setTier("canvas2d"); return; }
    contextRef.current = ctx;

    const format = navigator.gpu.getPreferredCanvasFormat();
    ctx.configure({ device, format, alphaMode: "premultiplied" });

    const uniformBuffer = device.createBuffer({
      size: 16 * 4, // 16 floats
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    });
    uniformBufferRef.current = uniformBuffer;

    const bgl = device.createBindGroupLayout({
      entries: [{
        binding: 0,
        visibility: GPUShaderStage.FRAGMENT,
        buffer: { type: "uniform" as GPUBufferBindingType },
      }],
    });

    try {
      const vm = device.createShaderModule({ code: toggleVertexCode });
      const fm = device.createShaderModule({ code: toggleFragmentCode });
      const pipeline = device.createRenderPipeline({
        layout: device.createPipelineLayout({ bindGroupLayouts: [bgl] }),
        vertex: { module: vm, entryPoint: "main" },
        fragment: {
          module: fm,
          entryPoint: "main",
          targets: [{
            format,
            blend: {
              color: {
                srcFactor: "src-alpha" as GPUBlendFactor,
                dstFactor: "one-minus-src-alpha" as GPUBlendFactor,
                operation: "add" as GPUBlendOperation,
              },
              alpha: {
                srcFactor: "one" as GPUBlendFactor,
                dstFactor: "one-minus-src-alpha" as GPUBlendFactor,
                operation: "add" as GPUBlendOperation,
              },
            },
          }],
        },
        primitive: { topology: "triangle-strip" },
      });
      pipelineRef.current = pipeline;
      gpuInitRef.current = true;
    } catch (err) {
      console.error("[JellyToggle] Shader compilation failed:", err);
      setTier("canvas2d");
    }
  }, []);

  // WebGPU render frame
  const renderWebGPU = useCallback(() => {
    const device = deviceRef.current;
    const ctx = contextRef.current;
    const pipeline = pipelineRef.current;
    const ub = uniformBufferRef.current;
    if (!device || !ctx || !pipeline || !ub) return;

    const pos = posSpringRef.current;
    const sqX = sqXSpringRef.current;
    const sqZ = sqZSpringRef.current;

    // Map position 0-1 to knob SDF space -0.45 to 0.45
    const knobPos = (pos.value - 0.5) * 0.9;

    // Track and knob colors based on theme and state
    const trackColor = isDark
      ? (jellyMode ? [0.15, 0.35, 0.33] : [0.2, 0.2, 0.22])
      : (jellyMode ? [0.6, 0.85, 0.82] : [0.82, 0.82, 0.84]);
    const knobColor = isDark
      ? (jellyMode ? [0.4, 0.85, 0.8] : [0.7, 0.7, 0.72])
      : (jellyMode ? [0.3, 0.7, 0.65] : [0.95, 0.95, 0.96]);

    // Background: transparent
    const bgColor = isDark ? [0.06, 0.06, 0.08] : [0.98, 0.98, 0.97];

    const ud = new Float32Array(16);
    ud[0] = CANVAS_W; ud[1] = CANVAS_H;
    ud[2] = knobPos;
    ud[3] = sqX.value;
    ud[4] = sqZ.value;
    ud[5] = bgColor[0]; ud[6] = bgColor[1]; ud[7] = bgColor[2];
    ud[8] = trackColor[0]; ud[9] = trackColor[1]; ud[10] = trackColor[2];
    ud[11] = knobColor[0]; ud[12] = knobColor[1]; ud[13] = knobColor[2];
    ud[14] = jellyMode ? 1 : 0;
    ud[15] = 0;

    device.queue.writeBuffer(ub, 0, ud);

    const bg = device.createBindGroup({
      layout: pipeline.getBindGroupLayout(0),
      entries: [{ binding: 0, resource: { buffer: ub } }],
    });

    const texture = ctx.getCurrentTexture();
    const encoder = device.createCommandEncoder();
    const pass = encoder.beginRenderPass({
      colorAttachments: [{
        view: texture.createView(),
        loadOp: "clear" as GPULoadOp,
        storeOp: "store" as GPUStoreOp,
        clearValue: { r: 0, g: 0, b: 0, a: 0 },
      }],
    });
    pass.setPipeline(pipeline);
    pass.setBindGroup(0, bg);
    pass.draw(4);
    pass.end();
    device.queue.submit([encoder.finish()]);
  }, [isDark, jellyMode]);

  // Canvas 2D render frame
  const renderCanvas2D = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const pos = posSpringRef.current;
    const sqX = sqXSpringRef.current;

    const w = CANVAS_W;
    const h = CANVAS_H;
    ctx.clearRect(0, 0, w, h);

    // Track
    const trackH = h * 0.7;
    const trackY = (h - trackH) / 2;
    const trackR = trackH / 2;

    ctx.beginPath();
    ctx.roundRect(4, trackY, w - 8, trackH, trackR);
    if (jellyMode) {
      ctx.fillStyle = isDark ? "rgba(60,140,130,0.6)" : "rgba(140,210,200,0.7)";
    } else {
      ctx.fillStyle = isDark ? "rgba(80,80,90,0.5)" : "rgba(200,200,210,0.6)";
    }
    ctx.fill();

    // Track highlight (Fresnel-evoking)
    const tGrad = ctx.createLinearGradient(0, trackY, 0, trackY + trackH);
    tGrad.addColorStop(0, "rgba(255,255,255,0.15)");
    tGrad.addColorStop(0.5, "rgba(255,255,255,0.02)");
    tGrad.addColorStop(1, "rgba(0,0,0,0.05)");
    ctx.fillStyle = tGrad;
    ctx.fill();

    // Knob
    const knobR = trackH * 0.42;
    const knobMinX = 4 + trackR;
    const knobMaxX = w - 4 - trackR;
    const knobX = knobMinX + pos.value * (knobMaxX - knobMinX);
    const knobY = h / 2;
    const squashFactor = 1 + sqX.value * 0.15;

    ctx.save();
    ctx.translate(knobX, knobY);
    ctx.scale(squashFactor, 1 / squashFactor);

    // Knob body
    ctx.beginPath();
    ctx.arc(0, 0, knobR, 0, Math.PI * 2);
    if (jellyMode) {
      ctx.fillStyle = isDark ? "rgba(100,220,210,0.9)" : "rgba(70,180,170,0.85)";
    } else {
      ctx.fillStyle = isDark ? "rgba(180,180,185,0.9)" : "rgba(240,240,242,0.95)";
    }
    ctx.fill();

    // Knob specular highlight (radial gradient)
    const sGrad = ctx.createRadialGradient(-knobR * 0.3, -knobR * 0.3, 0, 0, 0, knobR);
    sGrad.addColorStop(0, "rgba(255,255,255,0.5)");
    sGrad.addColorStop(0.4, "rgba(255,255,255,0.1)");
    sGrad.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = sGrad;
    ctx.fill();

    // Knob Fresnel edge (brighter arc)
    ctx.beginPath();
    ctx.arc(0, 0, knobR, 0, Math.PI * 2);
    ctx.strokeStyle = "rgba(255,255,255,0.25)";
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.restore();
  }, [isDark, jellyMode]);

  // Animation loop
  const animate = useCallback(() => {
    const pos = posSpringRef.current;
    const sqX = sqXSpringRef.current;
    const sqZ = sqZSpringRef.current;

    if (!prefersReducedMotion) {
      pos.update(1 / 60);
      sqX.update(1 / 60);
      sqZ.update(1 / 60);
    } else {
      // Reduced motion: snap to target
      if (!pos.isSettled(0.01)) {
        pos.value += (pos.target - pos.value) * 0.15;
        if (Math.abs(pos.value - pos.target) < 0.01) pos.snap();
      }
      sqX.snap();
      sqZ.snap();
    }

    if (tier === "webgpu") {
      renderWebGPU();
    } else if (tier === "canvas2d") {
      renderCanvas2D();
    }

    // Continue animating if springs are not settled
    if (!pos.isSettled() || !sqX.isSettled() || !sqZ.isSettled()) {
      animRef.current = requestAnimationFrame(animate);
    } else {
      // One final render then stop
      if (tier === "webgpu") renderWebGPU();
      else if (tier === "canvas2d") renderCanvas2D();
    }
  }, [tier, renderWebGPU, renderCanvas2D, prefersReducedMotion]);

  // Start animation on toggle change
  useEffect(() => {
    cancelAnimationFrame(animRef.current);
    animRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animRef.current);
  }, [jellyMode, animate]);

  // Init WebGPU when tier is webgpu
  useEffect(() => {
    if (tier === "webgpu") {
      initWebGPU();
    }
  }, [tier, initWebGPU]);

  // Handle click
  const handleClick = useCallback(() => {
    // Apply velocity impulse for squash effect
    const currentVel = posSpringRef.current.velocity;
    sqXSpringRef.current.velocity += (jellyMode ? -1 : 1) * 3 + currentVel * 0.2;
    sqZSpringRef.current.velocity += (jellyMode ? 1 : -1) * 2;
    toggleJellyMode();
  }, [jellyMode, toggleJellyMode]);

  // CSS fallback tier
  if (tier === "css") {
    return (
      <button
        onClick={toggleJellyMode}
        className={`relative w-14 h-7 rounded-full transition-colors duration-300 ${
          jellyMode
            ? "bg-jelly-teal/30 border border-jelly-teal/40"
            : "bg-muted border border-border"
        }`}
        aria-label={jellyMode ? "Disable jelly mode" : "Enable jelly mode"}
        aria-pressed={jellyMode}
        title={jellyMode ? "Jelly Mode: ON" : "Jelly Mode: OFF"}
      >
        <span
          className={`absolute top-0.5 w-6 h-6 rounded-full transition-all duration-300 ${
            jellyMode
              ? "left-7 bg-jelly-teal shadow-[0_0_8px_rgba(100,220,210,0.4)]"
              : "left-0.5 bg-foreground/60"
          }`}
        />
      </button>
    );
  }

  // WebGPU or Canvas 2D tier
  return (
    <button
      onClick={handleClick}
      className="relative block"
      style={{ width: 56, height: 28 }}
      aria-label={jellyMode ? "Disable jelly mode" : "Enable jelly mode"}
      aria-pressed={jellyMode}
      title={jellyMode ? "Jelly Mode: ON" : "Jelly Mode: OFF"}
    >
      <canvas
        ref={canvasRef}
        width={CANVAS_W}
        height={CANVAS_H}
        className="w-full h-full rounded-full"
        style={{ imageRendering: "auto" }}
      />
    </button>
  );
}
