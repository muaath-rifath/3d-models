'use client';

import React, { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';

type MotionSensorProps = {
    isDarkMode?: boolean;
}

const useMotionSensorMaterials = (isDarkMode: boolean) => {
    return useMemo(() => ({
        pcbMaterial: new THREE.MeshStandardMaterial({
            color: isDarkMode ? 0x006633 : 0x00aa55,
            roughness: 0.7,
            metalness: 0.3,
            name: 'pcb'
        }),
        domeMaterial: new THREE.MeshStandardMaterial({
            color: isDarkMode ? 0x333333 : 0xdddddd,
            roughness: 0.2,
            metalness: 0.8,
            transparent: true,
            opacity: 0.8,
            name: 'dome'
        }),
        pirMaterial: new THREE.MeshStandardMaterial({
            color: isDarkMode ? 0x222222 : 0x444444,
            roughness: 0.6,
            metalness: 0.4,
            name: 'pir_sensor'
        }),
        detectionAreaMaterial: new THREE.MeshStandardMaterial({
            color: 0x00ff88,
            transparent: true,
            opacity: 0.1,
            side: THREE.DoubleSide,
            name: 'detection_area'
        }),
        chipMaterial: new THREE.MeshStandardMaterial({
            color: isDarkMode ? 0x111111 : 0x333333,
            roughness: 0.3,
            metalness: 0.7,
            name: 'chip'
        }),
        ledMaterial: new THREE.MeshStandardMaterial({
            color: 0x00ff00,
            emissive: 0x00ff00,
            emissiveIntensity: isDarkMode ? 0.8 : 0.4,
            name: 'led'
        }),
        holeMaterial: new THREE.MeshStandardMaterial({
            color: isDarkMode ? 0x222222 : 0x111111,
            name: 'hole'
        })
    }), [isDarkMode]);
};

export default function MotionSensor({ isDarkMode = false }: MotionSensorProps) {
    const sensorGroupRef = useRef<THREE.Group>(null);
    const detectionAreaMaterialRef = useRef<THREE.MeshStandardMaterial>(null);
    const materials = useMotionSensorMaterials(isDarkMode);

    useFrame((state) => {
        if (detectionAreaMaterialRef.current) {
            const time = state.clock.elapsedTime;
            detectionAreaMaterialRef.current.opacity = 0.05 + Math.sin(time) * 0.05;
        }
    });

    const holePositions = useMemo(() => [
        { x: 0.75, z: 0.75 },
        { x: 0.75, z: -0.75 },
        { x: -0.75, z: 0.75 },
        { x: -0.75, z: -0.75 }
    ], []);

    return (
        <group ref={sensorGroupRef} dispose={null}>
            <mesh material={materials.pcbMaterial}>
                <boxGeometry args={[1.8, 0.1, 1.8]} />
            </mesh>

            <mesh material={materials.domeMaterial} position-y={0.7}>
                <sphereGeometry args={[0.7, 32, 32, 0, Math.PI * 2, 0, Math.PI * 0.5]} />
            </mesh>

            <mesh material={materials.pirMaterial} position-y={0.4}>
                <cylinderGeometry args={[0.4, 0.4, 0.2, 16]} />
            </mesh>

            <mesh
                material={materials.detectionAreaMaterial}
                ref={detectionAreaMaterialRef as any}
                position-y={3.5}
                rotation-x={Math.PI}
            >
                <coneGeometry args={[3, 6, 32, 1, true]} />
            </mesh>

            <mesh material={materials.chipMaterial} position={[0.5, 0.1, 0.5]}>
                <boxGeometry args={[0.4, 0.1, 0.4]} />
            </mesh>

            <mesh
                material={materials.ledMaterial}
                position={[-0.5, 0.06, 0.7]}
                rotation-x={-Math.PI / 2}
            >
                <circleGeometry args={[0.1, 16]} />
                <pointLight color={0x00ff00} intensity={0.5} distance={2} />
            </mesh>

            {holePositions.map((pos, index) => (
                <mesh
                    key={`hole-${index}`}
                    material={materials.holeMaterial}
                    position={[pos.x, -0.05, pos.z]}
                >
                    <cylinderGeometry args={[0.1, 0.1, 0.2, 16]} />
                </mesh>
            ))}
        </group>
    );
}