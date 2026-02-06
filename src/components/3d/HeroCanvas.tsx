'use client'

import React, { useMemo, useRef, Suspense } from 'react'
import { Canvas, useFrame, useThree, useLoader, extend } from '@react-three/fiber'
import { PerspectiveCamera, OrbitControls, shaderMaterial } from '@react-three/drei'
import { EffectComposer, Vignette, Noise, Bloom } from '@react-three/postprocessing'
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js'
import * as THREE from 'three'

// ==============================================================================
// 🎛️ КОНФИГ
// ==============================================================================
const CONFIG = {
    colors: {
        base: '#006622', // More saturated base green
        neon: '#00ff44', // More vivid electric green
        background: '#000000',
    },
    physics: {
        radius: 2.0,
        explosionPower: 5.0,
        scatterRandomness: 1.0,
        returnSpeed: 0.005,
    },
    animation: {
        rotationSpeed: 0.05,
        breathSpeed: 0.4,
        breathDepth: 0.04,
    },
    bloom: {
        threshold: 0.4, // Lower threshold to make more points glow
        intensity: 2.8, // Increased intensity
    }
}

// --- ШЕЙДЕРЫ ---
const BaseBrainMaterial = shaderMaterial(
    { color: new THREE.Color(CONFIG.colors.base) },
    `
    varying float vDepth;
    void main() {
      vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
      gl_PointSize = 4.0 * (1.0 / -mvPosition.z); 
      gl_Position = projectionMatrix * mvPosition;
    }
  `,
    `
    uniform vec3 color;
    void main() {
      float dist = length(gl_PointCoord - vec2(0.5));
      if (dist > 0.5) discard;
      gl_FragColor = vec4(color, 0.4); 
    }
  `
)

const NeonFlickerMaterial = shaderMaterial(
    { uTime: 0, uColor: new THREE.Color(CONFIG.colors.neon) },
    `
    varying float vRandom;
    attribute float aRandom; 
    void main() {
      vRandom = aRandom;
      vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
      gl_PointSize = 6.0 * (1.0 / -mvPosition.z);
      gl_Position = projectionMatrix * mvPosition;
    }
  `,
    `
    uniform vec3 uColor;
    uniform float uTime;
    varying float vRandom;

    void main() {
      float dist = length(gl_PointCoord - vec2(0.5));
      if (dist > 0.5) discard;
      float noise = sin(uTime * 3.0 + vRandom * 15.0);
      float flash = smoothstep(0.8, 1.0, noise); 
      float alpha = flash; 
      if (alpha < 0.01) discard;
      gl_FragColor = vec4(uColor, alpha); 
    }
  `
)

extend({ BaseBrainMaterial, NeonFlickerMaterial })

// --- ФИЗИКА ---
const applyPhysics = (positions: any, initialPositions: any, randomness: any, time: any, mouse: any, viewport: any) => {
    const breathScale = 1.0 + Math.sin(time * CONFIG.animation.breathSpeed) * CONFIG.animation.breathDepth;
    const mx = (mouse.x * viewport.width) / 2
    const my = (mouse.y * viewport.height) / 2
    const radius = CONFIG.physics.radius;

    for (let i = 0; i < positions.length; i += 3) {
        const idx = i / 3
        const rnd = randomness[idx] || 0.5
        const targetX = initialPositions[i] * breathScale
        const targetY = initialPositions[i + 1] * breathScale
        const targetZ = initialPositions[i + 2] * breathScale

        const dx = positions[i] - mx
        const dy = positions[i + 1] - my
        const dist = Math.sqrt(dx * dx + dy * dy)

        // Calculate distance from mouse to center (0,0) to check if we are "inside" the brain
        const distToCenter = Math.sqrt(mx * mx + my * my);
        const interactionRadius = 2.5; // Radius of the brain zone where interaction happens

        // Only interact if mouse is within the brain zone
        if (distToCenter < interactionRadius && dist < radius) {
            const dirX = dx / dist;
            const dirY = dy / dist;
            const force = (1.0 - dist / radius) * CONFIG.physics.explosionPower;
            const randomDirX = (randomness[idx] - 0.5) * CONFIG.physics.scatterRandomness;
            const randomDirY = (randomness[(idx + 1) % randomness.length] - 0.5) * CONFIG.physics.scatterRandomness;
            const randomDirZ = (randomness[(idx + 2) % randomness.length] - 0.5) * CONFIG.physics.scatterRandomness;

            positions[i] += ((dirX + randomDirX) * force) * 0.1;
            positions[i + 1] += ((dirY + randomDirY) * force) * 0.1;
            positions[i + 2] += (randomDirZ * force * 2.0) * 0.1;
        } else {
            const returnSpeed = CONFIG.physics.returnSpeed + (rnd * 0.05);
            positions[i] += (targetX - positions[i]) * returnSpeed;
            positions[i + 1] += (targetY - positions[i + 1]) * returnSpeed;
            positions[i + 2] += (targetZ - positions[i + 2]) * returnSpeed;
        }
    }
}

// --- 3D КОМПОНЕНТЫ ---
function BrainBase({ file }: { file: string }) {
    const meshRef = useRef<any>(null)
    const { mouse, viewport } = useThree()
    const obj = useLoader(OBJLoader, file)
    const [positions, initialPositions, randomness] = useMemo(() => {
        // @ts-ignore
        const originalPos = obj.children[0].geometry.attributes.position.array
        const originalCount = originalPos.length / 3

        // OPTIMIZATION: Keep every 2nd point (50% for faster loading)
        const count = Math.floor(originalCount / 2)

        const pos = new Float32Array(count * 3)
        const rnd = new Float32Array(count)

        let ptr = 0
        for (let i = 0; i < originalCount; i += 2) {
            pos[ptr * 3] = originalPos[i * 3]
            pos[ptr * 3 + 1] = originalPos[i * 3 + 1]
            pos[ptr * 3 + 2] = originalPos[i * 3 + 2]

            rnd[ptr] = Math.random()
            ptr++
        }

        return [pos, new Float32Array(pos), rnd]
    }, [obj])

    useFrame((state) => {
        if (!meshRef.current) return;
        const time = state.clock.getElapsedTime()
        applyPhysics(positions, initialPositions, randomness, time, mouse, viewport)
        meshRef.current.geometry.attributes.position.needsUpdate = true
        meshRef.current.rotation.y = time * CONFIG.animation.rotationSpeed
    })

    return (
        <points ref={meshRef}>
            <bufferGeometry>
                <bufferAttribute attach="attributes-position" count={positions.length / 3} array={positions} itemSize={3} />
            </bufferGeometry>
            {/* @ts-ignore */}
            <baseBrainMaterial transparent={true} depthWrite={false} blending={THREE.AdditiveBlending} />
        </points>
    )
}

function BrainNeon({ file }: { file: string }) {
    const meshRef = useRef<any>(null)
    const materialRef = useRef<any>(null)
    const { mouse, viewport } = useThree()
    const obj = useLoader(OBJLoader, file)
    const [positions, initialPositions, randomness, attrRandom] = useMemo(() => {
        // @ts-ignore
        const originalPos = obj.children[0].geometry.attributes.position.array
        const originalCount = originalPos.length / 3

        // OPTIMIZATION: Keep every 3rd point (33% for faster loading)
        const count = Math.floor(originalCount / 3)

        const pos = new Float32Array(count * 3)
        const rnd = new Float32Array(count)
        const aRnd = new Float32Array(count)

        let ptr = 0
        for (let i = 0; i < originalCount; i += 3) {
            pos[ptr * 3] = originalPos[i * 3]
            pos[ptr * 3 + 1] = originalPos[i * 3 + 1]
            pos[ptr * 3 + 2] = originalPos[i * 3 + 2]
            rnd[ptr] = Math.random()
            aRnd[ptr] = Math.random()
            ptr++
        }

        return [pos, new Float32Array(pos), rnd, aRnd]
    }, [obj])

    useFrame((state) => {
        if (!meshRef.current) return;
        const time = state.clock.getElapsedTime()
        if (materialRef.current) materialRef.current.uTime = time;
        applyPhysics(positions, initialPositions, randomness, time, mouse, viewport)
        meshRef.current.geometry.attributes.position.needsUpdate = true
        meshRef.current.rotation.y = time * CONFIG.animation.rotationSpeed
    })

    return (
        <points ref={meshRef}>
            <bufferGeometry>
                <bufferAttribute attach="attributes-position" count={positions.length / 3} array={positions} itemSize={3} />
                <bufferAttribute attach="attributes-aRandom" count={attrRandom.length} array={attrRandom} itemSize={1} />
            </bufferGeometry>
            {/* @ts-ignore */}
            <neonFlickerMaterial ref={materialRef} transparent depthWrite={false} blending={THREE.AdditiveBlending} />
        </points>
    )
}

// --- 3D CANVAS (ФОН) ---
export default function HeroCanvas() {
    return (
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 1, touchAction: 'pan-y' }} className="pointer-events-none md:pointer-events-auto">
            <Canvas dpr={[1, 1.5]} gl={{ toneMapping: THREE.NoToneMapping }}>
                {/* КАМЕРА БЛИЖЕ ДЛЯ БОЛЬШЕГО МОЗГА */}
                <PerspectiveCamera makeDefault position={[0, 0, 3.5]} fov={50} />

                {/* ПОЗИЦИЯ [1.2,0,0] - СМЕЩЕНО ВПРАВО */}
                <group position={[1.2, 0, 0]}>
                    <Suspense fallback={null}>
                        <BrainBase file="/brainRC.obj" />
                        <BrainNeon file="/brainRC2.obj" />
                    </Suspense>
                </group>

                <EffectComposer multisampling={0}>
                    <Noise opacity={0.03} />
                    {/* <Vignette eskil={false} offset={0.1} darkness={0.8} /> */}
                    <Bloom luminanceThreshold={CONFIG.bloom.threshold} intensity={CONFIG.bloom.intensity} mipmapBlur radius={0.6} />
                </EffectComposer>
                <OrbitControls enablePan={false} enableZoom={false} enableRotate={false} />
            </Canvas>
        </div >
    )
}
