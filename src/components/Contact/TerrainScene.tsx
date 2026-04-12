/* eslint-disable react-hooks/immutability */
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { memo, useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion'

const vertexShader = /* glsl */ `
uniform float uTime;
varying float vHeight;
varying vec3 vWorldPos;

float hash(vec3 p) {
  p = fract(p * 0.3183099 + vec3(0.1, 0.2, 0.3));
  p *= 17.0;
  return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
}

float noise(vec3 p) {
  vec3 i = floor(p);
  vec3 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);

  float n000 = hash(i + vec3(0.0, 0.0, 0.0));
  float n100 = hash(i + vec3(1.0, 0.0, 0.0));
  float n010 = hash(i + vec3(0.0, 1.0, 0.0));
  float n110 = hash(i + vec3(1.0, 1.0, 0.0));
  float n001 = hash(i + vec3(0.0, 0.0, 1.0));
  float n101 = hash(i + vec3(1.0, 0.0, 1.0));
  float n011 = hash(i + vec3(0.0, 1.0, 1.0));
  float n111 = hash(i + vec3(1.0, 1.0, 1.0));

  float nx00 = mix(n000, n100, f.x);
  float nx10 = mix(n010, n110, f.x);
  float nx01 = mix(n001, n101, f.x);
  float nx11 = mix(n011, n111, f.x);
  float nxy0 = mix(nx00, nx10, f.y);
  float nxy1 = mix(nx01, nx11, f.y);

  return mix(nxy0, nxy1, f.z);
}

float fbm(vec3 p) {
  float value = 0.0;
  float amplitude = 0.5;

  for (int i = 0; i < 3; i++) {
    value += amplitude * noise(p);
    p *= 2.0;
    amplitude *= 0.5;
  }

  return value;
}

void main() {
  vec3 pos = position;

  float n = fbm(vec3(pos.xz * 0.32, uTime * 0.4));
  float h = (n - 0.5) * 2.0 * 0.6;

  pos.y += h;

  vHeight = h;
  vec4 worldPos = modelMatrix * vec4(pos, 1.0);
  vWorldPos = worldPos.xyz;

  gl_Position = projectionMatrix * viewMatrix * worldPos;
}
`

const fragmentShader = /* glsl */ `
varying float vHeight;
varying vec3 vWorldPos;

void main() {
  vec3 valley = vec3(0.051, 0.0, 0.125);
  vec3 ridge = vec3(0.298, 0.114, 0.584);

  float normalizedH = clamp((vHeight + 0.6) / 1.2, 0.0, 1.0);
  float ridgeGlow = smoothstep(0.58, 1.0, normalizedH) * 0.25;

  vec3 color = mix(valley, ridge, normalizedH);
  color += vec3(0.486, 0.227, 0.933) * ridgeGlow;

  gl_FragColor = vec4(color, 1.0);
}
`

function TerrainMesh() {
  const terrainRef = useRef<THREE.Mesh>(null)
  const shaderMatRef = useRef<THREE.ShaderMaterial>(null)

  const terrainGeometry = useMemo(() => {
    const geometry = new THREE.PlaneGeometry(20, 20, 80, 80)
    geometry.rotateX(-Math.PI / 2)
    return geometry
  }, [])

  const lineGeometry = useMemo(() => new THREE.WireframeGeometry(terrainGeometry), [terrainGeometry])

  useEffect(() => {
    return () => {
      terrainGeometry.dispose()
      lineGeometry.dispose()
      shaderMatRef.current?.dispose()
    }
  }, [lineGeometry, terrainGeometry])

  useFrame((_, delta) => {
    if (shaderMatRef.current) {
      shaderMatRef.current.uniforms.uTime.value += delta
    }
  })

  return (
    <group rotation={[THREE.MathUtils.degToRad(-20), 0, 0]}>
      <mesh ref={terrainRef} geometry={terrainGeometry} receiveShadow>
        <shaderMaterial
          ref={shaderMatRef}
          vertexShader={vertexShader}
          fragmentShader={fragmentShader}
          uniforms={{ uTime: { value: 0 } }}
          side={THREE.DoubleSide}
        />
      </mesh>

      <lineSegments geometry={lineGeometry}>
        <lineBasicMaterial color="#c4b5fd" transparent opacity={0.02} />
      </lineSegments>
    </group>
  )
}

function CameraRig() {
  const { camera, pointer } = useThree()
  const reducedMotion = usePrefersReducedMotion()

  useFrame(() => {
    const targetX = reducedMotion ? 0 : pointer.x * 0.3
    const targetY = reducedMotion ? 6 : 6 + pointer.y * 0.3

    camera.position.x = THREE.MathUtils.lerp(camera.position.x, targetX, 0.05)
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, targetY, 0.05)
    camera.lookAt(0, 0, 0)
  })

  return null
}

function Scene() {
  const { scene } = useThree()

  useMemo(() => {
    scene.fog = new THREE.FogExp2(0x07070d, 0.08)
  }, [scene])

  return (
    <>
      <ambientLight intensity={0.25} />
      <pointLight position={[0, 8, 0]} color="#7c3aed" intensity={2} />
      <TerrainMesh />
      <CameraRig />
    </>
  )
}

function TerrainScene() {
  return (
    <div
      className="absolute inset-0"
      style={{ zIndex: 0, pointerEvents: 'none' }}
      aria-hidden="true"
    >
      <Canvas
        camera={{ position: [0, 6, 10], fov: 50, near: 0.1, far: 100 }}
        dpr={[1, Math.min(window.devicePixelRatio, 2)]}
        gl={{ antialias: true, alpha: true }}
      >
        <color attach="background" args={['#07070d']} />
        <Scene />
      </Canvas>
    </div>
  )
}

export default memo(TerrainScene)
