'use client';
import React, { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';

type BladeServerProps = {
    isDarkMode?: boolean;
}

const useBladeServerMaterials = (isDarkMode: boolean) => {
    return useMemo(() => ({
        rackMaterial: new THREE.MeshStandardMaterial({
            color: isDarkMode ? 0x223322 : 0x444444,
            roughness: 0.7,
            metalness: 0.8,
            name: 'rack'
        }),
        serverMaterial: new THREE.MeshStandardMaterial({
            color: isDarkMode ? 0x003322 : 0x333333,
            roughness: 0.6,
            metalness: 0.9,
            name: 'server'
        }),
        frontPanelMaterial: new THREE.MeshStandardMaterial({
            color: isDarkMode ? 0x009977 : 0x555555,
            roughness: 0.5,
            metalness: 0.7,
            name: 'front_panel'
        }),
        ledMaterial: new THREE.MeshStandardMaterial({
            color: 0x00ff88,
            emissive: 0x00ff88,
            emissiveIntensity: 0.8,
            roughness: 0.2,
            metalness: 0.9,
            name: 'led'
        }),
        activityLEDMaterial: new THREE.MeshStandardMaterial({
            color: 0x00ffdd,
            emissive: 0x00ffdd,
            emissiveIntensity: 0.8,
            roughness: 0.2,
            metalness: 0.9,
            name: 'led_activity'
        }),
        portMaterial: new THREE.MeshStandardMaterial({
            color: isDarkMode ? 0x006655 : 0xaaaaaa,
            roughness: 0.6,
            metalness: 0.8,
            name: 'port'
        }),
        handleMaterial: new THREE.MeshStandardMaterial({
            color: isDarkMode ? 0x77ccbb : 0x888888,
            roughness: 0.3,
            metalness: 0.9,
            name: 'handle'
        }),
        ventMaterial: new THREE.MeshStandardMaterial({
            color: isDarkMode ? 0x112211 : 0x222222,
            roughness: 0.9,
            metalness: 0.2,
            name: 'vent'
        }),
        railMaterial: new THREE.MeshStandardMaterial({
            color: isDarkMode ? 0x444444 : 0x777777,
            roughness: 0.4,
            metalness: 0.8,
            name: 'rail'
        }),
    }), [isDarkMode]);
};

function ServerBlade({ yPos, rackWidth, rackDepth, serverHeight, materials }: {
    yPos: number;
    rackWidth: number;
    rackDepth: number;
    serverHeight: number;
    materials: ReturnType<typeof useBladeServerMaterials>;
}) {
    const activityLedRef = useRef<THREE.Mesh>(null);

    useFrame(({ clock }) => {
        if (activityLedRef.current) {
            (activityLedRef.current.material as THREE.MeshStandardMaterial).emissiveIntensity = Math.sin(clock.elapsedTime * 5 + yPos) * 0.4 + 0.6;
        }
    });

    return (
        <group position-y={yPos}>
            <mesh material={materials.serverMaterial} position-z={0} castShadow receiveShadow>
                <boxGeometry args={[rackWidth - 1, serverHeight, rackDepth - 0.5]} />
            </mesh>

            <mesh material={materials.frontPanelMaterial} position-z={rackDepth / 2 - 0.1} castShadow>
                <boxGeometry args={[rackWidth - 1, serverHeight, 0.2]} />
            </mesh>

            <mesh material={materials.ledMaterial} position={[-rackWidth / 2 + 1, 0, rackDepth / 2 + 0.01]}>
                <circleGeometry args={[0.1, 16]} />
            </mesh>

            <mesh ref={activityLedRef} position={[-rackWidth / 2 + 1.5, 0, rackDepth / 2 + 0.01]}>
                <circleGeometry args={[0.1, 16]} />
                <meshStandardMaterial {...materials.activityLEDMaterial} />
            </mesh>

            {[0, 1].map(p => (
                <mesh key={p} material={materials.portMaterial} position={[rackWidth / 2 - 2 - p * 1.2, 0, rackDepth / 2 + 0.01]}>
                    <boxGeometry args={[0.8, 0.4, 0.1]} />
                </mesh>
            ))}

            <mesh material={materials.handleMaterial} position={[-rackWidth / 2 + 0.6, 0, rackDepth / 2 - 0.1]} rotation-z={Math.PI / 2}>
                <cylinderGeometry args={[0.2, 0.2, 0.8, 8]} />
            </mesh>
            <mesh material={materials.handleMaterial} position={[rackWidth / 2 - 0.6, 0, rackDepth / 2 - 0.1]} rotation-z={Math.PI / 2}>
                <cylinderGeometry args={[0.2, 0.2, 0.8, 8]} />
            </mesh>
        </group>
    );
}

export default function BladeServer({ isDarkMode = false }: BladeServerProps) {
    const serverGroupRef = useRef<THREE.Group>(null);
    const materials = useBladeServerMaterials(isDarkMode);

    const rackWidth = 30;
    const rackHeight = 20;
    const rackDepth = 8;
    const serverCount = 8;
    const serverHeight = 1.8;
    const serverSpacing = 0.2;

    const serverPositions = useMemo(() => {
        return Array.from({ length: serverCount }).map((_, i) =>
            (rackHeight / 2) - 2 - i * (serverHeight + serverSpacing)
        );
    }, [rackHeight, serverCount, serverHeight, serverSpacing]);

    const ventPositions = useMemo(() => {
        const positions: { x: number; y: number; z: number; side: 'left' | 'right' }[] = [];
        const ventDensity = 4;
        for (let vx = -ventDensity; vx <= ventDensity; vx++) {
            for (let vy = -ventDensity; vy <= ventDensity; vy++) {
                if ((vx + vy) % 3 === 0) continue;
                positions.push({ x: -rackWidth / 2 - 0.01, y: vx * 2, z: vy * 1.5, side: 'left' });
                positions.push({ x: rackWidth / 2 + 0.01, y: vx * 2, z: vy * 1.5, side: 'right' });
            }
        }
        return positions;
    }, [rackWidth]);

    return (
        <group ref={serverGroupRef} dispose={null}>
            <mesh material={materials.rackMaterial} castShadow receiveShadow>
                <boxGeometry args={[rackWidth, rackHeight, rackDepth]} />
            </mesh>

            {serverPositions.map((yPos, i) => (
                <ServerBlade
                    key={i}
                    yPos={yPos}
                    rackWidth={rackWidth}
                    rackDepth={rackDepth}
                    serverHeight={serverHeight}
                    materials={materials}
                />
            ))}

            {ventPositions.map((pos, i) => (
                <mesh
                    key={i}
                    material={materials.ventMaterial}
                    position={[pos.x, pos.y, pos.z]}
                    rotation-y={pos.side === 'left' ? Math.PI / 2 : -Math.PI / 2}
                >
                    <circleGeometry args={[0.3, 8]} />
                </mesh>
            ))}

            <mesh material={materials.railMaterial} position-y={rackHeight / 2 + 0.25}>
                <boxGeometry args={[rackWidth + 2, 0.5, 0.5]} />
            </mesh>
            <mesh material={materials.railMaterial} position-y={-rackHeight / 2 - 0.25}>
                <boxGeometry args={[rackWidth + 2, 0.5, 0.5]} />
            </mesh>
        </group>
    );
}