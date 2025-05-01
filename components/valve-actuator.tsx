'use client';

import React, { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';

type SmartWaterValveProps = {
    isDarkMode?: boolean;
}

const VALVE_BODY_RADIUS = 0.3;
const VALVE_BODY_LENGTH = 1.2;
const PIPE_RADIUS = 0.2;
const PIPE_LENGTH = 1.0;
const HOUSING_SIZE = { x: 0.9, y: 0.9, z: 1.0 };
const DISPLAY_SIZE = { width: 0.6, height: 0.3 };
const LED_RADIUS = 0.1;
const BUTTON_RADIUS = 0.08;
const BUTTON_HEIGHT = 0.05;
const HANDLE_RADIUS = 0.15;
const HANDLE_LENGTH = 0.3;
const ARROW_RADIUS = 0.1;
const ARROW_HEIGHT = 0.3;
const BRACKET_SIZE = { x: 0.1, y: 0.3, z: 0.5 };

const useValveMaterials = (isDarkMode: boolean) => {
    return useMemo(() => ({
        valveBodyMaterial: new THREE.MeshStandardMaterial({
            color: isDarkMode ? 0x1a2e20 : 0xd0e8ff,
            roughness: 0.3,
            metalness: 0.8,
            name: 'valve_body'
        }),
        pipeMaterial: new THREE.MeshStandardMaterial({
            color: isDarkMode ? 0x333333 : 0x999999,
            roughness: 0.4,
            metalness: 0.6,
            name: 'pipe'
        }),
        housingMaterial: new THREE.MeshStandardMaterial({
            color: isDarkMode ? 0x006633 : 0xc8e6c9,
            roughness: 0.7,
            metalness: 0.2,
            name: 'housing'
        }),
        displayMaterial: new THREE.MeshStandardMaterial({
            color: isDarkMode ? 0x003322 : 0x66aa88,
            emissive: isDarkMode ? 0x00aa88 : 0x66aa88,
            emissiveIntensity: isDarkMode ? 0.6 : 0.2,
            roughness: 0.2,
            metalness: 0.3,
            name: 'display'
        }),
        ledMaterial: new THREE.MeshStandardMaterial({
            color: 0x00ff00,
            emissive: 0x00ff00,
            emissiveIntensity: 0.8,
            name: 'led'
        }),
        buttonMaterial: new THREE.MeshStandardMaterial({
            color: isDarkMode ? 0x77ccbb : 0x888888,
            roughness: 0.3,
            metalness: 0.7,
            name: 'button'
        }),
        handleMaterial: new THREE.MeshStandardMaterial({
            color: isDarkMode ? 0x44ff66 : 0x006644,
            roughness: 0.4,
            metalness: 0.6,
            name: 'handle'
        }),
        arrowMaterial: new THREE.MeshStandardMaterial({
            color: isDarkMode ? 0x00ffaa : 0x00aa88,
            emissive: isDarkMode ? 0x00aa88 : 0x008866,
            emissiveIntensity: isDarkMode ? 0.5 : 0.2,
            name: 'arrow'
        }),
        bracketMaterial: new THREE.MeshStandardMaterial({
            color: isDarkMode ? 0x444444 : 0x888888,
            roughness: 0.5,
            metalness: 0.5,
            name: 'bracket'
        }),
    }), [isDarkMode]);
};

export default function SmartWaterValve({ isDarkMode = false }: SmartWaterValveProps) {
    const valveGroupRef = useRef<THREE.Group>(null);
    const materials = useValveMaterials(isDarkMode);

    useFrame((state) => {
        const time = state.clock.elapsedTime;
        if (materials.ledMaterial) {
            materials.ledMaterial.emissiveIntensity = 0.7 + Math.abs(Math.sin(time * 4)) * 0.3;
        }
        if (materials.displayMaterial) {
            materials.displayMaterial.emissiveIntensity = 0.9 + Math.sin(time * 2) * 0.1;
        }
    });

    return (
        <group ref={valveGroupRef} dispose={null}>
            <mesh material={materials.valveBodyMaterial} rotation-z={Math.PI / 2}>
                <cylinderGeometry args={[VALVE_BODY_RADIUS, VALVE_BODY_RADIUS, VALVE_BODY_LENGTH, 32]} />
            </mesh>

            <mesh material={materials.pipeMaterial} position-x={-VALVE_BODY_LENGTH / 2 - PIPE_LENGTH / 2} rotation-z={Math.PI / 2}>
                <cylinderGeometry args={[PIPE_RADIUS, PIPE_RADIUS, PIPE_LENGTH, 16]} />
            </mesh>
            <mesh material={materials.pipeMaterial} position-x={VALVE_BODY_LENGTH / 2 + PIPE_LENGTH / 2} rotation-z={Math.PI / 2}>
                <cylinderGeometry args={[PIPE_RADIUS, PIPE_RADIUS, PIPE_LENGTH, 16]} />
            </mesh>

            <mesh material={materials.housingMaterial} position-y={VALVE_BODY_RADIUS + HOUSING_SIZE.y / 2}>
                <boxGeometry args={[HOUSING_SIZE.x, HOUSING_SIZE.y, HOUSING_SIZE.z]} />
            </mesh>

            <mesh
                material={materials.displayMaterial}
                position={[0, VALVE_BODY_RADIUS + HOUSING_SIZE.y / 2, HOUSING_SIZE.z / 2 + 0.01]}
            >
                <planeGeometry args={[DISPLAY_SIZE.width, DISPLAY_SIZE.height]} />
            </mesh>

            <mesh
                material={materials.ledMaterial}
                position={[DISPLAY_SIZE.width / 2 - LED_RADIUS - 0.05, VALVE_BODY_RADIUS + HOUSING_SIZE.y - LED_RADIUS - 0.05, HOUSING_SIZE.z / 2 + 0.01]}
            >
                <circleGeometry args={[LED_RADIUS, 16]} />
                <pointLight color={0x00ff00} intensity={1} distance={0.5} />
            </mesh>

            <mesh
                material={materials.buttonMaterial}
                position={[-HOUSING_SIZE.x / 4, VALVE_BODY_RADIUS + HOUSING_SIZE.y + BUTTON_HEIGHT / 2, HOUSING_SIZE.z / 2 - 0.1]}
                rotation-x={Math.PI / 2}
            >
                <cylinderGeometry args={[BUTTON_RADIUS, BUTTON_RADIUS, BUTTON_HEIGHT, 16]} />
            </mesh>

            <mesh
                material={materials.buttonMaterial}
                position={[HOUSING_SIZE.x / 4, VALVE_BODY_RADIUS + HOUSING_SIZE.y + BUTTON_HEIGHT / 2, HOUSING_SIZE.z / 2 - 0.1]}
                rotation-x={Math.PI / 2}
            >
                <cylinderGeometry args={[BUTTON_RADIUS, BUTTON_RADIUS, BUTTON_HEIGHT, 16]} />
            </mesh>

            <mesh
                material={materials.handleMaterial}
                position={[0, 0, VALVE_BODY_RADIUS + HANDLE_LENGTH / 2]}
                rotation-x={Math.PI / 2}
            >
                <cylinderGeometry args={[HANDLE_RADIUS, HANDLE_RADIUS, HANDLE_LENGTH, 16]} />
            </mesh>

            <mesh
                material={materials.arrowMaterial}
                position={[-VALVE_BODY_LENGTH / 4, VALVE_BODY_RADIUS + 0.01, 0]}
                rotation-z={-Math.PI / 2}
            >
                <coneGeometry args={[ARROW_RADIUS, ARROW_HEIGHT, 8]} />
            </mesh>

            <mesh
                material={materials.bracketMaterial}
                position={[0, -VALVE_BODY_RADIUS - BRACKET_SIZE.y / 2, -BRACKET_SIZE.z / 2]}
            >
                <boxGeometry args={[BRACKET_SIZE.x, BRACKET_SIZE.y, BRACKET_SIZE.z]} />
            </mesh>

            <mesh
                material={materials.bracketMaterial}
                position={[0, -VALVE_BODY_RADIUS - BRACKET_SIZE.y / 2, BRACKET_SIZE.z / 2]}
            >
                <boxGeometry args={[BRACKET_SIZE.x, BRACKET_SIZE.y, BRACKET_SIZE.z]} />
            </mesh>

        </group>
    );
}