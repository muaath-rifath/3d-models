'use client';

import React, { useRef, useMemo, useState, useEffect, useCallback } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { RoundedBox, Text } from '@react-three/drei'; // Use RoundedBox and Text

// --- Interfaces & Types ---
interface WaveData {
  id: number;
  meshRef: React.RefObject<THREE.Mesh | null>; // Allow null
  materialRef: React.RefObject<THREE.MeshStandardMaterial | null>; // Allow null
  scale: number;
  opacity: number;
  created: number;
  coneHeight: number;
  coneRadius: number;
}

interface WaveEmitterState {
  waves: WaveData[];
  nextWaveTime: number;
}

type VehicleIoTGatewayProps = {
  isDarkMode?: boolean;
  // Removed width and height props
}

// --- Constants ---
const LENGTH = 12;
const DEVICE_WIDTH = 8;
const DEVICE_HEIGHT = 3;
const HALF_LENGTH = LENGTH / 2;
const HALF_WIDTH = DEVICE_WIDTH / 2;
const HALF_HEIGHT = DEVICE_HEIGHT / 2;
const EDGE_RADIUS = 0.5;
const SHOCK_ABSORBER_RADIUS = 0.6;
const SHOCK_ABSORBER_HEIGHT = 0.5;
const ANTENNA_HOUSING_SIZE = { x: LENGTH / 2, y: 0.8, z: DEVICE_WIDTH / 2 };
const ANTENNA_BASE_RADIUS = 0.4;
const ANTENNA_ROD_RADIUS = 0.2;
const ANTENNA_TIP_RADIUS = 0.2;
const ANTENNA_TIP_HEIGHT = 0.4;
const DISPLAY_WIDTH = 6;
const DISPLAY_HEIGHT = 2;
const DISPLAY_DEPTH = 0.1;
const SIM_SLOT_SIZE = { x: 2, y: 0.2, z: 1 };
const SD_SLOT_SIZE = { x: 2.2, y: 0.3, z: 1.2 };
const POWER_HOUSING_RADIUS = 1;
const POWER_HOUSING_LENGTH = 1.5;
const POWER_TIP_RADIUS = 0.7;
const POWER_TIP_LENGTH = 0.5;
const POWER_CABLE_RADIUS = 0.3;
const POWER_CABLE_LENGTH = 3;
const ANTENNA_PORT_BASE_RADIUS = 0.4;
const ANTENNA_PORT_CONNECTOR_RADIUS = 0.25;
const MOUNT_BRACKET_BASE_SIZE = { x: LENGTH + 2, y: 0.3, z: DEVICE_WIDTH };
const MOUNT_BRACKET_SIDE_SIZE = { x: 0.5, y: 2, z: DEVICE_WIDTH };
const MOUNT_HOLE_RADIUS = 0.2;
const LED_RADIUS = 0.2;
const LED_HEIGHT = 0.1;

// Wave Animation Config
const WAVE_CONFIG = {
  coneAngle: Math.PI / 6,      // 30 degrees cone angle
  maxHeight: 10,             // Maximum propagation height
  rotationSpeed: 0.03,       // Rotation speed
  segments: 32,              // Ring segment count for smoother circles
  lifespan: 3000,            // Wave lifetime in milliseconds
  initialRingSize: 0.15,     // Initial ring radius
  fadeStart: 0.7,            // Start fading after 70% progress
  expansionRate: 1.5         // Controls cone expansion speed
};

// --- Materials Hook ---
const useGatewayMaterials = (isDarkMode: boolean) => {
  return useMemo(() => ({
    mainBodyMaterial: new THREE.MeshStandardMaterial({
      color: isDarkMode ? 0x1a2e20 : 0xc0e8d0,
      roughness: 0.7,
      metalness: 0.3
    }),
    antennaBaseMaterial: new THREE.MeshStandardMaterial({
      color: isDarkMode ? 0x8fffaa : 0x009977,
      roughness: 0.3,
      metalness: 0.7
    }),
    screenMaterial: new THREE.MeshStandardMaterial({
      color: isDarkMode ? 0x00ffaa : 0x00aa88,
      roughness: 0.2,
      metalness: 0.8,
      emissive: isDarkMode ? 0x00ffaa : 0x00aa88,
      emissiveIntensity: isDarkMode ? 0.5 : 0.3
    }),
    mountingMaterial: new THREE.MeshStandardMaterial({
      color: isDarkMode ? 0x44ff66 : 0x006644,
      roughness: 0.3,
      metalness: 0.7
    }),
    connectorMaterial: new THREE.MeshStandardMaterial({
      color: 0x333333,
      roughness: 0.4,
      metalness: 0.7
    }),
    rubberizerMaterial: new THREE.MeshStandardMaterial({
      color: 0x444444,
      roughness: 0.9,
      metalness: 0.1
    }),
    vehiclePowerMaterial: new THREE.MeshStandardMaterial({
      color: 0x111111,
      roughness: 0.2,
      metalness: 0.9
    }),
    ledGreen: new THREE.MeshStandardMaterial({ color: 0x00ff00, emissive: 0x00ff00, emissiveIntensity: 0.8 }),
    ledBlue: new THREE.MeshStandardMaterial({ color: 0x0000ff, emissive: 0x0000ff, emissiveIntensity: 0.8 }),
    ledRed: new THREE.MeshStandardMaterial({ color: 0xff0000, emissive: 0xff0000, emissiveIntensity: 0.8 }),
    ledYellow: new THREE.MeshStandardMaterial({ color: 0xffff00, emissive: 0xffff00, emissiveIntensity: 0.8 }),
    mountHole: new THREE.MeshBasicMaterial({ color: 0x000000 }),
    waveMaterialBase: (color: THREE.Color) => new THREE.MeshStandardMaterial({
        color: color,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.8,
        depthWrite: false,
        metalness: 0.3,
        roughness: 0.4,
        emissive: color,
        emissiveIntensity: 0.3
      }),
  }), [isDarkMode]);
};

// --- Helper Components ---

// Shock Absorber Component
const ShockAbsorber = React.memo(({ position, materials }: { position: [number, number, number], materials: ReturnType<typeof useGatewayMaterials> }) => (
  <group position={position}>
    <mesh material={materials.rubberizerMaterial} position-y={-SHOCK_ABSORBER_HEIGHT / 2}>
      <cylinderGeometry args={[SHOCK_ABSORBER_RADIUS, SHOCK_ABSORBER_RADIUS, SHOCK_ABSORBER_HEIGHT, 16]} />
    </mesh>
    <mesh material={materials.connectorMaterial} position-y={-SHOCK_ABSORBER_HEIGHT - 0.1}>
      <cylinderGeometry args={[SHOCK_ABSORBER_RADIUS * 0.8, SHOCK_ABSORBER_RADIUS * 0.8, 0.2, 16]} />
    </mesh>
  </group>
));
ShockAbsorber.displayName = 'ShockAbsorber';

// Antenna Component with Wave Emitter Logic
const Antenna = React.memo(({
  position,
  antennaHeight,
  label,
  waveColor,
  materials,
  isDarkMode,
  waveInterval
}: {
  position: [number, number, number];
  antennaHeight: number;
  label: string;
  waveColor: THREE.Color;
  materials: ReturnType<typeof useGatewayMaterials>;
  isDarkMode: boolean;
  waveInterval: number;
}) => {
  const waveGroupRef = useRef<THREE.Group>(null);
  const [emitterState, setEmitterState] = useState<WaveEmitterState>({ waves: [], nextWaveTime: 0 });
  const waveMaterial = useMemo(() => materials.waveMaterialBase(waveColor), [materials, waveColor]);
  let waveCounter = useRef(0);

  useFrame(() => {
    const now = Date.now();
    let updatedWaves = [...emitterState.waves];
    let needsUpdate = false;

    // Create new wave
    if (now >= emitterState.nextWaveTime) {
      const newWave: WaveData = {
        id: waveCounter.current++,
        meshRef: React.createRef(),
        materialRef: React.createRef(),
        scale: 1,
        opacity: 0.8,
        created: now,
        coneHeight: 0,
        coneRadius: WAVE_CONFIG.initialRingSize,
      };
      updatedWaves.push(newWave);
      setEmitterState(prev => ({ ...prev, nextWaveTime: now + waveInterval, waves: updatedWaves }));
      needsUpdate = true;
    }

    // Animate existing waves
    for (let i = updatedWaves.length - 1; i >= 0; i--) {
      const wave = updatedWaves[i];
      const age = now - wave.created;
      const lifespan = WAVE_CONFIG.lifespan;

      if (age < lifespan) {
        const progress = age / lifespan;
        const waveHeight = progress * WAVE_CONFIG.maxHeight;
        const radius = Math.tan(WAVE_CONFIG.coneAngle) * waveHeight;
        const ringScale = 1 + radius / WAVE_CONFIG.initialRingSize;
        const newOpacity = 0.8 * (1 - progress);

        // Update wave data (will be used by the WaveMesh component)
        wave.coneHeight = waveHeight;
        wave.scale = ringScale;
        wave.opacity = newOpacity;
        needsUpdate = true; // Mark for potential state update if values changed significantly

      } else {
        // Remove expired waves
        updatedWaves.splice(i, 1);
        needsUpdate = true;
      }
    }

    // Only update state if waves array changed length or significant updates occurred
    // This check might need refinement based on performance
    if (needsUpdate && updatedWaves.length !== emitterState.waves.length) {
         setEmitterState(prev => ({ ...prev, waves: updatedWaves }));
    }
    // If only properties changed, the WaveMesh component will handle updates via refs

  });

  return (
    <group position={position}>
      {/* Antenna Base */}
      <mesh material={materials.connectorMaterial}>
        <cylinderGeometry args={[ANTENNA_BASE_RADIUS, ANTENNA_BASE_RADIUS * 1.2, 0.3, 16]} />
      </mesh>
      {/* Antenna Rod */}
      <mesh material={materials.connectorMaterial} position-y={antennaHeight / 2 + 0.15}>
        <cylinderGeometry args={[ANTENNA_ROD_RADIUS, ANTENNA_ROD_RADIUS, antennaHeight, 8]} />
      </mesh>
      {/* Antenna Tip */}
      <mesh material={materials.antennaBaseMaterial} position-y={antennaHeight + 0.35}>
        <coneGeometry args={[ANTENNA_TIP_RADIUS, ANTENNA_TIP_HEIGHT, 8]} />
      </mesh>
      {/* Wave Emission Point & Waves */}
      <group ref={waveGroupRef} position-y={antennaHeight + 0.55}>
        {emitterState.waves.map(wave => (
          <WaveMesh key={wave.id} waveData={wave} material={waveMaterial} />
        ))}
      </group>
      {/* Label */}
      <Text
        color={isDarkMode ? '#ccddee' : '#335544'}
        fontSize={0.5}
        position={[0, 0.5, 0.7]}
        rotation={[-Math.PI / 6, 0, 0]}
        anchorX="center"
        anchorY="middle"
      >
        {label}
      </Text>
    </group>
  );
});
Antenna.displayName = 'Antenna';

// Wave Mesh Component (Handles individual wave animation updates)
const WaveMesh = ({ waveData, material }: { waveData: WaveData, material: THREE.MeshStandardMaterial }) => {
  const meshRef = useRef<THREE.Mesh>(null!);
  const matRef = useRef<THREE.MeshStandardMaterial>(null!);

  useFrame(() => {
    if (meshRef.current && matRef.current) {
      meshRef.current.position.y = waveData.coneHeight;
      meshRef.current.scale.set(waveData.scale, waveData.scale, 1);
      meshRef.current.rotation.z += WAVE_CONFIG.rotationSpeed;
      matRef.current.opacity = waveData.opacity;
    }
  });

  return (
    <mesh ref={meshRef} rotation-x={Math.PI / 2}>
      <ringGeometry args={[WAVE_CONFIG.initialRingSize * 0.7, WAVE_CONFIG.initialRingSize, WAVE_CONFIG.segments]} />
      <primitive object={material.clone()} ref={matRef} attach="material" />
    </mesh>
  );
};

// Status Display Component
const StatusDisplay = React.memo(({ position, rotation, materials, isDarkMode }: {
  position: [number, number, number];
  rotation: [number, number, number];
  materials: ReturnType<typeof useGatewayMaterials>;
  isDarkMode: boolean;
}) => {
  const [timeString, setTimeString] = useState('');
  const [strengths, setStrengths] = useState({ cell: 0, gps: 0, wifi: 0, vehicle: 0 });
  const textMaterial = useMemo(() => new THREE.MeshBasicMaterial({ color: isDarkMode ? '#00ffaa' : '#00aa88' }), [isDarkMode]);
  const valueMaterial = useMemo(() => new THREE.MeshBasicMaterial({ color: '#ccddee' }), []);
  const statusMaterial = useMemo(() => new THREE.MeshBasicMaterial({ color: '#00ff00' }), []);

  useFrame(({ clock }) => {
    const now = new Date();
    setTimeString(now.toLocaleTimeString());

    const t = clock.elapsedTime;
    setStrengths({
      cell: 75 + 15 * Math.sin(t * 0.3),
      gps: 85 + 10 * Math.sin(t * 0.2 + 1),
      wifi: 60 + 20 * Math.sin(t * 0.4 + 2),
      vehicle: 95 + 5 * Math.sin(t * 0.1),
    });
  });

  const StrengthBar = ({ y, label, strength }: { y: number, label: string, strength: number }) => {
    const barWidth = DISPLAY_WIDTH * 0.4;
    const barHeight = DISPLAY_HEIGHT * 0.08;
    const activeWidth = barWidth * (strength / 100);
    const strengthColor = strength > 70 ? '#00ff00' : strength > 30 ? '#ffff00' : '#ff0000';

    return (
      <group position-y={y}>
        <Text material={valueMaterial} fontSize={0.18} anchorX="left" position={[-DISPLAY_WIDTH * 0.45, 0, 0.01]}>{label}</Text>
        {/* Background Bar */}
        <mesh position={[DISPLAY_WIDTH * 0.05, 0, 0.01]}>
          <planeGeometry args={[barWidth, barHeight]} />
          <meshBasicMaterial color="#333333" />
        </mesh>
        {/* Active Bar */}
        <mesh position={[-DISPLAY_WIDTH * 0.15 + activeWidth / 2, 0, 0.02]}>
          <planeGeometry args={[activeWidth, barHeight]} />
          <meshBasicMaterial color={strengthColor} />
        </mesh>
        <Text material={valueMaterial} fontSize={0.15} anchorX="left" position={[DISPLAY_WIDTH * 0.3, 0, 0.01]}>{`${Math.round(strength)}%`}</Text>
      </group>
    );
  };

  return (
    <group position={position} rotation={rotation}>
      {/* Bezel */}
      <mesh material={materials.mainBodyMaterial} position-z={-DISPLAY_DEPTH * 0.6}>
        <boxGeometry args={[DISPLAY_WIDTH + 0.4, DISPLAY_HEIGHT + 0.4, DISPLAY_DEPTH]} />
      </mesh>
      {/* Screen Background */}
      <mesh material={materials.screenMaterial}>
        <planeGeometry args={[DISPLAY_WIDTH, DISPLAY_HEIGHT]} />
      </mesh>
      {/* Content Group (relative positioning) */}
      <group position-z={0.01}> {/* Bring content slightly forward */}
        {/* Title */}
        <Text material={textMaterial} fontSize={0.25} anchorX="center" anchorY="top" position={[0, DISPLAY_HEIGHT * 0.4, 0.01]}>
          VEHICLE IoT GATEWAY
        </Text>
        {/* Time */}
        <Text material={valueMaterial} fontSize={0.18} anchorX="right" anchorY="top" position={[DISPLAY_WIDTH * 0.45, DISPLAY_HEIGHT * 0.4, 0.01]}>
          {timeString}
        </Text>
        {/* Strength Bars */}
        <StrengthBar y={DISPLAY_HEIGHT * 0.1} label="CELL" strength={strengths.cell} />
        <StrengthBar y={-DISPLAY_HEIGHT * 0.05} label="GPS" strength={strengths.gps} />
        <StrengthBar y={-DISPLAY_HEIGHT * 0.2} label="WIFI" strength={strengths.wifi} />
        <StrengthBar y={-DISPLAY_HEIGHT * 0.35} label="VEHICLE" strength={strengths.vehicle} />
        {/* Status */}
        <Text material={statusMaterial} fontSize={0.2} anchorX="center" anchorY="bottom" position={[0, -DISPLAY_HEIGHT * 0.45, 0.01]}>
          ● ONLINE
        </Text>
      </group>
    </group>
  );
});
StatusDisplay.displayName = 'StatusDisplay';

// Card Slot Component
const CardSlot = React.memo(({ position, rotation, size, label, materials, isDarkMode }: {
    position: [number, number, number];
    rotation: [number, number, number];
    size: { x: number, y: number, z: number };
    label: string;
    materials: ReturnType<typeof useGatewayMaterials>;
    isDarkMode: boolean;
}) => (
    <group position={position} rotation={rotation}>
        <mesh material={materials.connectorMaterial}>
            <boxGeometry args={[size.x, size.y, size.z]} />
        </mesh>
        <Text
            color={isDarkMode ? '#ccddee' : '#335544'}
            fontSize={0.3}
            position={[0, size.y * 1.5, 0.1]} // Adjust label position
            rotation={[0, 0, -Math.PI / 2]} // Rotate label to be readable
            anchorX="center"
            anchorY="middle"
        >
            {label}
        </Text>
    </group>
));
CardSlot.displayName = 'CardSlot';

// Vehicle Power Component
const VehiclePower = React.memo(({ position, materials, isDarkMode }: {
    position: [number, number, number];
    materials: ReturnType<typeof useGatewayMaterials>;
    isDarkMode: boolean;
}) => (
    <group position={position}>
        {/* Housing */}
        <mesh material={materials.vehiclePowerMaterial} rotation-x={Math.PI / 2} position-x={-POWER_HOUSING_LENGTH / 2}>
            <cylinderGeometry args={[POWER_HOUSING_RADIUS, POWER_HOUSING_RADIUS, POWER_HOUSING_LENGTH, 16]} />
        </mesh>
        {/* Tip */}
        <mesh material={materials.connectorMaterial} rotation-x={Math.PI / 2} position-x={-POWER_HOUSING_LENGTH - POWER_TIP_LENGTH / 2}>
            <cylinderGeometry args={[POWER_TIP_RADIUS, POWER_TIP_RADIUS * 1.1, POWER_TIP_LENGTH, 16]} />
        </mesh>
        {/* Cable */}
        <mesh material={materials.vehiclePowerMaterial} rotation-z={Math.PI / 2} position-x={-POWER_HOUSING_LENGTH - POWER_TIP_LENGTH - POWER_CABLE_LENGTH / 2}>
            <cylinderGeometry args={[POWER_CABLE_RADIUS, POWER_CABLE_RADIUS, POWER_CABLE_LENGTH, 8]} />
        </mesh>
        {/* Label */}
        <Text
            color={isDarkMode ? '#ccddee' : '#335544'}
            fontSize={0.4}
            position={[-POWER_HOUSING_LENGTH / 2, POWER_HOUSING_RADIUS + 0.3, 0]} // Position above housing
            rotation={[0, Math.PI / 2, 0]} // Orient label
            anchorX="center"
            anchorY="middle"
        >
            12-24V
        </Text>
    </group>
));
VehiclePower.displayName = 'VehiclePower';

// Antenna Port Component
const AntennaPort = React.memo(({ position, label, materials, isDarkMode }: {
    position: [number, number, number];
    label: string;
    materials: ReturnType<typeof useGatewayMaterials>;
    isDarkMode: boolean;
}) => (
    <group position={position}>
        {/* Base */}
        <mesh material={materials.connectorMaterial} rotation-x={Math.PI / 2}>
            <cylinderGeometry args={[ANTENNA_PORT_BASE_RADIUS, ANTENNA_PORT_BASE_RADIUS, 0.2, 16]} />
        </mesh>
        {/* Connector */}
        <mesh material={materials.vehiclePowerMaterial} rotation-x={Math.PI / 2} position-z={-0.2}>
            <cylinderGeometry args={[ANTENNA_PORT_CONNECTOR_RADIUS, ANTENNA_PORT_CONNECTOR_RADIUS * 1.2, 0.3, 16]} />
        </mesh>
        {/* Label */}
        <Text
            color={isDarkMode ? '#ccddee' : '#335544'}
            fontSize={0.25}
            position={[0, ANTENNA_PORT_BASE_RADIUS + 0.2, 0]} // Position above port
            rotation={[-Math.PI / 2, 0, 0]} // Orient label
            anchorX="center"
            anchorY="middle"
        >
            {label}
        </Text>
    </group>
));
AntennaPort.displayName = 'AntennaPort';

// Status LED Component
const StatusLED = React.memo(({ position, material }: { position: [number, number, number], material: THREE.MeshStandardMaterial }) => { // Changed Material to MeshStandardMaterial
    const lightRef = useRef<THREE.PointLight>(null);
    useFrame(({ clock }) => {
        if (lightRef.current) {
            lightRef.current.intensity = 0.5 + Math.sin(clock.elapsedTime * 5) * 0.3; // Pulsing effect
        }
    });
    return (
        <mesh material={material} position={position} rotation-x={Math.PI / 2}>
            <cylinderGeometry args={[LED_RADIUS, LED_RADIUS, LED_HEIGHT, 16]} />
            {/* Access emissive color safely now */}
            <pointLight ref={lightRef} color={material.emissive} intensity={0.8} distance={1.5} />
        </mesh>
    );
});
StatusLED.displayName = 'StatusLED';

// --- Main Component ---
export default function VehicleIoTGateway({ isDarkMode = true }: VehicleIoTGatewayProps) {
  const gatewayGroupRef = useRef<THREE.Group>(null);
  const materials = useGatewayMaterials(isDarkMode);

  // Antenna configurations
  const antennas = [
    { x: -LENGTH / 4 - 1, z: 0, height: 2.5, label: "CELL", color: new THREE.Color(0x00aaff), interval: 1500 + Math.random() * 1000 },
    { x: -LENGTH / 4, z: -DEVICE_WIDTH / 6, height: 2.0, label: "GPS", color: new THREE.Color(0xffaa00), interval: 1800 + Math.random() * 1000 },
    { x: -LENGTH / 4, z: DEVICE_WIDTH / 6, height: 1.5, label: "WIFI", color: new THREE.Color(0x00ff88), interval: 1200 + Math.random() * 1000 },
    { x: -LENGTH / 4 + 1, z: 0, height: 1.8, label: "BT/ZB", color: new THREE.Color(0x8844ff), interval: 2000 + Math.random() * 1000 },
  ];

  return (
    <group ref={gatewayGroupRef} dispose={null} rotation-y={Math.PI / 4}>

      {/* Main Body using RoundedBox */}
      <RoundedBox
        args={[LENGTH, DEVICE_HEIGHT, DEVICE_WIDTH]} // width, height, depth
        radius={EDGE_RADIUS} // corner radius
        smoothness={4} // subdivisions
        material={materials.mainBodyMaterial}
        castShadow
        receiveShadow
      />

      {/* Shock Absorbers */}
      <ShockAbsorber position={[HALF_LENGTH - EDGE_RADIUS, -HALF_HEIGHT, HALF_WIDTH - EDGE_RADIUS]} materials={materials} />
      <ShockAbsorber position={[HALF_LENGTH - EDGE_RADIUS, -HALF_HEIGHT, -HALF_WIDTH + EDGE_RADIUS]} materials={materials} />
      <ShockAbsorber position={[-HALF_LENGTH + EDGE_RADIUS, -HALF_HEIGHT, HALF_WIDTH - EDGE_RADIUS]} materials={materials} />
      <ShockAbsorber position={[-HALF_LENGTH + EDGE_RADIUS, -HALF_HEIGHT, -HALF_WIDTH + EDGE_RADIUS]} materials={materials} />

      {/* Antenna Section */}
      <group>
        {/* Housing Platform */}
        <mesh
          material={materials.antennaBaseMaterial}
          position={[-LENGTH / 4, HALF_HEIGHT + ANTENNA_HOUSING_SIZE.y / 2, 0]}
        >
          <boxGeometry args={[ANTENNA_HOUSING_SIZE.x, ANTENNA_HOUSING_SIZE.y, ANTENNA_HOUSING_SIZE.z]} />
        </mesh>
        {/* Antennas */}
        {antennas.map((ant, index) => (
          <Antenna
            key={index}
            position={[ant.x, HALF_HEIGHT + ANTENNA_HOUSING_SIZE.y, ant.z]}
            antennaHeight={ant.height}
            label={ant.label}
            waveColor={ant.color}
            materials={materials}
            isDarkMode={isDarkMode}
            waveInterval={ant.interval}
          />
        ))}
      </group>

      {/* Status Display */}
      <StatusDisplay
        position={[HALF_LENGTH + 0.01, 0, 0]}
        rotation={[0, Math.PI / 2, 0]}
        materials={materials}
        isDarkMode={isDarkMode}
      />

      {/* Card Slots */}
      <group>
        <CardSlot
            position={[-HALF_LENGTH + 1.5, 0.5, HALF_WIDTH + 0.01]}
            rotation={[0, Math.PI / 2, Math.PI / 2]}
            size={SIM_SLOT_SIZE}
            label="SIM"
            materials={materials}
            isDarkMode={isDarkMode}
        />
         <CardSlot
            position={[-HALF_LENGTH + 1.5, -0.5, HALF_WIDTH + 0.01]}
            rotation={[0, Math.PI / 2, Math.PI / 2]}
            size={SD_SLOT_SIZE}
            label="SD"
            materials={materials}
            isDarkMode={isDarkMode}
        />
      </group>

      {/* Vehicle Power */}
      <VehiclePower
        position={[-HALF_LENGTH - 0.5, 0, -HALF_WIDTH / 2]} // Adjusted position slightly
        materials={materials}
        isDarkMode={isDarkMode}
      />

      {/* Antenna Ports (Back Side) */}
      <group position-z={-HALF_WIDTH - 0.01}>
        <AntennaPort position={[-LENGTH / 4, HALF_HEIGHT - 0.2, 0]} label="ANT1" materials={materials} isDarkMode={isDarkMode} />
        <AntennaPort position={[0, HALF_HEIGHT - 0.2, 0]} label="ANT2" materials={materials} isDarkMode={isDarkMode} />
        <AntennaPort position={[LENGTH / 4, HALF_HEIGHT - 0.2, 0]} label="ANT3" materials={materials} isDarkMode={isDarkMode} />
      </group>

      {/* Mounting Bracket */}
      <group>
        {/* Base */}
        <mesh material={materials.mountingMaterial} position-y={-HALF_HEIGHT - MOUNT_BRACKET_BASE_SIZE.y / 2}>
          <boxGeometry args={[MOUNT_BRACKET_BASE_SIZE.x, MOUNT_BRACKET_BASE_SIZE.y, MOUNT_BRACKET_BASE_SIZE.z]} />
        </mesh>
        {/* Sides */}
        <mesh material={materials.mountingMaterial} position={[ (MOUNT_BRACKET_BASE_SIZE.x / 2 - MOUNT_BRACKET_SIDE_SIZE.x / 2), -HALF_HEIGHT - MOUNT_BRACKET_BASE_SIZE.y - MOUNT_BRACKET_SIDE_SIZE.y / 2, 0]}>
          <boxGeometry args={[MOUNT_BRACKET_SIDE_SIZE.x, MOUNT_BRACKET_SIDE_SIZE.y, MOUNT_BRACKET_SIDE_SIZE.z]} />
        </mesh>
        <mesh material={materials.mountingMaterial} position={[-(MOUNT_BRACKET_BASE_SIZE.x / 2 - MOUNT_BRACKET_SIDE_SIZE.x / 2), -HALF_HEIGHT - MOUNT_BRACKET_BASE_SIZE.y - MOUNT_BRACKET_SIDE_SIZE.y / 2, 0]}>
          <boxGeometry args={[MOUNT_BRACKET_SIDE_SIZE.x, MOUNT_BRACKET_SIDE_SIZE.y, MOUNT_BRACKET_SIDE_SIZE.z]} />
        </mesh>
        {/* Holes */}
        {[1, -1].map(sideX =>
            [1, -1].map(sideZ => (
                <mesh key={`${sideX}-${sideZ}`} material={materials.mountHole} position={[sideX * (MOUNT_BRACKET_BASE_SIZE.x / 2 - MOUNT_BRACKET_SIDE_SIZE.x / 2), -HALF_HEIGHT - MOUNT_BRACKET_BASE_SIZE.y - MOUNT_BRACKET_SIDE_SIZE.y, sideZ * (DEVICE_WIDTH / 3)]} rotation-x={Math.PI / 2}>
                    <cylinderGeometry args={[MOUNT_HOLE_RADIUS, MOUNT_HOLE_RADIUS, MOUNT_BRACKET_SIDE_SIZE.y + 0.1, 16]} />
                </mesh>
            ))
        )}
      </group>

      {/* Status LEDs (Top Surface) */}
      <group position-z={HALF_WIDTH - 0.5}>
        <StatusLED position={[HALF_LENGTH - 1, HALF_HEIGHT + LED_HEIGHT / 2, 0]} material={materials.ledGreen} />
        <StatusLED position={[HALF_LENGTH - 2, HALF_HEIGHT + LED_HEIGHT / 2, 0]} material={materials.ledBlue} />
        <StatusLED position={[HALF_LENGTH - 3, HALF_HEIGHT + LED_HEIGHT / 2, 0]} material={materials.ledRed} />
        <StatusLED position={[HALF_LENGTH - 4, HALF_HEIGHT + LED_HEIGHT / 2, 0]} material={materials.ledYellow} />
      </group>

    </group>
  );
}
