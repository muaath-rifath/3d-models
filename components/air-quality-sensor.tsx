'use client';

import React, { useRef, useMemo, useState } from 'react'; // Import useState
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';

type AirQualitySensorProps = {
    isDarkMode?: boolean;
}

// Remove mesh from SignalRingData if managed by state/rendering
interface SignalRingData {
    id: number; // Add id
    // mesh: THREE.Mesh | null; // Remove if not directly referencing mesh
    initialY: number;
    speed: number;
    currentY: number; // Add state properties
    opacity: number;
    scale: number;
}

// Remove mesh from ParticleData if managed by state/rendering
interface ParticleData {
    id: number; // Add id
    // mesh: THREE.Mesh | null; // Remove if not directly referencing mesh
    initialX: number;
    initialZ: number;
    speed: number;
    angle: number;
    currentX: number; // Add state properties
    currentY: number;
    currentZ: number;
}

const useSensorMaterials = (isDarkMode: boolean) => {
    return useMemo(() => ({
        housingMaterial: new THREE.MeshStandardMaterial({
            color: isDarkMode ? 0x006633 : 0xc8e6c9,
            roughness: 0.7,
            metalness: 0.3,
            name: 'housing'
        }),
        antennaMaterial: new THREE.MeshStandardMaterial({
            color: 0xCCCCCC,
            metalness: 0.8,
            roughness: 0.2,
            name: 'antenna'
        }),
        signalMaterial: new THREE.MeshBasicMaterial({
            color: 0x00FFAA,
            transparent: true,
            opacity: 0.7,
            side: THREE.DoubleSide,
            name: 'signalRing'
        }),
        pcbMaterial: new THREE.MeshStandardMaterial({
            color: isDarkMode ? 0x006633 : 0x008844,
            roughness: 0.7,
            metalness: 0.3,
            name: 'pcb'
        }),
        traceMaterial: new THREE.MeshStandardMaterial({
            color: 0xCFB53B,
            roughness: 0.2,
            metalness: 0.8,
            emissive: isDarkMode ? 0x332200 : 0x000000,
            emissiveIntensity: isDarkMode ? 0.2 : 0,
            name: 'circuitTrace'
        }),
        ventMaterial: new THREE.MeshStandardMaterial({
            color: isDarkMode ? 0x222222 : 0x444444,
            roughness: 0.8,
            metalness: 0.2,
            name: 'ventHousing'
        }),
        filterMaterial: new THREE.MeshStandardMaterial({
            color: 0x888888,
            wireframe: true,
            side: THREE.DoubleSide,
            name: 'ventFilter'
        }),
        chamberMaterial: new THREE.MeshPhysicalMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0.3,
            roughness: 0,
            metalness: 0.1,
            clearcoat: 1.0,
            clearcoatRoughness: 0.1,
            name: 'chamber'
        }),
        laserDeviceMaterial: new THREE.MeshStandardMaterial({
            color: 0x333333,
            roughness: 0.5,
            metalness: 0.8,
            name: 'laserDevice'
        }),
        laserBeamMaterial: new THREE.MeshBasicMaterial({
            color: 0xff0000,
            transparent: true,
            opacity: 0.7,
            name: 'laserBeam'
        }),
        particleMaterial: new THREE.MeshStandardMaterial({
            color: 0xffff00,
            emissive: new THREE.Color(0xffff00),
            emissiveIntensity: 0.7,
            transparent: true,
            opacity: 0.7,
            name: 'particle'
        }),
        gasSensorBaseMaterial: new THREE.MeshStandardMaterial({
            color: 0x444444,
            roughness: 0.5,
            metalness: 0.8,
            name: 'gasSensorBase'
        }),
        gasSensorMeshMaterial: new THREE.MeshBasicMaterial({
            color: 0x222222,
            wireframe: true,
            name: 'gasSensorMesh'
        }),
        displayMaterial: new THREE.MeshStandardMaterial({
            color: isDarkMode ? 0x000000 : 0x222222,
            roughness: 0.1,
            metalness: 0.5,
            name: 'displayBackground'
        }),
        indicatorMaterial: new THREE.MeshStandardMaterial({
            color: 0x00ff00,
            emissive: 0x00ff00,
            emissiveIntensity: 0.8,
            transparent: true,
            opacity: 0.9,
            name: 'statusIndicator'
        }),
        usbPortMaterial: new THREE.MeshStandardMaterial({
            color: 0x333333,
            roughness: 0.5,
            metalness: 0.8,
            name: 'usbPortHousing'
        }),
        usbConnectorMaterial: new THREE.MeshStandardMaterial({
            color: 0x888888,
            roughness: 0.1,
            metalness: 0.9,
            name: 'usbPortConnector'
        }),
        stemMaterial: new THREE.MeshStandardMaterial({
            color: isDarkMode ? 0x006633 : 0xc8e6c9,
            roughness: 0.7,
            metalness: 0.3,
            name: 'stem'
        }),
        bracketBaseMaterial: new THREE.MeshStandardMaterial({
            color: isDarkMode ? 0x444444 : 0x888888,
            roughness: 0.7,
            metalness: 0.3,
            name: 'bracketBase'
        }),
        mountingHoleMaterial: new THREE.MeshStandardMaterial({
            color: 0x222222,
            roughness: 0.5,
            metalness: 0.3,
            name: 'mountingHole'
        }),
        gasSensorTopRed: new THREE.MeshStandardMaterial({ color: 0xff0000, roughness: 0.3, metalness: 0.5, name: 'gasSensorTop' }),
        gasSensorTopGreen: new THREE.MeshStandardMaterial({ color: 0x00ff00, roughness: 0.3, metalness: 0.5, name: 'gasSensorTop' }),
        gasSensorTopBlue: new THREE.MeshStandardMaterial({ color: 0x0000ff, roughness: 0.3, metalness: 0.5, name: 'gasSensorTop' }),
        gasSensorTopYellow: new THREE.MeshStandardMaterial({ color: 0xffff00, roughness: 0.3, metalness: 0.5, name: 'gasSensorTop' }),
    }), [isDarkMode]);
};

function CircuitTrace({ x, z, width, length, rotation, material }: { x: number, z: number, width: number, length: number, rotation?: number, material: THREE.Material }) {
    return (
        <mesh material={material} position={[x, 0.06, z]} rotation-y={rotation ?? 0}>
            <boxGeometry args={[width, 0.01, length]} />
        </mesh>
    );
}

function IntakeVent({ angle, materials }: { angle: number, materials: ReturnType<typeof useSensorMaterials> }) {
    return (
        <group position={[Math.cos(angle) * 1.15, 0, Math.sin(angle) * 1.15]} rotation-y={angle + Math.PI / 2}>
            <mesh material={materials.ventMaterial}>
                <boxGeometry args={[0.4, 0.2, 0.1]} />
            </mesh>
            <mesh material={materials.filterMaterial} position-z={0.01}>
                <planeGeometry args={[0.35, 0.15]} />
            </mesh>
        </group>
    );
}

function GasSensor({ x, z, topMaterial, materials }: { x: number, z: number, topMaterial: THREE.Material, materials: ReturnType<typeof useSensorMaterials> }) {
    return (
        <group position={[x, 0.1, z]}>
            <mesh material={materials.gasSensorBaseMaterial}>
                <cylinderGeometry args={[0.1, 0.1, 0.05, 16]} />
            </mesh>
            <mesh material={topMaterial} position-y={0.04}>
                <cylinderGeometry args={[0.08, 0.08, 0.03, 16]} />
            </mesh>
            <mesh material={materials.gasSensorMeshMaterial} position-y={0.06} rotation-x={-Math.PI / 2}>
                <circleGeometry args={[0.07, 16]} />
            </mesh>
        </group>
    );
}

function MountingHole({ x, z, material }: { x: number, z: number, material: THREE.Material }) {
    return (
        <mesh material={material} position={[x, 0, z]} rotation-x={Math.PI / 2}>
            <cylinderGeometry args={[0.05, 0.05, 0.12, 16]} />
        </mesh>
    );
}

export default function AirQualitySensor({ isDarkMode = false }: AirQualitySensorProps) {
    const sensorGroupRef = useRef<THREE.Group>(null);
    const indicatorRef = useRef<THREE.Mesh>(null);
    const indicatorLightRef = useRef<THREE.PointLight>(null);

    // Use state for rings and particles
    const [signalRings, setSignalRings] = useState<SignalRingData[]>(() =>
        Array.from({ length: 3 }).map((_, i) => ({
            id: i,
            initialY: 0.9 + i * 0.2,
            speed: 0.01 + i * 0.005,
            currentY: 0.9 + i * 0.2,
            opacity: 0.7,
            scale: 1,
        }))
    );

    const [particles, setParticles] = useState<ParticleData[]>(() =>
        Array.from({ length: 15 }).map((_, i) => ({
            id: i,
            initialX: (Math.random() - 0.5) * 0.4,
            initialZ: (Math.random() - 0.5) * 0.4,
            speed: 0.01 + Math.random() * 0.02,
            angle: Math.random() * Math.PI * 2,
            currentX: (Math.random() - 0.5) * 0.4,
            currentY: 0,
            currentZ: (Math.random() - 0.5) * 0.4,
        }))
    );

    const materials = useSensorMaterials(isDarkMode);
    const textColor = isDarkMode ? '#00ff88' : '#00ff88';

    useFrame((state) => {
        const time = state.clock.elapsedTime;

        if (sensorGroupRef.current) {
            sensorGroupRef.current.position.y = Math.sin(time * 0.8) * 0.05;
        }

        if (indicatorRef.current && indicatorLightRef.current) {
            const indicatorMaterial = indicatorRef.current.material as THREE.MeshStandardMaterial;
            if (indicatorMaterial && typeof indicatorMaterial.emissiveIntensity !== 'undefined') {
                const intensityFactor = (Math.sin(time * 2) * 0.2 + 0.8);
                indicatorMaterial.emissiveIntensity = intensityFactor;
                indicatorLightRef.current.intensity = intensityFactor * 0.5;
            }
        }

        // Update signal rings state
        setSignalRings(prevRings => prevRings.map(ring => {
            let newY = ring.currentY + ring.speed;
            const progress = (newY - ring.initialY) / 0.5;
            let newOpacity = Math.max(0, 0.7 * (1 - progress));
            let newScale = 1 + progress * 2;

            if (newOpacity <= 0) {
                newY = ring.initialY;
                newOpacity = 0.7;
                newScale = 1;
            }
            return { ...ring, currentY: newY, opacity: newOpacity, scale: newScale };
        }));

        // Update particles state
        setParticles(prevParticles => prevParticles.map(particle => {
            const newAngle = particle.angle + particle.speed;
            const newX = particle.initialX + Math.sin(newAngle) * 0.05;
            const newZ = particle.initialZ + Math.cos(newAngle) * 0.05;
            const newY = Math.sin(time * particle.speed * 5 + newAngle) * 0.05;
            return { ...particle, angle: newAngle, currentX: newX, currentY: newY, currentZ: newZ };
        }));
    });

    const tracePositions = useMemo(() => Array.from({ length: 8 }).map((_, i) => {
        const angle = (i / 8) * Math.PI * 2;
        // Correct rotation calculation for traces
        return { x: Math.cos(angle) * 0.25, z: Math.sin(angle) * 0.25, angle: angle + Math.PI / 2 };
    }), []);

    const ventAngles = useMemo(() => Array.from({ length: 6 }).map((_, i) => (i / 6) * Math.PI * 2), []);

    const gasSensorPositions = useMemo(() => [
        { x: 0.5, z: 0.5, material: materials.gasSensorTopRed },
        { x: -0.5, z: 0.5, material: materials.gasSensorTopGreen },
        { x: 0.5, z: -0.5, material: materials.gasSensorTopBlue },
        { x: -0.5, z: -0.5, material: materials.gasSensorTopYellow },
    ], [materials]); // Add materials dependency

    const mountingHolePositions = useMemo(() => [
        { x: 0.6, z: 0.6 }, { x: -0.6, z: 0.6 }, { x: 0.6, z: -0.6 }, { x: -0.6, z: -0.6 }
    ], []);

    return (
        <group ref={sensorGroupRef} dispose={null}>
            {/* Main Housing and PCB */}
            <mesh material={materials.housingMaterial} position-y={0.4} castShadow receiveShadow>
                <cylinderGeometry args={[1.2, 1.2, 0.8, 32]} />

                {/* PCB */}
                <mesh material={materials.pcbMaterial} position-y={-0.2}>
                    <cylinderGeometry args={[1.0, 1.0, 0.1, 32]} />
                    {tracePositions.map((pos, i) => (
                        // Pass rotation correctly
                        <CircuitTrace key={i} {...pos} width={0.05} length={0.8} material={materials.traceMaterial} rotation={pos.angle} />
                    ))}
                </mesh>

                {/* Intake Vents */}
                {ventAngles.map((angle, i) => (
                    <IntakeVent key={i} angle={angle} materials={materials} />
                ))}

                {/* Particle Chamber */}
                <group position-y={-0.1}>
                    <mesh material={materials.chamberMaterial}>
                        <cylinderGeometry args={[0.3, 0.3, 0.3, 16]} />
                    </mesh>
                    {/* Laser Device and Beam */}
                    <mesh material={materials.laserDeviceMaterial} position={[0.25, 0, 0]} rotation-z={Math.PI / 2}>
                        <cylinderGeometry args={[0.05, 0.05, 0.1, 8]} />
                    </mesh>
                    <mesh material={materials.laserBeamMaterial} position={[0, 0, 0]} rotation-y={Math.PI / 2}>
                         <cylinderGeometry args={[0.01, 0.01, 0.5, 8]} />
                    </mesh>
                    {/* Render Particles Inside Chamber */}
                    {particles.map(particle => (
                        <mesh
                            key={particle.id}
                            material={materials.particleMaterial}
                            position={[particle.currentX, particle.currentY, particle.currentZ]}
                            scale={0.02} // Small scale for particles
                        >
                            <sphereGeometry args={[1, 8, 8]} />
                        </mesh>
                    ))}
                </group>

                {/* Gas Sensors */}
                {gasSensorPositions.map((pos, i) => (
                    // Pass topMaterial correctly
                    <GasSensor key={i} x={pos.x} z={pos.z} topMaterial={pos.material} materials={materials} />
                ))}

                {/* Display */}
                <mesh material={materials.displayMaterial} position={[0, 0.1, 1.01]} rotation-x={-0.2}>
                    <planeGeometry args={[1.5, 0.4]} />
                    <Text
                        color={textColor}
                        fontSize={0.12}
                        position={[0, 0.05, 0.01]}
                        anchorX="center"
                        anchorY="middle"
                    >
                        PM2.5: 15 ug/m³ | CO2: 450 ppm
                    </Text>
                     <Text
                        color={textColor}
                        fontSize={0.1}
                        position={[0, -0.08, 0.01]}
                        anchorX="center"
                        anchorY="middle"
                    >
                        TVOC: 0.2 ppm | Temp: 22°C | Hum: 45%
                    </Text>
                </mesh>

                {/* Status Indicator */}
                <mesh ref={indicatorRef} material={materials.indicatorMaterial} position={[0.8, 0.2, 0.8]} rotation-x={-0.3}>
                    <cylinderGeometry args={[0.05, 0.05, 0.02, 16]} />
                    <pointLight ref={indicatorLightRef} color={0x00ff00} intensity={0.5} distance={0.5} />
                </mesh>

                {/* USB Port */}
                <group position={[-0.8, -0.15, 0.8]} rotation-y={Math.PI / 4}>
                     <mesh material={materials.usbPortMaterial}>
                        <boxGeometry args={[0.3, 0.15, 0.1]} />
                     </mesh>
                     <mesh material={materials.usbConnectorMaterial} position={[0, 0, 0.03]}>
                        <boxGeometry args={[0.25, 0.1, 0.08]} />
                     </mesh>
                </group>

            </mesh>

            {/* Antenna */}
            <mesh material={materials.antennaMaterial} position={[0, 0.8, 0]} castShadow>
                <cylinderGeometry args={[0.05, 0.05, 0.6, 16]} />
            </mesh>

            {/* Render Signal Rings */}
            {signalRings.map(ring => (
                <mesh
                    key={ring.id}
                    position={[0, ring.currentY, 0]}
                    scale={ring.scale}
                    rotation-x={Math.PI / 2} // Rotate rings to be horizontal
                >
                    <ringGeometry args={[0.1, 0.12, 32]} />
                    {/* Clone material to allow independent opacity control */}
                    <primitive
                        object={materials.signalMaterial.clone()}
                        attach="material"
                        opacity={ring.opacity} // Apply opacity from state
                        transparent // Ensure material is transparent
                    />
                </mesh>
            ))}

            {/* Mounting Bracket */}
            <group position-y={-0.1}>
                <mesh material={materials.bracketBaseMaterial} position-y={-0.05}>
                    <cylinderGeometry args={[1.3, 1.3, 0.1, 32]} />
                    {mountingHolePositions.map((pos, i) => (
                         <MountingHole key={i} {...pos} material={materials.mountingHoleMaterial} />
                    ))}
                </mesh>
                <mesh material={materials.stemMaterial} position-y={0.15}>
                     <cylinderGeometry args={[0.2, 0.2, 0.5, 16]} />
                </mesh>
            </group>

        </group>
    );
}