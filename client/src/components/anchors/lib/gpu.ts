/**
 * Shared GPU device initialization — anchors/lib/gpu.ts
 *
 * Singleton GPU device shared by both anchors (cross-section + toggle).
 * Detection chain: navigator.gpu → requestAdapter → requestDevice → success.
 * Any failure → null (triggers CSS/Canvas2D fallback).
 * Result is cached. No retry until page reload.
 *
 * Source boundary: this file lives in anchors/lib/ only.
 */

let cachedDevice: GPUDevice | null | undefined = undefined;
let devicePromise: Promise<GPUDevice | null> | null = null;

/**
 * Synchronous check: does the browser expose navigator.gpu?
 */
export function isWebGPUAvailable(): boolean {
  return typeof navigator !== "undefined" && "gpu" in navigator;
}

/**
 * Async: get the shared GPU device. Returns null if unavailable.
 * Cached — subsequent calls return the same result.
 */
export async function getGPUDevice(): Promise<GPUDevice | null> {
  if (cachedDevice !== undefined) return cachedDevice;
  if (devicePromise) return devicePromise;

  devicePromise = initDevice();
  const result = await devicePromise;
  cachedDevice = result;
  devicePromise = null;
  return result;
}

async function initDevice(): Promise<GPUDevice | null> {
  try {
    if (!isWebGPUAvailable()) {
      console.info("[anchors/gpu] WebGPU not available.");
      return null;
    }

    const adapter = await navigator.gpu.requestAdapter();
    if (!adapter) {
      console.info("[anchors/gpu] No GPU adapter found.");
      return null;
    }

    const device = await adapter.requestDevice();
    if (!device) {
      console.info("[anchors/gpu] Failed to request GPU device.");
      return null;
    }

    device.lost.then((info) => {
      console.warn("[anchors/gpu] GPU device lost:", info.message);
      cachedDevice = null;
    });

    console.info("[anchors/gpu] GPU device initialized successfully.");
    return device;
  } catch (err) {
    console.warn("[anchors/gpu] GPU initialization failed:", err);
    return null;
  }
}
