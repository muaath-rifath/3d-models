'use client';

import React, { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';

type IoTGatewayProps = {
    isDarkMode?: boolean;
}

// Defining measurements for our cylindrical gateway
const GATEWAY_HEIGHT = 15;
const GATEWAY_DIAMETER = 8;
const GATEWAY_RADIUS = GATEWAY_DIAMETER / 2;

const useGatewayMaterials = (isDarkMode: boolean) => {
    return useMemo(() => ({
        // Main body material
        mainBodyMaterial: new THREE.MeshStandardMaterial({
            color: isDarkMode ? 0x1a2e20 : 0xd0e8ff,
            roughness: 0.7,
            metalness: 0.3,
            name: 'main_body'
        }),
        
        // Top surface material
        topSurfaceMaterial: new THREE.MeshStandardMaterial({
            color: isDarkMode ? 0x8fffaa : 0x009977,
            roughness: 0.3,
            metalness: 0.7,
            name: 'top_surface'
        }),
        
        // Display material
        displayMaterial: new THREE.MeshStandardMaterial({
            color: isDarkMode ? 0x00ffaa : 0x00aa88,
            roughness: 0.2,
            metalness: 0.8,
            emissive: isDarkMode ? 0x00ffaa : 0x00aa88,
            emissiveIntensity: isDarkMode ? 1.5 : 0.8,
            name: 'display'
        }),
        
        // Light ring material
        lightRingMaterial: new THREE.MeshStandardMaterial({
            color: isDarkMode ? 0x44ff66 : 0x22ee55,
            roughness: 0.1,
            metalness: 0.9,
            emissive: isDarkMode ? 0x44ff66 : 0x22ee55,
            emissiveIntensity: isDarkMode ? 2.0 : 1.5,
            name: 'light_ring'
        }),
        
        // Ventilation slots material
        ventilationMaterial: new THREE.MeshStandardMaterial({
            color: isDarkMode ? 0x2a3e30 : 0xb0c8df,
            roughness: 0.6,
            metalness: 0.2,
            name: 'ventilation'
        }),
        
        // Port panel material
        portPanelMaterial: new THREE.MeshStandardMaterial({
            color: isDarkMode ? 0x2a3e30 : 0xb0c8df,
            roughness: 0.6,
            metalness: 0.2,
            name: 'port_panel'
        }),
        
        // Port material
        portMaterial: new THREE.MeshStandardMaterial({
            color: 0x222222,
            roughness: 0.8,
            metalness: 0.5,
            name: 'port'
        })
    }), [isDarkMode]);
};

export default function IoTGateway({ isDarkMode = false }: IoTGatewayProps) {
    const gatewayGroupRef = useRef<THREE.Group>(null);
    const materials = useGatewayMaterials(isDarkMode);
    
    // References for animated elements
    const displayMatRef = useRef<THREE.MeshStandardMaterial | null>(null);
    const lightRingRef = useRef<THREE.Mesh | null>(null);
    
    useFrame((state) => {
        const time = state.clock.elapsedTime;
        
        // Pulsing light ring effect
        if (lightRingRef.current && lightRingRef.current.material instanceof THREE.MeshStandardMaterial) {
            const pulseIntensity = isDarkMode ? 
                1.8 + Math.sin(time * 2) * 0.2 : 
                1.3 + Math.sin(time * 2) * 0.2;
            lightRingRef.current.material.emissiveIntensity = pulseIntensity;
        }
    });

    return (
        <group ref={gatewayGroupRef} dispose={null}>
            {/* Main cylindrical body */}
            <mesh material={materials.mainBodyMaterial} castShadow receiveShadow>
                <cylinderGeometry args={[GATEWAY_RADIUS, GATEWAY_RADIUS, GATEWAY_HEIGHT, 32]} />
            </mesh>
            
            {/* Top surface */}
            <mesh 
                material={materials.topSurfaceMaterial} 
                position={[0, GATEWAY_HEIGHT / 2, 0]} 
                castShadow 
                receiveShadow
            >
                <cylinderGeometry args={[GATEWAY_RADIUS, GATEWAY_RADIUS, 0.5, 32]} />
            </mesh>
            
            {/* Status display - curved to match cylinder */}
            <mesh
                material={materials.displayMaterial}
                position={[0, 2, 0]}
                castShadow
                receiveShadow
            >
                <cylinderGeometry
                    args={[
                        GATEWAY_RADIUS + 0.05, // Slightly larger radius to avoid z-fighting
                        GATEWAY_RADIUS + 0.05,
                        3, // Height of display
                        16, // Segments
                        1,
                        true, // Open-ended
                        -Math.PI/3, // Start angle
                        Math.PI/1.5 // Length angle
                    ]}
                />
            </mesh>
            
            {/* LED light ring */}
            <mesh
                ref={lightRingRef}
                material={materials.lightRingMaterial}
                position={[0, GATEWAY_HEIGHT / 4, 0]}
                rotation={[Math.PI / 2, 0, 0]}
            >
                <torusGeometry args={[GATEWAY_RADIUS + 0.1, 0.2, 16, 100]} />
            </mesh>
            
            {/* Ventilation slots */}
            {Array.from({ length: 12 }).map((_, index) => {
                const angle = (index / 12) * Math.PI * 2;
                return (
                    <group key={`vent-group-${index}`}>
                        {Array.from({ length: 3 }).map((_, rowIndex) => {
                            const rowY = -GATEWAY_HEIGHT / 4 + rowIndex * 2;
                            return (
                                <mesh
                                    key={`vent-${index}-${rowIndex}`}
                                    material={materials.ventilationMaterial}
                                    position={[
                                        Math.sin(angle) * (GATEWAY_RADIUS + 0.01),
                                        rowY,
                                        Math.cos(angle) * (GATEWAY_RADIUS + 0.01)
                                    ]}
                                    rotation={[0, angle, 0]}
                                >
                                    <boxGeometry args={[0.2, 0.8, 0.2]} />
                                </mesh>
                            );
                        })}
                    </group>
                );
            })}
            
            {/* Port panel at the bottom front */}
            <mesh
                material={materials.portPanelMaterial}
                position={[0, -GATEWAY_HEIGHT / 2 + 1.75, 0]}
            >
                <cylinderGeometry
                    args={[
                        GATEWAY_RADIUS + 0.01,
                        GATEWAY_RADIUS + 0.01,
                        3.5,
                        32,
                        1,
                        true,
                        -Math.PI/3,
                        Math.PI/1.5
                    ]}
                />
            </mesh>
            
            {/* Ethernet port */}
            <mesh
                material={materials.portMaterial}
                position={[0, -GATEWAY_HEIGHT / 2 + 1.5, GATEWAY_RADIUS + 0.1]}
                rotation={[0, 0, 0]}
            >
                <boxGeometry args={[1.5, 0.6, 0.2]} />
            </mesh>
            
            {/* USB ports */}
            <mesh
                material={materials.portMaterial}
                position={[-1, -GATEWAY_HEIGHT / 2 + 1.5, GATEWAY_RADIUS + 0.1]}
                rotation={[0, 0, 0]}
            >
                <boxGeometry args={[0.9, 0.4, 0.2]} />
            </mesh>
            
            <mesh
                material={materials.portMaterial}
                position={[1, -GATEWAY_HEIGHT / 2 + 1.5, GATEWAY_RADIUS + 0.1]}
                rotation={[0, 0, 0]}
            >
                <boxGeometry args={[0.9, 0.4, 0.2]} />
            </mesh>
            
            {/* Power port */}
            <mesh
                material={materials.portMaterial}
                position={[0, -GATEWAY_HEIGHT / 2 + 0.5, GATEWAY_RADIUS + 0.1]}
                rotation={[Math.PI / 2, 0, 0]}
            >
                <cylinderGeometry args={[0.35, 0.35, 0.2, 32]} />
            </mesh>
        </group>
    );
}