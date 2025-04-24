"use client";
import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

type LaptopProps = {
  isDarkMode?: boolean;
  width?: number;
  height?: number;
}

export default function Laptop({ isDarkMode = false, width = 500, height = 400 }: LaptopProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const laptopRef = useRef<THREE.Group | null>(null);
  const displayGroupRef = useRef<THREE.Group | null>(null); // Keep ref for potential future interactions

  // --- Helper function from app/laptop/page.tsx ---
  const createRoundedRectShape = (w: number, h: number, r: number) => {
    const shape = new THREE.Shape();
    shape.moveTo(-w / 2 + r, -h / 2); shape.lineTo(w / 2 - r, -h / 2); shape.quadraticCurveTo(w / 2, -h / 2, w / 2, -h / 2 + r); shape.lineTo(w / 2, h / 2 - r); shape.quadraticCurveTo(w / 2, h / 2, w / 2 - r, h / 2); shape.lineTo(-w / 2 + r, h / 2); shape.quadraticCurveTo(-w / 2, h / 2, -w / 2, h / 2 - r); shape.lineTo(-w / 2, -h / 2 + r); shape.quadraticCurveTo(-w / 2, -h / 2, -w / 2 + r, -h / 2);
    return shape;
  };

  // --- createMaterials function from app/laptop/page.tsx (adapted) ---
  const createMaterials = (isDark: boolean) => {
      // Using the green theme from the page.tsx for consistency with the detailed model
      return {
          laptopBody: new THREE.MeshStandardMaterial({
              name: 'laptop_lid', // Default name, will be overridden for base
              color: isDark ? 0x505e50 : 0xe0ffe0,
              metalness: 0.7, roughness: 0.3,
              emissive: isDark ? 0x253025 : 0x000000, emissiveIntensity: isDark ? 0.30 : 0,
              side: THREE.DoubleSide
          }),
          screen: new THREE.MeshStandardMaterial({
              name: 'screen',
              color: isDark ? 0x00ffbb : 0x00aa99,
              metalness: 0.1, roughness: 0.05,
              emissive: isDark ? 0x00aa88 : 0x008866, emissiveIntensity: isDark ? 0.5 : 0.2,
              side: THREE.FrontSide
          }),
          uiElement: new THREE.MeshStandardMaterial({
              name: 'ui_element',
              color: isDark ? 0xafffaf : 0x00aa88,
              metalness: 0.1, roughness: 0.1,
              emissive: isDark ? 0x66cc66 : 0x000000, emissiveIntensity: isDark ? 0.7 : 0.0
          }),
          accent: new THREE.MeshStandardMaterial({
              name: 'accent',
              color: isDark ? 0x66ffaa : 0x00aa66,
              metalness: 0.7, roughness: 0.3,
              emissive: isDark ? 0x44cc88 : 0x000000, emissiveIntensity: isDark ? 0.6 : 0.0
          }),
          port: new THREE.MeshStandardMaterial({
              name: 'port',
              color: isDark ? 0x444444 : 0x888888,
              metalness: 0.8, roughness: 0.5
          }),
          buttons: new THREE.MeshStandardMaterial({
              name: 'buttons',
              color: isDark ? 0x505e50 : 0xe0ffe0,
              metalness: 0.9, roughness: 0.3,
              emissive: isDark ? 0x253025 : 0x000000, emissiveIntensity: isDark ? 0.3 : 0.0
          }),
          selfieCamera: new THREE.MeshStandardMaterial({
              name: 'selfie_camera',
              color: isDark ? 0x111111 : 0x000000,
              metalness: 0.2, roughness: 0.3,
              emissive: isDark ? 0x111111 : 0x000000, emissiveIntensity: isDark ? 0.1 : 0.0
          }),
          graphElement: new THREE.MeshStandardMaterial({
              name: 'graph_element',
              color: isDark ? 0x88ffcc : 0x00ccaa,
              metalness: 0.1, roughness: 0.2,
              emissive: isDark ? 0x44ddaa : 0x00aa88, emissiveIntensity: isDark ? 0.8 : 0.3,
              transparent: true, opacity: 0.9
          }),
          chartElement: new THREE.MeshStandardMaterial({
              name: 'chart_element',
              color: isDark ? 0xccff66 : 0x88cc00,
              metalness: 0.1, roughness: 0.2,
              emissive: isDark ? 0xaadd33 : 0x66aa00, emissiveIntensity: isDark ? 0.8 : 0.3,
              transparent: true, opacity: 0.9
          }),
          textElement: new THREE.MeshStandardMaterial({
              name: 'text_element',
              color: isDark ? 0xeeffee : 0xffffff,
              metalness: 0.1, roughness: 0.2,
              emissive: isDark ? 0xccffcc : 0xf0f0f0, emissiveIntensity: isDark ? 0.6 : 0.2
          }),
          keyCap: new THREE.MeshStandardMaterial({
              name: 'keyCap',
              color: isDark ? 0x354035 : 0xd0ddd0,
              roughness: 0.7, metalness: 0.1,
              emissive: isDark ? 0x101510 : 0x000000, emissiveIntensity: isDark ? 0.1 : 0,
          }),
          touchpad: new THREE.MeshStandardMaterial({
              name: 'touchpad',
              color: isDark ? 0x485548 : 0xd8e8d8,
              roughness: 0.6, metalness: 0.2,
          }),
          hinge: new THREE.MeshStandardMaterial({
              name: 'hinge',
              color: isDark ? 0x333833 : 0xaaaaaa,
              metalness: 0.8, roughness: 0.4,
          }),
      };
  };

  // --- createWidget function from app/laptop/page.tsx (adapted) ---
  const createWidget = (x: number, y: number, w: number, h: number, index: number, materials: ReturnType<typeof createMaterials>, isDark: boolean) => {
      const widgetGroup = new THREE.Group();
      const widgetCornerRadius = 0.3;
      const widgetZ = 0.002; // Base Z offset for widget background
      const widgetContentZ = widgetZ + 0.001; // Z offset for content within widget

      widgetGroup.position.set(x, y, widgetZ);

      const widgetShape = createRoundedRectShape(w, h, widgetCornerRadius);
      const widgetGeometry = new THREE.ShapeGeometry(widgetShape);
      const widgetMaterial = new THREE.MeshStandardMaterial({
          color: isDark ? 0x304530 : 0xfcfffc, roughness: 0.4, metalness: 0.0, side: THREE.FrontSide,
          transparent: true, opacity: 0.88, emissive: isDark ? 0x141f14 : 0x000000, emissiveIntensity: isDark ? 0.15 : 0,
      });
      const widgetBg = new THREE.Mesh(widgetGeometry, widgetMaterial);
      widgetBg.castShadow = false; widgetBg.receiveShadow = true;
      widgetGroup.add(widgetBg);

      const titles = ["CPU Load", "Memory Usage", "Network I/O", "Disk Activity", "GPU Temp", "Battery", "System Uptime", "Active Processes"];
      const titleText = titles[index % titles.length] || `Metric ${index + 1}`;
      const titleHeight = 0.3; const titleWidth = w * 0.75;
      const titleGeometry = new THREE.PlaneGeometry(titleWidth, titleHeight);
      const titleMaterial = materials.textElement.clone();
      titleMaterial.color.set(isDark ? 0xddffdd : 0x333333); titleMaterial.emissive.set(isDark ? 0xaaccaa : 0x000000);
      titleMaterial.emissiveIntensity = isDark ? 0.3 : 0; titleMaterial.side = THREE.FrontSide;
      const titleMesh = new THREE.Mesh(titleGeometry, titleMaterial);
      // Z offset relative to widget group's Z
      titleMesh.position.set(0, h / 2 - titleHeight / 2 - 0.2, (widgetContentZ - widgetZ));
      widgetGroup.add(titleMesh);

      const dataAreaX = 0; const dataAreaY = -0.15; const dataAreaWidth = w * 0.85; const dataAreaHeight = h * 0.5;
      // Z offset relative to widget group's Z
      const contentZ = (widgetContentZ - widgetZ) + 0.001;
      const randomSeed = (index + 1) * 5678;
      const seededRandom = (offset = 0) => { let x = Math.sin(randomSeed + offset) * 10000; return x - Math.floor(x); };
      const widgetType = index % titles.length;

       switch (widgetType) {
          // ... cases 0-7 from page.tsx, ensuring meshes use 'contentZ' for their Z position relative to the widget group ...
          case 0: // CPU Load - Gauge
          case 1: // Memory Usage - Gauge
              const gaugeRadius = dataAreaHeight * 0.6; const arcPercentage = seededRandom();
              const arcGeometry = new THREE.RingGeometry(gaugeRadius * 0.8, gaugeRadius, 32, 1, 0, Math.PI * arcPercentage);
              const arcMaterial = (widgetType === 0 ? materials.graphElement : materials.chartElement).clone(); arcMaterial.side = THREE.DoubleSide;
              const arcMesh = new THREE.Mesh(arcGeometry, arcMaterial);
              arcMesh.position.set(dataAreaX, dataAreaY - gaugeRadius * 0.2, contentZ); arcMesh.rotation.z = -Math.PI / 2;
              widgetGroup.add(arcMesh);
              const bgArcGeometry = new THREE.RingGeometry(gaugeRadius * 0.8, gaugeRadius, 32, 1, 0, Math.PI);
              const bgArcMaterial = new THREE.MeshStandardMaterial({ color: isDark ? 0x335533 : 0xcccccc, side: THREE.DoubleSide, opacity: 0.3, transparent: true });
              const bgArcMesh = new THREE.Mesh(bgArcGeometry, bgArcMaterial);
              bgArcMesh.position.copy(arcMesh.position); bgArcMesh.rotation.copy(arcMesh.rotation);
              bgArcMesh.position.z -= 0.0001; // Slightly behind
              widgetGroup.add(bgArcMesh);
              break;
          case 2: // Network I/O - Dual Line
          case 3: // Disk Activity - Dual Line
              const pointsUp: THREE.Vector3[] = []; const pointsDown: THREE.Vector3[] = []; const segmentsNet = 8;
              for (let i = 0; i <= segmentsNet; i++) {
                  const px = -dataAreaWidth / 2 + (i / segmentsNet) * dataAreaWidth;
                  const pyUp = (seededRandom(i) - 0.5) * dataAreaHeight * 0.4 + dataAreaHeight * 0.25;
                  const pyDown = (seededRandom(i + 50) - 0.5) * dataAreaHeight * 0.4 - dataAreaHeight * 0.25;
                  pointsUp.push(new THREE.Vector3(px, pyUp, 0)); pointsDown.push(new THREE.Vector3(px, pyDown, 0));
              }
              const lineGeomUp = new THREE.BufferGeometry().setFromPoints(pointsUp);
              const lineMatUp = new THREE.LineBasicMaterial({ color: isDark ? 0x88ff88 : 0x00aa00, linewidth: 2 });
              const lineUp = new THREE.Line(lineGeomUp, lineMatUp); lineUp.position.set(dataAreaX, dataAreaY, contentZ); widgetGroup.add(lineUp);
              const lineGeomDown = new THREE.BufferGeometry().setFromPoints(pointsDown);
              const lineMatDown = new THREE.LineBasicMaterial({ color: isDark ? 0x66aaff : 0x0066cc, linewidth: 2 });
              const lineDown = new THREE.Line(lineGeomDown, lineMatDown); lineDown.position.set(dataAreaX, dataAreaY, contentZ); widgetGroup.add(lineDown);
              break;
          case 4: // GPU Temp - Simple Bar
          case 5: // Battery - Simple Bar
               const barValue = seededRandom(); const barWidth = dataAreaWidth * 0.8; const barHeight = dataAreaHeight * 0.3;
               const barGeom = new THREE.BoxGeometry(barWidth * barValue, barHeight, 0.01);
               const barMat = (widgetType === 4 ? materials.accent : materials.graphElement).clone();
               barMat.color.set(widgetType === 4 ? (isDark ? 0xffaa66 : 0xcc6600) : (isDark ? 0x88ffcc : 0x00ccaa));
               const barMesh = new THREE.Mesh(barGeom, barMat);
               barMesh.position.set(dataAreaX - (barWidth * (1-barValue))/2, dataAreaY, contentZ); widgetGroup.add(barMesh);
               const bgBarGeom = new THREE.BoxGeometry(barWidth, barHeight, 0.01);
               const bgBarMat = new THREE.MeshStandardMaterial({ color: isDark ? 0x443322 : 0xddccaa, side: THREE.FrontSide, opacity: 0.3, transparent: true });
               const bgBarMesh = new THREE.Mesh(bgBarGeom, bgBarMat);
               bgBarMesh.position.set(dataAreaX, dataAreaY, contentZ - 0.0001); // Slightly behind
               widgetGroup.add(bgBarMesh);
               break;
          default: // Text for Uptime/Processes
              const textGeom = new THREE.PlaneGeometry(dataAreaWidth * 0.8, dataAreaHeight * 0.6);
              const textMat = materials.textElement.clone();
              textMat.color.set(isDark ? 0xccffcc : 0x444444);
              const textMesh = new THREE.Mesh(textGeom, textMat);
              textMesh.position.set(dataAreaX, dataAreaY, contentZ); widgetGroup.add(textMesh);
              break;
       }

      const statusRadius = 0.2; const statusGeometry = new THREE.CircleGeometry(statusRadius, 16);
      const statusMaterial = materials.accent.clone();
      const statusColorsCycle = [0xff8888, 0x88ff88, 0x8888ff, 0xffff88, 0xff88ff, 0x88ffff, 0xffaa88, 0x88ccff];
      statusMaterial.color.set(statusColorsCycle[index % statusColorsCycle.length]); statusMaterial.emissive.set(statusColorsCycle[index % statusColorsCycle.length]);
      statusMaterial.emissiveIntensity = isDark ? 0.4 : 0.1; statusMaterial.side = THREE.FrontSide;
      const statusMesh = new THREE.Mesh(statusGeometry, statusMaterial);
      // Z offset relative to widget group's Z
      statusMesh.position.set(-w / 2 + statusRadius + 0.15, -h / 2 + statusRadius + 0.15, (widgetContentZ - widgetZ));
      widgetGroup.add(statusMesh);

      return widgetGroup;
  };


  // --- createLaptop function from app/laptop/page.tsx (adapted) ---
  const createLaptop = (materials: ReturnType<typeof createMaterials>, isDark: boolean) => {
      const laptop = new THREE.Group(); // Main laptop group
      const displayGroup = new THREE.Group(); // Group for lid/screen
      const baseGroup = new THREE.Group(); // Group for keyboard/base

      // Laptop dimensions (same as page.tsx)
      const baseWidth = 28; const baseDepth = 20; const baseHeight = 1.5;
      const lidWidth = baseWidth; const lidDepth = 0.7; const lidHeight = baseDepth;
      const cornerRadius = 1.0; const screenCornerRadius = 0.8;

      // --- Create Display Group (Lid) ---
      const lidShape = createRoundedRectShape(lidWidth, lidHeight, cornerRadius);
      const lidExtrudeSettings = { steps: 1, depth: lidDepth, bevelEnabled: false };
      const lidGeometry = new THREE.ExtrudeGeometry(lidShape, lidExtrudeSettings);
      lidGeometry.center();
      const laptopLidMat = materials.laptopBody.clone();
      laptopLidMat.name = 'laptop_lid';
      const laptopLid = new THREE.Mesh(lidGeometry, laptopLidMat);
      laptopLid.castShadow = true; laptopLid.receiveShadow = true;
      laptopLid.position.set(0, lidHeight / 2, lidDepth / 2);
      displayGroup.add(laptopLid);

      // --- Screen and UI Layering ---
      const screenBezel = 0.8;
      const screenHeight = lidHeight - screenBezel * 2;
      const screenWidth = lidWidth - screenBezel * 2;
      const screenSurfaceZ = lidDepth + 0.01;
      const dashboardBgZ = screenSurfaceZ + 0.001;
      const widgetBaseZ = dashboardBgZ + 0.002; // Renamed from widgetZ to avoid conflict
      const frontCameraZ = dashboardBgZ + 0.005;

      // Dashboard Background
      const dashboardWidth = screenWidth - 0.4;
      const dashboardHeight = screenHeight - 0.4;
      const dashboardShape = createRoundedRectShape(dashboardWidth, dashboardHeight, screenCornerRadius);
      const punchHoleRadius = 0.3; const punchHoleX = 0;
      const dashboardTopY = screenBezel + screenHeight;
      const punchHoleY = dashboardTopY + 0.3;
      const punchHolePath = new THREE.Path();
      punchHolePath.absarc(punchHoleX, punchHoleY, punchHoleRadius, 0, Math.PI * 2, false);
      dashboardShape.holes.push(punchHolePath);
      const dashboardMaterial = new THREE.MeshStandardMaterial({
          color: isDark ? 0x1a241a : 0xe8f4e8, roughness: 0.6, metalness: 0.02, side: THREE.FrontSide, transparent: true, opacity: 0.97,
          emissive: isDark ? 0x020502 : 0x000000, emissiveIntensity: isDark ? 0.05 : 0,
      });
      const dashboardGeometry = new THREE.ShapeGeometry(dashboardShape);
      const dashboardBg = new THREE.Mesh(dashboardGeometry, dashboardMaterial);
      dashboardBg.position.set(0, screenBezel + screenHeight / 2, dashboardBgZ);
      displayGroup.add(dashboardBg);

      // Dashboard Border
      const borderPoints = dashboardShape.getPoints(50);
      const borderGeometry = new THREE.BufferGeometry().setFromPoints(borderPoints);
      const borderMaterial = new THREE.LineBasicMaterial({ color: isDark ? 0x446644 : 0xaaaaaa, linewidth: 1, transparent: true, opacity: 0.5 });
      const dashboardBorder = new THREE.LineLoop(borderGeometry, borderMaterial);
      dashboardBorder.position.copy(dashboardBg.position);
      dashboardBorder.position.z += 0.0001;
      displayGroup.add(dashboardBorder);

      // Front Camera
      const selfieCameraGeometry = new THREE.CircleGeometry(punchHoleRadius * 0.9, 32);
      const selfieCamera = new THREE.Mesh(selfieCameraGeometry, materials.selfieCamera);
      selfieCamera.position.set(punchHoleX, punchHoleY, frontCameraZ);
      displayGroup.add(selfieCamera);

      // Arrange Widgets
      const padding = 0.4;
      const usableWidth = dashboardWidth - padding * 2;
      const usableHeight = dashboardHeight - padding * 2;
      const widgetCols = 4; const widgetRows = 2;
      const widgetWidth = (usableWidth - padding * (widgetCols - 1)) / widgetCols;
      const topOffsetForCamera = punchHoleRadius * 2 + 0.4;
      const adjustedUsableHeight = usableHeight - topOffsetForCamera;
      const widgetHeight = (adjustedUsableHeight - padding * (widgetRows - 1)) / widgetRows;
      const startX = -usableWidth / 2 + widgetWidth / 2;
      const widgetAreaBottomY = screenBezel + padding;
      const startY = widgetAreaBottomY + adjustedUsableHeight - widgetHeight / 2;
      let widgetIndex = 0;
      for (let r = 0; r < widgetRows; r++) {
          for (let c = 0; c < widgetCols; c++) {
              const x = startX + c * (widgetWidth + padding);
              const y = startY - r * (widgetHeight + padding);
              // Pass materials and isDark to createWidget
              const widget = createWidget(x, y, widgetWidth, widgetHeight, widgetIndex, materials, isDark);
              // Adjust widget Z position relative to the display group
              widget.position.z = widgetBaseZ; // Use the base Z offset for the whole widget group
              displayGroup.add(widget);
              widgetIndex++;
          }
      }

      // --- Create Base Group ---
      const baseShape = createRoundedRectShape(baseWidth, baseDepth, cornerRadius);
      const baseExtrudeSettings = { steps: 1, depth: baseHeight, bevelEnabled: false };
      const baseGeometry = new THREE.ExtrudeGeometry(baseShape, baseExtrudeSettings);
      baseGeometry.center();
      const laptopBaseMat = materials.laptopBody.clone();
      laptopBaseMat.name = 'laptop_base';
      const laptopBase = new THREE.Mesh(baseGeometry, laptopBaseMat);
      laptopBase.castShadow = true; laptopBase.receiveShadow = false;
      baseGroup.add(laptopBase);
      baseGroup.position.y = baseHeight / 2;

      // --- Hinge ---
      const pivotY = baseHeight * 6.7; const pivotZ = baseDepth / 22;
      const hingeRadius = 0.4; const hingeLength = baseWidth * 0.15;
      const hingeGeometry = new THREE.CylinderGeometry(hingeRadius, hingeRadius, hingeLength, 16);
      hingeGeometry.rotateZ(Math.PI / 2);
      const hingeOffset = baseWidth * 0.35;
      const hingeL = new THREE.Mesh(hingeGeometry, materials.hinge);
      hingeL.position.set(-hingeOffset, pivotY, pivotZ); baseGroup.add(hingeL);
      const hingeR = new THREE.Mesh(hingeGeometry, materials.hinge);
      hingeR.position.set(hingeOffset, pivotY, pivotZ); baseGroup.add(hingeR);

      // --- Assemble Laptop ---
      laptop.add(baseGroup);
      displayGroup.position.set(0, pivotY, pivotZ);
      displayGroup.rotation.x = Math.PI / 2.5 ;
      baseGroup.add(displayGroup);
      // Assign to ref passed into the function if needed, or use the component's ref directly later
      // displayGroupRef.current = displayGroup;

      // --- Add Keyboard ---
      const keyboardGroup = new THREE.Group();
      const sideGap = 0.8; const topGap = 0.5; const bottomGap = 1.2;
      const keyboardWidth = baseWidth - sideGap * 2;
      const keyboardDepth = baseDepth - topGap - bottomGap - 7;
      const keyboardBaseThickness = 0.01;
      const keyboardBaseGeometry = new THREE.BoxGeometry(keyboardWidth, keyboardBaseThickness, keyboardDepth);
      const keyboardBaseMaterial = new THREE.MeshStandardMaterial({
          color: isDark ? 0x252e25 : 0xc8d8c8, roughness: 0.8, metalness: 0.2, transparent: true, opacity: 0.4
      });
      const keyboardBase = new THREE.Mesh(keyboardBaseGeometry, keyboardBaseMaterial);
      const baseSurfaceY = baseHeight / 2;
      keyboardBase.position.set(0, baseSurfaceY - keyboardBaseThickness / 2, -baseDepth/2 + topGap + keyboardDepth/2);
      keyboardGroup.add(keyboardBase);

      const rows = 6; const cols = 15; const keyGap = 0.075; const keyHeight = 0.12;
      const maxKeyWidth = (keyboardWidth - (cols - 1) * keyGap) / cols;
      const maxKeyDepth = (keyboardDepth - (rows - 1) * keyGap) / rows;
      const keySize = Math.min(maxKeyWidth, maxKeyDepth);
      const actualKeyboardWidth = cols * keySize + (cols - 1) * keyGap;
      const actualKeyboardDepth = rows * keySize + (rows - 1) * keyGap;
      const keyGridStartX = -actualKeyboardWidth / 2 + keySize / 2;
      const keyGridStartZ = -actualKeyboardDepth / 2 + keySize / 2;

      const specialKeys = {
          backspace: [0, 13, 2], tab: [1, 0, 2], backslash: [1, 13, 2], caps: [2, 0, 2],
          enter_upper: [2, 13, 2], enter: [3, 13, 2], shift_left: [4, 0, 2], shift_right: [4, 13, 2],
          ctrl_left: [5, 0, 2], fn: [5, 2, 1], alt_left: [5, 3, 2], spacebar: [5, 5, 6],
          alt_gr: [5, 11, 2], ctrl_right: [5, 13, 2],
      };
      const isSpecialKeyPosition = (row: number, col: number): false | { key: string; startCol: number; width: number; } => {
          for (const [key, [keyRow, keyStartCol, keyWidth]] of Object.entries(specialKeys)) {
              if (row === keyRow && col >= keyStartCol && col < keyStartCol + keyWidth) {
                  return { key: key as string, startCol: keyStartCol as number, width: keyWidth as number };
              }
          } return false;
      };

      for (let row = 0; row < rows; row++) {
          for (let col = 0; col < cols; col++) {
              const specialKey = isSpecialKeyPosition(row, col);
              if (specialKey && col > specialKey.startCol) continue;
              const keyWidth = specialKey ? specialKey.width * keySize + (specialKey.width - 1) * keyGap : keySize;
              const keyGeometry = new THREE.BoxGeometry(keyWidth, keyHeight, keySize);
              const keyMaterial = materials.keyCap.clone();
              if (specialKey) { keyMaterial.color.multiplyScalar(1.1); }
              const key = new THREE.Mesh(keyGeometry, keyMaterial);
              const xOffset = specialKey ? (specialKey.width - 1) * (keySize + keyGap) / 2 : 0;
              const relativeX = keyGridStartX + col * (keySize + keyGap) + xOffset;
              const relativeZ = keyGridStartZ + row * (keySize + keyGap);
              key.position.set(keyboardBase.position.x + relativeX, baseSurfaceY + keyHeight / 2, keyboardBase.position.z + relativeZ);
              keyboardGroup.add(key);
          }
      }

      // --- Touchpad ---
      const touchpadThickness = 0.1; const touchpadWidth = baseWidth * 0.4;
      const touchpadHeight = bottomGap * 6;
      const touchpadCenterZ = keyboardDepth / 2.5 + bottomGap * 0.9;
      const touchpadGeometry = new THREE.BoxGeometry(touchpadWidth, touchpadThickness, touchpadHeight);
      const touchpad = new THREE.Mesh(touchpadGeometry, materials.touchpad);
      touchpad.position.set(keyboardBase.position.x, baseSurfaceY + touchpadThickness / 2, touchpadCenterZ);
      keyboardGroup.add(touchpad);

      baseGroup.add(keyboardGroup);
      baseGroup.rotation.x = - 1.55;
      keyboardGroup.rotation.x = 1.58;

      return { laptop, displayGroup }; // Return both main group and display group
  };


  // Function to update materials and lights based on dark mode (from page.tsx)
  const updateSceneAppearance = (isDark: boolean) => {
      if (!sceneRef.current || !laptopRef.current) return;

      // Update scene background
      sceneRef.current.background = new THREE.Color(isDark ? 0x081208 : 0xf0f4f0); // Green theme background

      // Update lights
      sceneRef.current.traverse((object) => {
          if (object instanceof THREE.AmbientLight) {
              object.color.set(isDark ? 0x445544 : 0x909090); object.intensity = isDark ? 0.4 : 0.8;
          } else if (object instanceof THREE.DirectionalLight) {
              // Identify lights by position or add names if needed
              if (object.position.x > 0) { // Main light
                  object.color.set(isDark ? 0xaaffcc : 0xffffff); object.intensity = isDark ? 0.7 : 0.9;
              } else { // Backlight
                  object.color.set(isDark ? 0x44aa66 : 0xddffee); object.intensity = isDark ? 0.3 : 0.3;
              }
          }
      });

      // Update laptop materials by name
      laptopRef.current.traverse((object) => {
          if (object instanceof THREE.Mesh) {
              const material = object.material as THREE.MeshStandardMaterial;
              const matName = material.name;

              // --- Apply material updates based on name (Green Theme from page.tsx) ---
              if (matName === 'laptop_lid' || matName === 'laptop_base') {
                  material.color.set(isDark ? 0x505e50 : 0xe0ffe0);
                  material.emissive.set(isDark ? 0x253025 : 0x000000);
                  material.emissiveIntensity = isDark ? 0.30 : 0;
              } else if (matName === 'screen') {
                  material.color.set(isDark ? 0x00ffbb : 0x00aa99);
                  material.emissive.set(isDark ? 0x00aa88 : 0x008866);
                  material.emissiveIntensity = isDark ? 0.5 : 0.2;
              } else if (matName === 'ui_element') {
                  material.color.set(isDark ? 0xafffaf : 0x00aa88);
                  material.emissive.set(isDark ? 0x66cc66 : 0x000000);
                  material.emissiveIntensity = isDark ? 0.7 : 0.0;
              } else if (matName === 'accent') {
                  material.color.set(isDark ? 0x66ffaa : 0x00aa66);
                  material.emissive.set(isDark ? 0x44cc88 : 0x000000);
                  material.emissiveIntensity = isDark ? 0.6 : 0.0;
              } else if (matName === 'port') {
                  material.color.set(isDark ? 0x444444 : 0x888888);
              } else if (matName === 'buttons') {
                  material.color.set(isDark ? 0x505e50 : 0xe0ffe0);
                  material.emissive.set(isDark ? 0x253025 : 0x000000);
                  material.emissiveIntensity = isDark ? 0.3 : 0.0;
              } else if (matName === 'selfie_camera') {
                  material.color.set(isDark ? 0x111111 : 0x000000);
                  material.emissive.set(isDark ? 0x111111 : 0x000000);
                  material.emissiveIntensity = isDark ? 0.1 : 0.0;
              } else if (matName === 'graph_element') {
                  material.color.set(isDark ? 0x88ffcc : 0x00ccaa);
                  material.emissive.set(isDark ? 0x44ddaa : 0x00aa88);
                  material.emissiveIntensity = isDark ? 0.8 : 0.3;
              } else if (matName === 'chart_element') {
                  material.color.set(isDark ? 0xccff66 : 0x88cc00);
                  material.emissive.set(isDark ? 0xaadd33 : 0x66aa00);
                  material.emissiveIntensity = isDark ? 0.8 : 0.3;
              } else if (matName === 'text_element') {
                  material.color.set(isDark ? 0xeeffee : 0xffffff);
                  material.emissive.set(isDark ? 0xccffcc : 0xf0f0f0);
                  material.emissiveIntensity = isDark ? 0.6 : 0.2;
              } else if (matName === 'keyCap') {
                  material.color.set(isDark ? 0x354035 : 0xd0ddd0);
                  material.emissive.set(isDark ? 0x101510 : 0x000000);
                  material.emissiveIntensity = isDark ? 0.1 : 0;
              } else if (matName === 'touchpad') {
                  material.color.set(isDark ? 0x485548 : 0xd8e8d8);
                  material.roughness = 0.6;
              } else if (matName === 'hinge') {
                  material.color.set(isDark ? 0x333833 : 0xaaaaaa);
              }
              // Update dashboard background and border if needed (might need specific names or checks)
              else if (material instanceof THREE.MeshStandardMaterial && material.opacity === 0.97) { // Heuristic for dashboard bg
                  material.color.set(isDark ? 0x1a241a : 0xe8f4e8);
                  material.emissive.set(isDark ? 0x020502 : 0x000000);
                  material.emissiveIntensity = isDark ? 0.05 : 0;
              } else if (material instanceof THREE.MeshStandardMaterial && material.opacity === 0.88) { // Heuristic for widget bg
                  material.color.set(isDark ? 0x304530 : 0xfcfffc);
                  material.emissive.set(isDark ? 0x141f14 : 0x000000);
                  material.emissiveIntensity = isDark ? 0.15 : 0;
              } else if (material instanceof THREE.MeshStandardMaterial && material.opacity === 0.4) { // Heuristic for keyboard base
                  material.color.set(isDark ? 0x252e25 : 0xc8d8c8);
              }

              if (material.needsUpdate) {
                  material.needsUpdate = true;
              }
          } else if (object instanceof THREE.LineBasicMaterial) { // Update dashboard border
               object.color.set(isDark ? 0x446644 : 0xaaaaaa);
               if (object.needsUpdate) {
                   object.needsUpdate = true;
               }
          }
      });
  }


  useEffect(() => {
    if (!mountRef.current || !width || !height) return; // Ensure width/height are valid

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(isDarkMode ? 0x081208 : 0xf0f4f0); // Green theme background
    sceneRef.current = scene;

    // Camera setup - Use props for aspect ratio
    const camera = new THREE.PerspectiveCamera(55, width / height, 0.1, 1000);
    camera.position.set(0, 15, 30); // Position from page.tsx

    // Renderer setup - Use props for size
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    // Clear previous renderer if any
    while (mountRef.current.firstChild) {
        mountRef.current.removeChild(mountRef.current.firstChild);
    }
    mountRef.current.appendChild(renderer.domElement);

    // Controls - Adjusted settings from page.tsx
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 15;
    controls.maxDistance = 50;
    // Target needs to be set after model is created, using baseHeight

    // Lighting - Setup from page.tsx (Green Theme)
    const ambientLight = new THREE.AmbientLight(
        isDarkMode ? 0x445544 : 0x909090,
        isDarkMode ? 0.4 : 0.8
    );
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(
        isDarkMode ? 0xaaffcc : 0xffffff,
        isDarkMode ? 0.7 : 0.9
    );
    directionalLight.position.set(5, 15, 10);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 1024;
    directionalLight.shadow.mapSize.height = 1024;
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 50;
    scene.add(directionalLight);

    const backLight = new THREE.DirectionalLight(
        isDarkMode ? 0x44aa66 : 0xddffee,
        isDarkMode ? 0.3 : 0.3
    );
    backLight.position.set(-5, 10, -10);
    scene.add(backLight);

    // Create materials and laptop model using the detailed functions
    const materials = createMaterials(isDarkMode);
    const { laptop, displayGroup } = createLaptop(materials, isDarkMode);
    scene.add(laptop);
    laptopRef.current = laptop;
    displayGroupRef.current = displayGroup; // Store ref to display group

    // Set controls target based on model dimensions
    const baseHeight = 1.5; // From createLaptop
    controls.target.set(0, baseHeight / 2, 0);
    controls.update(); // Important after setting target

    // Animation loop
    let animationFrameId: number;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // Handle resize using props (no window listener needed here)
    // Resize logic is handled by the parent passing new width/height props

    // Cleanup on unmount or prop change
    return () => {
      cancelAnimationFrame(animationFrameId);
      controls.dispose();
      // Dispose materials and geometries
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          object.geometry.dispose();
          const material = object.material as THREE.Material | THREE.Material[];
          if (Array.isArray(material)) {
            material.forEach(mat => mat.dispose());
          } else {
            material.dispose();
          }
        } else if (object instanceof THREE.Line) {
            object.geometry.dispose();
            (object.material as THREE.Material).dispose();
        }
      });
      if (mountRef.current && renderer.domElement.parentNode === mountRef.current) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
      sceneRef.current = null;
      laptopRef.current = null;
      displayGroupRef.current = null;
    };
  // Rerun effect if isDarkMode, width, or height changes
  }, [isDarkMode, width, height]);

  // Apply dark mode changes using the detailed update function
  useEffect(() => {
    updateSceneAppearance(isDarkMode);
  }, [isDarkMode]); // Only trigger when isDarkMode changes

  // The div is now just a container, size controlled by props
  return (
    <div ref={mountRef} style={{ width, height, overflow: 'hidden' }} />
  );
}

