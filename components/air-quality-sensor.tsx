'use client';

import React, { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei'; // Import Text for easier text rendering

type AirQualitySensorProps = {
  isDarkMode?: boolean;
}

// Define a type for signal ring data used in useFrame
interface SignalRingData {
  mesh: THREE.Mesh | null; // Allow null initially
  initialY: number;
  speed: number;
}

// Define a type for particle data used in useFrame
interface ParticleData {
  mesh: THREE.Mesh | null; // Allow null initially
  initialX: number;
  initialZ: number;
  speed: number;
  angle: number;
}

// Helper hook for materials (similar to 5g-tower)
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
      emissiveIntensity: 0.8, // Base intensity, will be animated
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
    // Gas sensor top materials (unique colors)
    gasSensorTopRed: new THREE.MeshStandardMaterial({ color: 0xff0000, roughness: 0.3, metalness: 0.5, name: 'gasSensorTop' }),
    gasSensorTopGreen: new THREE.MeshStandardMaterial({ color: 0x00ff00, roughness: 0.3, metalness: 0.5, name: 'gasSensorTop' }),
    gasSensorTopBlue: new THREE.MeshStandardMaterial({ color: 0x0000ff, roughness: 0.3, metalness: 0.5, name: 'gasSensorTop' }),
    gasSensorTopYellow: new THREE.MeshStandardMaterial({ color: 0xffff00, roughness: 0.3, metalness: 0.5, name: 'gasSensorTop' }),
  }), [isDarkMode]);
};

// --- Helper Components for Structure ---

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
      {/* Vent opening */}
      <mesh material={materials.ventMaterial}>
        <boxGeometry args={[0.4, 0.2, 0.1]} />
      </mesh>
      {/* Mesh filter */}
      <mesh material={materials.filterMaterial} position-z={0.01}>
        <planeGeometry args={[0.35, 0.15]} />
      </mesh>
    </group>
  );
}

function GasSensor({ x, z, topMaterial, materials }: { x: number, z: number, topMaterial: THREE.Material, materials: ReturnType<typeof useSensorMaterials> }) {
  return (
    <group position={[x, 0.1, z]}>
      {/* Sensor base */}
      <mesh material={materials.gasSensorBaseMaterial}>
        <cylinderGeometry args={[0.1, 0.1, 0.05, 16]} />
      </mesh>
      {/* Sensor top */}
      <mesh material={topMaterial} position-y={0.04}>
        <cylinderGeometry args={[0.08, 0.08, 0.03, 16]} />
      </mesh>
      {/* Add mesh pattern on top */}
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

// --- Main Component ---

export default function AirQualitySensor({ isDarkMode = false }: AirQualitySensorProps) {
  const sensorGroupRef = useRef<THREE.Group>(null);
  const indicatorRef = useRef<THREE.Mesh>(null);
  const indicatorLightRef = useRef<THREE.PointLight>(null);

  // Refs for animated objects
  const signalRings = useRef<SignalRingData[]>([]);
  const particles = useRef<ParticleData[]>([]);

  // Initialize refs only once
  useMemo(() => {
    signalRings.current = Array.from({ length: 3 }).map((_, i) => ({
      mesh: null, // Will be assigned in JSX
      initialY: 0.9 + i * 0.2,
      speed: 0.01 + i * 0.005
    }));
    particles.current = Array.from({ length: 15 }).map(() => ({
      mesh: null, // Will be assigned in JSX
      initialX: (Math.random() - 0.5) * 0.4, // Random initial pos within chamber
      initialZ: (Math.random() - 0.5) * 0.4,
      speed: 0.01 + Math.random() * 0.02,
      angle: Math.random() * Math.PI * 2
    }));
  }, []);

  const materials = useSensorMaterials(isDarkMode);
  const textColor = isDarkMode ? '#00ff88' : '#00ff88'; // Keep green for now

  // Animation logic
  useFrame((state, delta) => {
    const time = state.clock.elapsedTime;

    // Gentle hover animation for the whole sensor
    if (sensorGroupRef.current) {
      sensorGroupRef.current.position.y = Math.sin(time * 0.8) * 0.05;
    }

    // Status LED blink
    if (indicatorRef.current && indicatorLightRef.current) {
      const intensityFactor = (Math.sin(time * 2) * 0.2 + 0.8);
      (indicatorRef.current.material as THREE.MeshStandardMaterial).emissiveIntensity = intensityFactor;
      indicatorLightRef.current.intensity = intensityFactor * 0.5;
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

    // Animate particles in chamber
    particles.current.forEach(particle => {
      if (!particle.mesh) return;
      particle.angle += particle.speed;
      particle.mesh.position.x = particle.initialX + Math.sin(particle.angle) * 0.05;
      particle.mesh.position.z = particle.initialZ + Math.cos(particle.angle) * 0.05;
      // Add some vertical movement
      particle.mesh.position.y = Math.sin(time * particle.speed * 5 + particle.angle) * 0.05;
    });
  });

  // Precompute positions/angles where possible
  const tracePositions = useMemo(() => Array.from({ length: 8 }).map((_, i) => {
    const angle = (i / 8) * Math.PI * 2;
    return { x: Math.cos(angle) * 0.25, z: Math.sin(angle) * 0.25, angle };
  }), []);

  const ventAngles = useMemo(() => Array.from({ length: 6 }).map((_, i) => (i / 6) * Math.PI * 2), []);

  const gasSensorPositions = useMemo(() => [
    { x: 0.5, z: 0.5, material: materials.gasSensorTopRed },
    { x: -0.5, z: 0.5, material: materials.gasSensorTopGreen },
    { x: 0.5, z: -0.5, material: materials.gasSensorTopBlue },
    { x: -0.5, z: -0.5, material: materials.gasSensorTopYellow },
  ], [materials]);

  const mountingHolePositions = useMemo(() => [
    { x: 0.6, z: 0.6 }, { x: -0.6, z: 0.6 }, { x: 0.6, z: -0.6 }, { x: -0.6, z: -0.6 }
  ], []);

  return (
    <group ref={sensorGroupRef} dispose={null}>
      {/* Main Housing */} 
      <mesh material={materials.housingMaterial} position-y={0.4} castShadow receiveShadow>
        <cylinderGeometry args={[1.2, 1.2, 0.8, 32]} />

        {/* PCB Base */} 
        <mesh material={materials.pcbMaterial} position-y={-0.2}> {/* Adjusted y position relative to housing */} 
          <cylinderGeometry args={[1.0, 1.0, 0.1, 32]} />
          {/* Circuit Traces */} 
          {tracePositions.map((pos, i) => (
            <CircuitTrace key={i} {...pos} width={0.05} length={0.8} material={materials.traceMaterial} />
          ))}
        </mesh>

        {/* Intake Vents */} 
        {ventAngles.map((angle, i) => (
          <IntakeVent key={i} angle={angle} materials={materials} />
        ))}

        {/* Particulate Matter Chamber */} 
        <group position-y={-0.1}> {/* Adjusted y position relative to housing */} 
          {/* Chamber Housing (Transparent) */} 
          <mesh material={materials.chamberMaterial}>
            <cylinderGeometry args={[0.3, 0.3, 0.3, 16]} />
          </mesh>
          {/* Laser Emitter */} 
          <mesh material={materials.laserDeviceMaterial} position={[0.3, 0, 0]} rotation-z={Math.PI / 2}>
            <cylinderGeometry args={[0.05, 0.05, 0.1, 8]} />
          </mesh>
          {/* Laser Beam */} 
          <mesh material={materials.laserBeamMaterial} rotation-z={Math.PI / 2}>
            <cylinderGeometry args={[0.01, 0.01, 0.6, 8]} />
          </mesh>
          {/* Laser Receiver */} 
          <mesh material={materials.laserDeviceMaterial} position={[-0.3, 0, 0]} rotation-z={Math.PI / 2}>
            <cylinderGeometry args={[0.05, 0.05, 0.1, 8]} />
          </mesh>
          {/* Floating Particles */} 
          {particles.current.map((particleData, i) => (
            <mesh
              key={i}
              ref={el => particleData.mesh = el} // Assign mesh to ref
              material={materials.particleMaterial}
              position={[particleData.initialX, 0, particleData.initialZ]} // Initial position set here
            >
              <sphereGeometry args={[0.01, 8, 8]} />
            </mesh>
          ))}
        </group>

        {/* Gas Sensors */} 
        {gasSensorPositions.map((pos, i) => (
          <GasSensor key={i} x={pos.x} z={pos.z} topMaterial={pos.material} materials={materials} />
        ))}

        {/* Digital Display */} 
        <group position={[0, 0.1, 0.9]}> {/* Adjusted y position relative to housing */} 
          {/* Display Background */} 
          <mesh material={materials.displayMaterial}>
            <planeGeometry args={[0.6, 0.3]} />
          </mesh>
          {/* Display Text (AQI Number) using Drei Text */} 
          <Text
            position={[0, 0.02, 0.01]} // Fine-tune position
            fontSize={0.15}
            color={textColor}
            font="https://fonts.gstatic.com/s/roboto/v27/KFOmCnqEu92Fr1Mu4mxK.woff" // Example font
            anchorX="center"
            anchorY="middle"
            characters="0123456789"
          >
            42
          </Text>
          {/* AQI Label using Drei Text */} 
          <Text
            position={[0, -0.08, 0.01]} // Fine-tune position
            fontSize={0.05}
            color={textColor}
            font="https://fonts.gstatic.com/s/roboto/v27/KFOmCnqEu92Fr1Mu4mxK.woff"
            anchorX="center"
            anchorY="middle"
          >
            AQI
          </Text>
        </group>

        {/* Status Indicator */} 
        <mesh ref={indicatorRef} material={materials.indicatorMaterial} position={[0, 0.1, -0.9]} rotation-x={Math.PI / 2}> {/* Adjusted y position */} 
          <cylinderGeometry args={[0.1, 0.1, 0.05, 16]} />
          <pointLight ref={indicatorLightRef} color={0x00ff00} intensity={0.4} distance={1} /> {/* Initial intensity */} 
        </mesh>

        {/* USB-C Port */} 
        <group position={[0, -0.4, -1.1]}> {/* Adjusted y position relative to housing */} 
          {/* Port Housing */} 
          <mesh material={materials.usbPortMaterial}>
            <boxGeometry args={[0.3, 0.1, 0.05]} />
          </mesh>
          {/* Port Connector */} 
          <mesh material={materials.usbConnectorMaterial} position-z={-0.02}>
            <boxGeometry args={[0.25, 0.06, 0.02]} />
          </mesh>
        </group>

      </mesh> {/* End Main Housing Mesh */} 

      {/* Antenna */} 
      <group position={[0.8, 0.7, 0]} castShadow>
        <mesh material={materials.antennaMaterial}>
          <cylinderGeometry args={[0.02, 0.02, 0.5, 8]} />
        </mesh>
        <mesh material={materials.antennaMaterial} position-y={0.25}>
          <sphereGeometry args={[0.04, 8, 8]} />
        </mesh>
      </group>

      {/* Signal Emitter Rings (Positioned relative to the main group) */} 
      {signalRings.current.map((ringData, i) => (
        <mesh
          key={i}
          ref={el => ringData.mesh = el} // Assign mesh to ref
          material={materials.signalMaterial}
          position={[0.8, ringData.initialY, 0]} // Initial position
          rotation-x={Math.PI / 2}
        >
          <ringGeometry args={[0.1, 0.12, 16]} />
        </mesh>
      ))}

      {/* Connection Stem */} 
      <mesh material={materials.stemMaterial} position-y={-0.4}>
        <cylinderGeometry args={[0.15, 0.15, 1.2, 16]} />
      </mesh>

      {/* Wall Mounting Bracket */} 
      <group position-y={-1.0}> {/* Adjusted y position */} 
        {/* Bracket Base */} 
        <mesh material={materials.bracketBaseMaterial} receiveShadow>
          <boxGeometry args={[1.5, 0.1, 1.5]} />
        </mesh>
        {/* Mounting Holes */} 
        {mountingHolePositions.map((pos, i) => (
            <MountingHole key={i} x={pos.x} z={pos.z} material={materials.mountingHoleMaterial} />
        ))}
      </group>

    </group>
  );
}