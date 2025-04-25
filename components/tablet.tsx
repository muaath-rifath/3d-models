'use client';

import React, { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { RoundedBox } from '@react-three/drei'; // Import RoundedBox
// Removed OrbitControls, useEffect, FontLoader, TextGeometry

type TabletProps = {
  isDarkMode?: boolean;
  // Removed width and height props
}

// --- Constants ---
const TABLET_WIDTH = 10;
const TABLET_HEIGHT = 15;
const TABLET_DEPTH = 0.7;
const BEZEL_THICKNESS = 0.4;
const SCREEN_INSET = 0.05;
const CAMERA_LENS_RADIUS = 0.4;
const SELFIE_LENS_RADIUS = 0.2;
const BUTTON_WIDTH = 0.2;
const BUTTON_HEIGHT = 1.8;
const BUTTON_DEPTH = TABLET_DEPTH * 0.8;
const PORT_WIDTH = 1.0;
const PORT_HEIGHT = 0.4;
const PORT_DEPTH = TABLET_DEPTH * 0.9;
const WIDGET_WIDTH = TABLET_WIDTH * 0.3;
const WIDGET_HEIGHT = TABLET_HEIGHT * 0.2;
const WIDGET_DEPTH = 0.03;

// --- Materials Hook (Green Theme) ---
const useTabletMaterials = (isDarkMode: boolean) => {
  return useMemo(() => ({
    // Copied and adapted materials from the original component
    tabletBody: new THREE.MeshStandardMaterial({
        name: 'tablet_body',
        color: isDarkMode ? 0x505e50 : 0xe0ffe0,
        metalness: 0.7,
        roughness: 0.3,
        emissive: isDarkMode ? 0x253025 : 0x000000,
        emissiveIntensity: isDarkMode ? 0.30 : 0,
    }),
    screen: new THREE.MeshStandardMaterial({
        name: 'screen',
        color: isDarkMode ? 0x00ffbb : 0x00aa99,
        metalness: 0.1,
        roughness: 0.05,
        emissive: isDarkMode ? 0x00aa88 : 0x008866,
        emissiveIntensity: isDarkMode ? 0.5 : 0.2,
    }),
    uiElement: new THREE.MeshStandardMaterial({
        name: 'ui_element',
        color: isDarkMode ? 0xafffaf : 0x00aa88,
        metalness: 0.1,
        roughness: 0.1,
        emissive: isDarkMode ? 0x66cc66 : 0x000000,
        emissiveIntensity: isDarkMode ? 0.7 : 0.0
    }),
    accent: new THREE.MeshStandardMaterial({
        name: 'accent',
        color: isDarkMode ? 0x66ffaa : 0x00aa66,
        metalness: 0.7,
        roughness: 0.3,
        emissive: isDarkMode ? 0x44cc88 : 0x000000,
        emissiveIntensity: isDarkMode ? 0.6 : 0.0
    }),
    camera: new THREE.MeshStandardMaterial({
        name: 'camera',
        color: isDarkMode ? 0x334433 : 0x556655,
        metalness: 0.9,
        roughness: 0.4,
        emissive: isDarkMode ? 0x112211 : 0x000000,
        emissiveIntensity: isDarkMode ? 0.3 : 0.0
    }),
    cameraLens: new THREE.MeshStandardMaterial({
        name: 'camera_lens',
        color: isDarkMode ? 0x445544 : 0x111111,
        metalness: 0.1,
        roughness: 0.1,
        emissive: isDarkMode ? 0x223322 : 0x000000,
        emissiveIntensity: isDarkMode ? 0.1 : 0.0
    }),
    port: new THREE.MeshStandardMaterial({
        name: 'port',
        color: isDarkMode ? 0x444444 : 0x888888,
        metalness: 0.8,
        roughness: 0.5
    }),
    buttons: new THREE.MeshStandardMaterial({
        name: 'buttons',
        color: isDarkMode ? 0x505e50 : 0xe0ffe0,
        metalness: 0.9,
        roughness: 0.3,
        emissive: isDarkMode ? 0x253025 : 0x000000,
        emissiveIntensity: isDarkMode ? 0.3 : 0.0
    }),
    selfieCamera: new THREE.MeshStandardMaterial({
        name: 'selfie_camera',
        color: isDarkMode ? 0x111111 : 0x000000,
        metalness: 0.2,
        roughness: 0.3,
        emissive: isDarkMode ? 0x111111 : 0x000000,
        emissiveIntensity: isDarkMode ? 0.1 : 0.0
    }),
    graphElement: new THREE.MeshStandardMaterial({
        name: 'graph_element',
        color: isDarkMode ? 0x88ffcc : 0x00ccaa,
        metalness: 0.1,
        roughness: 0.2,
        emissive: isDarkMode ? 0x44ddaa : 0x00aa88,
        emissiveIntensity: isDarkMode ? 0.8 : 0.3,
        transparent: true,
        opacity: 0.9
    }),
    chartElement: new THREE.MeshStandardMaterial({
        name: 'chart_element',
        color: isDarkMode ? 0xccff66 : 0x88cc00,
        metalness: 0.1,
        roughness: 0.2,
        emissive: isDarkMode ? 0xaadd33 : 0x66aa00,
        emissiveIntensity: isDarkMode ? 0.8 : 0.3,
        transparent: true,
        opacity: 0.9
    }),
    textElement: new THREE.MeshStandardMaterial({
        name: 'text_element',
        color: isDarkMode ? 0xeeffee : 0xffffff,
        metalness: 0.1,
        roughness: 0.2,
        emissive: isDarkMode ? 0xccffcc : 0xf0f0f0,
        emissiveIntensity: isDarkMode ? 0.6 : 0.2
    }),
    cameraRing: new THREE.MeshStandardMaterial({
        name: 'camera_ring',
        color: isDarkMode ? 0x66ffaa : 0xbbbbbb,
        metalness: 0.6,
        roughness: 0.3,
        emissive: isDarkMode ? 0x44cc88 : 0x666666,
        emissiveIntensity: isDarkMode ? 0.8 : 0.2,
    }),
    flashMaterial: new THREE.MeshStandardMaterial({
        name: 'flash_material',
        color: 0xffffdd,
        emissive: 0xaaaa88,
        emissiveIntensity: 0.2,
        roughness: 0.3
     }),
    mainLensMaterial: new THREE.MeshStandardMaterial({
        name: 'camera_lens_main',
        color: 0x111111,
        metalness: 0.1,
        roughness: 0.05,
        opacity: 0.9,
        transparent: true,
     }),
    highlightMaterial: new THREE.MeshBasicMaterial({
        name: 'highlight_material',
        color: 0xffffff,
        transparent: true,
        opacity: 0.5
     }),
    dashboardMaterial: new THREE.MeshStandardMaterial({
        name: 'dashboard_material',
        color: isDarkMode ? 0x1a241a : 0xe8f4e8,
        roughness: 0.6,
        metalness: 0.02,
        transparent: true,
        opacity: 0.97,
        emissive: isDarkMode ? 0x020502 : 0x000000,
        emissiveIntensity: isDarkMode ? 0.05 : 0,
    }),
    widgetMaterial: new THREE.MeshStandardMaterial({
        name: 'widget_material',
        color: isDarkMode ? 0x304530 : 0xfcfffc,
        roughness: 0.4,
        metalness: 0.0,
        transparent: true,
        opacity: 0.88,
        emissive: isDarkMode ? 0x141f14 : 0x000000,
        emissiveIntensity: isDarkMode ? 0.15 : 0,
    }),
  }), [isDarkMode]);
};

// --- Main Component ---
export default function Tablet({ isDarkMode = false }: TabletProps) {
  const tabletGroupRef = useRef<THREE.Group>(null);
  const materials = useTabletMaterials(isDarkMode);

  return (
    <group ref={tabletGroupRef} dispose={null}>
      {/* Tablet Body using RoundedBox */}
      <RoundedBox
        args={[TABLET_WIDTH, TABLET_HEIGHT, TABLET_DEPTH]} // width, height, depth
        radius={0.3} // corner radius
        smoothness={4} // subdivisions
        material={materials.tabletBody}
        castShadow
        receiveShadow
      />

      {/* Screen using RoundedBox */}
      <RoundedBox
        args={[TABLET_WIDTH - BEZEL_THICKNESS * 2, TABLET_HEIGHT - BEZEL_THICKNESS * 2, SCREEN_INSET]}
        radius={0.2}
        smoothness={4}
        material={materials.screen}
        position-z={TABLET_DEPTH / 2 + SCREEN_INSET / 2 + 0.01} // Slightly forward
        receiveShadow
      />

      {/* Simplified Dashboard/UI on Screen */}
      <mesh
        material={materials.dashboardMaterial}
        position={[0, 0, TABLET_DEPTH / 2 + SCREEN_INSET + 0.02]} // On top of screen
      >
        <planeGeometry args={[TABLET_WIDTH - BEZEL_THICKNESS * 2.5, TABLET_HEIGHT - BEZEL_THICKNESS * 2.5]} />
      </mesh>

      {/* Example Widgets on Dashboard */}
      <RoundedBox
        args={[WIDGET_WIDTH, WIDGET_HEIGHT, WIDGET_DEPTH]}
        radius={0.1}
        smoothness={4}
        material={materials.widgetMaterial}
        position={[-TABLET_WIDTH / 4, TABLET_HEIGHT / 4, TABLET_DEPTH / 2 + SCREEN_INSET + 0.03]}
      />
       <RoundedBox
        args={[WIDGET_WIDTH, WIDGET_HEIGHT, WIDGET_DEPTH]}
        radius={0.1}
        smoothness={4}
        material={materials.widgetMaterial}
        position={[TABLET_WIDTH / 4, TABLET_HEIGHT / 4, TABLET_DEPTH / 2 + SCREEN_INSET + 0.03]}
      />
       <RoundedBox
        args={[WIDGET_WIDTH * 2.2, WIDGET_HEIGHT * 0.8, WIDGET_DEPTH]}
        radius={0.1}
        smoothness={4}
        material={materials.widgetMaterial}
        position={[0, -TABLET_HEIGHT / 4, TABLET_DEPTH / 2 + SCREEN_INSET + 0.03]}
      />

      {/* Selfie Camera (Front) */}
      <mesh
        material={materials.selfieCamera}
        position={[0, TABLET_HEIGHT / 2 - BEZEL_THICKNESS / 2, TABLET_DEPTH / 2 + 0.01]}
        rotation-x={Math.PI / 2}
      >
        <circleGeometry args={[SELFIE_LENS_RADIUS, 16]} />
      </mesh>

      {/* Rear Camera */}
      <mesh
        material={materials.cameraRing}
        position={[TABLET_WIDTH / 2 - 0.6, TABLET_HEIGHT / 2 - 0.6, -TABLET_DEPTH / 2 - 0.01]}
        rotation-x={Math.PI / 2}
      >
        <ringGeometry args={[CAMERA_LENS_RADIUS * 0.9, CAMERA_LENS_RADIUS * 1.1, 32]} />
      </mesh>
      <mesh
        material={materials.cameraLens}
        position={[TABLET_WIDTH / 2 - 0.6, TABLET_HEIGHT / 2 - 0.6, -TABLET_DEPTH / 2 - 0.01]}
        rotation-x={Math.PI / 2}
      >
        <circleGeometry args={[CAMERA_LENS_RADIUS, 32]} />
      </mesh>

      {/* Side Buttons */}
      {/* Power Button */}
      <mesh
        material={materials.buttons}
        position={[TABLET_WIDTH / 2 + BUTTON_WIDTH / 2, TABLET_HEIGHT / 2 - BUTTON_HEIGHT * 0.7, 0]}
        castShadow
      >
        <boxGeometry args={[BUTTON_WIDTH, BUTTON_HEIGHT * 0.8, BUTTON_DEPTH]} />
      </mesh>
      {/* Volume Up */}
      <mesh
        material={materials.buttons}
        position={[TABLET_WIDTH / 2 + BUTTON_WIDTH / 2, TABLET_HEIGHT / 2 - BUTTON_HEIGHT * 2, 0]}
        castShadow
      >
        <boxGeometry args={[BUTTON_WIDTH, BUTTON_HEIGHT, BUTTON_DEPTH]} />
      </mesh>
      {/* Volume Down */}
      <mesh
        material={materials.buttons}
        position={[TABLET_WIDTH / 2 + BUTTON_WIDTH / 2, TABLET_HEIGHT / 2 - BUTTON_HEIGHT * 3.2, 0]}
        castShadow
      >
        <boxGeometry args={[BUTTON_WIDTH, BUTTON_HEIGHT, BUTTON_DEPTH]} />
      </mesh>

      {/* Bottom Port (e.g., USB-C) */}
      <mesh
        material={materials.port}
        position={[0, -TABLET_HEIGHT / 2 - PORT_HEIGHT / 2, 0]}
        rotation-x={Math.PI / 2}
      >
        {/* Use rounded box or cylinder for port shape */}
         <cylinderGeometry args={[PORT_WIDTH / 2, PORT_WIDTH / 2, PORT_DEPTH, 8]} />
      </mesh>

    </group>
  );
}

// Removed imperative setup, animation loop, resize handler, cleanup logic, createMaterials function
// Removed mountRef, sceneRef, tabletRef, controlsRef, rendererRef, cameraRef, light refs
// Removed the returned div
// Used RoundedBox for body and screen
// Added placeholder dashboard/widgets
