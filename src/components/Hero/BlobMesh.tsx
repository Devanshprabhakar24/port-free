import { shaderMaterial } from '@react-three/drei'
import { extend, useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import fragmentShader from '../../shaders/blob.frag.glsl'
import vertexShader from '../../shaders/blob.vert.glsl'

type BlobMaterialUniforms = {
  uTime: number
  uMouse: THREE.Vector2
}

const BlobMaterial = shaderMaterial(
  {
    uTime: 0,
    uMouse: new THREE.Vector2(0, 0),
  } as BlobMaterialUniforms,
  vertexShader,
  fragmentShader,
)

extend({ BlobMaterial })

export default function BlobMesh({
  mouseX,
  mouseY,
}: {
  mouseX: number
  mouseY: number
}) {
  const groupRef = useRef<THREE.Group>(null)
  const matRef = useRef<THREE.ShaderMaterial & BlobMaterialUniforms>(null)

  const wireMaterial = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: new THREE.Color('#f0abfc'),
        wireframe: true,
        transparent: true,
        opacity: 0.25,
      }),
    [],
  )

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()

    if (groupRef.current) {
      groupRef.current.rotation.y += 0.003
      groupRef.current.rotation.x = THREE.MathUtils.lerp(
        groupRef.current.rotation.x,
        mouseY * 0.4,
        0.05,
      )
      groupRef.current.rotation.y = THREE.MathUtils.lerp(
        groupRef.current.rotation.y,
        mouseX * 0.45,
        0.05,
      )
    }

    if (matRef.current) {
      matRef.current.uniforms.uTime.value = t
      matRef.current.uniforms.uMouse.value.set(mouseX, mouseY)
    }
  })

  return (
    <group ref={groupRef}>
      <mesh>
        <icosahedronGeometry args={[1.4, 28]} />
        {/* @ts-expect-error custom material is registered via extend */}
        <blobMaterial ref={matRef} transparent />
      </mesh>
      <mesh material={wireMaterial} scale={1.04}>
        <icosahedronGeometry args={[1.4, 7]} />
      </mesh>
    </group>
  )
}
