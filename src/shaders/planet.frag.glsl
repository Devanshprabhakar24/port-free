uniform vec3 uColor;
uniform vec3 uGlowColor;
uniform float uTime;
uniform int uType;

varying vec3 vNormal;
varying vec3 vPosition;
varying vec2 vUv;

vec3 mod289(vec3 x) { return x - floor(x * (1.0/289.0)) * 289.0; }
vec4 mod289(vec4 x) { return x - floor(x * (1.0/289.0)) * 289.0; }
vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

float snoise(vec3 v) {
  const vec2 C = vec2(1.0/6.0, 1.0/3.0);
  vec3 i  = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);
  vec3 g  = step(x0.yzx, x0.xyz);
  vec3 l  = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);
  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy;
  vec3 x3 = x0 - 0.5;
  i = mod289(i);
  vec4 p = permute(permute(permute(
    i.z + vec4(0.0, i1.z, i2.z, 1.0))
    + i.y + vec4(0.0, i1.y, i2.y, 1.0))
    + i.x + vec4(0.0, i1.x, i2.x, 1.0));
  vec4 j  = p - 49.0 * floor(p * (1.0/49.0));
  vec4 x_ = floor(j * (1.0/7.0));
  vec4 y_ = floor(j - 7.0 * x_);
  vec4 x  = x_ * (1.0/7.0) + 0.071428571428571;
  vec4 y  = y_ * (1.0/7.0) + 0.071428571428571;
  vec4 h  = 1.0 - abs(x) - abs(y);
  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);
  vec4 s0 = floor(b0)*2.0 + 1.0;
  vec4 s1 = floor(b1)*2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));
  vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;
  vec3 g0 = vec3(a0.xy, h.x);
  vec3 g1 = vec3(a0.zw, h.y);
  vec3 g2 = vec3(a1.xy, h.z);
  vec3 g3 = vec3(a1.zw, h.w);
  vec4 norm = taylorInvSqrt(vec4(dot(g0,g0), dot(g1,g1), dot(g2,g2), dot(g3,g3)));
  g0 *= norm.x; g1 *= norm.y; g2 *= norm.z; g3 *= norm.w;
  vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
  m = m * m;
  return 42.0 * dot(m*m, vec4(dot(g0,x0), dot(g1,x1), dot(g2,x2), dot(g3,x3)));
}

float fbm(vec3 p, int octaves) {
  float val = 0.0; float amp = 0.5; float freq = 1.0;
  for (int i = 0; i < 8; i++) {
    if (i >= octaves) break;
    val += amp * snoise(p * freq);
    amp *= 0.5; freq *= 2.0;
  }
  return val;
}

void main() {
  // --- Lighting ---
  vec3 lightDir = normalize(vec3(0.6, 0.4, 1.0));
  float diffuse = max(dot(vNormal, lightDir), 0.0);
  // Soft terminator — Minnaert-style
  float terminator = pow(diffuse, 0.65);

  // --- Fresnel rim ---
  vec3 viewDir = normalize(-vPosition);
  float fresnel = pow(1.0 - max(dot(vNormal, viewDir), 0.0), 3.5);

  // --- Specular ---
  vec3 halfVec = normalize(lightDir + viewDir);
  float spec = pow(max(dot(vNormal, halfVec), 0.0), 48.0) * 0.35;

  // --- Surface ---
  vec3 surfacePos = vUv.x > 0.0 ? vec3(vUv * 3.0, uTime * 0.012) : vPosition;
  vec3 col = uColor;

  if (uType == 1) {
    // Earth: deep ocean + continent noise + cloud wisps
    float oceanNoise  = fbm(surfacePos * 2.2, 5);
    float continentMask = smoothstep(0.05, 0.35, fbm(surfacePos * 1.6, 6));
    vec3  ocean    = mix(vec3(0.04, 0.12, 0.38), vec3(0.10, 0.28, 0.62), oceanNoise * 0.5 + 0.5);
    vec3  land     = mix(vec3(0.14, 0.34, 0.12), vec3(0.24, 0.50, 0.18), fbm(surfacePos * 3.5, 4) * 0.5 + 0.5);
    // Snow caps near poles (vUv.y proxy)
    float pole = smoothstep(0.72, 0.92, abs(vUv.y - 0.5) * 2.0);
    vec3  snow = vec3(0.88, 0.92, 0.98);
    col = mix(ocean, land, continentMask);
    col = mix(col, snow, pole);
    // Cloud layer
    float cloud = smoothstep(0.18, 0.55, fbm(surfacePos * 2.8 + 0.7, 5) * 0.5 + 0.5);
    col = mix(col, vec3(0.82, 0.88, 0.96), cloud * 0.72);
    // Atmosphere tint on fresnel
    vec3 atmo = vec3(0.35, 0.62, 1.0);
    col = mix(col, atmo, fresnel * 0.6);

  } else if (uType == 2) {
    // Gas giant: horizontal turbulent bands
    float lat = vUv.y;
    float bandNoise = snoise(vec3(surfacePos.x * 0.8, lat * 6.0, uTime * 0.008)) * 0.18;
    float band = sin((lat + bandNoise) * 12.0) * 0.5 + 0.5;
    vec3  darkBand  = uColor * 0.55;
    vec3  lightBand = mix(uColor * 1.35, vec3(0.98, 0.90, 0.72), 0.3);
    col = mix(darkBand, lightBand, band);
    // Storm oval (Great Red Spot style)
    vec2  stormCenter = vec2(0.28, 0.44);
    float stormDist = length(vUv - stormCenter) * 3.5;
    float storm = smoothstep(0.55, 0.0, stormDist);
    col = mix(col, vec3(0.72, 0.22, 0.08), storm * 0.55);
    col = mix(col, vec3(0.30, 0.55, 1.0), fresnel * 0.25);

  } else if (uType == 3) {
    // Rocky: crater noise + subtle dust
    float rocky = fbm(surfacePos * 3.0, 6);
    col = mix(uColor * 0.6, uColor * 1.2, rocky * 0.5 + 0.5);
    col = mix(col, vec3(0.55, 0.50, 0.45), fresnel * 0.3);

  } else {
    // Generic icy/alien
    float n = fbm(surfacePos * 2.5, 4);
    col = mix(uColor * 0.7, uColor * 1.3, n * 0.5 + 0.5);
    col = mix(col, uGlowColor * 0.5, fresnel * 0.4);
  }

  // --- Apply lighting ---
  vec3 ambient = col * 0.08;
  col = col * terminator + ambient + spec;
  // Night side deep dark (not pure black)
  col = mix(col * 0.06, col, smoothstep(0.0, 0.18, diffuse));

  // --- Outer atmosphere glow (rim) ---
  col += uGlowColor * fresnel * 0.55 * max(0.3, terminator);

  gl_FragColor = vec4(col, 1.0);
}
