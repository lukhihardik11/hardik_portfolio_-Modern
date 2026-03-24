/**
 * Shared optical functions — WGSL snippets for Fresnel and Beer-Lambert
 *
 * Adapted from JellySwitch.zip src/utils.ts.
 * These WGSL code strings are imported by both shader files
 * to ensure material consistency between cross-section and toggle.
 *
 * Source boundary: this file lives in anchors/lib/ only.
 */

/**
 * Schlick approximation for Fresnel reflectance.
 * r0 = ((1 - ior) / (1 + ior))^2
 * F = r0 + (1 - r0) * (1 - cosTheta)^5
 */
export const fresnelSchlickWGSL = /* wgsl */ `
fn fresnelSchlick(cosTheta: f32, ior: f32) -> f32 {
  let r0_base = (1.0 - ior) / (1.0 + ior);
  let r0 = r0_base * r0_base;
  return r0 + (1.0 - r0) * pow(clamp(1.0 - cosTheta, 0.0, 1.0), 5.0);
}
`;

/**
 * Beer-Lambert absorption for subsurface scattering.
 * Exponential decay based on path length through the material.
 */
export const beerLambertWGSL = /* wgsl */ `
fn beerLambert(thickness: f32, absorptionColor: vec3f, scatterStrength: f32) -> vec3f {
  return absorptionColor * exp(-scatterStrength * thickness);
}
`;

/**
 * Material constants — adapted from JellySwitch.zip src/constants.ts
 * Scatter and specular reduced for visual weight calibration (Gate 2, C6).
 */
export const JELLY_IOR = 1.42;
export const JELLY_SCATTER_STRENGTH = 2.5; // Source: 3.0, reduced for portfolio
export const SPECULAR_POWER = 10;
export const SPECULAR_INTENSITY = 0.4; // Source: 0.6, reduced for portfolio
export const FRESNEL_MULTIPLIER_DEFAULT = 1.0; // Tunable 1.0-2.5
