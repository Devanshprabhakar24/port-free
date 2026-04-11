uniform float uTime;
uniform vec2 uMouse;
varying vec3 vPosition;
varying vec3 vNormal;

float hash(float n) {
  return fract(sin(n) * 43758.5453123);
}

void main() {
  vNormal = normal;
  vec3 pos = position;

  float waveA = sin((pos.y + uTime * 0.7) * 4.0) * 0.08;
  float waveB = sin((pos.x * 3.5 - uTime * 1.2)) * 0.06;
  float mouseInfluence = (uMouse.x * normal.x + uMouse.y * normal.y) * 0.22;

  pos += normal * (waveA + waveB + mouseInfluence);
  vPosition = pos;

  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}
