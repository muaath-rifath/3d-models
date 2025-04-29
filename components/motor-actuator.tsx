'use client';

import React, { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';

type MotorActuatorProps = {
    isDarkMode?: boolean;
}

const HOUSING_LENGTH = 25;
const HOUSING_RADIUS = 2.5;
const RIB_COUNT = 20;
const RIB_HEIGHT = 0.3;
const SHAFT_RADIUS = 1;
const SHAFT_LENGTH = 5;
const END_CAP_RADIUS_OFFSET = 0.5;
const FRONT_CAP_LENGTH = 1.5;
const REAR_CAP_LENGTH = 2.5;
const CONNECTOR_BOX_SIZE = { x: 3, y: 2, z: 4 };
const PIN_RADIUS = 0.3;
const PIN_LENGTH = 1;
const LED_RADIUS = 0.4;
const BRACKET_SIZE = { x: 1.5, y: 1, z: 5 };
const MOUNTING_HOLE_RADIUS = 0.4;
const MOUNTING_HOLE_LENGTH = 1.2;
const WIRE_RADIUS = 0.15;
const WIRE_LENGTH = 5;

const useMotorMaterials = (isDarkMode: boolean) => {
    return useMemo(() => ({
        housingMaterial: new THREE.MeshPhongMaterial({
            color: isDarkMode ? 0x1a2e20 : 0xd0e8ff,
            shininess: 30,
            name: 'housing'
        }),
        ribMaterial: new THREE.MeshPhongMaterial({
            color: isDarkMode ? 0x1a2e20 : 0xd0e8ff,
            shininess: 50,
            name: 'rib'
        }),
        endCapMaterial: new THREE.MeshPhongMaterial({
            color: isDarkMode ? 0x8fffaa : 0x009977,
            shininess: 60,
            name: 'end_cap'
        }),
        shaftMaterial: new THREE.MeshStandardMaterial({
            color: isDarkMode ? 0x44ff66 : 0x006644,
            metalness: 0.8,
            roughness: 0.2,
            name: 'shaft'
        }),
        connectorBoxMaterial: new THREE.MeshPhongMaterial({
            color: isDarkMode ? 0x8fffaa : 0x009977,
            shininess: 50,
            name: 'connector_box'
        }),
        pinMaterial: new THREE.MeshStandardMaterial({
            color: 0xdddddd,
            metalness: 0.9,
            roughness: 0.1,
            name: 'pin'
        }),
        ledMaterial: new THREE.MeshPhongMaterial({
            color: isDarkMode ? 0x00ffaa : 0x00aa88,
            emissive: isDarkMode ? 0x00ffaa : 0x00aa88,
            emissiveIntensity: 0.8,
            shininess: 90,
            name: 'led'
        }),
        bracketMaterial: new THREE.MeshPhongMaterial({
            color: isDarkMode ? 0x8fffaa : 0x009977,
            shininess: 40,
            name: 'bracket'
        }),
        mountingHoleMaterial: new THREE.MeshPhongMaterial({
            color: 0x000000,
            name: 'hole'
        }),
        wireMaterials: [
            new THREE.MeshPhongMaterial({ color: 0xff0000, name: 'wire_red' }),
            new THREE.MeshPhongMaterial({ color: 0x000000, name: 'wire_black' }),
            new THREE.MeshPhongMaterial({ color: 0x0000ff, name: 'wire_blue' })
        ]
    }), [isDarkMode]);
};

export default function MotorActuator({ isDarkMode = false }: MotorActuatorProps) {
    const motorGroupRef = useRef<THREE.Group>(null);
    const ledMaterialRef = useRef<THREE.MeshPhongMaterial>(null);
    const materials = useMotorMaterials(isDarkMode);

    useFrame((state) => {
        if (ledMaterialRef.current) {
            const time = state.clock.elapsedTime;
            ledMaterialRef.current.emissiveIntensity = Math.abs(Math.sin(time * 5)) * 0.8 + 0.2;
        }
    });

    const ribAngles = useMemo(() => Array.from({ length: RIB_COUNT }, (_, i) => (i / RIB_COUNT) * Math.PI * 2), []);
    const pinPositions = useMemo(() => Array.from({ length: 3 }, (_, i) => [
        -HOUSING_LENGTH / 2 - 2,
        0,
        3 + i * 0.8 - 1.6
    ] as const), []);
    const mountingPositions = useMemo(() => [
        { x: -HOUSING_LENGTH / 3, y: -HOUSING_RADIUS - 1, z: 1.5 },
        { x: -HOUSING_LENGTH / 3, y: -HOUSING_RADIUS - 1, z: -1.5 },
        { x: HOUSING_LENGTH / 3, y: -HOUSING_RADIUS - 1, z: 1.5 },
        { x: HOUSING_LENGTH / 3, y: -HOUSING_RADIUS - 1, z: -1.5 }
    ], []);
    const wirePositions = useMemo(() => Array.from({ length: 3 }, (_, i) => [
        -HOUSING_LENGTH / 2 - 4.5,
        0,
        3 + i * 0.8 - 1.6
    ] as const), []);

    return (
        <group ref={motorGroupRef} dispose={null}>
            <mesh material={materials.housingMaterial} rotation-z={Math.PI / 2}>
                <cylinderGeometry args={[HOUSING_RADIUS, HOUSING_RADIUS, HOUSING_LENGTH, 32]} />
            </mesh>

            {ribAngles.map((angle, index) => (
                <mesh key={`rib-${index}`} material={materials.ribMaterial} rotation-z={Math.PI / 2}>
                    <cylinderGeometry args={[
                        HOUSING_RADIUS + RIB_HEIGHT,
                        HOUSING_RADIUS + RIB_HEIGHT,
                        HOUSING_LENGTH - 4,
                        8,
                        1,
                        false,
                        angle - 0.06,
                        0.12
                    ]} />
                </mesh>
            ))}

            <mesh
                material={materials.endCapMaterial}
                rotation-z={Math.PI / 2}
                position-x={HOUSING_LENGTH / 2 + FRONT_CAP_LENGTH / 2}
            >
                <cylinderGeometry args={[
                    HOUSING_RADIUS + END_CAP_RADIUS_OFFSET,
                    HOUSING_RADIUS + END_CAP_RADIUS_OFFSET,
                    FRONT_CAP_LENGTH,
                    32
                ]} />
            </mesh>

            <mesh
                material={materials.endCapMaterial}
                rotation-z={Math.PI / 2}
                position-x={-HOUSING_LENGTH / 2 - REAR_CAP_LENGTH / 2}
            >
                <cylinderGeometry args={[
                    HOUSING_RADIUS + END_CAP_RADIUS_OFFSET,
                    HOUSING_RADIUS + END_CAP_RADIUS_OFFSET,
                    REAR_CAP_LENGTH,
                    32
                ]} />
            </mesh>

            <mesh
                material={materials.shaftMaterial}
                rotation-z={Math.PI / 2}
                position-x={HOUSING_LENGTH / 2 + FRONT_CAP_LENGTH + SHAFT_LENGTH / 2}
            >
                <cylinderGeometry args={[SHAFT_RADIUS, SHAFT_RADIUS, SHAFT_LENGTH, 16]} />
            </mesh>

            <mesh
                material={materials.connectorBoxMaterial}
                position={[-HOUSING_LENGTH / 2 - REAR_CAP_LENGTH / 2, 0, 3]}
            >
                <boxGeometry args={[CONNECTOR_BOX_SIZE.x, CONNECTOR_BOX_SIZE.y, CONNECTOR_BOX_SIZE.z]} />
            </mesh>

            {pinPositions.map((pos, index) => (
                <mesh
                    key={`pin-${index}`}
                    material={materials.pinMaterial}
                    position={pos}
                    rotation-x={Math.PI / 2}
                >
                    <cylinderGeometry args={[PIN_RADIUS, PIN_RADIUS, PIN_LENGTH, 8]} />
                </mesh>
            ))}

            <mesh
                material={materials.ledMaterial}
                ref={ledMaterialRef as any}
                position={[-HOUSING_LENGTH / 2 - REAR_CAP_LENGTH / 2, CONNECTOR_BOX_SIZE.y / 2 + LED_RADIUS, 3]}
            >
                <sphereGeometry args={[LED_RADIUS, 16, 16]} />
            </mesh>

            <mesh
                material={materials.bracketMaterial}
                position={[-HOUSING_LENGTH / 3, -HOUSING_RADIUS - BRACKET_SIZE.y / 2, 0]}
            >
                <boxGeometry args={[BRACKET_SIZE.x, BRACKET_SIZE.y, BRACKET_SIZE.z]} />
            </mesh>

            <mesh
                material={materials.bracketMaterial}
                position={[HOUSING_LENGTH / 3, -HOUSING_RADIUS - BRACKET_SIZE.y / 2, 0]}
            >
                <boxGeometry args={[BRACKET_SIZE.x, BRACKET_SIZE.y, BRACKET_SIZE.z]} />
            </mesh>

            {mountingPositions.map((pos, index) => (
                <mesh
                    key={`hole-${index}`}
                    material={materials.mountingHoleMaterial}
                    position={[pos.x, pos.y, pos.z]}
                    rotation-x={Math.PI / 2}
                >
                    <cylinderGeometry args={[MOUNTING_HOLE_RADIUS, MOUNTING_HOLE_RADIUS, MOUNTING_HOLE_LENGTH, 16]} />
                </mesh>
            ))}

            {wirePositions.map((pos, index) => (
                <mesh
                    key={`wire-${index}`}
                    material={materials.wireMaterials[index]}
                    position={pos}
                    rotation-z={Math.PI / 2}
                >
                    <cylinderGeometry args={[WIRE_RADIUS, WIRE_RADIUS, WIRE_LENGTH, 8]} />
                </mesh>
            ))}
        </group>
    );
}