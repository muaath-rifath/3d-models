\
'use client';

import React, { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';

type Tower5GProps = {
    isDarkMode?: boolean;
}

// Helper function to create materials (memoized for performance)
const useTowerMaterials = (isDarkMode: boolean) => {
    return useMemo(() => ({
        metalMaterial: new THREE.MeshStandardMaterial({
            color: isDarkMode ? 0x00cc66 : 0x6699cc,
            roughness: 0.4,
            metalness: 0.8,
            name: 'metal'
        }),
        darkMetalMaterial: new THREE.MeshStandardMaterial({
            color: isDarkMode ? 0x115533 : 0x445566,
            roughness: 0.3,
            metalness: 0.7,
            name: 'dark_metal'
        }),
        antennaMaterial: new THREE.MeshStandardMaterial({
            color: isDarkMode ? 0xccffdd : 0xeeeeee,
            roughness: 0.2,
            metalness: 0.9,
            name: 'antenna'
        }),
        equipmentMaterial: new THREE.MeshStandardMaterial({
            color: isDarkMode ? 0x224433 : 0x223344,
            roughness: 0.5,
            metalness: 0.6,
            name: 'equipment'
        }),
        warningMaterial: new THREE.MeshStandardMaterial({
            color: isDarkMode ? 0xffaa00 : 0xff6600,
            emissive: isDarkMode ? 0xff7700 : 0xff3300,
            emissiveIntensity: isDarkMode ? 0.6 : 0.3,
            roughness: 0.4,
            metalness: 0.5,
            name: 'warning'
        })
    }), [isDarkMode]);
};

// Helper component for a Tower Section
function TowerSection({ y, materials }: { y: number, materials: ReturnType<typeof useTowerMaterials> }) {
    const sectionGroupRef = useRef<THREE.Group>(null);
    const height = 2;
    const diagonalPositions = useMemo(() => {
        const positions = [];
        for (let i = 0; i < 4; i++) {
            const angle = (i / 4) * Math.PI * 2 + Math.PI / 4;
            const x = Math.cos(angle) * 1.5;
            const z = Math.sin(angle) * 1.5;
            positions.push({ x, z, angle });
        }
        return positions;
    }, []);

    return (
        <group position-y={y} ref={sectionGroupRef}>
            {/* Horizontal supports */}
            <mesh material={materials.darkMetalMaterial}>
                <boxGeometry args={[4, 0.3, 4]} />
            </mesh>
            {/* Diagonal supports */}
            {diagonalPositions.map((pos, i) => (
                <mesh
                    key={i}
                    material={materials.metalMaterial}
                    position={[pos.x, 0, pos.z]}
                    rotation={[Math.PI / 4, -pos.angle, 0]} // Apply rotation directly
                >
                    <cylinderGeometry args={[0.15, 0.15, height * 1.5, 8]} />
                </mesh>
            ))}
        </group>
    );
}

// Helper component for a Sector Antenna
function SectorAntenna({ x, y, z, angle, materials }: { x: number, y: number, z: number, angle: number, materials: ReturnType<typeof useTowerMaterials> }) {
    return (
        <group position={[x, y, z]} rotation-y={angle}>
            {/* Main panel */}
            <mesh material={materials.antennaMaterial}>
                <boxGeometry args={[0.5, 4, 1.5]} />
            </mesh>
            {/* Equipment box */}
            <mesh material={materials.equipmentMaterial} position={[-0.7, -0.5, 0]}>
                <boxGeometry args={[0.8, 1.5, 1]} />
            </mesh>
        </group>
    );
}

// Helper component for a Dish
function Dish({ y, angle, materials }: { y: number, angle: number, materials: ReturnType<typeof useTowerMaterials> }) {
    return (
        <group position-y={y} rotation-y={angle}>
            {/* Support arm */}
            <mesh material={materials.darkMetalMaterial} position-x={1.5}>
                <boxGeometry args={[3, 0.3, 0.3]} />
            </mesh>
            {/* Dish */}
            <mesh material={materials.antennaMaterial} position={[3, 0, 0]} rotation={[Math.PI / 2, Math.PI, 0]}>
                {/* Use SphereGeometry with openEnded=true or LatheGeometry for a dish shape */}
                <sphereGeometry args={[1, 32, 16, 0, Math.PI]} />
            </mesh>
            {/* Mount */}
            <mesh material={materials.darkMetalMaterial} position={[3, 0, 0]} rotation-x={Math.PI / 2}>
                <cylinderGeometry args={[0.3, 0.3, 0.5, 8]} />
            </mesh>
        </group>
    );
}


export default function Tower5G({ isDarkMode = false }: Tower5GProps) {
    const towerRef = useRef<THREE.Group>(null);
    const materials = useTowerMaterials(isDarkMode); // Get materials based on mode

    // Constants for tower dimensions
    const mainTowerHeight = 25;
    const sectionCount = 8;
    const antennaCount = 3;
    const dishPositions = useMemo(() => [
        { y: mainTowerHeight * 0.8, angle: Math.PI / 6 },
        { y: mainTowerHeight * 0.6, angle: Math.PI / 2 + Math.PI / 6 },
        { y: mainTowerHeight * 0.4, angle: Math.PI + Math.PI / 6 },
    ], [mainTowerHeight]);

    const antennaPositions = useMemo(() => {
        const positions = [];
        const radius = 2.5;
        for (let i = 0; i < antennaCount; i++) {
            const angle = (i / antennaCount) * Math.PI * 2;
            const x = Math.cos(angle) * radius;
            const z = Math.sin(angle) * radius;
            positions.push({ x, y: mainTowerHeight + 1.5, z, angle });
        }
        return positions;
    }, [antennaCount, mainTowerHeight]);

    // Optional: Add animation using useFrame if needed
    // useFrame((state, delta) => {
    //   if (towerRef.current) {
    //     // Example: towerRef.current.rotation.y += delta * 0.1;
    //   }
    // });

    // Return the group containing the tower model using R3F components
    return (
        <group ref={towerRef} dispose={null}> {/* dispose={null} prevents R3F from disposing materials/geo managed here */}
            {/* Tower base */}
            <mesh material={materials.darkMetalMaterial} position-y={0}>
                <boxGeometry args={[4, 1, 4]} />
            </mesh>

            {/* Tower main shaft */}
            <mesh material={materials.metalMaterial} position-y={mainTowerHeight / 2 + 0.5}>
                <boxGeometry args={[1.5, mainTowerHeight, 1.5]} />
            </mesh>

            {/* Tower sections/supports */}
            {Array.from({ length: sectionCount }).map((_, i) => {
                const y = (i + 1) * mainTowerHeight / (sectionCount + 1) + 0.5;
                return <TowerSection key={i} y={y} materials={materials} />;
            })}

            {/* Top equipment platform */}
            <mesh material={materials.darkMetalMaterial} position-y={mainTowerHeight + 1}>
                <cylinderGeometry args={[3, 3, 0.5, 8]} />
            </mesh>

            {/* Antennas & Equipment */}
            {antennaPositions.map((pos, i) => (
                <SectorAntenna key={i} {...pos} materials={materials} />
            ))}

            {/* Warning light at top */}
            <mesh material={materials.warningMaterial} position-y={mainTowerHeight + 3.5}>
                <sphereGeometry args={[0.3, 16, 16]} />
                {/* Add point light declaratively */}
                <pointLight
                    color={isDarkMode ? 0xff7700 : 0xff3300}
                    intensity={isDarkMode ? 1.2 : 1.0} // Adjusted intensity slightly
                    distance={50} // Optional: limit light range
                    position={[0, 0.2, 0]} // Relative to the sphere mesh
                />
            </mesh>

            {/* Small dishes */}
            {dishPositions.map((pos, i) => (
                <Dish key={i} y={pos.y} angle={pos.angle} materials={materials} />
            ))}
        </group>
    );
}

// Removed imperative creation functions (createTower, createTowerSection, etc.)
// Removed updateMaterials function (handled by useTowerMaterials hook and direct prop usage)
// Removed cleanup logic (handled automatically by R3F)
// Removed resize handler (handled by Canvas)
