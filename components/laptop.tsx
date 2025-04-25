'use client';

import React, { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
// Removed OrbitControls, useEffect

// --- Helper function for rounded rectangles ---
const createRoundedRectShape = (w: number, h: number, r: number) => {
  const shape = new THREE.Shape();
  shape.moveTo(-w / 2 + r, -h / 2);
  shape.lineTo(w / 2 - r, -h / 2);
  shape.quadraticCurveTo(w / 2, -h / 2, w / 2, -h / 2 + r);
  shape.lineTo(w / 2, h / 2 - r);
  shape.quadraticCurveTo(w / 2, h / 2, w / 2 - r, h / 2);
  shape.lineTo(-w / 2 + r, h / 2);
  shape.quadraticCurveTo(-w / 2, h / 2, -w / 2, h / 2 - r);
  shape.lineTo(-w / 2, -h / 2 + r);
  shape.quadraticCurveTo(-w / 2, -h / 2, -w / 2 + r, -h / 2);
  return shape;
};

// --- Materials Hook ---
const useLaptopMaterials = (isDarkMode: boolean) => {
  return useMemo(() => ({
    laptopBody: new THREE.MeshStandardMaterial({
      name: 'laptop_body',
      color: isDarkMode ? 0x505e50 : 0xe0ffe0,
      metalness: 0.7, roughness: 0.3,
      emissive: isDarkMode ? 0x253025 : 0x000000, emissiveIntensity: isDarkMode ? 0.30 : 0,
      side: THREE.DoubleSide
    }),
    screen: new THREE.MeshStandardMaterial({
      name: 'screen',
      color: isDarkMode ? 0x00ffbb : 0x00aa99,
      metalness: 0.1, roughness: 0.05,
      emissive: isDarkMode ? 0x00aa88 : 0x008866, emissiveIntensity: isDarkMode ? 0.5 : 0.2,
      side: THREE.FrontSide
    }),
    uiElement: new THREE.MeshStandardMaterial({
      name: 'ui_element',
      color: isDarkMode ? 0xafffaf : 0x00aa88,
      metalness: 0.1, roughness: 0.1,
      emissive: isDarkMode ? 0x66cc66 : 0x000000, emissiveIntensity: isDarkMode ? 0.7 : 0.0
    }),
    accent: new THREE.MeshStandardMaterial({
      name: 'accent',
      color: isDarkMode ? 0x66ffaa : 0x00aa66,
      metalness: 0.7, roughness: 0.3,
      emissive: isDarkMode ? 0x44cc88 : 0x000000, emissiveIntensity: isDarkMode ? 0.6 : 0.0
    }),
    port: new THREE.MeshStandardMaterial({
      name: 'port',
      color: isDarkMode ? 0x444444 : 0x888888,
      metalness: 0.8, roughness: 0.5
    }),
    buttons: new THREE.MeshStandardMaterial({
      name: 'buttons',
      color: isDarkMode ? 0x505e50 : 0xe0ffe0,
      metalness: 0.9, roughness: 0.3,
      emissive: isDarkMode ? 0x253025 : 0x000000, emissiveIntensity: isDarkMode ? 0.3 : 0.0
    }),
    selfieCamera: new THREE.MeshStandardMaterial({
      name: 'selfie_camera',
      color: isDarkMode ? 0x111111 : 0x000000,
      metalness: 0.2, roughness: 0.3,
      emissive: isDarkMode ? 0x111111 : 0x000000, emissiveIntensity: isDarkMode ? 0.1 : 0.0
    }),
    graphElement: new THREE.MeshStandardMaterial({
      name: 'graph_element',
      color: isDarkMode ? 0x88ffcc : 0x00ccaa,
      metalness: 0.1, roughness: 0.2,
      emissive: isDarkMode ? 0x44ddaa : 0x00aa88, emissiveIntensity: isDarkMode ? 0.8 : 0.3,
      transparent: true, opacity: 0.9
    }),
    chartElement: new THREE.MeshStandardMaterial({
      name: 'chart_element',
      color: isDarkMode ? 0xccff66 : 0x88cc00,
      metalness: 0.1, roughness: 0.2,
      emissive: isDarkMode ? 0xaadd33 : 0x66aa00, emissiveIntensity: isDarkMode ? 0.8 : 0.3,
      transparent: true, opacity: 0.9
    }),
    textElement: new THREE.MeshStandardMaterial({
      name: 'text_element',
      color: isDarkMode ? 0xeeffee : 0xffffff,
      metalness: 0.1, roughness: 0.2,
      emissive: isDarkMode ? 0xccffcc : 0xf0f0f0, emissiveIntensity: isDarkMode ? 0.6 : 0.2
    }),
    keyCap: new THREE.MeshStandardMaterial({
      name: 'keyCap',
      color: isDarkMode ? 0x354035 : 0xd0ddd0,
      roughness: 0.7, metalness: 0.1,
      emissive: isDarkMode ? 0x101510 : 0x000000, emissiveIntensity: isDarkMode ? 0.1 : 0,
    }),
    touchpad: new THREE.MeshStandardMaterial({
      name: 'touchpad',
      color: isDarkMode ? 0x485548 : 0xd8e8d8,
      roughness: 0.6, metalness: 0.2,
    }),
    hinge: new THREE.MeshStandardMaterial({
      name: 'hinge',
      color: isDarkMode ? 0x333833 : 0xaaaaaa,
      metalness: 0.8, roughness: 0.4,
    }),
    widgetBackground: new THREE.MeshStandardMaterial({
      color: isDarkMode ? 0x304530 : 0xfcfffc, roughness: 0.4, metalness: 0.0, side: THREE.FrontSide,
      transparent: true, opacity: 0.88, emissive: isDarkMode ? 0x141f14 : 0x000000, emissiveIntensity: isDarkMode ? 0.15 : 0,
    }),
    widgetTitleText: new THREE.MeshStandardMaterial({
      color: isDarkMode ? 0xddffdd : 0x333333, emissive: isDarkMode ? 0xaaccaa : 0x000000,
      emissiveIntensity: isDarkMode ? 0.3 : 0, side: THREE.FrontSide,
    }),
    widgetGaugeBackground: new THREE.MeshStandardMaterial({ color: isDarkMode ? 0x335533 : 0xcccccc, side: THREE.DoubleSide, opacity: 0.3, transparent: true }),
    widgetLineUp: new THREE.LineBasicMaterial({ color: isDarkMode ? 0x88ff88 : 0x00aa00, linewidth: 2 }),
    widgetLineDown: new THREE.LineBasicMaterial({ color: isDarkMode ? 0x66aaff : 0x0066cc, linewidth: 2 }),
    widgetBarBackground: new THREE.MeshStandardMaterial({ color: isDarkMode ? 0x443322 : 0xddccaa, side: THREE.FrontSide, opacity: 0.3, transparent: true }),
    widgetDefaultText: new THREE.MeshStandardMaterial({ color: isDarkMode ? 0xccffcc : 0x444444 }),
  }), [isDarkMode]);
};

// --- Screen Widget Component ---
type ScreenWidgetProps = {
  x: number;
  y: number;
  w: number;
  h: number;
  index: number;
  materials: ReturnType<typeof useLaptopMaterials>;
  isDarkMode: boolean;
}

function ScreenWidget({ x, y, w, h, index, materials, isDarkMode }: ScreenWidgetProps) {
  // ... (existing code for widgetShape, titles, dataArea, randomSeed, widgetType) ...
  const widgetCornerRadius = 0.3;
  const widgetZ = 0.002; // Base Z offset for widget background
  const contentZ = widgetZ + 0.001; // Z offset for content within widget

  const widgetShape = useMemo(() => createRoundedRectShape(w, h, widgetCornerRadius), [w, h, widgetCornerRadius]);

  const titles = useMemo(() => ["CPU Load", "Memory Usage", "Network I/O", "Disk Activity", "GPU Temp", "Battery", "System Uptime", "Active Processes"], []);
  const titleText = titles[index % titles.length] || `Metric ${index + 1}`;
  const titleHeight = 0.3; const titleWidth = w * 0.75;

  const dataAreaX = 0; const dataAreaY = -0.15; const dataAreaWidth = w * 0.85; const dataAreaHeight = h * 0.5;
  const randomSeed = useMemo(() => (index + 1) * 5678, [index]);
  const seededRandom = useMemo(() => (offset = 0) => {
    let x = Math.sin(randomSeed + offset) * 10000;
    return x - Math.floor(x);
  }, [randomSeed]);

  const widgetType = useMemo(() => index % titles.length, [index, titles.length]);

  // Memoize widget content geometries/data AND create Line objects for dualLine
  const widgetContent = useMemo(() => {
    switch (widgetType) {
      case 0: // CPU Load - Gauge
      case 1: { // Memory Usage - Gauge
        const gaugeRadius = dataAreaHeight * 0.6;
        const arcPercentage = seededRandom();
        const arcGeometry = new THREE.RingGeometry(gaugeRadius * 0.8, gaugeRadius, 32, 1, 0, Math.PI * arcPercentage);
        const bgArcGeometry = new THREE.RingGeometry(gaugeRadius * 0.8, gaugeRadius, 32, 1, 0, Math.PI);
        const arcMaterial = widgetType === 0 ? materials.graphElement : materials.chartElement;
        return {
          type: 'gauge' as const,
          arcGeometry, bgArcGeometry, arcMaterial,
          position: [dataAreaX, dataAreaY - gaugeRadius * 0.2, contentZ] as const, // Add 'as const'
          rotation: [0, 0, -Math.PI / 2] as const // Add 'as const'
        };
      }
      case 2: // Network I/O - Dual Line
      case 3: { // Disk Activity - Dual Line
        const pointsUp: THREE.Vector3[] = []; const pointsDown: THREE.Vector3[] = []; const segmentsNet = 8;
        for (let i = 0; i <= segmentsNet; i++) {
          const px = -dataAreaWidth / 2 + (i / segmentsNet) * dataAreaWidth;
          const pyUp = (seededRandom(i) - 0.5) * dataAreaHeight * 0.4 + dataAreaHeight * 0.25;
          const pyDown = (seededRandom(i + 50) - 0.5) * dataAreaHeight * 0.4 - dataAreaHeight * 0.25;
          pointsUp.push(new THREE.Vector3(px, pyUp, 0)); pointsDown.push(new THREE.Vector3(px, pyDown, 0));
        }
        const lineGeomUp = new THREE.BufferGeometry().setFromPoints(pointsUp);
        const lineGeomDown = new THREE.BufferGeometry().setFromPoints(pointsDown);
        const lineUp = new THREE.Line(lineGeomUp, materials.widgetLineUp);
        const lineDown = new THREE.Line(lineGeomDown, materials.widgetLineDown);
        return {
          type: 'dualLine' as const,
          lineUp,
          lineDown,
          position: [dataAreaX, dataAreaY, contentZ] as const // Add 'as const'
        };
      }
      case 4: // GPU Temp - Simple Bar
      case 5: { // Battery - Simple Bar
        const barValue = seededRandom(); const barWidth = dataAreaWidth * 0.8; const barHeight = dataAreaHeight * 0.3;
        const barGeom = new THREE.BoxGeometry(barWidth * barValue, barHeight, 0.01);
        const bgBarGeom = new THREE.BoxGeometry(barWidth, barHeight, 0.01);
        const barMat = (widgetType === 4 ? materials.accent : materials.graphElement).clone();
        barMat.color.set(widgetType === 4 ? (isDarkMode ? 0xffaa66 : 0xcc6600) : (isDarkMode ? 0x88ffcc : 0x00ccaa));
        return {
          type: 'bar' as const,
          barGeom, bgBarGeom, barMat,
          position: [dataAreaX - (barWidth * (1 - barValue)) / 2, dataAreaY, contentZ] as const, // Add 'as const'
          bgPosition: [dataAreaX, dataAreaY, contentZ - 0.0001] as const // Add 'as const'
        };
      }
      default: { // Text for Uptime/Processes
        const textGeom = new THREE.PlaneGeometry(dataAreaWidth * 0.8, dataAreaHeight * 0.6);
        return {
          type: 'text' as const,
          textGeom,
          position: [dataAreaX, dataAreaY, contentZ] as const // Add 'as const'
        };
      }
    }
  }, [widgetType, dataAreaHeight, dataAreaWidth, seededRandom, materials, isDarkMode, dataAreaX, dataAreaY, contentZ]);

  return (
    <group position={[x, y, widgetZ]}>
      {/* Widget Background */}
      <mesh receiveShadow material={materials.widgetBackground}>
        <shapeGeometry args={[widgetShape]} />
      </mesh>

      {/* Widget Title (Placeholder) */}
      <mesh material={materials.widgetTitleText} position={[0, h / 2 - titleHeight / 2 - 0.2, contentZ - widgetZ]}>
        <planeGeometry args={[titleWidth, titleHeight]} />
        {/* TODO: Replace with <Text> from drei for actual text */}
      </mesh>

      {/* Widget Content - Use type narrowing */}
      {widgetContent.type === 'gauge' && (
        <group position={widgetContent.position} rotation={widgetContent.rotation}>
          <mesh geometry={widgetContent.arcGeometry} material={widgetContent.arcMaterial} />
          <mesh geometry={widgetContent.bgArcGeometry} material={materials.widgetGaugeBackground} position-z={-0.0001} />
        </group>
      )}
      {widgetContent.type === 'dualLine' && (
        <group position={widgetContent.position}>
          {/* Access lineUp/lineDown only when type is 'dualLine' */}
          <primitive object={widgetContent.lineUp} />
          <primitive object={widgetContent.lineDown} />
        </group>
      )}
      {widgetContent.type === 'bar' && (
        <group>
          <mesh geometry={widgetContent.barGeom} material={widgetContent.barMat} position={widgetContent.position} />
          <mesh geometry={widgetContent.bgBarGeom} material={materials.widgetBarBackground} position={widgetContent.bgPosition} />
        </group>
      )}
      {widgetContent.type === 'text' && (
        <mesh geometry={widgetContent.textGeom} material={materials.widgetDefaultText} position={widgetContent.position} />
      )}
    </group>
  );
}

// --- Keyboard Key Component ---
type KeyProps = {
  x: number;
  y: number;
  w: number;
  h: number;
  material: THREE.Material;
}

function KeyboardKey({ x, y, w, h, material }: KeyProps) {
  const keyShape = useMemo(() => createRoundedRectShape(w, h, 0.03), [w, h]);
  const extrudeSettings = useMemo(() => ({ depth: 0.05, bevelEnabled: true, bevelThickness: 0.01, bevelSize: 0.01, bevelSegments: 1 }), []);

  return (
    <mesh position={[x, y, 0.025]} material={material} castShadow receiveShadow>
      <extrudeGeometry args={[keyShape, extrudeSettings]} />
    </mesh>
  );
}

// --- Main Laptop Component ---
type LaptopProps = {
  isDarkMode?: boolean;
  // Removed width and height
}

export default function Laptop({ isDarkMode = false }: LaptopProps) {
  const laptopGroupRef = useRef<THREE.Group>(null);
  const lidGroupRef = useRef<THREE.Group>(null);
  const materials = useLaptopMaterials(isDarkMode);

  // Constants for dimensions
  const bodyWidth = 5; const bodyDepth = 3.5; const bodyHeight = 0.2;
  const lidWidth = bodyWidth; const lidDepth = bodyDepth; const lidHeight = 0.15;
  const screenBezel = 0.2; const screenWidth = lidWidth - screenBezel * 2; const screenHeight = lidDepth - screenBezel * 2;
  const hingeRadius = 0.1; const hingeLength = bodyWidth * 0.6;
  const keySize = 0.3; const keySpacing = 0.05;
  const touchpadWidth = 1.5; const touchpadHeight = 0.8;

  // Keyboard layout (simplified)
  const keyboardLayout = useMemo(() => {
    const layout = [];
    const numRows = 4; const keysPerRow = 10;
    const keyboardTotalWidth = keysPerRow * keySize + (keysPerRow - 1) * keySpacing;
    const keyboardTotalHeight = numRows * keySize + (numRows - 1) * keySpacing;
    const startX = -keyboardTotalWidth / 2;
    const startY = keyboardTotalHeight / 2 - keySize / 2; // Centered vertically for now

    for (let row = 0; row < numRows; row++) {
      for (let col = 0; col < keysPerRow; col++) {
        layout.push({
          x: startX + col * (keySize + keySpacing) + keySize / 2,
          y: startY - row * (keySize + keySpacing),
          w: keySize,
          h: keySize
        });
      }
    }
    return layout;
  }, [keySize, keySpacing]);

  // Screen widgets layout
  const widgetLayout = useMemo(() => {
    const layout = [];
    const numCols = 4; const numRows = 2;
    const widgetW = (screenWidth - 0.1 * (numCols + 1)) / numCols;
    const widgetH = (screenHeight - 0.1 * (numRows + 1)) / numRows;
    const startX = -screenWidth / 2 + 0.1 + widgetW / 2;
    const startY = screenHeight / 2 - 0.1 - widgetH / 2;

    for (let row = 0; row < numRows; row++) {
      for (let col = 0; col < numCols; col++) {
        layout.push({
          x: startX + col * (widgetW + 0.1),
          y: startY - row * (widgetH + 0.1),
          w: widgetW,
          h: widgetH,
          index: row * numCols + col
        });
      }
    }
    return layout;
  }, [screenWidth, screenHeight]);

  // Lid open angle
  const lidAngle = Math.PI / 2.5; // Approx 72 degrees

  return (
    <group ref={laptopGroupRef} dispose={null}>

      {/* Laptop Base */}
      <mesh
        material={materials.laptopBody}
        position={[0, bodyHeight / 2, 0]}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[bodyWidth, bodyHeight, bodyDepth]} />

        {/* Keyboard Keys */}
        <group position={[0, bodyHeight / 2 + 0.001, -0.2]}> {/* Position relative to base top, slightly forward */} 
          {keyboardLayout.map((key, index) => (
            <KeyboardKey key={index} {...key} material={materials.keyCap} />
          ))}
        </group>

        {/* Touchpad */}
        <mesh
          material={materials.touchpad}
          position={[0, bodyHeight / 2 + 0.001, bodyDepth / 2 - touchpadHeight / 2 - 0.3]} // Position relative to base top, near front edge
          receiveShadow
        >
          <planeGeometry args={[touchpadWidth, touchpadHeight]} />
        </mesh>

        {/* Ports (Simplified placeholders) */}
        <mesh material={materials.port} position={[-bodyWidth / 2, bodyHeight * 0.4, 0]}>
          <boxGeometry args={[0.02, bodyHeight * 0.6, bodyDepth * 0.4]} />
        </mesh>
        <mesh material={materials.port} position={[bodyWidth / 2, bodyHeight * 0.4, 0]}>
          <boxGeometry args={[0.02, bodyHeight * 0.6, bodyDepth * 0.6]} />
        </mesh>
      </mesh>

      {/* Hinge */}
      <mesh
        material={materials.hinge}
        position={[0, bodyHeight, -bodyDepth / 2 + hingeRadius]}
        rotation-x={Math.PI / 2}
        castShadow
      >
        <cylinderGeometry args={[hingeRadius, hingeRadius, hingeLength, 16]} />
      </mesh>

      {/* Laptop Lid/Display Group */}
      <group
        ref={lidGroupRef}
        position={[0, bodyHeight, -bodyDepth / 2 + hingeRadius]} // Position at hinge axis
        rotation-x={lidAngle} // Open angle
      >
        <mesh
          material={materials.laptopBody}
          position={[0, lidHeight / 2, lidDepth / 2 - hingeRadius]} // Position relative to hinge axis
          castShadow
          receiveShadow
        >
          <boxGeometry args={[lidWidth, lidHeight, lidDepth]} />

          {/* Screen Bezel/Surface */}
          <mesh
            material={materials.screen}
            position={[0, lidHeight / 2 + 0.001, 0]} // Position relative to lid top surface
            receiveShadow
          >
            <planeGeometry args={[screenWidth, screenHeight]} />

            {/* Screen Widgets */}
            {widgetLayout.map((widget) => (
              <ScreenWidget
                key={widget.index}
                {...widget}
                materials={materials}
                isDarkMode={isDarkMode}
              />
            ))}
          </mesh>

          {/* Selfie Camera (Placeholder) */}
          <mesh
            material={materials.selfieCamera}
            position={[0, lidHeight / 2 + 0.002, screenHeight / 2 + screenBezel / 2]} // Centered above screen
          >
            <circleGeometry args={[0.05, 16]} />
          </mesh>
        </mesh>
      </group>

    </group>
  );
}

// Removed imperative setup, animation loop, resize handler, and cleanup logic
// Removed mountRef and the returned div

