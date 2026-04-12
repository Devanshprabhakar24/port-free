precision mediump float;

uniform vec3  uSurfaceA;
uniform vec3  uSurfaceB;
uniform vec3  uAtmoColor;
uniform float uTime;
uniform int   uType;

varying vec3 vNormal;
varying vec3 vPosition;
varying vec2 vUv;
varying vec3 vWorldPos;

vec3 _p3(vec3 x) { return fract(x * vec3(443.897, 441.423, 437.195)) - fract(x * vec3(0.1, 0.1, 0.1)); }
float _dot3(vec3 a, vec3 b) { return a.x * b.x + a.y * b.y + a.z * b.z; }

float snoise(vec3 v) {
  const vec2 C = vec2(1.0/6.0, 1.0/3.0);
  vec3 i = floor(v + dot(v, C.yyy));
  vec3 x0= v -  i + dot(i, C.xxx);
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1= min(g.xyz, l.zxy);
  vec3 i2= max(g.xyz, l.zxy);
  vec3 x1= x0 - i1 + C.xxx;
  vec3 x2= x0 - i2 + C.yyy;
  vec3 x3= x0 - 0.5;
  i = mod(i, 289.0);
  vec4 p = fract((fract(((i.z + vec4(0, i1.z, i2.z, 1))*34.0)+1.0)
               * (i.z + vec4(0, i1.z, i2.z, 1)))*(1.0/41.0)
             + (fract(((i.y + vec4(0, i1.y, i2.y, 1))*34.0)+1.0)
               * (i.y + vec4(0, i1.y, i2.y, 1)))*(1.0/41.0)
             + (fract(((i.x + vec4(0, i1.x, i2.x, 1))*34.0)+1.0)
               * (i.x + vec4(0, i1.x, i2.x, 1)))*(1.0/41.0));
  p = p*2.0 - 1.0;
  vec4 m = max(0.6 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
  m = m*m;
  m = m*m;
  vec4 g4;
  g4.x = dot(fract(p.x * vec3(0.1031, 0.1030, 0.0973))-0.5, x0);
  g4.y = dot(fract(p.y * vec3(0.1031, 0.1030, 0.0973))-0.5, x1);
  g4.z = dot(fract(p.z * vec3(0.1031, 0.1030, 0.0973))-0.5, x2);
  g4.w = dot(fract(p.w * vec3(0.1031, 0.1030, 0.0973))-0.5, x3);
  return 42.0 * dot(m, g4);
}

float fbm4(vec3 p) {
  float v = 0.0;
  float a = 0.5;
  v += a*snoise(p);      p*=2.1; a*=0.5;
  v += a*snoise(p);      p*=2.1; a*=0.5;
  v += a*snoise(p);      p*=2.1; a*=0.5;
  v += a*snoise(p);
  return v;
}

void main() {
  vec3 L = normalize(vec3(0.65, 0.35, 1.0));
  vec3 V = normalize(-vPosition);
  vec3 N = normalize(vNormal);

  float NdL = dot(N, L);
  float diffuse = smoothstep(-0.28, 0.55, NdL);
  float spec = pow(max(dot(reflect(-L, N), V), 0.0), 56.0) * 0.30;
  float fresnel = pow(1.0 - max(dot(N, V), 0.0), 4.2);

  vec3 coord = vWorldPos + uTime * vec3(0.012, 0.008, 0.004);
  vec3 col;

  if (uType == 1) {
    float oceanWave = fbm4(coord * 1.8) * 0.5 + 0.5;
    vec3 deepOcean  = mix(vec3(0.02,0.06,0.28), vec3(0.06,0.20,0.55), oceanWave);

    float landMask = smoothstep(0.11, 0.32, fbm4(coord * 1.5 + 3.7));
    vec3 highland = mix(vec3(0.16,0.36,0.10), vec3(0.28,0.52,0.16), fbm4(coord*3.2)*0.5+0.5);
    vec3 lowland  = mix(vec3(0.22,0.46,0.14), vec3(0.42,0.62,0.22), fbm4(coord*4.1)*0.5+0.5);
    vec3 land     = mix(lowland, highland, fbm4(coord*2.8)*0.5+0.5);

    float tropicMask = smoothstep(0.28, 0.48, abs(vUv.y-0.5)*2.2);
    vec3 sand = mix(vec3(0.68,0.58,0.32), vec3(0.78,0.66,0.38), fbm4(coord*5.0)*0.5+0.5);
    land = mix(land, sand, tropicMask * landMask * 0.45);

    float poleBlend = smoothstep(0.70, 0.92, abs(vUv.y-0.5)*2.0);
    vec3 ice = vec3(0.82, 0.88, 0.98);

    col = mix(deepOcean, land, landMask);
    col = mix(col, ice, poleBlend);

    float cloudN = fbm4(vec3(vWorldPos.x * 3.1, vWorldPos.y * 1.9, vWorldPos.z * 3.1) + uTime * vec3(0.022, 0.010, 0.018));
    float cloud = smoothstep(0.24, 0.62, cloudN * 0.5 + 0.5);
    col = mix(col, vec3(0.80,0.86,0.97), cloud * 0.48);

    spec *= (1.0 - landMask) * (1.0 - cloud * 0.85);
    col = mix(col, vec3(0.28,0.58,1.0), fresnel * 0.65);
  } else if (uType == 2) {
    float lat = vUv.y;
    float turb = fbm4(vec3(coord.x * 1.05 + uTime * 0.02, lat * 9.5, coord.z * 0.22)) * 0.11;
    float band = sin((lat + turb) * 11.2) * 0.5 + 0.5;
    float band2 = sin((lat + turb * 0.5) * 5.9 + 1.2) * 0.5 + 0.5;

    vec3 dark  = uSurfaceA * 0.46;
    vec3 mid   = mix(uSurfaceA, uSurfaceB, 0.5);
    vec3 light = uSurfaceB * 1.24;
    col = mix(dark, mix(mid, light, band2), band);

    vec2 sc = vec2(0.30, 0.46);
    float sd = length((vUv - sc) * vec2(3.2, 5.5));
    float stm = smoothstep(0.6, 0.0, sd);
    vec3 stormCol = mix(vec3(0.62,0.20,0.06), vec3(0.80,0.50,0.30), fbm4(coord*6.0)*0.5+0.5);
    col = mix(col, stormCol, stm * 0.42);

    col = mix(col, uAtmoColor * 0.6, fresnel * 0.30);
    spec *= 0.15;
  } else if (uType == 3) {
    float n1 = fbm4(coord * 2.2) * 0.5 + 0.5;
    float n2 = fbm4(coord * 5.6) * 0.5 + 0.5;
    float terr = smoothstep(0.30, 0.70, n1);
    col = mix(uSurfaceA * 0.62, uSurfaceB * 1.18, terr);
    float craterEdge = smoothstep(0.42, 0.46, n2) * (1.0 - smoothstep(0.46, 0.50, n2));
    col = mix(col, uSurfaceA * 1.40, craterEdge * 0.5);
    col = mix(col, uAtmoColor, fresnel * 0.38);
    spec *= 0.12;
  } else {
    float n = fbm4(coord * 1.9) * 0.5 + 0.5;
    float swirl = fbm4(coord * 3.2 + 1.8) * 0.5 + 0.5;
    col = mix(uSurfaceA * 0.72, uSurfaceB * 1.28, n);
    float streak = smoothstep(0.56, 0.68, swirl);
    col = mix(col, vec3(0.86,0.91,0.98), streak * 0.38);
    col = mix(col, uAtmoColor, fresnel * 0.55);
  }

  vec3 ambient = col * 0.05;
  col = col * diffuse + ambient + vec3(spec);

  float nightBlend = smoothstep(-0.22, 0.14, NdL); // softer transition
  vec3 nightCol = col * 0.09 + uAtmoColor * 0.05;
  // Add subtle blue tint for Earth night side only
  if (uType == 1) {
    nightCol = mix(nightCol, vec3(0.10, 0.16, 0.28), 0.45);
  }
  col = mix(nightCol, col, nightBlend);
  col += uAtmoColor * fresnel * 0.48 * max(0.25, diffuse);

  gl_FragColor = vec4(col, 1.0);
}
