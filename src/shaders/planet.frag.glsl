precision mediump float;

uniform sampler2D uTexture;
uniform sampler2D uCloudTex;
uniform vec3  uAtmoColor;
uniform float uTime;
uniform float uHasClouds;     // 1.0 for Earth, 0.0 for others
uniform float uAtmoThickness; // 0.0 = none, 1.0 = thick

varying vec3 vNormal;
varying vec3 vPosition;
varying vec2 vUv;
varying vec3 vWorldNormal;

// ─── ACES filmic tonemapping ──────────────────────────────────────────────
vec3 aces(vec3 x){
  return clamp((x*(2.51*x+0.03))/(x*(2.43*x+0.59)+0.14),0.0,1.0);
}

void main(){
  vec3 L = normalize(vec3(0.68, 0.25, 0.90));
  vec3 V = normalize(-vPosition);
  vec3 N = normalize(vNormal);
  vec3 H = normalize(L + V);

  float NdL = dot(N, L);
  float NdV = max(dot(N, V), 0.0);
  float NdH = max(dot(N, H), 0.0);
  float VdL = dot(V, L);

  // ── Physically-based diffuse ──
  float diffuse = smoothstep(-0.32, 0.65, NdL);
  // Realistic limb darkening
  float limbDark = pow(NdV, 0.30) * (0.88 + 0.12 * NdV);
  // Fresnel
  float fresnel = pow(1.0 - NdV, 4.2);

  // ── Sample the planet surface texture ──
  vec3 surfaceCol = texture2D(uTexture, vUv).rgb;
  // Slight gamma correction for sRGB textures
  surfaceCol = pow(surfaceCol, vec3(2.2));

  // ── Cloud layer (Earth only) ──
  float cloudMask = 0.0;
  vec3 cloudCol = vec3(0.0);
  if (uHasClouds > 0.5) {
    // Animated cloud UVs — slowly drifting
    vec2 cloudUV = vUv;
    cloudUV.x = fract(cloudUV.x + uTime * 0.003);
    float cloudAlpha = texture2D(uCloudTex, cloudUV).r;
    cloudMask = smoothstep(0.25, 0.65, cloudAlpha);

    // Cloud self-shadowing: lit from sun side
    float cloudLighting = smoothstep(0.0, 0.8, NdL);
    vec3 cloudBright = vec3(1.0, 0.99, 0.97);
    vec3 cloudShadow = vec3(0.45, 0.48, 0.55);
    cloudCol = mix(cloudShadow, cloudBright, cloudLighting);

    // Shadow clouds cast on surface
    surfaceCol *= 1.0 - cloudMask * 0.25 * diffuse;
  }

  // ── Specular — tight sun glint ──
  float spec = pow(NdH, 260.0) * 0.18;
  float specBroad = pow(NdH, 40.0) * 0.025;

  // ── Apply lighting ──
  vec3 lit = surfaceCol * diffuse * limbDark;
  vec3 ambient = surfaceCol * 0.025;
  lit += ambient;
  lit += vec3(spec + specBroad) * diffuse;

  // ── Blend clouds ──
  if (uHasClouds > 0.5) {
    lit = mix(lit, cloudCol * diffuse * limbDark, cloudMask * 0.80);
  }

  // ── Night side ──
  float nightT = smoothstep(-0.28, 0.06, NdL);
  vec3 nightTint = surfaceCol * 0.008;
  lit = mix(nightTint, lit, nightT);

  // ── Atmospheric scattering ──
  if (uAtmoThickness > 0.01) {
    // Rayleigh scattering — blue rim
    float rayleighPhase = 0.75 * (1.0 + VdL * VdL);
    vec3 rayleigh = uAtmoColor * rayleighPhase * fresnel * uAtmoThickness * 0.45;

    // Mie forward scattering — bright halo
    float cosAngle = max(VdL, 0.0);
    float miePhase = pow(cosAngle, 10.0) * 0.25;
    vec3 mie = mix(uAtmoColor, vec3(1.0, 0.95, 0.88), 0.3) * miePhase * fresnel * uAtmoThickness * 0.3;

    // Terminator glow — sunset reddening
    float terminator = smoothstep(-0.12, 0.08, NdL) * smoothstep(0.22, 0.03, NdL);
    vec3 termCol = mix(uAtmoColor, vec3(0.90, 0.40, 0.15), 0.50);
    vec3 termGlow = termCol * terminator * fresnel * uAtmoThickness * 0.5;

    // Limb brightening on sunlit side
    float limbBright = fresnel * max(NdL * 0.5 + 0.5, 0.0) * uAtmoThickness * 0.30;
    vec3 limbLight = uAtmoColor * limbBright;

    lit += rayleigh + mie + termGlow + limbLight;
  }

  // ── City lights on night side (Earth only) ──
  if (uHasClouds > 0.5) {
    float nightFace = smoothstep(0.06, -0.22, NdL);
    // Use surface brightness as proxy for populated areas
    float surfBright = dot(surfaceCol, vec3(0.3, 0.5, 0.2));
    float cityMask = smoothstep(0.08, 0.18, surfBright) * (1.0 - smoothstep(0.35, 0.50, surfBright));
    vec3 cityGlow = vec3(1.0, 0.82, 0.42) * cityMask * nightFace * 0.65;
    cityGlow *= (1.0 - cloudMask * 0.9); // clouds block city lights
    lit += cityGlow;
  }

  // ── Final grading ──
  lit = max(lit, vec3(0.0));
  // HDR bloom approximation
  float luma = dot(lit, vec3(0.2126, 0.7152, 0.0722));
  lit += lit * smoothstep(0.80, 1.4, luma) * 0.12;
  // Convert back to sRGB
  lit = pow(aces(lit * 1.08), vec3(1.0 / 2.2));

  gl_FragColor = vec4(lit, 1.0);
}
