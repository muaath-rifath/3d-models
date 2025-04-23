"use client";
import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

// Renamed component
export default function Laptop() {
    const mountRef = useRef<HTMLDivElement>(null);
    const [isDarkMode, setIsDarkMode] = useState(false);
    const sceneRef = useRef<THREE.Scene | null>(null);
    // Renamed ref
    const laptopRef = useRef<THREE.Group | null>(null);
    const displayGroupRef = useRef<THREE.Group | null>(null); // Ref for display group rotation

    // Function to toggle dark mode
    const toggleDarkMode = () => {
        setIsDarkMode(prev => !prev);
    }

    // Function to update materials based on dark mode - Green Theme
    const updateMaterials = (isDark: boolean) => {
        // Renamed ref check
        if (!sceneRef.current || !laptopRef.current) return;

        // Update scene background - Green tint
        sceneRef.current.background = new THREE.Color(isDark ? 0x081208 : 0xf0f4f0);

        // Update laptop materials (using laptopRef)
        laptopRef.current.traverse((object) => {
            if (object instanceof THREE.Mesh) {
                const material = object.material as THREE.MeshStandardMaterial;

                // Identify parts by their name and update accordingly - Green Theme
                if (material.name === 'laptop_lid' || material.name === 'laptop_base') { // Updated names
                    material.color.set(isDark ? 0x505e50 : 0xe0ffe0); // Adapted green body
                    material.emissive.set(isDark ? 0x253025 : 0x000000);
                    material.emissiveIntensity = isDark ? 0.30 : 0;
                }
                else if (material.name === 'screen') {
                    material.color.set(isDark ? 0x00ffbb : 0x00aa99); // Adapted green screen
                    material.emissive.set(isDark ? 0x00aa88 : 0x008866);
                    material.emissiveIntensity = isDark ? 0.5 : 0.2;
                }
                else if (material.name === 'ui_element') {
                    material.color.set(isDark ? 0xafffaf : 0x00aa88); // Adapted green UI
                    material.emissive.set(isDark ? 0x66cc66 : 0x000000);
                    material.emissiveIntensity = isDark ? 0.7 : 0.0;
                }
                else if (material.name === 'accent') {
                    material.color.set(isDark ? 0x66ffaa : 0x00aa66); // Adapted green accent
                    material.emissive.set(isDark ? 0x44cc88 : 0x000000);
                    material.emissiveIntensity = isDark ? 0.6 : 0.0;
                }
                // Removed camera/lens updates as they are part of display group now
                else if (material.name === 'port') {
                    material.color.set(isDark ? 0x444444 : 0x888888); // Keep neutral grey
                }
                else if (material.name === 'buttons') { // Might reuse for power button on base
                    material.color.set(isDark ? 0x505e50 : 0xe0ffe0); // Match green body
                    material.emissive.set(isDark ? 0x253025 : 0x000000);
                    material.emissiveIntensity = isDark ? 0.3 : 0.0;
                }
                else if (material.name === 'selfie_camera') {
                    material.color.set(isDark ? 0x111111 : 0x000000); // Keep dark
                    material.emissive.set(isDark ? 0x111111 : 0x000000);
                    material.emissiveIntensity = isDark ? 0.1 : 0.0;
                }
                else if (material.name === 'graph_element') {
                    material.color.set(isDark ? 0x88ffcc : 0x00ccaa); // Adapted green graph
                    material.emissive.set(isDark ? 0x44ddaa : 0x00aa88);
                    material.emissiveIntensity = isDark ? 0.8 : 0.3;
                }
                else if (material.name === 'chart_element') {
                    material.color.set(isDark ? 0xccff66 : 0x88cc00); // Contrasting green/yellow chart
                    material.emissive.set(isDark ? 0xaadd33 : 0x66aa00);
                    material.emissiveIntensity = isDark ? 0.8 : 0.3;
                }
                else if (material.name === 'text_element') {
                    material.color.set(isDark ? 0xeeffee : 0xffffff); // Greenish tint text
                    material.emissive.set(isDark ? 0xccffcc : 0xf0f0f0);
                    material.emissiveIntensity = isDark ? 0.6 : 0.2;
                }
                // Removed camera_ring update
                // Add updates for new materials
                else if (material.name === 'keyCap') {
                    material.color.set(isDark ? 0x354035 : 0xd0ddd0); // Darker/Lighter green keys
                    material.emissive.set(isDark ? 0x101510 : 0x000000);
                    material.emissiveIntensity = isDark ? 0.1 : 0;
                }
                else if (material.name === 'touchpad') {
                    material.color.set(isDark ? 0x485548 : 0xd8e8d8); // Slightly different green for touchpad
                    material.roughness = 0.6; // Less shiny
                }
                else if (material.name === 'hinge') {
                    material.color.set(isDark ? 0x333833 : 0xaaaaaa); // Dark/Light grey hinge
                }

                // Ensure other materials also update if needed
                if (material.needsUpdate) {
                    material.needsUpdate = true;
                }
            }
        });
    }

    useEffect(() => {
        if (!mountRef.current) return;

        // Scene setup - Green tint
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(isDarkMode ? 0x081208 : 0xf0f4f0);
        sceneRef.current = scene;

        // Camera setup - Adjusted position and FoV for laptop
        const camera = new THREE.PerspectiveCamera(
            55, // Slightly wider FoV than tablet
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        camera.position.set(0, 15, 30); // Adjusted position for laptop view

        // Renderer setup
        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        mountRef.current.appendChild(renderer.domElement);

        // Controls - Adjusted zoom limits for laptop
        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;
        controls.minDistance = 15; // Adjusted min distance
        controls.maxDistance = 50; // Adjusted max distance
        controls.target.set(0, 5, 0); // Target the center of the laptop base/hinge area

        // Lighting - Adjusted intensity and color for green theme (same as tablet)
        const ambientLight = new THREE.AmbientLight(
            isDarkMode ? 0x445544 : 0x909090,
            isDarkMode ? 0.4 : 0.8
        );
        scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(
            isDarkMode ? 0xaaffcc : 0xffffff,
            isDarkMode ? 0.7 : 0.9
        );
        directionalLight.position.set(5, 15, 10); // Higher light source
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

        // Screen light might not be needed if UI elements are emissive enough
        // const screenLight = new THREE.SpotLight(...)
        // scene.add(screenLight);

        // Materials - Added keyboard/touchpad materials - Green Theme
        const createMaterials = (isDark: boolean) => {
            return {
                // Renamed material key
                laptopBody: new THREE.MeshStandardMaterial({
                    name: 'laptop_lid', // Default name, will be overridden for base
                    color: isDark ? 0x505e50 : 0xe0ffe0,
                    metalness: 0.7,
                    roughness: 0.3,
                    emissive: isDark ? 0x253025 : 0x000000,
                    emissiveIntensity: isDark ? 0.30 : 0,
                    side: THREE.DoubleSide
                }),
                screen: new THREE.MeshStandardMaterial({
                    name: 'screen',
                    color: isDark ? 0x00ffbb : 0x00aa99,
                    metalness: 0.1,
                    roughness: 0.05,
                    emissive: isDark ? 0x00aa88 : 0x008866,
                    emissiveIntensity: isDark ? 0.5 : 0.2,
                    side: THREE.FrontSide
                }),
                uiElement: new THREE.MeshStandardMaterial({
                    name: 'ui_element',
                    color: isDark ? 0xafffaf : 0x00aa88,
                    metalness: 0.1,
                    roughness: 0.1,
                    emissive: isDark ? 0x66cc66 : 0x000000,
                    emissiveIntensity: isDark ? 0.7 : 0.0
                }),
                accent: new THREE.MeshStandardMaterial({
                    name: 'accent',
                    color: isDark ? 0x66ffaa : 0x00aa66,
                    metalness: 0.7,
                    roughness: 0.3,
                    emissive: isDark ? 0x44cc88 : 0x000000,
                    emissiveIntensity: isDark ? 0.6 : 0.0
                }),
                // Removed camera/lens materials (will be handled within display group)
                port: new THREE.MeshStandardMaterial({
                    name: 'port',
                    color: isDark ? 0x444444 : 0x888888,
                    metalness: 0.8,
                    roughness: 0.5
                }),
                buttons: new THREE.MeshStandardMaterial({ // For power button etc.
                    name: 'buttons',
                    color: isDark ? 0x505e50 : 0xe0ffe0,
                    metalness: 0.9,
                    roughness: 0.3,
                    emissive: isDark ? 0x253025 : 0x000000,
                    emissiveIntensity: isDark ? 0.3 : 0.0
                }),
                selfieCamera: new THREE.MeshStandardMaterial({
                    name: 'selfie_camera',
                    color: isDark ? 0x111111 : 0x000000,
                    metalness: 0.2,
                    roughness: 0.3,
                    emissive: isDark ? 0x111111 : 0x000000,
                    emissiveIntensity: isDark ? 0.1 : 0.0
                }),
                graphElement: new THREE.MeshStandardMaterial({
                    name: 'graph_element',
                    color: isDark ? 0x88ffcc : 0x00ccaa,
                    metalness: 0.1,
                    roughness: 0.2,
                    emissive: isDark ? 0x44ddaa : 0x00aa88,
                    emissiveIntensity: isDark ? 0.8 : 0.3,
                    transparent: true,
                    opacity: 0.9
                }),
                chartElement: new THREE.MeshStandardMaterial({
                    name: 'chart_element',
                    color: isDark ? 0xccff66 : 0x88cc00,
                    metalness: 0.1,
                    roughness: 0.2,
                    emissive: isDark ? 0xaadd33 : 0x66aa00,
                    emissiveIntensity: isDark ? 0.8 : 0.3,
                    transparent: true,
                    opacity: 0.9
                }),
                textElement: new THREE.MeshStandardMaterial({
                    name: 'text_element',
                    color: isDark ? 0xeeffee : 0xffffff,
                    metalness: 0.1,
                    roughness: 0.2,
                    emissive: isDark ? 0xccffcc : 0xf0f0f0,
                    emissiveIntensity: isDark ? 0.6 : 0.2
                }),
                // Removed cameraRing material
                // New materials
                keyCap: new THREE.MeshStandardMaterial({
                    name: 'keyCap',
                    color: isDark ? 0x354035 : 0xd0ddd0, // Darker/Lighter green keys
                    roughness: 0.7,
                    metalness: 0.1,
                    emissive: isDark ? 0x101510 : 0x000000, // Subtle glow for dark mode keys
                    emissiveIntensity: isDark ? 0.1 : 0,
                }),
                touchpad: new THREE.MeshStandardMaterial({
                    name: 'touchpad',
                    color: isDark ? 0x485548 : 0xd8e8d8, // Slightly different green for touchpad
                    roughness: 0.6, // Less shiny than body
                    metalness: 0.2,
                }),
                hinge: new THREE.MeshStandardMaterial({
                    name: 'hinge',
                    color: isDark ? 0x333833 : 0xaaaaaa, // Dark/Light grey hinge
                    metalness: 0.8,
                    roughness: 0.4,
                }),
            };
        };

        const materials = createMaterials(isDarkMode);

        // Create Laptop - Renamed function
        const createLaptop = () => {
            const laptop = new THREE.Group(); // Main laptop group
            const displayGroup = new THREE.Group(); // Group for lid/screen
            const baseGroup = new THREE.Group(); // Group for keyboard/base

            // Laptop dimensions (adjust as needed)
            const baseWidth = 28;
            const baseDepth = 20; // Depth of the keyboard base
            const baseHeight = 1.5; // Thickness of the base
            const lidWidth = baseWidth;
            const lidDepth = 0.7; // Thickness of the lid
            // Make lid height match base depth for closed appearance
            const lidHeight = baseDepth; 

            const cornerRadius = 1.0;
            const screenCornerRadius = 0.8;
            const widgetCornerRadius = 0.3; // Keep from tablet

            // Helper function (same as tablet)
            const createRoundedRectShape = (w: number, h: number, r: number) => {
                const shape = new THREE.Shape();
                shape.moveTo(-w / 2 + r, -h / 2); shape.lineTo(w / 2 - r, -h / 2); shape.quadraticCurveTo(w / 2, -h / 2, w / 2, -h / 2 + r); shape.lineTo(w / 2, h / 2 - r); shape.quadraticCurveTo(w / 2, h / 2, w / 2 - r, h / 2); shape.lineTo(-w / 2 + r, h / 2); shape.quadraticCurveTo(-w / 2, h / 2, -w / 2, h / 2 - r); shape.lineTo(-w / 2, -h / 2 + r); shape.quadraticCurveTo(-w / 2, -h / 2, -w / 2 + r, -h / 2);
                return shape;
            };

            // --- Create Display Group (Lid) ---
            const lidShape = createRoundedRectShape(lidWidth, lidHeight, cornerRadius);
            const lidExtrudeSettings = { steps: 1, depth: lidDepth, bevelEnabled: false };
            const lidGeometry = new THREE.ExtrudeGeometry(lidShape, lidExtrudeSettings);
            lidGeometry.center(); 
            const laptopLidMat = materials.laptopBody.clone(); 
            laptopLidMat.name = 'laptop_lid';
            const laptopLid = new THREE.Mesh(lidGeometry, laptopLidMat);
            laptopLid.castShadow = true;
            laptopLid.receiveShadow = true;
            // Position lid so the group's origin (0,0,0) is the bottom-back edge
            laptopLid.position.set(0, lidHeight / 2, lidDepth / 2); 
            displayGroup.add(laptopLid);

            // --- Screen and UI Layering (Adapted from Tablet) ---
            const screenBezel = 0.8;
            const screenHeight = lidHeight - screenBezel * 2; 
            const screenWidth = lidWidth - screenBezel * 2;
            // Z positions relative to the displayGroup origin (back edge is Z=0, front is Z=lidDepth)
            const screenSurfaceZ = lidDepth + 0.01; 
            const dashboardBgZ = screenSurfaceZ + 0.001;
            const widgetZ = dashboardBgZ + 0.002;
            const widgetContentZ = widgetZ + 0.001;
            const frontCameraZ = dashboardBgZ + 0.005;

            // Dashboard Background - Adjusted dimensions and Green Theme
            const dashboardWidth = screenWidth - 0.4;
            const dashboardHeight = screenHeight - 0.4;
            const dashboardShape = createRoundedRectShape(dashboardWidth, dashboardHeight, screenCornerRadius);

            // Punch-hole camera 
            const punchHoleRadius = 0.3;
            const punchHoleX = 0;
            // Y position relative to displayGroup origin (bottom edge is Y=0)
            // Position near the top edge of the dashboard area
            const dashboardTopY = screenBezel + screenHeight; // Top Y of the screen area within the lid
            const punchHoleY = dashboardTopY - 0.6; // Place camera near the top

            const punchHolePath = new THREE.Path();
            punchHolePath.absarc(punchHoleX, punchHoleY, punchHoleRadius, 0, Math.PI * 2, false);
            dashboardShape.holes.push(punchHolePath);

            const dashboardMaterial = new THREE.MeshStandardMaterial({
                color: isDarkMode ? 0x1a241a : 0xe8f4e8, 
                roughness: 0.6, metalness: 0.02, side: THREE.FrontSide, transparent: true, opacity: 0.97,
                emissive: isDarkMode ? 0x020502 : 0x000000, emissiveIntensity: isDarkMode ? 0.05 : 0,
            });
            const dashboardGeometry = new THREE.ShapeGeometry(dashboardShape);
            const dashboardBg = new THREE.Mesh(dashboardGeometry, dashboardMaterial);
            // Position relative to displayGroup origin (bottom-back)
            // Center X, center Y within screen area, place at correct Z depth
            dashboardBg.position.set(0, screenBezel + screenHeight / 2, dashboardBgZ); 
            displayGroup.add(dashboardBg);

            // Dashboard Border
            const borderPoints = dashboardShape.getPoints(50);
            const borderGeometry = new THREE.BufferGeometry().setFromPoints(borderPoints);
            const borderMaterial = new THREE.LineBasicMaterial({ color: isDarkMode ? 0x446644 : 0xaaaaaa, linewidth: 1, transparent: true, opacity: 0.5 });
            const dashboardBorder = new THREE.LineLoop(borderGeometry, borderMaterial);
            // Position border relative to dashboardBg
            dashboardBorder.position.copy(dashboardBg.position);
            dashboardBorder.position.z += 0.0001; 
            displayGroup.add(dashboardBorder);

            // Front Camera
            const selfieCameraGeometry = new THREE.CircleGeometry(punchHoleRadius * 0.9, 32);
            const selfieCamera = new THREE.Mesh(selfieCameraGeometry, materials.selfieCamera);
            // Position relative to displayGroup origin
            selfieCamera.position.set(punchHoleX, punchHoleY, frontCameraZ); 
            displayGroup.add(selfieCamera);

            // Create Widgets (reuse tablet function, adjust layout)
            const createWidget = (x: number, y: number, w: number, h: number, index: number) => {
                // --- Copied and adapted createWidget function ---
                const widgetGroup = new THREE.Group();
                // Position relative to displayGroup origin (bottom-back)
                widgetGroup.position.set(x, y, widgetZ); 

                // ... (rest of createWidget function remains the same, internal positions are relative to widgetGroup) ...
                // --- Ensure internal Z positions use offsets like (widgetContentZ - widgetZ) ---
                const widgetShape = createRoundedRectShape(w, h, widgetCornerRadius);
                const widgetGeometry = new THREE.ShapeGeometry(widgetShape);
                const widgetMaterial = new THREE.MeshStandardMaterial({
                    color: isDarkMode ? 0x304530 : 0xfcfffc, roughness: 0.4, metalness: 0.0, side: THREE.FrontSide,
                    transparent: true, opacity: 0.88, emissive: isDarkMode ? 0x141f14 : 0x000000, emissiveIntensity: isDarkMode ? 0.15 : 0,
                });
                const widgetBg = new THREE.Mesh(widgetGeometry, widgetMaterial);
                widgetBg.castShadow = false; widgetBg.receiveShadow = true;
                widgetGroup.add(widgetBg);

                const titles = ["CPU Load", "Memory Usage", "Network I/O", "Disk Activity", "GPU Temp", "Battery", "System Uptime", "Active Processes"];
                const titleText = titles[index % titles.length] || `Metric ${index + 1}`;
                const titleHeight = 0.3; const titleWidth = w * 0.75;
                const titleGeometry = new THREE.PlaneGeometry(titleWidth, titleHeight);
                const titleMaterial = materials.textElement.clone();
                titleMaterial.color.set(isDarkMode ? 0xddffdd : 0x333333); titleMaterial.emissive.set(isDarkMode ? 0xaaccaa : 0x000000);
                titleMaterial.emissiveIntensity = isDarkMode ? 0.3 : 0; titleMaterial.side = THREE.FrontSide;
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
                    // ... cases 0-7 ... ensure all meshes inside cases use the 'contentZ' variable for their Z position
                    case 0: // CPU Load - Gauge
                    case 1: // Memory Usage - Gauge
                        const gaugeRadius = dataAreaHeight * 0.6; const arcPercentage = seededRandom();
                        const arcGeometry = new THREE.RingGeometry(gaugeRadius * 0.8, gaugeRadius, 32, 1, 0, Math.PI * arcPercentage);
                        const arcMaterial = (widgetType === 0 ? materials.graphElement : materials.chartElement).clone(); arcMaterial.side = THREE.DoubleSide;
                        const arcMesh = new THREE.Mesh(arcGeometry, arcMaterial);
                        arcMesh.position.set(dataAreaX, dataAreaY - gaugeRadius * 0.2, contentZ); arcMesh.rotation.z = -Math.PI / 2; // Use contentZ
                        widgetGroup.add(arcMesh);
                        const bgArcGeometry = new THREE.RingGeometry(gaugeRadius * 0.8, gaugeRadius, 32, 1, 0, Math.PI);
                        const bgArcMaterial = new THREE.MeshStandardMaterial({ color: isDarkMode ? 0x335533 : 0xcccccc, side: THREE.DoubleSide, opacity: 0.3, transparent: true }); // Dark green bg
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
                        const lineMatUp = new THREE.LineBasicMaterial({ color: isDarkMode ? 0x88ff88 : 0x00aa00, linewidth: 2 });
                        const lineUp = new THREE.Line(lineGeomUp, lineMatUp); lineUp.position.set(dataAreaX, dataAreaY, contentZ); widgetGroup.add(lineUp); // Use contentZ
                        const lineGeomDown = new THREE.BufferGeometry().setFromPoints(pointsDown);
                        const lineMatDown = new THREE.LineBasicMaterial({ color: isDarkMode ? 0x66aaff : 0x0066cc, linewidth: 2 }); // Blue for down/read
                        const lineDown = new THREE.Line(lineGeomDown, lineMatDown); lineDown.position.set(dataAreaX, dataAreaY, contentZ); widgetGroup.add(lineDown); // Use contentZ
                        break;
                    case 4: // GPU Temp - Simple Bar
                    case 5: // Battery - Simple Bar
                         const barValue = seededRandom(); const barWidth = dataAreaWidth * 0.8; const barHeight = dataAreaHeight * 0.3;
                         const barGeom = new THREE.BoxGeometry(barWidth * barValue, barHeight, 0.01);
                         const barMat = (widgetType === 4 ? materials.accent : materials.graphElement).clone(); // Accent for Temp, Graph for Battery
                         barMat.color.set(widgetType === 4 ? (isDarkMode ? 0xffaa66 : 0xcc6600) : (isDarkMode ? 0x88ffcc : 0x00ccaa)); // Orange/Green
                         const barMesh = new THREE.Mesh(barGeom, barMat);
                         barMesh.position.set(dataAreaX - (barWidth * (1-barValue))/2, dataAreaY, contentZ); widgetGroup.add(barMesh); // Use contentZ
                         const bgBarGeom = new THREE.BoxGeometry(barWidth, barHeight, 0.01);
                         const bgBarMat = new THREE.MeshStandardMaterial({ color: isDarkMode ? 0x443322 : 0xddccaa, side: THREE.FrontSide, opacity: 0.3, transparent: true }); // Dark orange bg
                         const bgBarMesh = new THREE.Mesh(bgBarGeom, bgBarMat);
                         bgBarMesh.position.set(dataAreaX, dataAreaY, contentZ - 0.0001); // Slightly behind
                         widgetGroup.add(bgBarMesh);
                         break;
                    default: // Text for Uptime/Processes
                        const textGeom = new THREE.PlaneGeometry(dataAreaWidth * 0.8, dataAreaHeight * 0.6);
                        const textMat = materials.textElement.clone();
                        textMat.color.set(isDarkMode ? 0xccffcc : 0x444444);
                        const textMesh = new THREE.Mesh(textGeom, textMat);
                        textMesh.position.set(dataAreaX, dataAreaY, contentZ); widgetGroup.add(textMesh); // Use contentZ
                        break;
                 }

                const statusRadius = 0.2; const statusGeometry = new THREE.CircleGeometry(statusRadius, 16);
                const statusMaterial = materials.accent.clone();
                const statusColorsCycle = [0xff8888, 0x88ff88, 0x8888ff, 0xffff88, 0xff88ff, 0x88ffff, 0xffaa88, 0x88ccff];
                statusMaterial.color.set(statusColorsCycle[index % statusColorsCycle.length]); statusMaterial.emissive.set(statusColorsCycle[index % statusColorsCycle.length]);
                statusMaterial.emissiveIntensity = isDarkMode ? 0.4 : 0.1; statusMaterial.side = THREE.FrontSide;
                const statusMesh = new THREE.Mesh(statusGeometry, statusMaterial);
                // Z offset relative to widget group's Z
                statusMesh.position.set(-w / 2 + statusRadius + 0.15, -h / 2 + statusRadius + 0.15, (widgetContentZ - widgetZ)); 
                widgetGroup.add(statusMesh);

                return widgetGroup;
                // --- End of copied createWidget function ---
            };

            // Arrange Widgets (adjust rows/cols for laptop screen)
            const padding = 0.4;
            const usableWidth = dashboardWidth - padding * 2;
            const usableHeight = dashboardHeight - padding * 2; // Usable height within the dashboard bg
            const widgetCols = 4; 
            const widgetRows = 2; 
            const widgetWidth = (usableWidth - padding * (widgetCols - 1)) / widgetCols;
            
            const topOffsetForCamera = punchHoleRadius * 2 + 0.4;
            const adjustedUsableHeight = usableHeight - topOffsetForCamera; 
            const widgetHeight = (adjustedUsableHeight - padding * (widgetRows - 1)) / widgetRows;

            const startX = -usableWidth / 2 + widgetWidth / 2;
            // Y position relative to displayGroup origin (bottom-back)
            // Start from the bottom of the usable area (screenBezel + padding) and go up
            const widgetAreaBottomY = screenBezel + padding;
            const startY = widgetAreaBottomY + adjustedUsableHeight - widgetHeight / 2; // Start Y for the top row

            let widgetIndex = 0;
            for (let r = 0; r < widgetRows; r++) {
                for (let c = 0; c < widgetCols; c++) {
                    const x = startX + c * (widgetWidth + padding);
                    // Calculate Y position for each row, moving downwards
                    const y = startY - r * (widgetHeight + padding); 
                    const widget = createWidget(x, y, widgetWidth, widgetHeight, widgetIndex); // Use widgetHeight
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
            laptopBase.castShadow = true;
            // Remove shadow receiving to eliminate any unwanted shadows on the base surface
            laptopBase.receiveShadow = false;
            baseGroup.add(laptopBase); 
            baseGroup.position.y = baseHeight / 2;
            
            // Removed keyboard group completely
            // Removed touchpad completely

            // --- Hinge --- (Visual Only)
            // Define the pivot point coordinates relative to baseGroup origin
            const pivotY = baseHeight * 6.7; 
            const pivotZ = baseDepth / 22; 

            // Add visual hinges
            const hingeRadius = 0.4;
            const hingeLength = baseWidth * 0.15; // Shorter hinges
            const hingeGeometry = new THREE.CylinderGeometry(hingeRadius, hingeRadius, hingeLength, 16);
            hingeGeometry.rotateZ(Math.PI / 2); // Rotate to lie along X-axis

            const hingeOffset = baseWidth * 0.35; // Distance from center

            const hingeL = new THREE.Mesh(hingeGeometry, materials.hinge);
            // Position relative to baseGroup's origin, using pivot coordinates + X offset
            hingeL.position.set(-hingeOffset, pivotY, pivotZ); 
            baseGroup.add(hingeL);

            const hingeR = new THREE.Mesh(hingeGeometry, materials.hinge);
            // Position relative to baseGroup's origin, using pivot coordinates + X offset
            hingeR.position.set(hingeOffset, pivotY, pivotZ); 
            baseGroup.add(hingeR);

            // --- Assemble Laptop ---
            laptop.add(baseGroup); // Add base group (which includes hinges)

            // Position and rotate display group relative to the base group's pivot point
            displayGroup.position.set(0, pivotY, pivotZ); 
            displayGroup.rotation.x = Math.PI / 2.5 ; 

            // Add display group as a child of the base group
            baseGroup.add(displayGroup); 
            displayGroupRef.current = displayGroup; 

            // --- Add Keyboard ---
            const keyboardGroup = new THREE.Group();
            
            // Define consistent gap sizes for all sides
            const sideGap = 0.8; // Gap for left and right edges
            // Adjust gaps to move keyboard higher
            const topGap = 0.5;  // Smaller gap at the top/back edge
            const bottomGap = 1.2; // Larger gap at the bottom/front edge (increased by the amount topGap decreased)
            
            // Calculate available keyboard area dimensions based on gaps
            const keyboardWidth = baseWidth - sideGap * 2; // Width available for keyboard background and keys
            const keyboardDepth = baseDepth - topGap - bottomGap - 7; // Depth available for keyboard background and keys
            
            // Define keyboard base thickness (visual recess)
            const keyboardBaseThickness = 0.5;
            
            // Create keyboard background geometry using calculated dimensions
            const keyboardBaseGeometry = new THREE.BoxGeometry(keyboardWidth, keyboardBaseThickness, keyboardDepth);
            const keyboardBaseMaterial = new THREE.MeshStandardMaterial({
                color: isDarkMode ? 0x252e25 : 0xc8d8c8,
                roughness: 0.8,
                metalness: 0.2,
                transparent: true,
                opacity: 0.4
            });
            const keyboardBase = new THREE.Mesh(keyboardBaseGeometry, keyboardBaseMaterial);
            
            // Position keyboard base centered within the base, respecting the adjusted gaps
            const baseSurfaceY = baseHeight / 2; // Top surface Y of the main base in local space
            keyboardBase.position.set(
                0, 
                baseSurfaceY + keyboardBaseThickness/2, 
                -baseDepth/2 + topGap + keyboardDepth/2 // Position based on *new* topGap and calculated depth
            );
            keyboardGroup.add(keyboardBase);
            
            // Define key grid layout parameters
            const rows = 6;
            const cols = 15;
            const keyGap = 0.075; // Keep gap relatively small
            const keyHeight = 0.12; 

            // Calculate maximum key size to fill the available keyboard area (keyboardWidth x keyboardDepth) exactly
            const maxKeyWidth = (keyboardWidth - (cols - 1) * keyGap) / cols;
            const maxKeyDepth = (keyboardDepth - (rows - 1) * keyGap) / rows;
            // Use the smaller dimension to maintain square-like keys
            const keySize = Math.min(maxKeyWidth, maxKeyDepth); 

            // Calculate actual dimensions of the key grid based on the calculated keySize
            // This grid should now perfectly fit within keyboardWidth x keyboardDepth
            const actualKeyboardWidth = cols * keySize + (cols - 1) * keyGap;
            const actualKeyboardDepth = rows * keySize + (rows - 1) * keyGap;
            
            // Starting position (top-left corner of key grid) relative to keyboardBase center
            const keyGridStartX = -actualKeyboardWidth / 2 + keySize / 2;
            const keyGridStartZ = -actualKeyboardDepth / 2 + keySize / 2;
            
            // Special keys mapping using only integer widths summing to 'cols' (15)
            const specialKeys = {
                // Format: [row, startCol, width]
                // Row 0: 13 * 1 + 2 = 15
                backspace: [0, 13, 2],    // Cols 13-14

                // Row 1: 2 + 11 * 1 + 2 = 15
                tab: [1, 0, 2],         // Cols 0-1
                backslash: [1, 13, 2],  // Cols 13-14

                // Row 2: 2 + 11 * 1 + 2 = 15
                caps: [2, 0, 2],          // Cols 0-1
                enter_upper: [2, 13, 2], // Placeholder if Enter spans rows, adjust if needed

                // Row 3: 13 * 1 + 2 = 15 (Assuming simple Enter)
                enter: [3, 13, 2],        // Cols 13-14

                // Row 4: 2 + 11 * 1 + 2 = 15
                shift_left: [4, 0, 2],      // Cols 0-1
                shift_right: [4, 13, 2],     // Cols 13-14

                // Row 5: 2 + 1 + 2 + 6 + 2 + 2 = 15
                ctrl_left: [5, 0, 2],     // Cols 0-1
                fn: [5, 2, 1],            // Col 2
                alt_left: [5, 3, 2],      // Cols 3-4
                spacebar: [5, 5, 6],        // Cols 5-10
                alt_gr: [5, 11, 2],     // Cols 11-12
                ctrl_right: [5, 13, 2],    // Cols 13-14
            };
            
            // Function to check if a position is part of a special key
            // Add explicit return type annotation
            const isSpecialKeyPosition = (row: number, col: number): false | { key: string; startCol: number; width: number; } => {
                for (const [key, [keyRow, keyStartCol, keyWidth]] of Object.entries(specialKeys)) {
                    if (row === keyRow && col >= keyStartCol && col < keyStartCol + keyWidth) {
                        // Ensure the returned object matches the type annotation
                        return { key: key as string, startCol: keyStartCol as number, width: keyWidth as number };
                    }
                }
                return false;
            };
            
            // Create all keys in grid using the calculated keySize
            for (let row = 0; row < rows; row++) {
                for (let col = 0; col < cols; col++) {
                    // Check if this position is part of a special key
                    const specialKey = isSpecialKeyPosition(row, col);
                    
                    // If it's a subsequent cell of a multi-cell special key, skip it
                    // This check should now work correctly with the explicit type
                    if (specialKey && col > specialKey.startCol) continue;
                    
                    // Determine key width (special keys may be wider, based on calculated keySize)
                    // This check should now work correctly
                    const keyWidth = specialKey ? specialKey.width * keySize + (specialKey.width - 1) * keyGap : keySize;
                    
                    // Create key geometry based on the calculated key size
                    const keyGeometry = new THREE.BoxGeometry(keyWidth, keyHeight, keySize);
                    // keyGeometry.translate(0, keyHeight / 2, 0); // Keep origin at center for easier positioning
                    
                    // Create key material - slightly different shade for special keys
                    const keyMaterial = materials.keyCap.clone();
                    // This check should now work correctly
                    if (specialKey) {
                        // Adjust color for special keys
                        keyMaterial.color.multiplyScalar(1.1); // Make special keys slightly brighter
                    }
                    
                    const key = new THREE.Mesh(keyGeometry, keyMaterial);
                    
                    // Position the key in grid using calculated keySize and keyGap
                    // This check should now work correctly
                    const xOffset = specialKey ? 
                        (specialKey.width - 1) * (keySize + keyGap) / 2 : 0;
                    
                    // Calculate position relative to keyboardBase center
                    const relativeX = keyGridStartX + col * (keySize + keyGap) + xOffset;
                    const relativeZ = keyGridStartZ + row * (keySize + keyGap);

                    // Position key relative to baseGroup origin, sitting on top of keyboardBase
                    key.position.set(
                        keyboardBase.position.x + relativeX, 
                        baseSurfaceY + keyboardBaseThickness + keyHeight/2, // Sits on keyboard base
                        keyboardBase.position.z + relativeZ
                    );
                    keyboardGroup.add(key);
                }
            }
            
            // Position touchpad within the adjusted bottomGap area
            const touchpadThickness = 0.05;
            const touchpadWidth = baseWidth * 0.4; 
            // Adjust touchpad height to fit nicely within the *new* larger bottom gap
            const touchpadHeight = bottomGap * 0.7; // Keep it relative to the gap size
            
            // Calculate touchpad Z position: Center it vertically within the *new* bottom gap space
            const touchpadCenterZ = keyboardBase.position.z + keyboardDepth / 2 + bottomGap / 2; // Uses new keyboardBase.position and bottomGap
            
            const touchpadGeometry = new THREE.BoxGeometry(touchpadWidth, touchpadThickness, touchpadHeight);
            const touchpad = new THREE.Mesh(touchpadGeometry, materials.touchpad);
            
            // Position touchpad centered horizontally with keyboardBase, and vertically within the *new* bottom gap
            touchpad.position.set(
                keyboardBase.position.x, 
                baseSurfaceY + keyboardBaseThickness + touchpadThickness/2, 
                touchpadCenterZ // Uses recalculated Z position
            );
            keyboardGroup.add(touchpad);
            
            // Add the keyboard group to the baseGroup
            baseGroup.add(keyboardGroup);

            // Ensure no unexpected rotations
            baseGroup.rotation.x = 0; 
            keyboardGroup.rotation.x = 1.55; // Keep this rotation

            return laptop; // Return the main laptop group
        };

        // Define laptop dimensions at a higher scope level
        const baseHeight = 1.5; // Same value as defined in createLaptop
        
        // Create the laptop and add it to the scene
        const laptop = createLaptop(); 
        scene.add(laptop);
        laptopRef.current = laptop; 

        // Adjust camera target
        controls.target.set(0, baseHeight / 2, 0); // Target the middle of the base height

        // Wireframe state
        let wireframeEnabled = false;

        // Toggle wireframe function
        const toggleWireframe = () => {
            wireframeEnabled = !wireframeEnabled;
            scene.traverse((object) => {
                if (object instanceof THREE.Mesh) {
                    const mat = object.material as THREE.MeshStandardMaterial;
                    // Don't make text/UI elements wireframe if needed
                    if (mat.name !== 'text_element' /* && other exceptions */) {
                         mat.wireframe = wireframeEnabled;
                    }
                }
            });
        };

        // Event listener for keyboard
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'w') {
                toggleWireframe();
            }
            else if (event.key === 'd') {
                toggleDarkMode();
            }
        };
        window.addEventListener('keydown', handleKeyDown);

        // Animation loop - subtle rotation or display open/close
        const animate = () => {
            requestAnimationFrame(animate);
            controls.update();
            renderer.render(scene, camera);
        };

        animate();

        // Handle window resize
        const handleResize = () => {
            const width = window.innerWidth;
            const height = window.innerHeight;
            camera.aspect = width / height;
            camera.updateProjectionMatrix();
            renderer.setSize(width, height);
        };
        window.addEventListener('resize', handleResize);

        // Cleanup function
        return () => {
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('keydown', handleKeyDown);
            // Ensure renderer.domElement exists before trying to remove
            if (mountRef.current && renderer.domElement.parentNode === mountRef.current) {
                mountRef.current.removeChild(renderer.domElement);
            }
            // Dispose geometries and materials if needed for complex scenes
            // scene.traverse(...) 
        };
    }, []); // Keep dependency array empty for initial setup

    // Apply dark mode when state changes
    useEffect(() => {
        updateMaterials(isDarkMode);
        // Update lights based on dark mode (same as tablet)
        if (sceneRef.current) {
            sceneRef.current.background = new THREE.Color(isDarkMode ? 0x081208 : 0xf0f4f0);
            sceneRef.current.traverse((object) => {
                if (object instanceof THREE.AmbientLight) {
                    object.color.set(isDarkMode ? 0x445544 : 0x909090); object.intensity = isDarkMode ? 0.4 : 0.8;
                } else if (object instanceof THREE.DirectionalLight) {
                    if (object.position.x > 0) { // Main light
                        object.color.set(isDarkMode ? 0xaaffcc : 0xffffff); object.intensity = isDarkMode ? 0.7 : 0.9;
                    } else { // Backlight
                        object.color.set(isDarkMode ? 0x44aa66 : 0xddffee); object.intensity = isDarkMode ? 0.3 : 0.3;
                    }
                }
                // Add screen light update if used
            });
        }
    }, [isDarkMode]);

    return (
        // Adjusted background color for laptop dark mode - Green Theme
        <div style={{ background: isDarkMode ? '#081208' : '#f0f4f0', height: '100vh', width: '100vw' }}>
            <div ref={mountRef} style={{ width: '100%', height: '100vh' }} />
            {/* Updated info box text and style - Green Theme */}
            <div className="info" style={{
                position: 'absolute', top: '10px', left: '10px', padding: '10px',
                background: isDarkMode ? 'rgba(20,40,20,0.7)' : 'rgba(255,255,255,0.7)',
                color: isDarkMode ? '#aaffaa' : '#333', borderRadius: '4px',
                boxShadow: isDarkMode ? '0 0 8px #00aa66' : '0 0 5px rgba(0,0,0,0.2)',
            }}>
                <p>Modern Laptop with IoT Control Dashboard</p> {/* Updated text */}
                <p>Press W to toggle wireframe mode</p>
                <p>Press D to toggle dark mode</p>
                <p>Use mouse to orbit, zoom and pan</p>
                <button
                    onClick={toggleDarkMode}
                    style={{
                        background: isDarkMode ? '#009966' : '#22aa88', color: 'white', border: 'none',
                        padding: '5px 10px', borderRadius: '4px', cursor: 'pointer', marginTop: '5px',
                        boxShadow: isDarkMode ? '0 0 5px #00aa66' : 'none',
                    }}
                >
                    {isDarkMode ? 'Light Mode' : 'Dark Mode'}
                </button>
            </div>
        </div>
    );
}

