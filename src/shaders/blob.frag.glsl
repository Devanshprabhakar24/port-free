uniform float uTime;
varying vec3 vPosition;
varying vec3 vNormal;

void main() {
  vec3 base = vec3(0.486, 0.227, 0.933);
  vec3 accent = vec3(0.925, 0.282, 0.6);
  float fresnel = pow(1.0 - abs(dot(normalize(vNormal), vec3(0.0, 0.0, 1.0))), 2.2);
  float pulse = 0.5 + 0.5 * sin(uTime * 1.2 + vPosition.y * 4.0);

  vec3 color = mix(base, accent, pulse * 0.65) + fresnel * 0.3;
  gl_FragColor = vec4(color, 0.92);
}
