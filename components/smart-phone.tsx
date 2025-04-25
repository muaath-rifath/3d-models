'use client';

import React, { useRef, useMemo } from 'react';
import * as THREE from 'three';

type SmartPhoneProps = {
  isDarkMode?: boolean;
}

// --- Constants ---
const PHONE_WIDTH = 6;
const PHONE_HEIGHT = 12;
const PHONE_DEPTH = 0.6;
const BEZEL_THICKNESS = 0.2;
const SCREEN_INSET = 0.05;
const CAMERA_BUMP_WIDTH = PHONE_WIDTH * 0.8;
const CAMERA_BUMP_HEIGHT = PHONE_HEIGHT * 0.2;
const CAMERA_BUMP_DEPTH = 0.15;
const MAIN_LENS_RADIUS = 0.6;
const SMALL_LENS_RADIUS = 0.3;
const BUTTON_WIDTH = 0.2;
const BUTTON_HEIGHT = 1.5;
const BUTTON_DEPTH = PHONE_DEPTH * 0.8;
const PORT_WIDTH = 0.8;
const PORT_HEIGHT = 0.3;
const PORT_DEPTH = PHONE_DEPTH * 0.9;
const NOTCH_WIDTH = 1.5;
const NOTCH_HEIGHT = 0.3;
const SELFIE_LENS_RADIUS = 0.15;

// --- Materials Hook (Green Theme) ---
const useSmartPhoneMaterials = (isDarkMode: boolean) => {
  return useMemo(() => ({
    phoneBody: new THREE.MeshStandardMaterial({
      color: isDarkMode ? 0x505e50 : 0xe0ffe0,
      roughness: 0.6,
      metalness: 0.3,
      name: 'phone_body'
    }),
    screen: new THREE.MeshStandardMaterial({
      color: isDarkMode ? 0x00ffbb : 0x00aa99,
      emissive: isDarkMode ? 0x00aa88 : 0x008866,
      emissiveIntensity: isDarkMode ? 0.5 : 0.2,
      roughness: 0.2,
      metalness: 0.1,
      name: 'screen'
    }),
    // Simplified UI representation
    uiElement: new THREE.MeshStandardMaterial({
      color: isDarkMode ? 0xafffaf : 0x00aa88,
      emissive: isDarkMode ? 0x66cc66 : 0x000000,
      emissiveIntensity: isDarkMode ? 0.7 : 0.0,
      roughness: 0.9,
      metalness: 0.0,
      name: 'ui_element' // Generic UI block
    }),
    accent: new THREE.MeshStandardMaterial({
      color: isDarkMode ? 0x66ffaa : 0x00aa66,
      roughness: 0.4,
      metalness: 0.6,
      name: 'accent' // Camera bump, etc.
    }),
    cameraLens: new THREE.MeshStandardMaterial({
      color: isDarkMode ? 0x445544 : 0x111111,
      roughness: 0.1,
      metalness: 0.2,
      transparent: true,
      opacity: 0.8,
      name: 'camera_lens'
    }),
    port: new THREE.MeshStandardMaterial({
      color: isDarkMode ? 0x444444 : 0x888888,
      roughness: 0.7,
      metalness: 0.4,
      name: 'port'
    }),
    buttons: new THREE.MeshStandardMaterial({
      color: isDarkMode ? 0x505e50 : 0xe0ffe0, // Match body
      roughness: 0.6,
      metalness: 0.3,
      name: 'buttons'
    }),
    notch: new THREE.MeshStandardMaterial({
      color: isDarkMode ? 0x112211 : 0x333333,
      roughness: 0.8,
      metalness: 0.1,
      name: 'notch'
    }),
    selfieCamera: new THREE.MeshStandardMaterial({
      color: isDarkMode ? 0x111111 : 0x000000,
      roughness: 0.2,
      metalness: 0.1,
      name: 'selfie_camera'
    }),
    cameraRing: new THREE.MeshStandardMaterial({
        color: isDarkMode ? 0x66ffaa : 0xbbbbbb,
        roughness: 0.3,
        metalness: 0.7,
        name: 'camera_ring'
      }),
  }), [isDarkMode]);
};

// --- Main Component ---
export default function SmartPhone({ isDarkMode = false }: SmartPhoneProps) {
  const phoneGroupRef = useRef<THREE.Group>(null);
  const materials = useSmartPhoneMaterials(isDarkMode);

  // Rounded Box Geometry Helper (simplified)
  const createRoundedBoxGeometry = (width: number, height: number, depth: number, radius: number, smoothness: number) => {
    const shape = new THREE.Shape();
    const x = -width / 2;
    const y = -height / 2;
    shape.moveTo(x, y + radius);
    shape.lineTo(x, y + height - radius);
    shape.quadraticCurveTo(x, y + height, x + radius, y + height);
    shape.lineTo(x + width - radius, y + height);
    shape.quadraticCurveTo(x + width, y + height, x + width, y + height - radius);
    shape.lineTo(x + width, y + radius);
    shape.quadraticCurveTo(x + width, y, x + width - radius, y);
    shape.lineTo(x + radius, y);
    shape.quadraticCurveTo(x, y, x, y + radius);

    const extrudeSettings = {
      depth: depth,
      bevelEnabled: false,
      steps: 1
    };
    return new THREE.ExtrudeGeometry(shape, extrudeSettings);
  };

  const phoneBodyGeometry = useMemo(() => createRoundedBoxGeometry(PHONE_WIDTH, PHONE_HEIGHT, PHONE_DEPTH, 0.5, 8), []);
  const screenGeometry = useMemo(() => createRoundedBoxGeometry(PHONE_WIDTH - BEZEL_THICKNESS * 2, PHONE_HEIGHT - BEZEL_THICKNESS * 2, SCREEN_INSET, 0.4, 8), []);
  const cameraBumpGeometry = useMemo(() => createRoundedBoxGeometry(CAMERA_BUMP_WIDTH, CAMERA_BUMP_HEIGHT, CAMERA_BUMP_DEPTH, 0.3, 8), []);

  return (
    <group ref={phoneGroupRef} dispose={null}>
      {/* Phone Body */}
      <mesh material={materials.phoneBody} geometry={phoneBodyGeometry} castShadow receiveShadow />

      {/* Screen */}
      <mesh
        material={materials.screen}
        geometry={screenGeometry}
        position-z={PHONE_DEPTH / 2 + SCREEN_INSET / 2 + 0.01} // Slightly forward
        receiveShadow
      />

       {/* Simplified UI Representation */}
       <mesh
        material={materials.uiElement}
        position={[0, 0, PHONE_DEPTH / 2 + SCREEN_INSET + 0.02]} // On top of screen
       >
         <planeGeometry args={[PHONE_WIDTH * 0.8, PHONE_HEIGHT * 0.7]} />
       </mesh>

      {/* Notch */}
      <mesh
        material={materials.notch}
        position={[0, PHONE_HEIGHT / 2 - BEZEL_THICKNESS - NOTCH_HEIGHT / 2, PHONE_DEPTH / 2 + SCREEN_INSET + 0.015]}
      >
        <boxGeometry args={[NOTCH_WIDTH, NOTCH_HEIGHT, SCREEN_INSET * 1.1]} />
      </mesh>
      {/* Selfie Camera in Notch */}
      <mesh
        material={materials.selfieCamera}
        position={[0, PHONE_HEIGHT / 2 - BEZEL_THICKNESS - NOTCH_HEIGHT / 2, PHONE_DEPTH / 2 + SCREEN_INSET + 0.02]}
      >
        <circleGeometry args={[SELFIE_LENS_RADIUS, 16]} />
      </mesh>

      {/* Camera Bump (Back) */}
      <mesh
        material={materials.accent}
        geometry={cameraBumpGeometry}
        position={[0, PHONE_HEIGHT / 2 - CAMERA_BUMP_HEIGHT / 2 - 0.5, -PHONE_DEPTH / 2 - CAMERA_BUMP_DEPTH / 2]}
        castShadow
      />

      {/* Camera Lenses (Back) */}
      {/* Main Lens */}
      <group position={[0, PHONE_HEIGHT / 2 - CAMERA_BUMP_HEIGHT / 2 - 0.5, -PHONE_DEPTH / 2 - CAMERA_BUMP_DEPTH - 0.01]}>
        <mesh material={materials.cameraRing} position={[-CAMERA_BUMP_WIDTH / 4, 0, 0]}>
            <ringGeometry args={[MAIN_LENS_RADIUS * 0.9, MAIN_LENS_RADIUS * 1.1, 32]} />
        </mesh>
        <mesh material={materials.cameraLens} position={[-CAMERA_BUMP_WIDTH / 4, 0, 0]}>
          <circleGeometry args={[MAIN_LENS_RADIUS, 32]} />
        </mesh>
        {/* Small Lens 1 */}
        <mesh material={materials.cameraRing} position={[CAMERA_BUMP_WIDTH / 4, CAMERA_BUMP_HEIGHT / 4, 0]}>
            <ringGeometry args={[SMALL_LENS_RADIUS * 0.9, SMALL_LENS_RADIUS * 1.1, 32]} />
        </mesh>
        <mesh material={materials.cameraLens} position={[CAMERA_BUMP_WIDTH / 4, CAMERA_BUMP_HEIGHT / 4, 0]}>
          <circleGeometry args={[SMALL_LENS_RADIUS, 16]} />
        </mesh>
        {/* Small Lens 2 */}
        <mesh material={materials.cameraRing} position={[CAMERA_BUMP_WIDTH / 4, -CAMERA_BUMP_HEIGHT / 4, 0]}>
            <ringGeometry args={[SMALL_LENS_RADIUS * 0.9, SMALL_LENS_RADIUS * 1.1, 32]} />
        </mesh>
        <mesh material={materials.cameraLens} position={[CAMERA_BUMP_WIDTH / 4, -CAMERA_BUMP_HEIGHT / 4, 0]}>
          <circleGeometry args={[SMALL_LENS_RADIUS, 16]} />
        </mesh>
      </group>

      {/* Side Buttons */}
      {/* Volume Up */}
      <mesh
        material={materials.buttons}
        position={[-PHONE_WIDTH / 2 - BUTTON_WIDTH / 2, PHONE_HEIGHT / 4, 0]}
        castShadow
      >
        <boxGeometry args={[BUTTON_WIDTH, BUTTON_HEIGHT, BUTTON_DEPTH]} />
      </mesh>
      {/* Volume Down */}
      <mesh
        material={materials.buttons}
        position={[-PHONE_WIDTH / 2 - BUTTON_WIDTH / 2, PHONE_HEIGHT / 4 - BUTTON_HEIGHT - 0.3, 0]}
        castShadow
      >
        <boxGeometry args={[BUTTON_WIDTH, BUTTON_HEIGHT, BUTTON_DEPTH]} />
      </mesh>
      {/* Power Button */}
      <mesh
        material={materials.buttons}
        position={[PHONE_WIDTH / 2 + BUTTON_WIDTH / 2, PHONE_HEIGHT / 4, 0]}
        castShadow
      >
        <boxGeometry args={[BUTTON_WIDTH, BUTTON_HEIGHT * 1.2, BUTTON_DEPTH]} />
      </mesh>

      {/* Bottom Port (e.g., USB-C) */}
      <mesh
        material={materials.port}
        position={[0, -PHONE_HEIGHT / 2 - PORT_HEIGHT / 2, 0]}
        rotation-x={Math.PI / 2}
      >
        {/* Use rounded box or cylinder for port shape */}
         <cylinderGeometry args={[PORT_WIDTH / 2, PORT_WIDTH / 2, PORT_DEPTH, 8]} />
      </mesh>

    </group>
  );
}
