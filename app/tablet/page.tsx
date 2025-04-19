"use client";
import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

// Renamed component
export default function Tablet() {
    const mountRef = useRef<HTMLDivElement>(null);
    const [isDarkMode, setIsDarkMode] = useState(false);
    const sceneRef = useRef<THREE.Scene | null>(null);
    // Renamed ref
    const tabletRef = useRef<THREE.Group | null>(null);

    // Function to toggle dark mode
    const toggleDarkMode = () => {
        setIsDarkMode(prev => !prev);
    }

    // Function to update materials based on dark mode
    const updateMaterials = (isDark: boolean) => {
        // Renamed ref check
        if (!sceneRef.current || !tabletRef.current) return;

        // Update scene background
        sceneRef.current.background = new THREE.Color(isDark ? 0x080812 : 0xf0f0f0); // Slightly different dark bg

        // Update tablet materials (using tabletRef)
        tabletRef.current.traverse((object) => {
            if (object instanceof THREE.Mesh) {
                const material = object.material as THREE.MeshStandardMaterial;

                // Identify parts by their name and update accordingly
                // Example: Slightly different body color for tablet
                if (material.name === 'tablet_body') {
                    material.color.set(isDark ? 0x50505e : 0xe0e0ff); // Different body color
                    material.emissive.set(isDark ? 0x252530 : 0x000000);
                    material.emissiveIntensity = isDark ? 0.30 : 0;
                }
                else if (material.name === 'screen') {
                    material.color.set(isDark ? 0x00aaff : 0x0088cc); // Slightly different screen
                    material.emissive.set(isDark ? 0x0088aa : 0x0066aa);
                    material.emissiveIntensity = isDark ? 0.5 : 0.2;
                }
                else if (material.name === 'ui_element') {
                    material.color.set(isDark ? 0xaaffff : 0x00aabb); // Different UI element
                    material.emissive.set(isDark ? 0x66cccc : 0x000000);
                    material.emissiveIntensity = isDark ? 0.7 : 0.0;
                }
                else if (material.name === 'accent') {
                    material.color.set(isDark ? 0x66aaff : 0x0044aa); // Different accent
                    material.emissive.set(isDark ? 0x4488ff : 0x000000);
                    material.emissiveIntensity = isDark ? 0.6 : 0.0;
                }
                else if (material.name === 'camera') {
                    material.color.set(isDark ? 0x333344 : 0x555566); // Different camera
                    material.emissive.set(isDark ? 0x111122 : 0x000000);
                    material.emissiveIntensity = isDark ? 0.3 : 0.0;
                }
                else if (material.name === 'camera_lens') {
                    material.color.set(isDark ? 0x444455 : 0x111111); // Different lens
                    material.emissive.set(isDark ? 0x222233 : 0x000000);
                    material.emissiveIntensity = isDark ? 0.1 : 0.0;
                }
                else if (material.name === 'port') {
                    material.color.set(isDark ? 0x444444 : 0x888888); // Different port
                }
                else if (material.name === 'buttons') {
                    material.color.set(isDark ? 0x50505e : 0xe0e0ff); // Match tablet body dark color
                    material.emissive.set(isDark ? 0x252530 : 0x000000); // Match tablet body emissive
                    material.emissiveIntensity = isDark ? 0.3 : 0.0;
                }
                // No notch for tablet example
                // else if (material.name === 'notch') { ... }
                else if (material.name === 'selfie_camera') {
                    material.color.set(isDark ? 0x111111 : 0x000000);
                    material.emissive.set(isDark ? 0x111111 : 0x000000);
                    material.emissiveIntensity = isDark ? 0.1 : 0.0;
                }
                else if (material.name === 'graph_element') {
                    material.color.set(isDark ? 0x88ddff : 0x00aacc); // Different graph
                    material.emissive.set(isDark ? 0x44bbdd : 0x0088aa);
                    material.emissiveIntensity = isDark ? 0.8 : 0.3;
                }
                else if (material.name === 'chart_element') {
                    material.color.set(isDark ? 0x66ccff : 0x0066bb); // Different chart
                    material.emissive.set(isDark ? 0x33aadd : 0x004499);
                    material.emissiveIntensity = isDark ? 0.8 : 0.3;
                }
                else if (material.name === 'text_element') {
                    material.color.set(isDark ? 0xeeeeff : 0xffffff); // Different text
                    material.emissive.set(isDark ? 0xccccff : 0xf0f0f0);
                    material.emissiveIntensity = isDark ? 0.6 : 0.2;
                }
                else if (material.name === 'camera_ring') {
                    material.color.set(isDark ? 0x66aaff : 0xbbbbbb); // Different ring color
                    material.emissive.set(isDark ? 0x4488ff : 0x666666); // Different glow color
                    material.emissiveIntensity = isDark ? 0.8 : 0.2;
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

        // Scene setup
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(isDarkMode ? 0x080812 : 0xf0f0f0); // Adjusted dark bg
        sceneRef.current = scene;

        // Camera setup - Adjusted position and FoV for tablet
        const camera = new THREE.PerspectiveCamera(
            50, // Slightly narrower FoV might be better for larger object
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        camera.position.set(0, 5, 25); // Further back and slightly higher

        // Renderer setup
        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        mountRef.current.appendChild(renderer.domElement);

        // Controls - Adjusted zoom limits
        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;
        controls.minDistance = 10; // Increased min distance
        controls.maxDistance = 40; // Increased max distance

        // Lighting - Adjusted intensity for dark mode
        const ambientLight = new THREE.AmbientLight(
            isDarkMode ? 0x444455 : 0x909090,
            isDarkMode ? 0.4 : 0.8 // Slightly lower dark ambient
        );
        scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(
            isDarkMode ? 0xaaccff : 0xffffff, // Cooler dark light
            isDarkMode ? 0.7 : 0.9 // Slightly lower dark directional
        );
        directionalLight.position.set(5, 10, 7);
        directionalLight.castShadow = true;

        // Optimize shadow map settings
        directionalLight.shadow.mapSize.width = 1024;
        directionalLight.shadow.mapSize.height = 1024;
        directionalLight.shadow.camera.near = 0.5;
        directionalLight.shadow.camera.far = 50;
        scene.add(directionalLight);

        // Add a backlight for more dimension
        const backLight = new THREE.DirectionalLight(
            isDarkMode ? 0x4466aa : 0xddeeff, // Cooler dark backlight
            isDarkMode ? 0.3 : 0.3
        );
        backLight.position.set(-3, 5, -5);
        scene.add(backLight);

        // Add a spotlight for the screen to make it pop
        const screenLight = new THREE.SpotLight(
            isDarkMode ? 0x88ccff : 0xffffff, // Cooler dark spotlight
            isDarkMode ? 0.6 : 0.4 // Slightly lower dark spotlight
        );
        screenLight.position.set(0, 0, 30); // Further away for larger screen
        screenLight.angle = 0.4; // Wider angle
        screenLight.penumbra = 1;
        screenLight.decay = 2;
        screenLight.distance = 50; // Increased distance
        scene.add(screenLight);

        // Materials with enhanced properties - Adjusted for Tablet
        const createMaterials = (isDark: boolean) => {
            return {
                // Renamed material key and adjusted properties
                tabletBody: new THREE.MeshStandardMaterial({
                    name: 'tablet_body', // Renamed material name
                    color: isDark ? 0x50505e : 0xe0e0ff, // Different body color
                    metalness: 0.7, // Slightly less metallic
                    roughness: 0.3, // Slightly rougher
                    emissive: isDark ? 0x252530 : 0x000000,
                    emissiveIntensity: isDark ? 0.30 : 0,
                    side: THREE.DoubleSide
                }),

                screen: new THREE.MeshStandardMaterial({
                    name: 'screen',
                    color: isDark ? 0x00aaff : 0x0088cc, // Slightly different screen
                    metalness: 0.1,
                    roughness: 0.05,
                    emissive: isDark ? 0x0088aa : 0x0066aa,
                    emissiveIntensity: isDark ? 0.5 : 0.2,
                    side: THREE.FrontSide
                }),

                uiElement: new THREE.MeshStandardMaterial({
                    name: 'ui_element',
                    color: isDark ? 0xaaffff : 0x00aabb, // Different UI element
                    metalness: 0.1,
                    roughness: 0.1,
                    emissive: isDark ? 0x66cccc : 0x000000,
                    emissiveIntensity: isDark ? 0.7 : 0.0
                }),

                accent: new THREE.MeshStandardMaterial({
                    name: 'accent',
                    color: isDark ? 0x66aaff : 0x0044aa, // Different accent
                    metalness: 0.7,
                    roughness: 0.3,
                    emissive: isDark ? 0x4488ff : 0x000000,
                    emissiveIntensity: isDark ? 0.6 : 0.0
                }),

                camera: new THREE.MeshStandardMaterial({
                    name: 'camera',
                    color: isDark ? 0x333344 : 0x555566, // Different camera
                    metalness: 0.9,
                    roughness: 0.4,
                    emissive: isDark ? 0x111122 : 0x000000,
                    emissiveIntensity: isDark ? 0.3 : 0.0
                }),

                cameraLens: new THREE.MeshStandardMaterial({
                    name: 'camera_lens',
                    color: isDark ? 0x444455 : 0x111111, // Different lens
                    metalness: 0.1,
                    roughness: 0.1,
                    emissive: isDark ? 0x222233 : 0x000000,
                    emissiveIntensity: isDark ? 0.1 : 0.0
                }),

                port: new THREE.MeshStandardMaterial({
                    name: 'port',
                    color: isDark ? 0x444444 : 0x888888, // Different port
                    metalness: 0.8,
                    roughness: 0.5
                }),

                buttons: new THREE.MeshStandardMaterial({
                    name: 'buttons',
                    color: isDark ? 0x50505e : 0xe0e0ff, // Match tablet body dark color
                    metalness: 0.9,
                    roughness: 0.3,
                    emissive: isDark ? 0x252530 : 0x000000, // Match tablet body emissive
                    emissiveIntensity: isDark ? 0.3 : 0.0
                }),

                // No notch material needed for this tablet example

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
                    color: isDark ? 0x88ddff : 0x00aacc, // Different graph
                    metalness: 0.1,
                    roughness: 0.2,
                    emissive: isDark ? 0x44bbdd : 0x0088aa,
                    emissiveIntensity: isDark ? 0.8 : 0.3,
                    transparent: true,
                    opacity: 0.9
                }),

                chartElement: new THREE.MeshStandardMaterial({
                    name: 'chart_element',
                    color: isDark ? 0x66ccff : 0x0066bb, // Different chart
                    metalness: 0.1,
                    roughness: 0.2,
                    emissive: isDark ? 0x33aadd : 0x004499,
                    emissiveIntensity: isDark ? 0.8 : 0.3,
                    transparent: true,
                    opacity: 0.9
                }),

                textElement: new THREE.MeshStandardMaterial({
                    name: 'text_element',
                    color: isDark ? 0xeeeeff : 0xffffff, // Different text
                    metalness: 0.1,
                    roughness: 0.2,
                    emissive: isDark ? 0xccccff : 0xf0f0f0,
                    emissiveIntensity: isDark ? 0.6 : 0.2
                }),

                cameraRing: new THREE.MeshStandardMaterial({
                    name: 'camera_ring',
                    color: isDark ? 0x66aaff : 0xbbbbbb, // Different ring color
                    metalness: 0.6,
                    roughness: 0.3,
                    emissive: isDark ? 0x4488ff : 0x666666, // Different glow color
                    emissiveIntensity: isDark ? 0.8 : 0.2,
                    side: THREE.DoubleSide
                })
            };
        };

        const materials = createMaterials(isDarkMode);

        // Create Tablet - Renamed function
        const createTablet = () => {
            const tablet = new THREE.Group(); // Renamed group

            // Tablet dimensions in cm - Adjusted
            const height = 25; // Larger height
            const width = 18; // Larger width
            const thickness = 0.7; // Slightly thinner
            const cornerRadius = 1.2; // Larger corner radius
            const screenCornerRadius = 1.0; // Larger screen radius
            const widgetCornerRadius = 0.3; // Slightly larger widget radius
            const bevelSize = 0.1; // Keep bevel size consistent

            // Main tablet body with rounded corners
            const tabletShape = new THREE.Shape(); // Renamed shape variable
            // Define shape centered around (0,0) using new dimensions
            tabletShape.moveTo(-width / 2 + cornerRadius, -height / 2);
            tabletShape.lineTo(width / 2 - cornerRadius, -height / 2);
            tabletShape.quadraticCurveTo(width / 2, -height / 2, width / 2, -height / 2 + cornerRadius);
            tabletShape.lineTo(width / 2, height / 2 - cornerRadius);
            tabletShape.quadraticCurveTo(width / 2, height / 2, width / 2 - cornerRadius, height / 2);
            tabletShape.lineTo(-width / 2 + cornerRadius, height / 2);
            tabletShape.quadraticCurveTo(-width / 2, height / 2, -width / 2, height / 2 - cornerRadius);
            tabletShape.lineTo(-width / 2, -height / 2 + cornerRadius);
            tabletShape.quadraticCurveTo(-width / 2, -height / 2, -width / 2 + cornerRadius, -height / 2);

            // Extrude settings (keeping bevel disabled for now)
            const extrudeSettings = {
                steps: 1,
                depth: thickness,
                bevelEnabled: false
            };

            const tabletGeometry = new THREE.ExtrudeGeometry(tabletShape, extrudeSettings);
            tabletGeometry.center();
            // Use renamed material key
            const tabletBody = new THREE.Mesh(tabletGeometry, materials.tabletBody);
            tabletBody.castShadow = true;
            tabletBody.receiveShadow = true;
            tabletBody.position.set(0, 0, 0);
            tablet.add(tabletBody); // Add to renamed group

            // --- Screen and UI Layering ---
            // Adjusted screen dimensions based on tablet size
            const screenHeight = height - 1.0; // Larger bezels typical for tablets
            const screenWidth = width - 1.0;
            const screenSurfaceZ = thickness / 2 + 0.01;
            const dashboardBgZ = screenSurfaceZ + 0.001;
            const widgetZ = dashboardBgZ + 0.002;
            const widgetContentZ = widgetZ + 0.001;
            const frontCameraZ = dashboardBgZ + 0.005; // Keep camera slightly above dashboard

            // --- IoT Dashboard Design ---

            // Helper function to create rounded rectangle shapes (no changes needed)
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

            // Dashboard Background - Adjusted dimensions
            const dashboardWidth = screenWidth - 0.4; // Slightly larger inset
            const dashboardHeight = screenHeight - 0.4;
            const dashboardShape = createRoundedRectShape(dashboardWidth, dashboardHeight, screenCornerRadius);

            // Create a hole for the punch-hole camera (optional, could be bezel camera)
            const punchHoleRadius = 0.3; // Slightly larger radius
            const punchHoleX = 0; // Centered horizontally
            // Position near the top, adjusted for larger height
            const punchHoleY = dashboardHeight / 2 - 0.6;

            const punchHolePath = new THREE.Path();
            punchHolePath.absarc(punchHoleX, punchHoleY, punchHoleRadius, 0, Math.PI * 2, false);
            dashboardShape.holes.push(punchHolePath); // Add the punch hole

            // Adjusted dashboard material colors
            const dashboardMaterial = new THREE.MeshStandardMaterial({
                color: isDarkMode ? 0x1a1a24 : 0xe8e8f4, // Cooler dark, lighter light
                roughness: 0.6, // Slightly rougher
                metalness: 0.02, // Less metallic
                side: THREE.FrontSide,
                transparent: true,
                opacity: 0.97,
                emissive: isDarkMode ? 0x020205 : 0x000000,
                emissiveIntensity: isDarkMode ? 0.05 : 0,
            });
            const dashboardGeometry = new THREE.ShapeGeometry(dashboardShape);
            const dashboardBg = new THREE.Mesh(dashboardGeometry, dashboardMaterial);
            dashboardBg.position.z = dashboardBgZ;
            tablet.add(dashboardBg); // Add to tablet group

            // Add Dashboard Border (Optional, subtle) - Adjusted colors
            const borderPoints = dashboardShape.getPoints(50);
            const borderGeometry = new THREE.BufferGeometry().setFromPoints(borderPoints);
            const borderMaterial = new THREE.LineBasicMaterial({
                color: isDarkMode ? 0x444466 : 0xaaaaaa, // Cooler dark border
                linewidth: 1,
                transparent: true,
                opacity: 0.5
            });
            const dashboardBorder = new THREE.LineLoop(borderGeometry, borderMaterial);
            dashboardBorder.position.z = dashboardBgZ + 0.0001;
            tablet.add(dashboardBorder); // Add to tablet group

            // --- Front Camera ---
            const selfieCameraGeometry = new THREE.CircleGeometry(punchHoleRadius * 0.9, 32);
            const selfieCamera = new THREE.Mesh(selfieCameraGeometry, materials.selfieCamera);
            selfieCamera.position.set(punchHoleX, punchHoleY, frontCameraZ);
            tablet.add(selfieCamera); // Add to tablet group

            // Create Widget function (mostly unchanged logic, just uses tablet materials)
            const createWidget = (x: number, y: number, w: number, h: number, index: number) => {
                const widgetGroup = new THREE.Group();
                widgetGroup.position.set(x, y, widgetZ);

                // Widget Background - Adjusted colors
                const widgetShape = createRoundedRectShape(w, h, widgetCornerRadius);
                const widgetGeometry = new THREE.ShapeGeometry(widgetShape);
                const widgetMaterial = new THREE.MeshStandardMaterial({
                    color: isDarkMode ? 0x303045 : 0xfcfcff, // Cooler dark, lighter light
                    roughness: 0.4, // Smoother
                    metalness: 0.0,
                    side: THREE.FrontSide,
                    transparent: true,
                    opacity: 0.88, // Slightly more transparent
                    emissive: isDarkMode ? 0x14141f : 0x000000,
                    emissiveIntensity: isDarkMode ? 0.15 : 0,
                });
                const widgetBg = new THREE.Mesh(widgetGeometry, widgetMaterial);
                widgetBg.castShadow = false;
                widgetBg.receiveShadow = true;
                widgetGroup.add(widgetBg);

                // Widget Title
                const titles = ["Temperature", "Humidity", "Light Level", "Energy Usage", "Device Status", "Network Traffic", "Air Quality", "System Load"]; // Added more titles
                const titleText = titles[index % titles.length] || `Sensor ${index + 1}`;
                const titleHeight = 0.3; // Slightly larger title text area
                const titleWidth = w * 0.75; // Wider title area
                const titleGeometry = new THREE.PlaneGeometry(titleWidth, titleHeight);
                const titleMaterial = materials.textElement.clone();
                titleMaterial.color.set(isDarkMode ? 0xddddff : 0x333333); // Adjusted colors
                titleMaterial.emissive.set(isDarkMode ? 0xaaaacc : 0x000000);
                titleMaterial.emissiveIntensity = isDarkMode ? 0.3 : 0;
                titleMaterial.side = THREE.FrontSide;
                const titleMesh = new THREE.Mesh(titleGeometry, titleMaterial);
                titleMesh.position.set(0, h / 2 - titleHeight / 2 - 0.2, widgetContentZ - widgetZ); // Adjusted Y position
                widgetGroup.add(titleMesh);

                // --- Widget Data Area - Generate different content based on index ---
                const dataAreaX = 0;
                const dataAreaY = -0.15; // Adjusted Y position
                const dataAreaWidth = w * 0.85; // Wider data area
                const dataAreaHeight = h * 0.5; // Adjusted height
                const contentZ = widgetContentZ - widgetZ + 0.001;

                const randomSeed = (index + 1) * 1234;
                const seededRandom = (offset = 0) => {
                    let x = Math.sin(randomSeed + offset) * 10000;
                    return x - Math.floor(x);
                };

                const widgetType = index % titles.length;

                // --- Switch statement for widget types (same logic, uses updated materials) ---
                // (Code for switch statement is identical to smartphone, just uses tablet materials implicitly)
                // ... (Keep the switch statement code here) ...
                switch (widgetType) {
                    case 0: // Temperature - Line Graph Simulation
                        const points = [];
                        const segments = 10;
                        for (let i = 0; i <= segments; i++) {
                            const px = -dataAreaWidth / 2 + (i / segments) * dataAreaWidth;
                            const py = (seededRandom(i) - 0.5) * dataAreaHeight * 0.8; // Random Y variation
                            points.push(new THREE.Vector3(px, py, 0));
                        }
                        const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
                        const lineMaterial = new THREE.LineBasicMaterial({ color: isDarkMode ? 0xffaaaa : 0xcc0000, linewidth: 2 }); // Adjusted color
                        const line = new THREE.Line(lineGeometry, lineMaterial);
                        line.position.set(dataAreaX, dataAreaY, contentZ);
                        widgetGroup.add(line);
                        break;

                    case 1: // Humidity - Gauge Simulation (Arc)
                        const gaugeRadius = dataAreaHeight * 0.6;
                        const arcPercentage = seededRandom();
                        const arcGeometry = new THREE.RingGeometry(gaugeRadius * 0.8, gaugeRadius, 32, 1, 0, Math.PI * arcPercentage);
                        const arcMaterial = materials.chartElement.clone(); // Uses tablet chartElement
                        arcMaterial.side = THREE.DoubleSide;
                        const arcMesh = new THREE.Mesh(arcGeometry, arcMaterial);
                        arcMesh.position.set(dataAreaX, dataAreaY - gaugeRadius * 0.2, contentZ);
                        arcMesh.rotation.z = -Math.PI / 2;
                        widgetGroup.add(arcMesh);
                        // Add background arc
                        const bgArcGeometry = new THREE.RingGeometry(gaugeRadius * 0.8, gaugeRadius, 32, 1, 0, Math.PI);
                        const bgArcMaterial = new THREE.MeshStandardMaterial({ color: isDarkMode ? 0x333355 : 0xcccccc, side: THREE.DoubleSide, opacity: 0.3, transparent: true }); // Adjusted color
                        const bgArcMesh = new THREE.Mesh(bgArcGeometry, bgArcMaterial);
                        bgArcMesh.position.copy(arcMesh.position);
                        bgArcMesh.rotation.copy(arcMesh.rotation);
                        widgetGroup.add(bgArcMesh);
                        break;

                    case 2: // Light Level - Radial Indicator
                        const indicatorRadius = dataAreaHeight * 0.5;
                        const lightLevel = seededRandom();
                        const indicatorGeometry = new THREE.CircleGeometry(indicatorRadius * lightLevel, 32);
                        const indicatorMaterial = new THREE.MeshBasicMaterial({ color: isDarkMode ? 0xffffcc : 0xffcc00 }); // Adjusted color
                        const indicatorMesh = new THREE.Mesh(indicatorGeometry, indicatorMaterial);
                        indicatorMesh.position.set(dataAreaX, dataAreaY, contentZ);
                        widgetGroup.add(indicatorMesh);
                        // Add outer ring
                        const ringGeometry = new THREE.RingGeometry(indicatorRadius * 0.95, indicatorRadius, 32);
                        const ringMaterial = new THREE.MeshBasicMaterial({ color: isDarkMode ? 0xaaaaaa : 0x888888, side: THREE.DoubleSide }); // Adjusted color
                        const ringMesh = new THREE.Mesh(ringGeometry, ringMaterial);
                        ringMesh.position.copy(indicatorMesh.position);
                        widgetGroup.add(ringMesh);
                        break;

                    case 3: // Energy Usage - Stacked Bars Simulation
                        const barCountEnergy = 3;
                        const barWidthEnergy = dataAreaWidth / (barCountEnergy * 1.8);
                        const barSpacingEnergy = barWidthEnergy * 0.8;
                        const maxTotalHeight = dataAreaHeight * 0.9;
                        for (let i = 0; i < barCountEnergy; i++) {
                            const height1 = seededRandom(i) * maxTotalHeight * 0.6;
                            const height2 = seededRandom(i + 10) * maxTotalHeight * 0.4;
                            const geom1 = new THREE.BoxGeometry(barWidthEnergy, height1, 0.01);
                            const mat1 = materials.graphElement.clone(); // Uses tablet graphElement
                            const mesh1 = new THREE.Mesh(geom1, mat1);
                            const barX = -dataAreaWidth / 2 + barWidthEnergy / 2 + i * (barWidthEnergy + barSpacingEnergy);
                            mesh1.position.set(barX, dataAreaY - dataAreaHeight / 2 + height1 / 2, contentZ);
                            widgetGroup.add(mesh1);

                            const geom2 = new THREE.BoxGeometry(barWidthEnergy, height2, 0.01);
                            const mat2 = materials.chartElement.clone(); // Uses tablet chartElement
                            const mesh2 = new THREE.Mesh(geom2, mat2);
                            mesh2.position.set(barX, mesh1.position.y + height1 / 2 + height2 / 2, contentZ);
                            widgetGroup.add(mesh2);
                        }
                        break;

                    case 4: // Device Status - Text/Indicator Simulation
                        const statusCount = 3;
                        const statusHeight = dataAreaHeight / statusCount * 0.6;
                        const statusWidth = dataAreaWidth * 0.8;
                        const statusSpacing = (dataAreaHeight - (statusHeight * statusCount)) / (statusCount + 1);
                        const statuses = ["Online", "Scanning", "Idle"];
                        const statusColors = [0x88ff88, 0xffff88, 0xaaaaff]; // Adjusted colors

                        for (let i = 0; i < statusCount; i++) {
                            const planeGeom = new THREE.PlaneGeometry(statusWidth, statusHeight);
                            const planeMat = materials.textElement.clone(); // Uses tablet textElement
                            planeMat.color.set(isDarkMode ? 0xbbbbcc : 0x555555); // Adjusted color
                            const planeMesh = new THREE.Mesh(planeGeom, planeMat);
                            const planeY = dataAreaY + dataAreaHeight / 2 - statusSpacing * (i + 1) - statusHeight * (i + 0.5);
                            planeMesh.position.set(dataAreaX, planeY, contentZ);
                            widgetGroup.add(planeMesh);

                            // Add status indicator circle
                            const indicatorGeom = new THREE.CircleGeometry(statusHeight * 0.4, 16);
                            const indicatorMat = new THREE.MeshBasicMaterial({ color: statusColors[i % statusColors.length] });
                            const indicatorMesh = new THREE.Mesh(indicatorGeom, indicatorMat);
                            indicatorMesh.position.set(dataAreaX - statusWidth / 2 + statusHeight * 0.5, planeY, contentZ + 0.001);
                            widgetGroup.add(indicatorMesh);
                        }
                        break;

                    case 5: // Network Traffic - Dual Line Graph Simulation
                        const pointsUp: THREE.Vector3[] = [];
                        const pointsDown: THREE.Vector3[] = [];
                        const segmentsNet = 10;
                        for (let i = 0; i <= segmentsNet; i++) {
                            const px = -dataAreaWidth / 2 + (i / segmentsNet) * dataAreaWidth;
                            const pyUp = (seededRandom(i) - 0.5) * dataAreaHeight * 0.4 + dataAreaHeight * 0.25;
                            const pyDown = (seededRandom(i + 50) - 0.5) * dataAreaHeight * 0.4 - dataAreaHeight * 0.25;
                            pointsUp.push(new THREE.Vector3(px, pyUp, 0));
                            pointsDown.push(new THREE.Vector3(px, pyDown, 0));
                        }
                        const lineGeomUp = new THREE.BufferGeometry().setFromPoints(pointsUp);
                        const lineMatUp = new THREE.LineBasicMaterial({ color: isDarkMode ? 0x88ff88 : 0x00aa00, linewidth: 2 }); // Adjusted color
                        const lineUp = new THREE.Line(lineGeomUp, lineMatUp);
                        lineUp.position.set(dataAreaX, dataAreaY, contentZ);
                        widgetGroup.add(lineUp);

                        const lineGeomDown = new THREE.BufferGeometry().setFromPoints(pointsDown);
                        const lineMatDown = new THREE.LineBasicMaterial({ color: isDarkMode ? 0x88aaff : 0x0066cc, linewidth: 2 }); // Adjusted color
                        const lineDown = new THREE.Line(lineGeomDown, lineMatDown);
                        lineDown.position.set(dataAreaX, dataAreaY, contentZ);
                        widgetGroup.add(lineDown);
                        break;
                    // Add cases for new widget types if needed (Air Quality, System Load)
                    case 6: // Air Quality - Simple Bar
                        const airQualityValue = seededRandom();
                        const aqBarWidth = dataAreaWidth * 0.8;
                        const aqBarHeight = dataAreaHeight * 0.3;
                        const aqGeom = new THREE.BoxGeometry(aqBarWidth * airQualityValue, aqBarHeight, 0.01);
                        const aqMat = materials.graphElement.clone();
                        aqMat.color.set(isDarkMode ? 0xffcc66 : 0xcc8800); // Orange/Yellow tones
                        const aqMesh = new THREE.Mesh(aqGeom, aqMat);
                        aqMesh.position.set(dataAreaX - (aqBarWidth * (1-airQualityValue))/2, dataAreaY, contentZ); // Align left
                        widgetGroup.add(aqMesh);
                         // Add background bar
                        const bgAqGeom = new THREE.BoxGeometry(aqBarWidth, aqBarHeight, 0.01);
                        const bgAqMat = new THREE.MeshStandardMaterial({ color: isDarkMode ? 0x443322 : 0xddccaa, side: THREE.FrontSide, opacity: 0.3, transparent: true });
                        const bgAqMesh = new THREE.Mesh(bgAqGeom, bgAqMat);
                        bgAqMesh.position.set(dataAreaX, dataAreaY, contentZ - 0.0001); // Slightly behind
                        widgetGroup.add(bgAqMesh);
                        break;
                    case 7: // System Load - Multiple small bars
                        const loadBarCount = 5;
                        const loadBarWidth = dataAreaWidth / (loadBarCount * 1.5);
                        const loadBarSpacing = loadBarWidth * 0.5;
                        const maxLoadHeight = dataAreaHeight * 0.8;
                         for (let i = 0; i < loadBarCount; i++) {
                            const loadHeight = seededRandom(i) * maxLoadHeight;
                            const loadGeom = new THREE.BoxGeometry(loadBarWidth, loadHeight, 0.01);
                            const loadMat = materials.chartElement.clone();
                            loadMat.color.set(isDarkMode ? 0xcc88ff : 0x8844cc); // Purple tones
                            const loadMesh = new THREE.Mesh(loadGeom, loadMat);
                            const loadBarX = -dataAreaWidth / 2 + loadBarWidth / 2 + i * (loadBarWidth + loadBarSpacing);
                            loadMesh.position.set(loadBarX, dataAreaY - dataAreaHeight / 2 + loadHeight / 2, contentZ);
                            widgetGroup.add(loadMesh);
                        }
                        break;

                    default:
                        break;
                }


                // Widget Status/Icon Area - Adjusted size and colors
                const statusRadius = 0.2; // Larger status indicator
                const statusGeometry = new THREE.CircleGeometry(statusRadius, 16);
                const statusMaterial = materials.accent.clone(); // Use tablet accent
                const statusColorsCycle = [0xff8888, 0x88ff88, 0x8888ff, 0xffff88, 0xff88ff, 0x88ffff]; // Adjusted colors
                statusMaterial.color.set(statusColorsCycle[index % statusColorsCycle.length]);
                statusMaterial.emissive.set(statusColorsCycle[index % statusColorsCycle.length]);
                statusMaterial.emissiveIntensity = isDarkMode ? 0.4 : 0.1;
                statusMaterial.side = THREE.FrontSide;
                const statusMesh = new THREE.Mesh(statusGeometry, statusMaterial);
                // Adjusted position for larger widget/radius
                statusMesh.position.set(-w / 2 + statusRadius + 0.15, -h / 2 + statusRadius + 0.15, widgetContentZ - widgetZ);
                widgetGroup.add(statusMesh);

                return widgetGroup;
            };

            // --- Arrange Widgets --- Adjusted for tablet screen
            const padding = 0.4; // Increased padding
            const usableWidth = dashboardWidth - padding * 2;
            const usableHeight = dashboardHeight - padding * 2;
            // More columns and rows for tablet
            const widgetCols = 3;
            const widgetRows = 3;
            const widgetWidth = (usableWidth - padding * (widgetCols - 1)) / widgetCols;
            const widgetHeight = (usableHeight - padding * (widgetRows - 1)) / widgetRows;

            const startX = -usableWidth / 2 + widgetWidth / 2;
            // Adjust startY if punch hole is at the top
            const topOffsetForCamera = punchHoleRadius * 2 + 0.4; // Increased space below camera
            const adjustedUsableHeight = usableHeight - topOffsetForCamera;
            // Use adjusted height for widget calculation if camera offset is significant
            const adjustedWidgetHeight = (adjustedUsableHeight - padding * (widgetRows - 1)) / widgetRows;
            const startY = usableHeight / 2 - topOffsetForCamera - adjustedWidgetHeight / 2;


            let widgetIndex = 0;
            for (let r = 0; r < widgetRows; r++) {
                for (let c = 0; c < widgetCols; c++) {
                    const x = startX + c * (widgetWidth + padding);
                    const y = startY - r * (adjustedWidgetHeight + padding);
                    const widget = createWidget(x, y, widgetWidth, adjustedWidgetHeight, widgetIndex);
                    tablet.add(widget); // Add to tablet group
                    widgetIndex++;
                }
            }


            // --- Back Camera, Buttons, Ports ---
            const backSurfaceZ = -thickness / 2;
            const backElementOffset = 0.01;

            // Camera lenses - Adjusted positioning and ring material
            const addCameraLens = (x: number, y: number, size: number) => {
                const housingDepth = 0.1; // Slightly deeper housing
                const ringDepth = 0.02;
                const lensZOffset = 0.005;

                const housingZ = backSurfaceZ - housingDepth / 2 - backElementOffset;
                const ringZ = housingZ - housingDepth / 2 - ringDepth / 2 - 0.001;
                const lensZ = ringZ - ringDepth / 2 - lensZOffset;
                const innerLensZ = lensZ - lensZOffset;
                const highlightZ = innerLensZ - lensZOffset;

                // Housing
                const housingGeometry = new THREE.CylinderGeometry(size + 0.1, size + 0.1, housingDepth, 32);
                housingGeometry.rotateX(Math.PI / 2);
                const housing = new THREE.Mesh(housingGeometry, materials.camera); // Use tablet camera material
                housing.position.set(x, y, housingZ);
                housing.castShadow = true;
                tablet.add(housing); // Add to tablet group

                // Ring - Use the new glowing material
                const ringGeometry = new THREE.TorusGeometry(size + 0.035, ringDepth, 16, 48);
                const ring = new THREE.Mesh(ringGeometry, materials.cameraRing); // Use tablet cameraRing material
                ring.position.set(x, y, ringZ);
                tablet.add(ring); // Add to tablet group

                // Main lens
                const lensGeometry = new THREE.CircleGeometry(size, 32);
                const lensMaterial = new THREE.MeshStandardMaterial({
                    name: 'camera_lens_main',
                    color: 0x111111,
                    metalness: 0.1,
                    roughness: 0.05,
                    opacity: 0.9,
                    transparent: true,
                    side: THREE.DoubleSide
                 });
                const lens = new THREE.Mesh(lensGeometry, lensMaterial);
                lens.position.set(x, y, lensZ);
                tablet.add(lens); // Add to tablet group

                // Inner lens
                const innerLensGeometry = new THREE.CircleGeometry(size * 0.7, 32);
                const innerLens = new THREE.Mesh(innerLensGeometry, materials.cameraLens); // Use tablet cameraLens material
                innerLens.position.set(x, y, innerLensZ);
                tablet.add(innerLens); // Add to tablet group

                // Highlight
                const highlightGeometry = new THREE.CircleGeometry(size * 0.2, 16);
                const highlightMaterial = new THREE.MeshBasicMaterial({
                    color: 0xffffff,
                    transparent: true,
                    opacity: 0.5
                 });
                const highlight = new THREE.Mesh(highlightGeometry, highlightMaterial);
                highlight.position.set(x - size/4, y + size/4, highlightZ);
                tablet.add(highlight); // Add to tablet group
            };

            // Add camera lenses (Adjusted for larger tablet back) - Maybe just one or two lenses
            const cameraClusterX = width / 2 - 2.0; // Further from edge
            const cameraClusterY = height / 2 - 2.0;
            // Increased vertical separation: +0.7 and -0.7 instead of +0.5 and -0.5
            addCameraLens(cameraClusterX, cameraClusterY + 0.7, 0.55); // Main lens (moved up slightly)
            addCameraLens(cameraClusterX, cameraClusterY - 0.7, 0.45); // Secondary lens (moved down slightly)

            // Flash - Adjusted position
            const flashSize = 0.2; // Larger flash
            const flashDepth = 0.06;
            const flashDetailSize = flashSize * 0.6;
            const flashDetailOffset = 0.002;

            const flashBaseZ = backSurfaceZ - backElementOffset - 0.005;
            const flashZ = flashBaseZ - flashDepth / 2;
            const flashGeometry = new THREE.CylinderGeometry(flashSize, flashSize, flashDepth, 32);
            flashGeometry.rotateX(Math.PI / 2);
            const flashMaterial = new THREE.MeshStandardMaterial({
                color: 0xffffdd,
                emissive: 0xaaaa88,
                emissiveIntensity: 0.2,
                roughness: 0.3
             });
            const flash = new THREE.Mesh(flashGeometry, flashMaterial);
            flash.castShadow = false;
            flash.renderOrder = 1;
            // Position flash next to camera cluster
            const flashX = cameraClusterX + 1.0; // To the right of the cluster
            const flashY = cameraClusterY; // Centered vertically with cluster
            flash.position.set(flashX, flashY, flashZ);
            tablet.add(flash); // Add to tablet group

            // Add inner flash detail
            const flashDetailGeometry = new THREE.CircleGeometry(flashDetailSize, 32);
            const flashDetailMaterial = materials.cameraLens.clone(); // Use tablet cameraLens
            flashDetailMaterial.color.set(0xeeeecc);
            flashDetailMaterial.emissive.set(0xffffaa);
            flashDetailMaterial.emissiveIntensity = 0.5;
            const flashDetail = new THREE.Mesh(flashDetailGeometry, flashDetailMaterial);
            const flashDetailZ = flashZ - flashDepth / 2 - flashDetailOffset;
            flashDetail.position.set(flashX, flashY, flashDetailZ);
            flashDetail.renderOrder = 3;
            tablet.add(flashDetail); // Add to tablet group

            // Flash rim
            const flashRimGeometry = new THREE.RingGeometry(flashSize, flashSize + 0.04, 32); // Slightly thicker rim
            const flashRim = new THREE.Mesh(flashRimGeometry, materials.camera); // Use tablet camera material
            flashRim.renderOrder = 2;
            const flashRimZ = flashDetailZ - 0.0005;
            flashRim.position.set(flashX, flashY, flashRimZ);
            tablet.add(flashRim); // Add to tablet group

            // Add simple logo on the back - Adjusted size/position
            const logoWidth = 2.0; // Larger logo
            const logoHeight = 1.0;
            const logoGeometry = new THREE.PlaneGeometry(logoWidth, logoHeight);
            const logoMaterial = materials.accent.clone(); // Use tablet accent material
            logoMaterial.side = THREE.FrontSide;
            const logo = new THREE.Mesh(logoGeometry, logoMaterial);
            logo.position.set(0, -height / 5, backSurfaceZ - backElementOffset - 0.001); // Adjusted Y position
            tablet.add(logo); // Add to tablet group

            // --- Side Buttons Fix --- Adjusted positions/sizes
            const addButton = (y: number, h: number, isRight: boolean = true) => {
                const buttonDepth = 0.1;
                const buttonWidth = 0.3; // Slightly wider buttons
                const buttonGeometry = new THREE.BoxGeometry(buttonDepth, h, buttonWidth); // Use buttonWidth for Z dimension
                const button = new THREE.Mesh(buttonGeometry, materials.buttons); // Use tablet buttons material
                const x = isRight ? width / 2 : -width / 2;
                button.position.set(x + (isRight ? buttonDepth / 2 : -buttonDepth / 2), y, 0);
                button.castShadow = true;
                tablet.add(button); // Add to tablet group
            };

            addButton(height * 0.3, 1.5, true);   // Power button (top right side)
            addButton(height * 0.15, 1.2, true);  // Volume up (right side)
            addButton(height * 0.05, 1.2, true);  // Volume down (right side)

            // --- Bottom Ports Centering Fix --- Adjusted positions/sizes
            const addPort = (x: number, w: number) => {
                const portDepth = 0.1;
                const portHeight = 0.1; // Slightly taller port
                const portGeometry = new THREE.BoxGeometry(w, portHeight, portDepth);
                const port = new THREE.Mesh(portGeometry, materials.port); // Use tablet port material
                port.position.set(x, -height / 2, -portDepth / 2);
                tablet.add(port); // Add to tablet group
            };

            addPort(0, 1.0);     // Main USB-C port (centered)
            addPort(-width * 0.3, 0.6);  // Speaker grille (left)
            addPort(width * 0.3, 0.6);   // Speaker grille (right)

            return tablet; // Return the tablet group
        };

        // Create the tablet and add it to the scene
        const tablet = createTablet(); // Call renamed function
        scene.add(tablet);
        tabletRef.current = tablet; // Assign to renamed ref

        // Wireframe state
        let wireframeEnabled = false;

        // Toggle wireframe function
        const toggleWireframe = () => {
            wireframeEnabled = !wireframeEnabled;
            scene.traverse((object) => {
                if (object instanceof THREE.Mesh) {
                    const mat = object.material as THREE.MeshStandardMaterial;
                    mat.wireframe = wireframeEnabled;
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


        // Animation loop - make the tablet slowly rotate
        const animate = () => {
            requestAnimationFrame(animate);

            // Subtle rotation of the tablet
            if (tablet) { // Check tablet variable
                tablet.rotation.y += 0.0015; // Slower rotation for larger object
            }

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
            window.removeEventListener('keydown', handleKeyDown); // Use named handler for removal
            mountRef.current?.removeChild(renderer.domElement);
        };
    }, []); // Removed isDarkMode from dependency array initially, will add back if needed for initial setup

    // Apply dark mode when state changes
    useEffect(() => {
        updateMaterials(isDarkMode);
        // Update lights based on dark mode
        if (sceneRef.current) {
            sceneRef.current.background = new THREE.Color(isDarkMode ? 0x080812 : 0xf0f0f0);
            sceneRef.current.traverse((object) => {
                if (object instanceof THREE.AmbientLight) {
                    object.color.set(isDarkMode ? 0x444455 : 0x909090);
                    object.intensity = isDarkMode ? 0.4 : 0.8;
                } else if (object instanceof THREE.DirectionalLight) {
                    if (object.position.x > 0) { // Main directional light
                        object.color.set(isDarkMode ? 0xaaccff : 0xffffff);
                        object.intensity = isDarkMode ? 0.7 : 0.9;
                    } else { // Backlight
                        object.color.set(isDarkMode ? 0x4466aa : 0xddeeff);
                        object.intensity = isDarkMode ? 0.3 : 0.3;
                    }
                } else if (object instanceof THREE.SpotLight) { // Screen light
                    object.color.set(isDarkMode ? 0x88ccff : 0xffffff);
                    object.intensity = isDarkMode ? 0.6 : 0.4;
                }
            });
        }
    }, [isDarkMode]);

    return (
        // Adjusted background color for tablet dark mode
        <div style={{ background: isDarkMode ? '#080812' : '#f0f0f0', height: '100vh', width: '100vw' }}>
            <div ref={mountRef} style={{ width: '100%', height: '100vh' }} />
            {/* Updated info box text */}
            <div className="info" style={{
                position: 'absolute',
                top: '10px',
                left: '10px',
                padding: '10px',
                background: isDarkMode ? 'rgba(20,20,40,0.7)' : 'rgba(255,255,255,0.7)', // Adjusted dark bg
                color: isDarkMode ? '#aabbff' : '#333', // Adjusted dark text
                borderRadius: '4px',
                boxShadow: isDarkMode ? '0 0 8px #4488ff' : '0 0 5px rgba(0,0,0,0.2)', // Adjusted dark shadow
            }}>
                <p>Modern Tablet with IoT Control Dashboard</p> {/* Updated text */}
                <p>Press W to toggle wireframe mode</p>
                <p>Press D to toggle dark mode</p>
                <p>Use mouse to orbit, zoom and pan</p>
                <button
                    onClick={toggleDarkMode}
                    style={{
                        background: isDarkMode ? '#004499' : '#2266cc', // Adjusted dark button bg
                        color: 'white',
                        border: 'none',
                        padding: '5px 10px',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        marginTop: '5px',
                        boxShadow: isDarkMode ? '0 0 5px #4488ff' : 'none', // Adjusted dark button shadow
                    }}
                >
                    {isDarkMode ? 'Light Mode' : 'Dark Mode'}
                </button>
            </div>
        </div>
    );
}
