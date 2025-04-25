'use client';

import React, { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei'; // For easier text rendering

type EnvSensorProps = {
  isDarkMode?: boolean;
}

// Define a type for signal ring data used in useFrame
interface SignalRingData {
  mesh: THREE.Mesh | null; // Allow null initially
  initialY: number;
  speed: number;
}

// Material hook
const useEnvSensorMaterials = (isDarkMode: boolean) => {
  return useMemo(() => ({
    pcbMaterial: new THREE.MeshStandardMaterial({
      color: 0x006633, // PCB green
      roughness: 0.7,
      metalness: 0.3,
      name: 'pcb'
    }),
    traceMaterial: new THREE.MeshStandardMaterial({
      color: 0xCFB53B, // Gold color
      roughness: 0.2,
      metalness: 0.8,
      emissive: isDarkMode ? 0x332200 : 0x000000,
      emissiveIntensity: isDarkMode ? 0.2 : 0,
      name: 'trace'
    }),
    chipMaterial: new THREE.MeshStandardMaterial({
      color: 0x111111,
      roughness: 0.5,
      metalness: 0.5,
      name: 'chip'
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
    ledMaterial: new THREE.MeshStandardMaterial({
      color: 0x00FF00,
      emissive: 0x00FF00,
      emissiveIntensity: 0.8, // Base intensity, will be animated
      transparent: true,
      opacity: 0.9,
      name: 'led'
    }),
    padMaterial: new THREE.MeshStandardMaterial({
      color: 0xCCCCCC,
      metalness: 0.9,
      roughness: 0.1,
      name: 'pad'
    }),
    sensorMaterial: new THREE.MeshStandardMaterial({
      color: 0x444444,
      roughness: 0.6,
      metalness: 0.4,
      name: 'sensorBody'
    }),
    sensorHoleMaterial: new THREE.MeshBasicMaterial({ color: 0x222222, name: 'sensorHole' })
  }), [isDarkMode]);
};

// --- Helper Components ---

function CircuitTrace({ x, z, width, length, rotation, material }: { x: number, z: number, width: number, length: number, rotation?: number, material: THREE.Material }) {
  return (
    <mesh material={material} position={[x, 0.005, z]} rotation-y={rotation ?? 0}> {/* Slightly raise trace */} 
      <boxGeometry args={[width, 0.01, length]} />
    </mesh>
  );
}

function ConnectionPad({ x, z, material }: { x: number, z: number, material: THREE.Material }) {
  return (
    <mesh material={material} position={[x, -0.015, z]} rotation-x={Math.PI / 2}> {/* Position relative to PCB bottom */} 
      <cylinderGeometry args={[0.08, 0.08, 0.03, 8]} />
    </mesh>
  );
}

function SensorHole({ x, z, material }: { x: number, z: number, material: THREE.Material }) {
    return (
        <mesh material={material} position={[x, 0.061, z]} rotation-x={Math.PI / 2}> {/* Position relative to sensor top */} 
            <circleGeometry args={[0.02, 8]} />
        </mesh>
    );
}

// --- Main Component ---

export default function EnvSensor({ isDarkMode = false }: EnvSensorProps) {
  const sensorGroupRef = useRef<THREE.Group>(null);
  const ledRef = useRef<THREE.Mesh>(null);
  const ledLightRef = useRef<THREE.PointLight>(null);

  // Refs for animated objects
  const signalRings = useRef<SignalRingData[]>([]);

  // Initialize refs only once
  useMemo(() => {
    signalRings.current = Array.from({ length: 3 }).map((_, i) => ({
      mesh: null, // Will be assigned in JSX
      initialY: 0.5 + i * 0.2,
      speed: 0.01 + i * 0.005
    }));
  }, []);

  const materials = useEnvSensorMaterials(isDarkMode);

  // Animation logic
  useFrame((state) => {
    const time = state.clock.elapsedTime;

    // Gentle hover animation
    if (sensorGroupRef.current) {
      sensorGroupRef.current.position.y = Math.sin(time * 0.8) * 0.05;
    }

    // Status LED blink
    if (ledRef.current && ledLightRef.current) {
      const intensityFactor = (Math.sin(time * 3) * 0.2 + 0.8);
      (ledRef.current.material as THREE.MeshStandardMaterial).emissiveIntensity = intensityFactor;
      ledLightRef.current.intensity = intensityFactor * 0.5;
    }

    // Animate signal rings
    signalRings.current.forEach(ring => {
      if (!ring.mesh) return;
      ring.mesh.position.y += ring.speed;
      const material = ring.mesh.material as THREE.MeshBasicMaterial;
      const progress = (ring.mesh.position.y - ring.initialY) / 0.5; // Normalize progress
      material.opacity = Math.max(0, 0.7 * (1 - progress)); // Fade out
      const scale = 1 + progress * 2;
      ring.mesh.scale.set(scale, 1, scale);

      if (material.opacity <= 0) {
        ring.mesh.position.y = ring.initialY;
        material.opacity = 0.7;
        ring.mesh.scale.set(1, 1, 1);
      }
    });
  });

  // Precompute positions
  const tracePositions = useMemo(() => [
    { x: 0, z: 0, width: 0.05, length: 1.4 },
    { x: 0.3, z: 0, width: 0.05, length: 1.4 },
    { x: -0.3, z: 0, width: 0.05, length: 1.4 },
    { x: 0, z: 0.3, width: 1.4, length: 0.05 },
    { x: 0, z: -0.3, width: 1.4, length: 0.05 },
  ], []);

  const padPositions = useMemo(() => [
    { x: 0.6, z: 0.6 }, { x: -0.6, z: 0.6 }, { x: 0.6, z: -0.6 }, { x: -0.6, z: -0.6 }
  ], []);

  const sensorHolePositions = useMemo(() => {
      const positions = [];
      for (let i = -2; i <= 2; i++) {
          for (let j = -2; j <= 2; j++) {
              if (Math.abs(i) === 2 && Math.abs(j) === 2) continue; // Skip corners
              positions.push({ x: i * 0.05, z: j * 0.05 });
          }
      }
      return positions;
  }, []);

  return (
    <group ref={sensorGroupRef} dispose={null}>
      {/* PCB */} 
      <mesh material={materials.pcbMaterial} castShadow receiveShadow>
        <boxGeometry args={[1.5, 0.1, 1.5]} />

        {/* Circuit Traces */} 
        {tracePositions.map((pos, i) => (
          <CircuitTrace key={`trace-${i}`} {...pos} material={materials.traceMaterial} />
        ))}

        {/* Main Chip */} 
        <mesh material={materials.chipMaterial} position-y={0.1} castShadow> {/* Position relative to PCB top */} 
          <boxGeometry args={[0.8, 0.1, 0.8]} />
          {/* Chip Label using Drei Text */} 
          <Text
            position={[0, 0.051, 0]} // Position relative to chip top
            rotation-x={-Math.PI / 2}
            fontSize={0.08}
            color="white"
            font="https://fonts.gstatic.com/s/roboto/v27/KFOmCnqEu92Fr1Mu4mxK.woff" // Example font
            anchorX="center"
            anchorY="middle"
            maxWidth={0.7}
            lineHeight={1.2}
          >
            ECOSENSE T2
          </Text>
        </mesh>

        {/* Antenna */} 
        <group position={[0.6, 0.05, 0.6]}> {/* Position relative to PCB top */} 
          <mesh material={materials.antennaMaterial} position-y={0.25} castShadow> {/* Base of antenna */} 
            <cylinderGeometry args={[0.02, 0.02, 0.5, 8]} />
          </mesh>
          <mesh material={materials.antennaMaterial} position-y={0.5}> {/* Top sphere */} 
            <sphereGeometry args={[0.04, 8, 8]} />
          </mesh>
        </group>

        {/* LED Indicator */} 
        <mesh ref={ledRef} material={materials.ledMaterial} position={[-0.6, 0.075, -0.6]} castShadow> {/* Position relative to PCB top */} 
          <boxGeometry args={[0.1, 0.05, 0.1]} />
          <pointLight ref={ledLightRef} color={0x00FF00} intensity={0.4} distance={0.5} position-y={0.05} />
        </mesh>

        {/* Connection Pads (Bottom) */} 
        {padPositions.map((pos, i) => (
          <ConnectionPad key={`pad-${i}`} {...pos} material={materials.padMaterial} />
        ))}

        {/* Sensor Component */} 
        <mesh material={materials.sensorMaterial} position={[0, 0.11, -0.5]} rotation-x={Math.PI / 2} castShadow> {/* Position relative to PCB top */} 
          <cylinderGeometry args={[0.15, 0.15, 0.12, 16]} />
           {/* Sensor Mesh Holes */} 
           {sensorHolePositions.map((pos, i) => (
               <SensorHole key={`hole-${i}`} {...pos} material={materials.sensorHoleMaterial} />
           ))}
        </mesh>

      </mesh> {/* End PCB Mesh */} 

      {/* Signal Emitter Rings (Positioned relative to the main group) */} 
      {signalRings.current.map((ringData, i) => (
        <mesh
          key={`signal-${i}`}
          ref={el => ringData.mesh = el} // Assign mesh to ref
          material={materials.signalMaterial}
          position={[0.6, ringData.initialY, 0.6]} // Initial position relative to group origin
          rotation-x={Math.PI / 2}
        >
          <ringGeometry args={[0.1, 0.12, 16]} />
        </mesh>
      ))}

    </group>
  );
}
