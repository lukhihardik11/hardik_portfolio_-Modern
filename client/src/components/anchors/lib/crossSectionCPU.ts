/**
 * CPU-based SDF ray marcher for the cross-section.
 * Ports the exact WGSL shader logic to TypeScript for Canvas 2D rendering.
 * Same optical model: Fresnel (Schlick), Beer-Lambert, Blinn-Phong specular,
 * deformation-coupled normals, preset concavity, pointer-responsive deformation.
 *
 * Renders at reduced resolution then upscales for performance.
 * Source boundary: anchors/lib/ only.
 */

// --- Vector math helpers ---
type V3 = [number, number, number];

function v3add(a: V3, b: V3): V3 { return [a[0]+b[0], a[1]+b[1], a[2]+b[2]]; }
function v3sub(a: V3, b: V3): V3 { return [a[0]-b[0], a[1]-b[1], a[2]-b[2]]; }
function v3mul(a: V3, s: number): V3 { return [a[0]*s, a[1]*s, a[2]*s]; }
function v3mulv(a: V3, b: V3): V3 { return [a[0]*b[0], a[1]*b[1], a[2]*b[2]]; }
function v3dot(a: V3, b: V3): number { return a[0]*b[0]+a[1]*b[1]+a[2]*b[2]; }
function v3len(a: V3): number { return Math.sqrt(v3dot(a, a)); }
function v3norm(a: V3): V3 { const l = v3len(a); return l > 0 ? [a[0]/l, a[1]/l, a[2]/l] : [0,0,0]; }
function v3max(a: V3, b: V3): V3 { return [Math.max(a[0],b[0]), Math.max(a[1],b[1]), Math.max(a[2],b[2])]; }
function v3abs(a: V3): V3 { return [Math.abs(a[0]), Math.abs(a[1]), Math.abs(a[2])]; }
function v3cross(a: V3, b: V3): V3 {
  return [a[1]*b[2]-a[2]*b[1], a[2]*b[0]-a[0]*b[2], a[0]*b[1]-a[1]*b[0]];
}
function clamp01(x: number): number { return Math.max(0, Math.min(1, x)); }

// --- Optical functions ---
function fresnelSchlick(cosTheta: number, ior: number): number {
  const r0b = (1 - ior) / (1 + ior);
  const r0 = r0b * r0b;
  return r0 + (1 - r0) * Math.pow(clamp01(1 - cosTheta), 5);
}

function beerLambert(thickness: number, absorptionColor: V3, strength: number): V3 {
  return [
    absorptionColor[0] * Math.exp(-strength * thickness),
    absorptionColor[1] * Math.exp(-strength * thickness),
    absorptionColor[2] * Math.exp(-strength * thickness),
  ];
}

// --- SDF ---
function sdRoundBox(p: V3, b: V3, r: number): number {
  const q: V3 = [Math.abs(p[0]) - b[0] + r, Math.abs(p[1]) - b[1] + r, Math.abs(p[2]) - b[2] + r];
  const qMax: V3 = [Math.max(q[0], 0), Math.max(q[1], 0), Math.max(q[2], 0)];
  return v3len(qMax) + Math.min(Math.max(q[0], Math.max(q[1], q[2])), 0) - r;
}

export interface CrossSectionUniforms {
  width: number;
  height: number;
  pointerX: number;
  pointerY: number;
  deformAmount: number;
  bgColor: V3;
  fresnelMul: number;
  scatterStrength: number;
  specularIntensity: number;
  jellyColor: V3;
  maxSteps: number;
  presetDeform: number;
}

function sceneSDF(p: V3, u: CrossSectionUniforms): number {
  const hs: V3 = [0.9, 0.25, 0.5];
  const dp: V3 = [p[0], p[1], p[2]];
  // Preset concavity
  const pg = Math.exp(-(p[0]*p[0] + p[2]*p[2]) * 1.5);
  dp[1] += u.presetDeform * pg;
  // Pointer deformation
  const pdx = p[0] - u.pointerX;
  const pdy = p[2] - u.pointerY;
  const ig = Math.exp(-(pdx*pdx + pdy*pdy) * 3.0);
  dp[1] -= u.deformAmount * ig;
  return sdRoundBox(dp, hs, 0.12);
}

function calcNormal(p: V3, u: CrossSectionUniforms): V3 {
  const e = 0.001;
  return v3norm([
    sceneSDF([p[0]+e, p[1], p[2]], u) - sceneSDF([p[0]-e, p[1], p[2]], u),
    sceneSDF([p[0], p[1]+e, p[2]], u) - sceneSDF([p[0], p[1]-e, p[2]], u),
    sceneSDF([p[0], p[1], p[2]+e], u) - sceneSDF([p[0], p[1], p[2]-e], u),
  ]);
}

/**
 * Render the cross-section to an ImageData buffer.
 * renderWidth/renderHeight should be smaller than display size for performance.
 */
export function renderCrossSectionCPU(
  imageData: ImageData,
  u: CrossSectionUniforms
): void {
  const w = imageData.width;
  const h = imageData.height;
  const data = imageData.data;
  const asp = w / h;

  // Camera setup (orthographic, 18° elevation)
  const elev = 18 * Math.PI / 180;
  const azim = 5 * Math.PI / 180;
  const cd = v3norm([-Math.sin(azim)*Math.cos(elev), -Math.sin(elev), -Math.cos(azim)*Math.cos(elev)]);
  const cr = v3norm(v3cross(cd, [0, 1, 0]));
  const cu = v3norm(v3cross(cr, cd));
  const sc = 1.6;
  const ld = v3norm([0.4, 0.8, 0.3]);
  const ms = Math.min(u.maxSteps, 48);

  for (let py = 0; py < h; py++) {
    for (let px = 0; px < w; px++) {
      const uvx = px / w;
      const uvy = py / h;
      const spx = (uvx - 0.5) * asp * sc;
      const spy = (uvy - 0.5) * sc;
      const ro: V3 = v3add(v3add([0, 0.6, 2.5], v3mul(cr, spx)), v3mul(cu, spy));
      const rd = cd;

      // Ray march
      let t = 0;
      let hit = false;
      let hp: V3 = [0, 0, 0];
      for (let i = 0; i < ms; i++) {
        const p: V3 = v3add(ro, v3mul(rd, t));
        const d = sceneSDF(p, u);
        if (d < 0.001) { hit = true; hp = p; break; }
        t += d;
        if (t > 10) break;
      }

      const idx = (py * w + px) * 4;
      if (!hit) {
        data[idx]   = u.bgColor[0] * 255;
        data[idx+1] = u.bgColor[1] * 255;
        data[idx+2] = u.bgColor[2] * 255;
        data[idx+3] = 255;
        continue;
      }

      // Shading
      const n = calcNormal(hp, u);
      const vd: V3 = v3mul(rd, -1);
      const nv = Math.max(v3dot(n, vd), 0);
      const fr = fresnelSchlick(nv, 1.42) * u.fresnelMul;

      // Beer-Lambert subsurface scattering
      const th = Math.max(0.5 - Math.abs(hp[1]), 0.05);
      const sc2 = beerLambert(th, u.jellyColor, u.scatterStrength);

      // Specular
      const hv = v3norm(v3add(ld, vd));
      const nh = Math.max(v3dot(n, hv), 0);
      const spec = Math.pow(nh, 10) * u.specularIntensity;

      // Diffuse + AO
      const nl = Math.max(v3dot(n, ld), 0);
      const diff = nl * 0.6 + 0.4;
      const ao = 0.7 + 0.3 * clamp01((hp[1] + 0.25) / 0.5);

      // Combine
      const interior = v3mul(v3mul(sc2, diff), ao);
      const surface: V3 = [spec + fr * 0.95, spec + fr * 0.95, spec + fr * 0.95];
      const frClamped = clamp01(fr) * 0.6;
      const mixed: V3 = [
        interior[0] * (1 - frClamped) + surface[0] * frClamped,
        interior[1] * (1 - frClamped) + surface[1] * frClamped,
        interior[2] * (1 - frClamped) + surface[2] * frClamped,
      ];
      const col: V3 = [
        mixed[0] * 0.85 + interior[0] * 0.15,
        mixed[1] * 0.85 + interior[1] * 0.15,
        mixed[2] * 0.85 + interior[2] * 0.15,
      ];
      const finalCol: V3 = [
        u.bgColor[0] * 0.15 + col[0] * 0.85,
        u.bgColor[1] * 0.15 + col[1] * 0.85,
        u.bgColor[2] * 0.15 + col[2] * 0.85,
      ];

      data[idx]   = clamp01(finalCol[0]) * 255;
      data[idx+1] = clamp01(finalCol[1]) * 255;
      data[idx+2] = clamp01(finalCol[2]) * 255;
      data[idx+3] = 255;
    }
  }
}
