/**
 * Toggle WGSL shader — anchors/lib/toggleShader.wgsl.ts
 *
 * SDF scene: ellipsoid knob on rounded box track.
 * Same optical model (Fresnel, specular) at reduced ray march steps (24).
 * Knob position driven by spring solver.
 *
 * Source boundary: this file lives in anchors/lib/ only.
 */

export const toggleVertexCode = /* wgsl */ `
@vertex
fn main(@builtin(vertex_index) vi: u32) -> @builtin(position) vec4f {
  var pos = array<vec2f, 4>(
    vec2f(-1.0, -1.0), vec2f(1.0, -1.0),
    vec2f(-1.0, 1.0), vec2f(1.0, 1.0)
  );
  return vec4f(pos[vi], 0.0, 1.0);
}
`;

export const toggleFragmentCode = /* wgsl */ `
struct Uniforms {
  resolution: vec2f,
  knobPos: f32,
  squashX: f32,
  squashZ: f32,
  bgR: f32, bgG: f32, bgB: f32,
  trackR: f32, trackG: f32, trackB: f32,
  knobR: f32, knobG: f32, knobB: f32,
  isActive: f32,
  _pad: f32,
};
@group(0) @binding(0) var<uniform> u: Uniforms;

fn fresnelSchlick(ct: f32, ior: f32) -> f32 {
  let r0b = (1.0 - ior) / (1.0 + ior);
  let r0 = r0b * r0b;
  return r0 + (1.0 - r0) * pow(clamp(1.0 - ct, 0.0, 1.0), 5.0);
}

fn sdEllipsoid(p: vec3f, r: vec3f) -> f32 {
  let k0 = length(p / r);
  let k1 = length(p / (r * r));
  return k0 * (k0 - 1.0) / k1;
}

fn sdRoundBox(p: vec3f, b: vec3f, r: f32) -> f32 {
  let q = abs(p) - b + vec3f(r);
  return length(max(q, vec3f(0.0))) + min(max(q.x, max(q.y, q.z)), 0.0) - r;
}

fn sceneSDF(p: vec3f) -> f32 {
  let trackD = sdRoundBox(p, vec3f(0.85, 0.32, 0.32), 0.28);
  let knobCenter = vec3f(u.knobPos, 0.0, 0.0);
  let knobP = p - knobCenter;
  let knobR = vec3f(0.28 * (1.0 + u.squashX * 0.15), 0.28, 0.28 * (1.0 + u.squashZ * 0.1));
  let knobD = sdEllipsoid(knobP, knobR);
  return min(trackD, knobD);
}

fn calcNormal(p: vec3f) -> vec3f {
  let e = 0.001;
  return normalize(vec3f(
    sceneSDF(p + vec3f(e, 0, 0)) - sceneSDF(p - vec3f(e, 0, 0)),
    sceneSDF(p + vec3f(0, e, 0)) - sceneSDF(p - vec3f(0, e, 0)),
    sceneSDF(p + vec3f(0, 0, e)) - sceneSDF(p - vec3f(0, 0, e))
  ));
}

fn isKnob(p: vec3f) -> bool {
  let knobCenter = vec3f(u.knobPos, 0.0, 0.0);
  let knobP = p - knobCenter;
  let knobR = vec3f(0.28 * (1.0 + u.squashX * 0.15), 0.28, 0.28 * (1.0 + u.squashZ * 0.1));
  return sdEllipsoid(knobP, knobR) < 0.01;
}

@fragment
fn main(@builtin(position) fp: vec4f) -> @location(0) vec4f {
  let uv = fp.xy / u.resolution;
  let asp = u.resolution.x / u.resolution.y;
  let cd = normalize(vec3f(0.0, -0.3, -1.0));
  let cr = normalize(cross(cd, vec3f(0.0, 1.0, 0.0)));
  let cu = normalize(cross(cr, cd));
  let sc = 1.8;
  let sp = vec2f((uv.x - 0.5) * asp * sc, (uv.y - 0.5) * sc);
  let ro = vec3f(0.0, 0.8, 2.0) + cr * sp.x + cu * sp.y;
  let rd = cd;
  let ld = normalize(vec3f(0.3, 0.8, 0.4));
  let bg = vec3f(u.bgR, u.bgG, u.bgB);
  var t = 0.0;
  var hit = false;
  var hp = vec3f(0.0);
  for (var i = 0; i < 24; i = i + 1) {
    let p = ro + rd * t;
    let d = sceneSDF(p);
    if (d < 0.001) { hit = true; hp = p; break; }
    t = t + d;
    if (t > 5.0) { break; }
  }
  if (!hit) { return vec4f(bg, 0.0); }
  let n = calcNormal(hp);
  let vd = -rd;
  let nv = max(dot(n, vd), 0.0);
  let fr = fresnelSchlick(nv, 1.42) * 1.5;
  let hv = normalize(ld + vd);
  let nh = max(dot(n, hv), 0.0);
  let spec = pow(nh, 10.0) * 0.4;
  let nl = max(dot(n, ld), 0.0);
  let diff = nl * 0.6 + 0.4;
  var baseColor: vec3f;
  if (isKnob(hp)) {
    baseColor = vec3f(u.knobR, u.knobG, u.knobB);
  } else {
    baseColor = vec3f(u.trackR, u.trackG, u.trackB);
  }
  let col = baseColor * diff + vec3f(spec) + fr * vec3f(0.15);
  return vec4f(col, 1.0);
}
`;
