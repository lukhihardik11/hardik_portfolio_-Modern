/**
 * Cross-section WGSL shader
 * Source boundary: anchors/lib/ only.
 */

export const crossSectionVertexCode = /* wgsl */ `
@vertex
fn main(@builtin(vertex_index) vi: u32) -> @builtin(position) vec4f {
  var pos = array<vec2f, 4>(
    vec2f(-1.0, -1.0), vec2f(1.0, -1.0),
    vec2f(-1.0, 1.0), vec2f(1.0, 1.0)
  );
  return vec4f(pos[vi], 0.0, 1.0);
}
`;

export const crossSectionFragmentCode = /* wgsl */ `
struct Uniforms {
  resolution: vec2f,
  time: f32,
  pointerX: f32,
  pointerY: f32,
  deformAmount: f32,
  bgR: f32, bgG: f32, bgB: f32,
  fresnelMul: f32,
  scatterStrength: f32,
  specularIntensity: f32,
  jellyR: f32, jellyG: f32, jellyB: f32,
  maxSteps: f32,
  presetDeform: f32,
};
@group(0) @binding(0) var<uniform> u: Uniforms;

fn fresnelSchlick(ct: f32, ior: f32) -> f32 {
  let r0b = (1.0 - ior) / (1.0 + ior);
  let r0 = r0b * r0b;
  return r0 + (1.0 - r0) * pow(clamp(1.0 - ct, 0.0, 1.0), 5.0);
}

fn beerLambert(th: f32, ac: vec3f, s: f32) -> vec3f {
  return ac * exp(-s * th);
}

fn sdRoundBox(p: vec3f, b: vec3f, r: f32) -> f32 {
  let q = abs(p) - b + vec3f(r);
  return length(max(q, vec3f(0.0))) + min(max(q.x, max(q.y, q.z)), 0.0) - r;
}

fn sceneSDF(p: vec3f) -> f32 {
  let hs = vec3f(0.9, 0.25, 0.5);
  var dp = p;
  let pg = exp(-dot(p.xz, p.xz) * 1.5);
  dp.y = dp.y + u.presetDeform * pg;
  let pp = vec2f(u.pointerX, u.pointerY);
  let pd = vec2f(p.x - pp.x, p.z - pp.y);
  let ig = exp(-dot(pd, pd) * 3.0);
  dp.y = dp.y - u.deformAmount * ig;
  return sdRoundBox(dp, hs, 0.12);
}

fn calcNormal(p: vec3f) -> vec3f {
  let e = 0.001;
  return normalize(vec3f(
    sceneSDF(p + vec3f(e, 0, 0)) - sceneSDF(p - vec3f(e, 0, 0)),
    sceneSDF(p + vec3f(0, e, 0)) - sceneSDF(p - vec3f(0, e, 0)),
    sceneSDF(p + vec3f(0, 0, e)) - sceneSDF(p - vec3f(0, 0, e))
  ));
}

@fragment
fn main(@builtin(position) fp: vec4f) -> @location(0) vec4f {
  let uv = fp.xy / u.resolution;
  let asp = u.resolution.x / u.resolution.y;
  let elev = radians(18.0);
  let azim = radians(5.0);
  let cd = normalize(vec3f(-sin(azim)*cos(elev), -sin(elev), -cos(azim)*cos(elev)));
  let cr = normalize(cross(cd, vec3f(0.0, 1.0, 0.0)));
  let cu = normalize(cross(cr, cd));
  let sc = 1.6;
  let sp = vec2f((uv.x - 0.5) * asp * sc, (uv.y - 0.5) * sc);
  let ro = vec3f(0.0, 0.6, 2.5) + cr * sp.x + cu * sp.y;
  let rd = cd;
  let ld = normalize(vec3f(0.4, 0.8, 0.3));
  let bg = vec3f(u.bgR, u.bgG, u.bgB);
  let ms = i32(u.maxSteps);
  var t = 0.0;
  var hit = false;
  var hp = vec3f(0.0);
  for (var i = 0; i < 48; i = i + 1) {
    if (i >= ms) { break; }
    let p = ro + rd * t;
    let d = sceneSDF(p);
    if (d < 0.001) { hit = true; hp = p; break; }
    t = t + d;
    if (t > 10.0) { break; }
  }
  if (!hit) { return vec4f(bg, 1.0); }
  let n = calcNormal(hp);
  let vd = -rd;
  let nv = max(dot(n, vd), 0.0);
  let fr = fresnelSchlick(nv, 1.42) * u.fresnelMul;
  let th = max(0.5 - abs(hp.y), 0.05);
  let jc = vec3f(u.jellyR, u.jellyG, u.jellyB);
  let sc2 = beerLambert(th, jc, u.scatterStrength);
  let hv = normalize(ld + vd);
  let nh = max(dot(n, hv), 0.0);
  let spec = pow(nh, 10.0) * u.specularIntensity;
  let nl = max(dot(n, ld), 0.0);
  let diff = nl * 0.6 + 0.4;
  let ao = 0.7 + 0.3 * clamp((hp.y + 0.25) / 0.5, 0.0, 1.0);
  let interior = sc2 * diff * ao;
  let surface = vec3f(spec) + fr * vec3f(0.95);
  let col = mix(interior, surface, clamp(fr, 0.0, 0.6)) * 0.85 + interior * 0.15;
  let final_col = mix(bg, col, 0.85);
  return vec4f(final_col, 1.0);
}
`;
