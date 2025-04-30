'use client';

import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
// Import Line if needed for borders, or primitive for existing THREE.Line objects
// import { Line } from '@react-three/drei';
// Assuming Text component is available for rendering text in R3F
// import { Text } from '@react-three/drei';

// Helper function to create rounded rectangle shapes (from reference)
const createRoundedRectShape = (w: number, h: number, r: number) => {
    const shape = new THREE.Shape();
    shape.moveTo(-w / 2 + r, -h / 2); shape.lineTo(w / 2 - r, -h / 2); shape.quadraticCurveTo(w / 2, -h / 2, w / 2, -h / 2 + r); shape.lineTo(w / 2, h / 2 - r); shape.quadraticCurveTo(w / 2, h / 2, w / 2 - r, h / 2); shape.lineTo(-w / 2 + r, h / 2); shape.quadraticCurveTo(-w / 2, h / 2, -w / 2, h / 2 - r); shape.lineTo(-w / 2, -h / 2 + r); shape.quadraticCurveTo(-w / 2, -h / 2, -w / 2 + r, -h / 2);
    return shape;
};

// Materials Hook (adapted from reference createMaterials)
const useLaptopMaterials = (isDarkMode: boolean) => {
    return useMemo(() => ({
        laptopBody: new THREE.MeshStandardMaterial({
            name: 'laptop_lid', // Default name, will be overridden for base
            color: isDarkMode ? 0x505e50 : 0xe0ffe0,
            metalness: 0.7, roughness: 0.3,
            emissive: isDarkMode ? 0x253025 : 0x000000, emissiveIntensity: isDarkMode ? 0.30 : 0,
            side: THREE.DoubleSide
        }),
        screen: new THREE.MeshStandardMaterial({ // Not directly used for screen bg, but for potential elements
            name: 'screen',
            color: isDarkMode ? 0x00ffbb : 0x00aa99,
            metalness: 0.1, roughness: 0.05,
            emissive: isDarkMode ? 0x00aa88 : 0x008866, emissiveIntensity: isDarkMode ? 0.5 : 0.2,
            side: THREE.FrontSide
        }),
        dashboardBackground: new THREE.MeshStandardMaterial({ // Specific material for the screen background area
            name: 'dashboard_background',
            color: isDarkMode ? 0x1a241a : 0xe8f4e8,
            roughness: 0.6, metalness: 0.02, side: THREE.FrontSide, transparent: true, opacity: 0.97,
            emissive: isDarkMode ? 0x020502 : 0x000000, emissiveIntensity: isDarkMode ? 0.05 : 0,
        }),
        dashboardBorder: new THREE.LineBasicMaterial({ // Specific material for the border
            name: 'dashboard_border',
            color: isDarkMode ? 0x446644 : 0xaaaaaa, linewidth: 1, transparent: true, opacity: 0.5
        }),
        uiElement: new THREE.MeshStandardMaterial({ // General UI elements if needed
            name: 'ui_element',
            color: isDarkMode ? 0xafffaf : 0x00aa88,
            metalness: 0.1, roughness: 0.1,
            emissive: isDarkMode ? 0x66cc66 : 0x000000, emissiveIntensity: isDarkMode ? 0.7 : 0.0
        }),
        accent: new THREE.MeshStandardMaterial({ // For status indicators, etc.
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
        buttons: new THREE.MeshStandardMaterial({ // For power button etc.
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
        graphElement: new THREE.MeshStandardMaterial({ // For widgets
            name: 'graph_element',
            color: isDarkMode ? 0x88ffcc : 0x00ccaa,
            metalness: 0.1, roughness: 0.2,
            emissive: isDarkMode ? 0x44ddaa : 0x00aa88, emissiveIntensity: isDarkMode ? 0.8 : 0.3,
            transparent: true, opacity: 0.9, side: THREE.DoubleSide // Ensure side for ring geometry
        }),
        chartElement: new THREE.MeshStandardMaterial({ // For widgets
            name: 'chart_element',
            color: isDarkMode ? 0xccff66 : 0x88cc00,
            metalness: 0.1, roughness: 0.2,
            emissive: isDarkMode ? 0xaadd33 : 0x66aa00, emissiveIntensity: isDarkMode ? 0.8 : 0.3,
            transparent: true, opacity: 0.9, side: THREE.DoubleSide // Ensure side for ring geometry
        }),
        textElement: new THREE.MeshStandardMaterial({ // For widget text (if using planes)
            name: 'text_element',
            color: isDarkMode ? 0xeeffee : 0xffffff,
            metalness: 0.1, roughness: 0.2,
            emissive: isDarkMode ? 0xccffcc : 0xf0f0f0, emissiveIntensity: isDarkMode ? 0.6 : 0.2,
            side: THREE.FrontSide
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
        keyboardBase: new THREE.MeshStandardMaterial({ // Specific material for keyboard recess
            name: 'keyboard_base',
            color: isDarkMode ? 0x252e25 : 0xc8d8c8,
            roughness: 0.8, metalness: 0.2,
            transparent: true, opacity: 0.4
        }),
        // Widget specific materials from reference code
        widgetBackground: new THREE.MeshStandardMaterial({
            name: 'widget_background',
            color: isDarkMode ? 0x304530 : 0xfcfffc, roughness: 0.4, metalness: 0.0, side: THREE.FrontSide,
            transparent: true, opacity: 0.88, emissive: isDarkMode ? 0x141f14 : 0x000000, emissiveIntensity: isDarkMode ? 0.15 : 0,
        }),
        widgetTitleText: new THREE.MeshStandardMaterial({ // If using planes for text
            name: 'widget_title_text',
            color: isDarkMode ? 0xddffdd : 0x333333, emissive: isDarkMode ? 0xaaccaa : 0x000000,
            emissiveIntensity: isDarkMode ? 0.3 : 0, side: THREE.FrontSide,
        }),
        widgetGaugeBackground: new THREE.MeshStandardMaterial({
            name: 'widget_gauge_background',
            color: isDarkMode ? 0x335533 : 0xcccccc, side: THREE.DoubleSide, opacity: 0.3, transparent: true
        }),
        widgetLineUp: new THREE.LineBasicMaterial({
            name: 'widget_line_up',
            color: isDarkMode ? 0x88ff88 : 0x00aa00, linewidth: 2
        }),
        widgetLineDown: new THREE.LineBasicMaterial({
            name: 'widget_line_down',
            color: isDarkMode ? 0x66aaff : 0x0066cc, linewidth: 2
        }),
        widgetBarBackground: new THREE.MeshStandardMaterial({
            name: 'widget_bar_background',
            color: isDarkMode ? 0x443322 : 0xddccaa, side: THREE.FrontSide, opacity: 0.3, transparent: true
        }),
        widgetDefaultText: new THREE.MeshStandardMaterial({ // If using planes for text
            name: 'widget_default_text',
            color: isDarkMode ? 0xccffcc : 0x444444, side: THREE.FrontSide
        }),
    }), [isDarkMode]);
};

type MaterialsType = ReturnType<typeof useLaptopMaterials>;

// Type definition for props
type LaptopProps = {
    isDarkMode?: boolean;
    // Add any other props needed, e.g., position, rotation
} & React.ComponentProps<'group'>; // Allow passing standard group props

// Screen Widget Component (Adapted from reference createWidget)
type ScreenWidgetProps = {
    x: number; y: number; z: number; // Position relative to display group
    w: number; h: number; index: number;
    materials: MaterialsType; isDarkMode: boolean;
}

function ScreenWidget({ x, y, z, w, h, index, materials, isDarkMode }: ScreenWidgetProps) {
    const widgetCornerRadius = 0.3;
    // Z offsets relative to the widget's base Z position (widgetZ in parent)
    const contentZOffset = 0.001;
    const statusZOffset = 0.001;
    const titleZOffset = 0.001;
    const bgArcZOffset = -0.0001;
    const bgBarZOffset = -0.0001;

    const widgetShape = useMemo(() => createRoundedRectShape(w, h, widgetCornerRadius), [w, h, widgetCornerRadius]);
    const widgetGeometry = useMemo(() => new THREE.ShapeGeometry(widgetShape), [widgetShape]);

    const titles = useMemo(() => ["CPU Load", "Memory Usage", "Network I/O", "Disk Activity", "GPU Temp", "Battery", "System Uptime", "Active Processes"], []);
    const titleText = titles[index % titles.length] || `Metric ${index + 1}`;
    const titleHeight = 0.3; const titleWidth = w * 0.75;

    const dataAreaX = 0; const dataAreaY = -0.15; const dataAreaWidth = w * 0.85; const dataAreaHeight = h * 0.5;
    const randomSeed = (index + 1) * 5678;
    const seededRandom = (offset = 0) => { let x = Math.sin(randomSeed + offset) * 10000; return x - Math.floor(x); };
    const widgetType = index % titles.length;

    // --- Memoized Geometries & Objects for Widget Content ---
    const gaugeRadius = dataAreaHeight * 0.6;
    const arcPercentage = seededRandom();
    const arcGeometry = useMemo(() => new THREE.RingGeometry(gaugeRadius * 0.8, gaugeRadius, 32, 1, 0, Math.PI * arcPercentage), [gaugeRadius, arcPercentage]);
    const bgArcGeometry = useMemo(() => new THREE.RingGeometry(gaugeRadius * 0.8, gaugeRadius, 32, 1, 0, Math.PI), [gaugeRadius]);

    const linePoints = useMemo(() => {
        const pointsUp: THREE.Vector3[] = []; const pointsDown: THREE.Vector3[] = []; const segmentsNet = 8;
        for (let i = 0; i <= segmentsNet; i++) {
            const px = -dataAreaWidth / 2 + (i / segmentsNet) * dataAreaWidth;
            const pyUp = (seededRandom(i) - 0.5) * dataAreaHeight * 0.4 + dataAreaHeight * 0.25;
            const pyDown = (seededRandom(i + 50) - 0.5) * dataAreaHeight * 0.4 - dataAreaHeight * 0.25;
            pointsUp.push(new THREE.Vector3(px, pyUp, 0)); pointsDown.push(new THREE.Vector3(px, pyDown, 0));
        }
        return { pointsUp, pointsDown };
    }, [dataAreaWidth, dataAreaHeight, seededRandom]);
    const lineGeomUp = useMemo(() => new THREE.BufferGeometry().setFromPoints(linePoints.pointsUp), [linePoints.pointsUp]);
    const lineGeomDown = useMemo(() => new THREE.BufferGeometry().setFromPoints(linePoints.pointsDown), [linePoints.pointsDown]);
    // Create THREE.Line objects here to use with <primitive>
    const lineUpObject = useMemo(() => new THREE.Line(lineGeomUp, materials.widgetLineUp), [lineGeomUp, materials.widgetLineUp]);
    const lineDownObject = useMemo(() => new THREE.Line(lineGeomDown, materials.widgetLineDown), [lineGeomDown, materials.widgetLineDown]);

    const barValue = seededRandom(); const barWidth = dataAreaWidth * 0.8; const barHeight = dataAreaHeight * 0.3;
    const barGeom = useMemo(() => new THREE.BoxGeometry(barWidth * barValue, barHeight, 0.01), [barWidth, barHeight, barValue]);
    const bgBarGeom = useMemo(() => new THREE.BoxGeometry(barWidth, barHeight, 0.01), [barWidth, barHeight]);

    const textGeom = useMemo(() => new THREE.PlaneGeometry(dataAreaWidth * 0.8, dataAreaHeight * 0.6), [dataAreaWidth, dataAreaHeight]);

    const statusRadius = 0.2;
    const statusGeometry = useMemo(() => new THREE.CircleGeometry(statusRadius, 16), [statusRadius]);
    const statusColorsCycle = useMemo(() => [0xff8888, 0x88ff88, 0x8888ff, 0xffff88, 0xff88ff, 0x88ffff, 0xffaa88, 0x88ccff], []);
    const statusMaterial = useMemo(() => {
        const mat = materials.accent.clone();
        mat.color.set(statusColorsCycle[index % statusColorsCycle.length]);
        mat.emissive.set(statusColorsCycle[index % statusColorsCycle.length]);
        mat.emissiveIntensity = isDarkMode ? 0.4 : 0.1;
        mat.side = THREE.FrontSide;
        return mat;
    }, [materials.accent, statusColorsCycle, index, isDarkMode]);

    // --- Widget Content Rendering ---
    const renderWidgetContent = () => {
        switch (widgetType) {
            case 0: // CPU Load - Gauge
            case 1: // Memory Usage - Gauge
                const arcMaterial = (widgetType === 0 ? materials.graphElement : materials.chartElement);
                return <>
                    <mesh geometry={bgArcGeometry} material={materials.widgetGaugeBackground} position={[dataAreaX, dataAreaY - gaugeRadius * 0.2, bgArcZOffset]} rotation-z={-Math.PI / 2} />
                    <mesh geometry={arcGeometry} material={arcMaterial} position={[dataAreaX, dataAreaY - gaugeRadius * 0.2, contentZOffset]} rotation-z={-Math.PI / 2} />
                </>;
            case 2: // Network I/O - Dual Line
            case 3: // Disk Activity - Dual Line
                return <>
                    {/* Use primitive tag for THREE.Line objects */}
                    <primitive object={lineUpObject} position={[dataAreaX, dataAreaY, contentZOffset]} />
                    <primitive object={lineDownObject} position={[dataAreaX, dataAreaY, contentZOffset]} />
                </>;
            case 4: // GPU Temp - Simple Bar
            case 5: // Battery - Simple Bar
                // Define barMat directly inside the case
                const barMat = (widgetType === 4 ? materials.accent : materials.graphElement).clone();
                barMat.color.set(widgetType === 4 ? (isDarkMode ? 0xffaa66 : 0xcc6600) : (isDarkMode ? 0x88ffcc : 0x00ccaa));
                return <>
                    <mesh geometry={bgBarGeom} material={materials.widgetBarBackground} position={[dataAreaX, dataAreaY, bgBarZOffset]} />
                    <mesh geometry={barGeom} material={barMat} position={[dataAreaX - (barWidth * (1 - barValue)) / 2, dataAreaY, contentZOffset]} />
                </>;
            default: // Text for Uptime/Processes
                // Replace with <Text> component if available and configured
                return <mesh geometry={textGeom} material={materials.widgetDefaultText} position={[dataAreaX, dataAreaY, contentZOffset]} />;
        }
    };

    return (
        <group position={[x, y, z]}>
            {/* Widget Background */}
            <mesh geometry={widgetGeometry} material={materials.widgetBackground} castShadow={false} receiveShadow={true} />

            {/* Widget Title (using Plane + Material for simplicity, replace with <Text> if possible) */}
            <mesh position={[0, h / 2 - titleHeight / 2 - 0.2, titleZOffset]}>
                <planeGeometry args={[titleWidth, titleHeight]} />
                {/* Use primitive for the material to avoid type errors */}
                <primitive object={materials.widgetTitleText} attach="material" />
                {/* If using Drei Text: <Text color={materials.widgetTitleText.color} fontSize={0.2} anchorX="center" anchorY="middle">{titleText}</Text> */}
            </mesh>

            {/* Widget Content */}
            {renderWidgetContent()}

            {/* Status Indicator */}
            <mesh
                geometry={statusGeometry}
                material={statusMaterial}
                position={[-w / 2 + statusRadius + 0.15, -h / 2 + statusRadius + 0.15, statusZOffset]}
            />
        </group>
    );
}


// Main Laptop Component (Adapted from reference createLaptop)
export default function Laptop({ isDarkMode = false, ...props }: LaptopProps) {
    const materials = useLaptopMaterials(isDarkMode);
    const displayGroupRef = useRef<THREE.Group>(null!); // Ref for display group rotation

    // --- Dimensions (from reference code) ---
    const baseWidth = 28;
    const baseDepth = 20;
    const baseHeight = 1.5;
    const lidWidth = baseWidth;
    const lidDepth = 0.7;
    const lidHeight = baseDepth; // Match base depth
    const cornerRadius = 1.0;
    const screenCornerRadius = 0.8;
    // const widgetCornerRadius = 0.3; // Defined in ScreenWidget

    // --- Geometries (Memoized) ---
    const lidShape = useMemo(() => createRoundedRectShape(lidWidth, lidHeight, cornerRadius), [lidWidth, lidHeight, cornerRadius]);
    const lidExtrudeSettings = useMemo(() => ({ steps: 1, depth: lidDepth, bevelEnabled: false }), [lidDepth]);
    const lidGeometry = useMemo(() => {
        const geom = new THREE.ExtrudeGeometry(lidShape, lidExtrudeSettings);
        geom.center(); // Center geometry for easier positioning relative to group origin
        return geom;
    }, [lidShape, lidExtrudeSettings]);

    const baseShape = useMemo(() => createRoundedRectShape(baseWidth, baseDepth, cornerRadius), [baseWidth, baseDepth, cornerRadius]);
    const baseExtrudeSettings = useMemo(() => ({ steps: 1, depth: baseHeight, bevelEnabled: false }), [baseHeight]);
    const baseGeometry = useMemo(() => {
        const geom = new THREE.ExtrudeGeometry(baseShape, baseExtrudeSettings);
        geom.center(); // Center geometry
        return geom;
    }, [baseShape, baseExtrudeSettings]);

    const hingeRadius = 0.4;
    const hingeLength = baseWidth * 0.15;
    const hingeGeometry = useMemo(() => {
        const geom = new THREE.CylinderGeometry(hingeRadius, hingeRadius, hingeLength, 16);
        geom.rotateZ(Math.PI / 2); // Rotate to lie along X-axis
        return geom;
    }, [hingeRadius, hingeLength]);

    // --- Screen Elements Calculations (Relative to Display Group) ---
    const screenBezel = 0.8;
    const screenHeight = lidHeight - screenBezel * 2;
    const screenWidth = lidWidth - screenBezel * 2;
    // Z positions relative to the displayGroup origin (back edge is Z=0, front is Z=lidDepth)
    const screenSurfaceZ = lidDepth + 0.01;
    const dashboardBgZ = screenSurfaceZ + 0.001;
    const widgetZ = dashboardBgZ + 0.002;
    // const widgetContentZ = widgetZ + 0.001; // Handled within ScreenWidget
    const frontCameraZ = dashboardBgZ + 0.005;

    // Dashboard Background
    const dashboardWidth = screenWidth - 0.4;
    const dashboardHeight = screenHeight - 0.4;
    const punchHoleRadius = 0.3;
    const punchHoleX = 0;
    // Y position relative to displayGroup origin (bottom edge is Y=0)
    const dashboardTopY = screenBezel + screenHeight; // Top Y of the screen area within the lid
    // Place camera near the top edge of the dashboard area
    const punchHoleY = dashboardTopY - punchHoleRadius + 0.5; // Adjusted Y for camera position

    const dashboardShape = useMemo(() => {
        const shape = createRoundedRectShape(dashboardWidth, dashboardHeight, screenCornerRadius);
        const punchHolePath = new THREE.Path();
        // Y position for absarc is relative to the shape's center (0,0)
        // Calculate shape's center Y relative to displayGroup origin (bottom edge Y=0)
        const shapeCenterY = screenBezel + screenHeight / 2;
        const punchHoleShapeY = punchHoleY - shapeCenterY; // Y relative to shape center
        punchHolePath.absarc(punchHoleX, punchHoleShapeY, punchHoleRadius, 0, Math.PI * 2, false);
        shape.holes.push(punchHolePath);
        return shape;
    }, [dashboardWidth, dashboardHeight, screenCornerRadius, punchHoleX, punchHoleY, punchHoleRadius, screenBezel, screenHeight]);

    const dashboardGeometry = useMemo(() => new THREE.ShapeGeometry(dashboardShape), [dashboardShape]);
    const borderPoints = useMemo(() => dashboardShape.getPoints(50), [dashboardShape]);
    const borderGeometry = useMemo(() => new THREE.BufferGeometry().setFromPoints(borderPoints), [borderPoints]);
    const selfieCameraGeometry = useMemo(() => new THREE.CircleGeometry(punchHoleRadius * 0.9, 32), [punchHoleRadius]);
    // Create LineLoop object for border
    const dashboardBorderObject = useMemo(() => new THREE.LineLoop(borderGeometry, materials.dashboardBorder), [borderGeometry, materials.dashboardBorder]);


    // --- Widget Layout Calculations (Relative to Display Group) ---
    const widgetLayout = useMemo(() => {
        const padding = 0.4;
        const usableWidth = dashboardWidth - padding * 2;
        const usableHeight = dashboardHeight - padding * 2; // Usable height within the dashboard bg
        const widgetCols = 4;
        const widgetRows = 2;
        const widgetWidth = (usableWidth - padding * (widgetCols - 1)) / widgetCols;

        const topOffsetForCamera = punchHoleRadius * 2 + 0.4; // Space above widgets near camera
        const adjustedUsableHeight = usableHeight - topOffsetForCamera;
        const widgetHeight = (adjustedUsableHeight - padding * (widgetRows - 1)) / widgetRows;

        // Calculate positions relative to the displayGroup origin (bottom-back edge Y=0, Z=0)
        // Center X relative to dashboard center (which is X=0)
        const gridStartX = -usableWidth / 2 + widgetWidth / 2;

        // Start Y for the top row, relative to displayGroup origin
        // Bottom of usable area: screenBezel + padding
        // Top of usable area (below camera offset): screenBezel + usableHeight - topOffsetForCamera
        // ADD A SMALL OFFSET TO MOVE WIDGETS UP
        const verticalOffset = 1; // Adjust this value to control how much to move up
        const gridStartY = screenBezel + usableHeight - topOffsetForCamera - widgetHeight / 2 + verticalOffset;


        const positions = [];
        let widgetIndex = 0;
        for (let r = 0; r < widgetRows; r++) {
            for (let c = 0; c < widgetCols; c++) {
                const x = gridStartX + c * (widgetWidth + padding);
                const y = gridStartY - r * (widgetHeight + padding); // Move downwards for each row
                positions.push({ x, y, w: widgetWidth, h: widgetHeight, index: widgetIndex });
                widgetIndex++;
            }
        }
        return positions;
    }, [dashboardWidth, dashboardHeight, screenBezel, screenHeight, punchHoleRadius]);


    // --- Keyboard Calculations (Relative to Base Group) ---
    const keyboardLayout = useMemo(() => {
        // Define consistent gap sizes
        const sideGap = 0.8;
        const topGap = 0.2; // Smaller gap at the top/back edge
        const bottomGap = 1.2; // Larger gap at the bottom/front edge

        // Calculate available keyboard area dimensions based on gaps
        const keyboardWidth = baseWidth - sideGap * 2;
        const keyboardDepth = baseDepth - topGap - bottomGap; // Depth available

        // Define keyboard base thickness (visual recess)
        const keyboardBaseThickness = 0.01; // Minimal thickness

        // Define key grid layout parameters
        const rows = 6; const cols = 15; const keyGap = 0.075; const keyHeight = 0.12;

        // Calculate maximum key size to fit the available area
        const maxKeyWidth = (keyboardWidth - (cols - 1) * keyGap) / cols;
        const maxKeyDepth = (keyboardDepth - (rows - 1) * keyGap) / rows;
        const keySize = Math.min(maxKeyWidth, maxKeyDepth); // Use smaller dimension

        // Calculate actual dimensions of the key grid
        const actualKeyboardWidth = cols * keySize + (cols - 1) * keyGap;
        const actualKeyboardDepth = rows * keySize + (rows - 1) * keyGap;

        // Starting position (top-left corner of key grid) relative to keyboardBase center
        const keyGridStartX = -actualKeyboardWidth / 2 + keySize / 2;
        const keyGridStartZ = -actualKeyboardDepth / 2 + keySize / 2;

        // Special keys mapping (same as reference)
        const specialKeys: { [key: string]: [number, number, number] } = {
            backspace: [0, 13, 2], tab: [1, 0, 2], backslash: [1, 13, 2],
            caps: [2, 0, 2], enter_upper: [2, 13, 2], enter: [3, 13, 2],
            shift_left: [4, 0, 2], shift_right: [4, 13, 2], ctrl_left: [5, 0, 2],
            fn: [5, 2, 1], alt_left: [5, 3, 2], spacebar: [5, 5, 6],
            alt_gr: [5, 11, 2], ctrl_right: [5, 13, 2],
        };

        const isSpecialKeyPosition = (row: number, col: number): false | { key: string; startCol: number; width: number; } => {
            for (const [key, [keyRow, keyStartCol, keyWidth]] of Object.entries(specialKeys)) {
                if (row === keyRow && col >= keyStartCol && col < keyStartCol + keyWidth) {
                    return { key, startCol: keyStartCol, width: keyWidth };
                }
            }
            return false;
        };

        const keys = [];
        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                const specialKey = isSpecialKeyPosition(row, col);
                if (specialKey && col > specialKey.startCol) continue; // Skip subsequent cells

                const keyWidth = specialKey ? specialKey.width * keySize + (specialKey.width - 1) * keyGap : keySize;
                const xOffset = specialKey ? (specialKey.width - 1) * (keySize + keyGap) / 2 : 0;
                const relativeX = keyGridStartX + col * (keySize + keyGap) + xOffset;
                const relativeZ = keyGridStartZ + row * (keySize + keyGap);

                keys.push({
                    x: relativeX, z: relativeZ, // Relative to keyboard base center
                    w: keyWidth, d: keySize, h: keyHeight, // Use d for depth
                    isSpecial: !!specialKey,
                    key: `key-${row}-${col}`
                });
            }
        }

        // Keyboard base position relative to main base center (Y=0, Z=0)
        // Base center is Y=0 because of baseGeometry.center()
        const baseSurfaceY = baseHeight / 2; // Top surface Y of the main base
        const keyboardBaseY = baseSurfaceY - keyboardBaseThickness / 2; // Center slightly below base surface
        // Z position relative to main base center (Z=0)
        const keyboardBaseZ = -baseDepth / 2 + topGap + keyboardDepth / 2;

        // Touchpad position relative to main base center (Y=0, Z=0)
        const touchpadThickness = 0.1;
        const touchpadWidth = baseWidth * 0.4;
        const touchpadDepth = bottomGap * 0.6; // Use depth instead of height
        // Calculate touchpad Z position relative to main base center (Z=0)
        // Center it within the bottom gap area
        const touchpadCenterZ = baseDepth / 2 - bottomGap / 2; // Z position

        return {
            base: { w: keyboardWidth, h: keyboardBaseThickness, d: keyboardDepth, x: 0, y: keyboardBaseY, z: keyboardBaseZ },
            keys,
            touchpad: { w: touchpadWidth, h: touchpadThickness, d: touchpadDepth, x: 0, y: baseSurfaceY + touchpadThickness / 2, z: touchpadCenterZ }
        };

    }, [baseWidth, baseDepth, baseHeight]); // Dependencies


    // --- Hinge Calculations (Relative to Base Group) ---
    // Define the pivot point coordinates relative to baseGroup origin (center of base geometry)
    const pivotY = baseHeight / 2; // Pivot at the top surface of the base
    const pivotZ = -baseDepth / 2 + 0.1; // Pivot near the back edge
    const hingeOffset = baseWidth * 0.35; // Distance from center

    // --- Materials (Cloned for specific names) ---
    const laptopLidMat = useMemo(() => {
        const mat = materials.laptopBody.clone();
        mat.name = 'laptop_lid';
        return mat;
    }, [materials.laptopBody]);
    const laptopBaseMat = useMemo(() => {
        const mat = materials.laptopBody.clone();
        mat.name = 'laptop_base';
        return mat;
    }, [materials.laptopBody]);

    // --- Keyboard Key Geometry (Memoized) ---
    // Memoize a standard key geometry to instance it
    const standardKeyGeometry = useMemo(() => new THREE.BoxGeometry(1, 1, 1), []); // Placeholder size, will be scaled


    // --- Component Structure ---
    return (
        <group {...props} dispose={null}> {/* Main Laptop Group */}

            {/* Base Group - Origin at the center of the base geometry */}
            <group position-y={0}> {/* Base group origin matches main base geometry center - removed rotation from here */}
                {/* Rotated Base Container - This only rotates the physical base */}
                <group rotation-x={Math.PI / 2 }> {/* This group only rotates the base parts */}
                    {/* Laptop Base Mesh */}
                    <mesh
                        geometry={baseGeometry}
                        material={laptopBaseMat}
                        castShadow
                        receiveShadow={false} // Avoid self-shadowing on base surface
                    />

                    {/* Keyboard Group - Positioned relative to Base Group origin */}
                    <group rotation-x={- Math.PI / 2}> {/* Add rotation to the keyboard group */}
                        {/* Keyboard Base (Recess) */}
                        <mesh position={[keyboardLayout.base.x, keyboardLayout.base.y, keyboardLayout.base.z]}>
                            <boxGeometry args={[keyboardLayout.base.w, keyboardLayout.base.h, keyboardLayout.base.d]} />
                            <primitive object={materials.keyboardBase} attach="material" />
                        </mesh>

                        {/* Keyboard Keys */}
                        {keyboardLayout.keys.map(keyInfo => (
                            <mesh
                                key={keyInfo.key}
                                position={[
                                    keyboardLayout.base.x + keyInfo.x,
                                    keyboardLayout.base.y + keyboardLayout.base.h / 2 + keyInfo.h / 2,
                                    keyboardLayout.base.z + keyInfo.z
                                ]}
                                geometry={standardKeyGeometry}
                                scale={[keyInfo.w, keyInfo.h, keyInfo.d]}
                                material={materials.keyCap}
                                castShadow
                            />
                        ))}

                        {/* Touchpad */}
                        <mesh
                            position={[keyboardLayout.touchpad.x, keyboardLayout.touchpad.y, keyboardLayout.touchpad.z]}
                            material={materials.touchpad}
                            castShadow
                        >
                            <boxGeometry args={[keyboardLayout.touchpad.w, keyboardLayout.touchpad.h, keyboardLayout.touchpad.d]} />
                        </mesh>
                    </group>
                </group>

                {/* Hinges - Positioned relative to Base Group origin but NOT rotated */}
                <mesh geometry={hingeGeometry} material={materials.hinge} position={[-hingeOffset, pivotY, pivotZ]} />
                <mesh geometry={hingeGeometry} material={materials.hinge} position={[hingeOffset, pivotY, pivotZ]} />

                {/* Display Group - Positioned and Rotated relative to Base Group's Pivot Point */}
                <group
                    ref={displayGroupRef}
                    position={[0, pivotY, pivotZ]} // Position at the pivot point
                    rotation-x={-Math.PI / 6} // Initial open angle (negative X rotation)
                >
                    {/* Laptop Lid Mesh - Origin is center, position relative to display group pivot */}
                    <mesh
                        geometry={lidGeometry}
                        material={laptopLidMat}
                        position={[0, lidHeight / 2, lidDepth / 2]} // Position relative to pivot
                        castShadow
                        receiveShadow
                    />

                    {/* Dashboard Background - Position relative to display group pivot */}
                    <mesh
                        geometry={dashboardGeometry}
                        material={materials.dashboardBackground}
                        position={[0, screenBezel + screenHeight / 2, dashboardBgZ]}
                    />

                    {/* Dashboard Border - Position relative to display group pivot */}
                    <primitive
                        object={dashboardBorderObject}
                        position={[0, screenBezel + screenHeight / 2, dashboardBgZ + 0.0001]}
                    />

                    {/* Front Camera - Position relative to display group pivot */}
                    <mesh
                        geometry={selfieCameraGeometry}
                        material={materials.selfieCamera}
                        position={[punchHoleX, punchHoleY, frontCameraZ]}
                    />

                    {/* Widgets - Positioned relative to display group pivot */}
                    {widgetLayout.map(widgetInfo => (
                        <ScreenWidget
                            key={widgetInfo.index}
                            x={widgetInfo.x}
                            y={widgetInfo.y}
                            z={widgetZ} // Base Z for all widgets
                            w={widgetInfo.w}
                            h={widgetInfo.h}
                            index={widgetInfo.index}
                            materials={materials}
                            isDarkMode={isDarkMode}
                        />
                    ))}
                </group> {/* End Display Group */}
            </group> {/* End Base Group */}
        </group> // End Main Laptop Group
    );
}
