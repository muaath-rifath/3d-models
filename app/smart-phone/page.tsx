"use client";
import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

export default function SmartPhone() {
    const mountRef = useRef<HTMLDivElement>(null);
    const [isDarkMode, setIsDarkMode] = useState(false);
    const sceneRef = useRef<THREE.Scene | null>(null);
    const phoneRef = useRef<THREE.Group | null>(null);

    // Function to toggle dark mode
    const toggleDarkMode = () => {
        setIsDarkMode(prev => !prev);
    }

    // Function to update materials based on dark mode - Green Theme
    const updateMaterials = (isDark: boolean) => {
        if (!sceneRef.current || !phoneRef.current) return;

        // Update scene background - Green tint
        sceneRef.current.background = new THREE.Color(isDark ? 0x081208 : 0xf0f4f0);

        // Update phone materials - Green Theme
        phoneRef.current.traverse((object) => {
            if (object instanceof THREE.Mesh) {
                const material = object.material as THREE.MeshStandardMaterial;

                // Identify parts by their name and update accordingly - Green Theme
                if (material.name === 'phone_body') {
                    material.color.set(isDark ? 0x505e50 : 0xe0ffe0); // Adapted green body
                    material.emissive.set(isDark ? 0x253025 : 0x000000);
                    material.emissiveIntensity = isDark ? 0.30 : 0;
                }
                else if (material.name === 'screen') {
                    material.color.set(isDark ? 0x00ffbb : 0x00aa99); // Adapted green screen
                    material.emissive.set(isDark ? 0x00aa88 : 0x008866);
                    material.emissiveIntensity = isDark ? 5 : 0.2;
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
                else if (material.name === 'camera') {
                    material.color.set(isDark ? 0x334433 : 0x556655); // Greenish tint camera
                    material.emissive.set(isDark ? 0x112211 : 0x000000);
                    material.emissiveIntensity = isDark ? 0.3 : 0.0;
                }
                else if (material.name === 'camera_lens' || material.name === 'camera_lens_main') { // Include main lens
                    material.color.set(isDark ? 0x445544 : 0x111111); // Greenish tint lens
                    material.emissive.set(isDark ? 0x223322 : 0x000000);
                    material.emissiveIntensity = isDark ? 0.1 : 0.0;
                }
                else if (material.name === 'port') {
                    material.color.set(isDark ? 0x444444 : 0x888888); // Keep neutral grey
                }
                else if (material.name === 'buttons') {
                    material.color.set(isDark ? 0x505e50 : 0xe0ffe0); // Match green body
                    material.emissive.set(isDark ? 0x253025 : 0x000000);
                    material.emissiveIntensity = isDark ? 0.3 : 0.0;
                }
                else if (material.name === 'notch') { // Keep notch dark/subtle
                    material.color.set(isDark ? 0x112211 : 0x333333);
                    material.emissive.set(isDark ? 0x001100 : 0x000000);
                    material.emissiveIntensity = isDark ? 0.1 : 0.0;
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
                else if (material.name === 'camera_ring') {
                    material.color.set(isDark ? 0x66ffaa : 0xbbbbbb); // Adapted green ring
                    material.emissive.set(isDark ? 0x44cc88 : 0x666666); // Adapted green glow
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

        // Scene setup - Green tint
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(isDarkMode ? 0x081208 : 0xf0f4f0);
        sceneRef.current = scene;

        // Camera setup
        const camera = new THREE.PerspectiveCamera(
            60,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        camera.position.set(0, 0, 15);

        // Renderer setup
        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        mountRef.current.appendChild(renderer.domElement);

        // Controls
        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;
        controls.minDistance = 5;
        controls.maxDistance = 20;

        // Lighting - Adjusted intensity and color for green theme
        const ambientLight = new THREE.AmbientLight(
            isDarkMode ? 0x445544 : 0x909090, // Greenish ambient
            isDarkMode ? 0.4 : 0.8
        );
        scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(
            isDarkMode ? 0xaaffcc : 0xffffff, // Greenish directional
            isDarkMode ? 0.7 : 0.9
        );
        directionalLight.position.set(5, 10, 7);
        directionalLight.castShadow = true;

        // Optimize shadow map settings
        directionalLight.shadow.mapSize.width = 1024;
        directionalLight.shadow.mapSize.height = 1024;
        directionalLight.shadow.camera.near = 0.5;
        directionalLight.shadow.camera.far = 50;
        scene.add(directionalLight);

        // Add a backlight for more dimension - Green tint
        const backLight = new THREE.DirectionalLight(
            isDarkMode ? 0x44aa66 : 0xddffee, // Greenish backlight
            isDarkMode ? 0.3 : 0.3
        );
        backLight.position.set(-3, 5, -5);
        scene.add(backLight);

        // Add a spotlight for the screen to make it pop - Green tint
        const screenLight = new THREE.SpotLight(
            isDarkMode ? 0x88ffcc : 0xffffff, // Greenish screen light
            isDarkMode ? 0.6 : 0.4
        );
        screenLight.position.set(0, 0, 20); // Adjusted position slightly
        screenLight.angle = 0.3;
        screenLight.penumbra = 1;
        screenLight.decay = 2;
        screenLight.distance = 30;
        scene.add(screenLight);

        // Materials with enhanced properties - Adjusted for Green Theme
        const createMaterials = (isDark: boolean) => {
            return {
                phoneBody: new THREE.MeshStandardMaterial({
                    name: 'phone_body',
                    color: isDark ? 0x505e50 : 0xe0ffe0, // Adapted green body
                    metalness: 0.7, // Adjusted metalness/roughness slightly
                    roughness: 0.3,
                    emissive: isDark ? 0x253025 : 0x000000,
                    emissiveIntensity: isDark ? 0.30 : 0,
                    side: THREE.DoubleSide
                }),

                screen: new THREE.MeshStandardMaterial({
                    name: 'screen',
                    color: isDark ? 0x00ffbb : 0x00aa99, // Adapted green screen
                    metalness: 0.1,
                    roughness: 0.05,
                    emissive: isDark ? 0x00aa88 : 0x008866,
                    emissiveIntensity: isDark ? 0.5 : 0.2,
                    side: THREE.FrontSide
                }),

                uiElement: new THREE.MeshStandardMaterial({
                    name: 'ui_element',
                    color: isDark ? 0xafffaf : 0x00aa88, // Adapted green UI
                    metalness: 0.1,
                    roughness: 0.1,
                    emissive: isDark ? 0x66cc66 : 0x000000,
                    emissiveIntensity: isDark ? 0.7 : 0.0
                }),

                accent: new THREE.MeshStandardMaterial({
                    name: 'accent',
                    color: isDark ? 0x66ffaa : 0x00aa66, // Adapted green accent
                    metalness: 0.7,
                    roughness: 0.3,
                    emissive: isDark ? 0x44cc88 : 0x000000,
                    emissiveIntensity: isDark ? 0.6 : 0.0
                }),

                camera: new THREE.MeshStandardMaterial({
                    name: 'camera',
                    color: isDark ? 0x334433 : 0x556655, // Greenish tint camera
                    metalness: 0.9,
                    roughness: 0.4,
                    emissive: isDark ? 0x112211 : 0x000000,
                    emissiveIntensity: isDark ? 0.3 : 0.0
                }),

                cameraLens: new THREE.MeshStandardMaterial({
                    name: 'camera_lens',
                    color: isDark ? 0x445544 : 0x111111, // Greenish tint lens
                    metalness: 0.1,
                    roughness: 0.1,
                    emissive: isDark ? 0x223322 : 0x000000,
                    emissiveIntensity: isDark ? 0.1 : 0.0
                }),

                port: new THREE.MeshStandardMaterial({
                    name: 'port',
                    color: isDark ? 0x444444 : 0x888888, // Keep neutral grey
                    metalness: 0.8,
                    roughness: 0.5
                }),

                buttons: new THREE.MeshStandardMaterial({
                    name: 'buttons',
                    color: isDark ? 0x505e50 : 0xe0ffe0, // Match green body
                    metalness: 0.9,
                    roughness: 0.3,
                    emissive: isDark ? 0x253025 : 0x000000,
                    emissiveIntensity: isDark ? 0.3 : 0.0
                }),

                notch: new THREE.MeshStandardMaterial({
                    name: 'notch',
                    color: isDark ? 0x112211 : 0x333333, // Keep dark/subtle
                    metalness: 0.5,
                    roughness: 0.8,
                    emissive: isDark ? 0x001100 : 0x000000,
                    emissiveIntensity: isDark ? 0.1 : 0.0
                }),

                selfieCamera: new THREE.MeshStandardMaterial({
                    name: 'selfie_camera',
                    color: isDark ? 0x111111 : 0x000000, // Keep dark
                    metalness: 0.2,
                    roughness: 0.3,
                    emissive: isDark ? 0x111111 : 0x000000,
                    emissiveIntensity: isDark ? 0.1 : 0.0
                }),

                graphElement: new THREE.MeshStandardMaterial({
                    name: 'graph_element',
                    color: isDark ? 0x88ffcc : 0x00ccaa, // Adapted green graph
                    metalness: 0.1,
                    roughness: 0.2,
                    emissive: isDark ? 0x44ddaa : 0x00aa88,
                    emissiveIntensity: isDark ? 0.8 : 0.3,
                    transparent: true,
                    opacity: 0.9
                }),

                chartElement: new THREE.MeshStandardMaterial({
                    name: 'chart_element',
                    color: isDark ? 0xccff66 : 0x88cc00, // Contrasting green/yellow chart
                    metalness: 0.1,
                    roughness: 0.2,
                    emissive: isDark ? 0xaadd33 : 0x66aa00,
                    emissiveIntensity: isDark ? 0.8 : 0.3,
                    transparent: true,
                    opacity: 0.9
                }),

                textElement: new THREE.MeshStandardMaterial({
                    name: 'text_element',
                    color: isDark ? 0xeeffee : 0xffffff, // Greenish tint text
                    metalness: 0.1,
                    roughness: 0.2,
                    emissive: isDark ? 0xccffcc : 0xf0f0f0,
                    emissiveIntensity: isDark ? 0.6 : 0.2
                }),

                cameraRing: new THREE.MeshStandardMaterial({
                    name: 'camera_ring',
                    color: isDark ? 0x66ffaa : 0xbbbbbb, // Adapted green ring
                    metalness: 0.6,
                    roughness: 0.3,
                    emissive: isDark ? 0x44cc88 : 0x666666, // Adapted green glow
                    emissiveIntensity: isDark ? 0.8 : 0.2,
                    side: THREE.DoubleSide
                })
            };
        };

        const materials = createMaterials(isDarkMode);

        // Create Smartphone
        const createPhone = () => {
            const phone = new THREE.Group();

            // Phone dimensions in cm
            const height = 14;
            const width = 7;
            const thickness = 0.8;
            const cornerRadius = 0.7;
            const screenCornerRadius = 0.5;
            const widgetCornerRadius = 0.2;
            const bevelSize = 0.1;

            // Main phone body with rounded corners
            const phoneShape = new THREE.Shape();
            phoneShape.moveTo(-width / 2 + cornerRadius, -height / 2);
            phoneShape.lineTo(width / 2 - cornerRadius, -height / 2);
            phoneShape.quadraticCurveTo(width / 2, -height / 2, width / 2, -height / 2 + cornerRadius);
            phoneShape.lineTo(width / 2, height / 2 - cornerRadius);
            phoneShape.quadraticCurveTo(width / 2, height / 2, width / 2 - cornerRadius, height / 2);
            phoneShape.lineTo(-width / 2 + cornerRadius, height / 2);
            phoneShape.quadraticCurveTo(-width / 2, height / 2, -width / 2, height / 2 - cornerRadius);
            phoneShape.lineTo(-width / 2, -height / 2 + cornerRadius);
            phoneShape.quadraticCurveTo(-width / 2, -height / 2, -width / 2 + cornerRadius, -height / 2);

            const extrudeSettings = {
                steps: 1,
                depth: thickness,
                bevelEnabled: false
            };

            const phoneGeometry = new THREE.ExtrudeGeometry(phoneShape, extrudeSettings);
            phoneGeometry.center();
            const phoneBody = new THREE.Mesh(phoneGeometry, materials.phoneBody); // Use phoneBody material
            phoneBody.castShadow = true;
            phoneBody.receiveShadow = true;
            phoneBody.position.set(0, 0, 0);
            phone.add(phoneBody);

            // --- Screen and UI Layering ---
            const screenHeight = height - 0.4;
            const screenWidth = width - 0.3;
            const screenSurfaceZ = thickness / 2 + 0.01;
            const dashboardBgZ = screenSurfaceZ + 0.001;
            const widgetZ = dashboardBgZ + 0.002;
            const widgetContentZ = widgetZ + 0.001;
            const frontCameraZ = dashboardBgZ + 0.005;

            // --- IoT Dashboard Design ---

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

            // Dashboard Background - Green Theme
            const dashboardWidth = screenWidth - 0.2;
            const dashboardHeight = screenHeight - 0.2;
            const dashboardShape = createRoundedRectShape(dashboardWidth, dashboardHeight, screenCornerRadius);

            const punchHoleRadius = 0.25;
            const punchHoleX = 0;
            const punchHoleY = dashboardHeight / 2 - 0.4;

            const punchHolePath = new THREE.Path();
            punchHolePath.absarc(punchHoleX, punchHoleY, punchHoleRadius, 0, Math.PI * 2, false);
            dashboardShape.holes.push(punchHolePath);

            // Adjusted dashboard material colors - Green Theme
            const dashboardMaterial = new THREE.MeshStandardMaterial({
                color: isDarkMode ? 0x1a241a : 0xe8f4e8, // Greenish dashboard
                roughness: 0.6,
                metalness: 0.02,
                side: THREE.FrontSide,
                transparent: true,
                opacity: 0.97,
                emissive: isDarkMode ? 0x020502 : 0x000000,
                emissiveIntensity: isDarkMode ? 0.05 : 0,
            });
            const dashboardGeometry = new THREE.ShapeGeometry(dashboardShape);
            const dashboardBg = new THREE.Mesh(dashboardGeometry, dashboardMaterial);
            dashboardBg.position.z = dashboardBgZ;
            phone.add(dashboardBg);

            // Add Dashboard Border (Optional, subtle) - Adjusted colors - Green Theme
            const borderPoints = dashboardShape.getPoints(50);
            const borderGeometry = new THREE.BufferGeometry().setFromPoints(borderPoints);
            const borderMaterial = new THREE.LineBasicMaterial({
                color: isDarkMode ? 0x446644 : 0xaaaaaa, // Greenish border
                linewidth: 1,
                transparent: true,
                opacity: 0.5
            });
            const dashboardBorder = new THREE.LineLoop(borderGeometry, borderMaterial);
            dashboardBorder.position.z = dashboardBgZ + 0.0001;
            phone.add(dashboardBorder);

            // --- Front Camera --- (No color changes needed)
            const selfieCameraGeometry = new THREE.CircleGeometry(punchHoleRadius * 0.9, 32);
            const selfieCamera = new THREE.Mesh(selfieCameraGeometry, materials.selfieCamera);
            selfieCamera.position.set(punchHoleX, punchHoleY, frontCameraZ);
            phone.add(selfieCamera);

            // Create Widget function - Green Theme
            const createWidget = (x: number, y: number, w: number, h: number, index: number) => {
                const widgetGroup = new THREE.Group();
                widgetGroup.position.set(x, y, widgetZ);

                // Widget Background - Adjusted colors - Green Theme
                const widgetShape = createRoundedRectShape(w, h, widgetCornerRadius);
                const widgetGeometry = new THREE.ShapeGeometry(widgetShape);
                const widgetMaterial = new THREE.MeshStandardMaterial({
                    color: isDarkMode ? 0x304530 : 0xfcfffc, // Greenish widget
                    roughness: 0.4,
                    metalness: 0.0,
                    side: THREE.FrontSide,
                    transparent: true,
                    opacity: 0.88,
                    emissive: isDarkMode ? 0x141f14 : 0x000000,
                    emissiveIntensity: isDarkMode ? 0.15 : 0,
                });
                const widgetBg = new THREE.Mesh(widgetGeometry, widgetMaterial);
                widgetBg.castShadow = false;
                widgetBg.receiveShadow = true;
                widgetGroup.add(widgetBg);

                // Widget Title - Green Theme
                const titles = ["Temperature", "Humidity", "Light Level", "Energy Usage", "Device Status", "Network Traffic"];
                const titleText = titles[index % titles.length] || `Sensor ${index + 1}`;
                const titleHeight = 0.25;
                const titleWidth = w * 0.7;
                const titleGeometry = new THREE.PlaneGeometry(titleWidth, titleHeight);
                const titleMaterial = materials.textElement.clone();
                titleMaterial.color.set(isDarkMode ? 0xddffdd : 0x333333); // Greenish title
                titleMaterial.emissive.set(isDarkMode ? 0xaaccaa : 0x000000);
                titleMaterial.emissiveIntensity = isDarkMode ? 0.3 : 0;
                titleMaterial.side = THREE.FrontSide;
                const titleMesh = new THREE.Mesh(titleGeometry, titleMaterial);
                titleMesh.position.set(0, h / 2 - titleHeight / 2 - 0.15, widgetContentZ - widgetZ);
                widgetGroup.add(titleMesh);

                // --- Widget Data Area - Generate different content based on index ---
                const dataAreaX = 0;
                const dataAreaY = -0.1;
                const dataAreaWidth = w * 0.8;
                const dataAreaHeight = h * 0.45;
                const contentZ = widgetContentZ - widgetZ + 0.001;

                const randomSeed = (index + 1) * 1234;
                const seededRandom = (offset = 0) => {
                    let x = Math.sin(randomSeed + offset) * 10000;
                    return x - Math.floor(x);
                };

                const widgetType = index % titles.length;

                // --- Switch statement for widget types - Update colors for Green Theme ---
                switch (widgetType) {
                    case 0: // Temperature - Line Graph Simulation
                        const points = [];
                        const segments = 10;
                        for (let i = 0; i <= segments; i++) {
                            const px = -dataAreaWidth / 2 + (i / segments) * dataAreaWidth;
                            const py = (seededRandom(i) - 0.5) * dataAreaHeight * 0.8;
                            points.push(new THREE.Vector3(px, py, 0));
                        }
                        const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
                        const lineMaterial = new THREE.LineBasicMaterial({ color: isDarkMode ? 0xffaaaa : 0xcc0000, linewidth: 2 }); // Keep red for temp
                        const line = new THREE.Line(lineGeometry, lineMaterial);
                        line.position.set(dataAreaX, dataAreaY, contentZ);
                        widgetGroup.add(line);
                        break;

                    case 1: // Humidity - Gauge Simulation (Arc) - Use Chart Element Color
                        const gaugeRadius = dataAreaHeight * 0.6;
                        const arcPercentage = seededRandom();
                        const arcGeometry = new THREE.RingGeometry(gaugeRadius * 0.8, gaugeRadius, 32, 1, 0, Math.PI * arcPercentage);
                        const arcMaterial = materials.chartElement.clone(); // Use green/yellow chart color
                        arcMaterial.side = THREE.DoubleSide;
                        const arcMesh = new THREE.Mesh(arcGeometry, arcMaterial);
                        arcMesh.position.set(dataAreaX, dataAreaY - gaugeRadius * 0.2, contentZ);
                        arcMesh.rotation.z = -Math.PI / 2;
                        widgetGroup.add(arcMesh);
                        // Add background arc
                        const bgArcGeometry = new THREE.RingGeometry(gaugeRadius * 0.8, gaugeRadius, 32, 1, 0, Math.PI);
                        const bgArcMaterial = new THREE.MeshStandardMaterial({ color: isDarkMode ? 0x335533 : 0xcccccc, side: THREE.DoubleSide, opacity: 0.3, transparent: true }); // Dark green bg
                        const bgArcMesh = new THREE.Mesh(bgArcGeometry, bgArcMaterial);
                        bgArcMesh.position.copy(arcMesh.position);
                        bgArcMesh.rotation.copy(arcMesh.rotation);
                        widgetGroup.add(bgArcMesh);
                        break;

                    case 2: // Light Level - Radial Indicator - Yellow
                        const indicatorRadius = dataAreaHeight * 0.5;
                        const lightLevel = seededRandom();
                        const indicatorGeometry = new THREE.CircleGeometry(indicatorRadius * lightLevel, 32);
                        const indicatorMaterial = new THREE.MeshBasicMaterial({ color: isDarkMode ? 0xffffcc : 0xffcc00 }); // Keep yellow
                        const indicatorMesh = new THREE.Mesh(indicatorGeometry, indicatorMaterial);
                        indicatorMesh.position.set(dataAreaX, dataAreaY, contentZ);
                        widgetGroup.add(indicatorMesh);
                        // Add outer ring
                        const ringGeometry = new THREE.RingGeometry(indicatorRadius * 0.95, indicatorRadius, 32);
                        const ringMaterial = new THREE.MeshBasicMaterial({ color: isDarkMode ? 0xaaaa88 : 0x888888, side: THREE.DoubleSide }); // Yellowish grey
                        const ringMesh = new THREE.Mesh(ringGeometry, ringMaterial);
                        ringMesh.position.copy(indicatorMesh.position);
                        widgetGroup.add(ringMesh);
                        break;

                    case 3: // Energy Usage - Stacked Bars Simulation - Use Graph/Chart Colors
                        const barCountEnergy = 3;
                        const barWidthEnergy = dataAreaWidth / (barCountEnergy * 1.8);
                        const barSpacingEnergy = barWidthEnergy * 0.8;
                        const maxTotalHeight = dataAreaHeight * 0.9;
                        for (let i = 0; i < barCountEnergy; i++) {
                            const height1 = seededRandom(i) * maxTotalHeight * 0.6;
                            const height2 = seededRandom(i + 10) * maxTotalHeight * 0.4;
                            const geom1 = new THREE.BoxGeometry(barWidthEnergy, height1, 0.01);
                            const mat1 = materials.graphElement.clone(); // Use main green graph color
                            const mesh1 = new THREE.Mesh(geom1, mat1);
                            const barX = -dataAreaWidth / 2 + barWidthEnergy / 2 + i * (barWidthEnergy + barSpacingEnergy);
                            mesh1.position.set(barX, dataAreaY - dataAreaHeight / 2 + height1 / 2, contentZ);
                            widgetGroup.add(mesh1);

                            const geom2 = new THREE.BoxGeometry(barWidthEnergy, height2, 0.01);
                            const mat2 = materials.chartElement.clone(); // Use contrasting green/yellow chart color
                            const mesh2 = new THREE.Mesh(geom2, mat2);
                            mesh2.position.set(barX, mesh1.position.y + height1 / 2 + height2 / 2, contentZ);
                            widgetGroup.add(mesh2);
                        }
                        break;

                    case 4: // Device Status - Text/Indicator Simulation - Use Status Colors
                        const statusCount = 3;
                        const statusHeight = dataAreaHeight / statusCount * 0.6;
                        const statusWidth = dataAreaWidth * 0.8;
                        const statusSpacing = (dataAreaHeight - (statusHeight * statusCount)) / (statusCount + 1);
                        const statuses = ["Online", "Scanning", "Idle"];
                        const statusColors = [0x88ff88, 0xffff88, 0xaaaaff]; // Keep these distinct colors

                        for (let i = 0; i < statusCount; i++) {
                            const planeGeom = new THREE.PlaneGeometry(statusWidth, statusHeight);
                            const planeMat = materials.textElement.clone();
                            planeMat.color.set(isDarkMode ? 0xaaaaaa : 0x555555); // Grey background for text simulation
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

                    case 5: // Network Traffic - Dual Line Graph Simulation - Use Graph/Accent Colors
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
                        const lineMatUp = new THREE.LineBasicMaterial({ color: isDarkMode ? 0x88ff88 : 0x00aa00, linewidth: 2 }); // Lighter green
                        const lineUp = new THREE.Line(lineGeomUp, lineMatUp);
                        lineUp.position.set(dataAreaX, dataAreaY, contentZ);
                        widgetGroup.add(lineUp);

                        const lineGeomDown = new THREE.BufferGeometry().setFromPoints(pointsDown);
                        const lineMatDown = new THREE.LineBasicMaterial({ color: isDarkMode ? 0x66ffaa : 0x00aa66, linewidth: 2 }); // Use accent green
                        const lineDown = new THREE.Line(lineGeomDown, lineMatDown);
                        lineDown.position.set(dataAreaX, dataAreaY, contentZ);
                        widgetGroup.add(lineDown);
                        break;

                    default:
                        break;
                }


                // Widget Status/Icon Area - Keep multi-color for now
                const statusRadius = 0.15;
                const statusGeometry = new THREE.CircleGeometry(statusRadius, 16);
                const statusMaterial = materials.accent.clone(); // Start with accent
                const statusColorsCycle = [0xff6666, 0x66ff66, 0x6666ff, 0xffff66, 0xff66ff, 0x66ffff]; // Keep distinct colors
                statusMaterial.color.set(statusColorsCycle[index % statusColorsCycle.length]);
                statusMaterial.emissive.set(statusColorsCycle[index % statusColorsCycle.length]);
                statusMaterial.emissiveIntensity = isDarkMode ? 0.4 : 0.1;
                statusMaterial.side = THREE.FrontSide;
                const statusMesh = new THREE.Mesh(statusGeometry, statusMaterial);
                statusMesh.position.set(-w / 2 + statusRadius + 0.1, -h / 2 + statusRadius + 0.1, widgetContentZ - widgetZ);
                widgetGroup.add(statusMesh);

                return widgetGroup;
            };

            // --- Arrange Widgets ---
            const padding = 0.2;
            const usableWidth = dashboardWidth - padding * 2;
            const usableHeight = dashboardHeight - padding * 2;
            const widgetCols = 2;
            const widgetRows = 3;
            const widgetWidth = (usableWidth - padding * (widgetCols - 1)) / widgetCols;
            const widgetHeight = (usableHeight - padding * (widgetRows - 1)) / widgetRows;

            const startX = -usableWidth / 2 + widgetWidth / 2;
            const topOffsetForCamera = punchHoleRadius * 2 + 0.2;
            const adjustedUsableHeight = usableHeight - topOffsetForCamera;
            const adjustedWidgetHeight = (adjustedUsableHeight - padding * (widgetRows - 1)) / widgetRows;
            const startY = usableHeight / 2 - topOffsetForCamera - adjustedWidgetHeight / 2;


            let widgetIndex = 0;
            for (let r = 0; r < widgetRows; r++) {
                for (let c = 0; c < widgetCols; c++) {
                    const x = startX + c * (widgetWidth + padding);
                    const y = startY - r * (adjustedWidgetHeight + padding);
                    const widget = createWidget(x, y, widgetWidth, adjustedWidgetHeight, widgetIndex);
                    phone.add(widget);
                    widgetIndex++;
                }
            }

            // --- Back Camera, Buttons, Ports ---
            const backSurfaceZ = -thickness / 2;
            const backElementOffset = 0.01;

            // Camera lenses - Adjusted positioning and ring material
            const addCameraLens = (x: number, y: number, size: number) => {
                const housingDepth = 0.08;
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
                const housing = new THREE.Mesh(housingGeometry, materials.camera); // Use green camera material
                housing.position.set(x, y, housingZ);
                housing.castShadow = true;
                phone.add(housing);

                // Ring - Use the new glowing material
                const ringGeometry = new THREE.TorusGeometry(size + 0.035, ringDepth, 16, 48);
                const ring = new THREE.Mesh(ringGeometry, materials.cameraRing); // Use green cameraRing material
                ring.position.set(x, y, ringZ);
                phone.add(ring);

                // Main lens
                const lensGeometry = new THREE.CircleGeometry(size, 32);
                const lensMaterial = new THREE.MeshStandardMaterial({
                    name: 'camera_lens_main',
                    color: isDarkMode ? 0x445544 : 0x111111, // Use greenish tint lens color
                    metalness: 0.1,
                    roughness: 0.05,
                    opacity: 0.9,
                    transparent: true,
                    side: THREE.DoubleSide,
                    emissive: isDarkMode ? 0x223322 : 0x000000, // Add emissive matching cameraLens
                    emissiveIntensity: isDarkMode ? 0.1 : 0.0
                 });
                const lens = new THREE.Mesh(lensGeometry, lensMaterial);
                lens.position.set(x, y, lensZ);
                phone.add(lens);

                // Inner lens
                const innerLensGeometry = new THREE.CircleGeometry(size * 0.7, 32);
                const innerLens = new THREE.Mesh(innerLensGeometry, materials.cameraLens); // Use green cameraLens material
                innerLens.position.set(x, y, innerLensZ);
                phone.add(innerLens);

                // Highlight
                const highlightGeometry = new THREE.CircleGeometry(size * 0.2, 16);
                const highlightMaterial = new THREE.MeshBasicMaterial({
                    color: 0xffffff,
                    transparent: true,
                    opacity: 0.5
                 });
                const highlight = new THREE.Mesh(highlightGeometry, highlightMaterial);
                highlight.position.set(x - size/4, y + size/4, highlightZ);
                phone.add(highlight);
            };

            // Add camera lenses
            const cameraClusterX = width / 2 - 1.5;
            const cameraClusterY = height / 2 - 1.5;
            addCameraLens(cameraClusterX - 0.6, cameraClusterY + 0.6, 0.45);
            addCameraLens(cameraClusterX + 0.6, cameraClusterY + 0.6, 0.35);
            addCameraLens(cameraClusterX, cameraClusterY - 0.5, 0.4);

            // Flash
            const flashSize = 0.15;
            const flashDepth = 0.05;
            const flashDetailSize = flashSize * 0.6;
            const flashDetailOffset = 0.002;

            const flashBaseZ = backSurfaceZ - backElementOffset - 0.005;
            const flashZ = flashBaseZ - flashDepth / 2;
            const flashGeometry = new THREE.CylinderGeometry(flashSize, flashSize, flashDepth, 32);
            flashGeometry.rotateX(Math.PI / 2);
            const flashMaterial = new THREE.MeshStandardMaterial({
                color: 0xffffdd, // Keep flash color yellowish
                emissive: 0xaaaa88,
                emissiveIntensity: 0.2,
                roughness: 0.3
             });
            const flash = new THREE.Mesh(flashGeometry, flashMaterial);
            flash.castShadow = false;
            flash.renderOrder = 1;
            const flashX = cameraClusterX - 1.0;
            const flashY = cameraClusterY - 0.5;
            flash.position.set(flashX, flashY, flashZ);
            phone.add(flash);

            // Add inner flash detail
            const flashDetailGeometry = new THREE.CircleGeometry(flashDetailSize, 32);
            const flashDetailMaterial = materials.cameraLens.clone(); // Use green cameraLens
            flashDetailMaterial.color.set(0xeeeecc); // Keep yellowish
            flashDetailMaterial.emissive.set(0xffffaa);
            flashDetailMaterial.emissiveIntensity = 0.5;
            const flashDetail = new THREE.Mesh(flashDetailGeometry, flashDetailMaterial);
            const flashDetailZ = flashZ - flashDepth / 2 - flashDetailOffset;
            flashDetail.position.set(flashX, flashY, flashDetailZ);
            flashDetail.renderOrder = 3;
            phone.add(flashDetail);

            // Flash rim
            const flashRimGeometry = new THREE.RingGeometry(flashSize, flashSize + 0.035, 32);
            const flashRim = new THREE.Mesh(flashRimGeometry, materials.camera); // Use green camera material
            flashRim.renderOrder = 2;
            const flashRimZ = flashDetailZ - 0.0005;
            flashRim.position.set(flashX, flashY, flashRimZ);
            phone.add(flashRim);

            // Add simple logo on the back
            const logoWidth = 1.0;
            const logoHeight = 0.5;
            const logoGeometry = new THREE.PlaneGeometry(logoWidth, logoHeight);
            const logoMaterial = materials.accent.clone(); // Use green accent material
            logoMaterial.side = THREE.FrontSide;
            const logo = new THREE.Mesh(logoGeometry, logoMaterial);
            logo.position.set(0, -height / 4, backSurfaceZ - backElementOffset - 0.001);
            phone.add(logo);

            // --- Side Buttons Fix ---
            const addButton = (y: number, h: number, isRight: boolean = true) => {
                const buttonDepth = 0.1;
                const buttonGeometry = new THREE.BoxGeometry(buttonDepth, h, 0.25);
                const button = new THREE.Mesh(buttonGeometry, materials.buttons); // Use green buttons material
                const x = isRight ? width / 2 : -width / 2;
                button.position.set(x + (isRight ? buttonDepth / 2 : -buttonDepth / 2), y, 0);
                button.castShadow = true;
                phone.add(button);
            };

            addButton(1, 1.2, true);
            addButton(2, 0.8, false);
            addButton(0.8, 0.8, false);

            // --- Bottom Ports Centering Fix ---
            const addPort = (x: number, w: number) => {
                const portDepth = 0.1;
                const portHeight = 0.07;
                const portGeometry = new THREE.BoxGeometry(w, portHeight, portDepth);
                const port = new THREE.Mesh(portGeometry, materials.port); // Use neutral port material
                port.position.set(x, -height / 2, -portDepth / 2);
                phone.add(port);
            };

            addPort(0, 0.8);
            addPort(-1.5, 0.4);
            addPort(1.5, 0.4);

            return phone;
        };

        // Create the phone and add it to the scene
        const phone = createPhone();
        scene.add(phone);
        phoneRef.current = phone;

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


        // Animation loop - make the phone slowly rotate
        const animate = () => {
            requestAnimationFrame(animate);

            // Subtle rotation of the phone
            if (phone) {
                phone.rotation.y += 0.002;
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
            window.removeEventListener('keydown', handleKeyDown); // Use named handler
            mountRef.current?.removeChild(renderer.domElement);
        };
    }, []); // Removed isDarkMode dependency

    // Apply dark mode when state changes
    useEffect(() => {
        updateMaterials(isDarkMode);
        // Update lights based on dark mode
        if (sceneRef.current) {
            sceneRef.current.background = new THREE.Color(isDarkMode ? 0x081208 : 0xf0f4f0); // Green tint
            sceneRef.current.traverse((object) => {
                if (object instanceof THREE.AmbientLight) {
                    object.color.set(isDarkMode ? 0x445544 : 0x909090); // Greenish ambient
                    object.intensity = isDarkMode ? 0.4 : 0.8;
                } else if (object instanceof THREE.DirectionalLight) {
                    if (object.position.x > 0) { // Main directional light
                        object.color.set(isDarkMode ? 0xaaffcc : 0xffffff); // Greenish directional
                        object.intensity = isDarkMode ? 0.7 : 0.9;
                    } else { // Backlight
                        object.color.set(isDarkMode ? 0x44aa66 : 0xddffee); // Greenish backlight
                        object.intensity = isDarkMode ? 0.3 : 0.3;
                    }
                } else if (object instanceof THREE.SpotLight) { // Screen light
                    object.color.set(isDarkMode ? 0x88ffcc : 0xffffff); // Greenish screen light
                    object.intensity = isDarkMode ? 0.6 : 0.4;
                }
            });
        }
    }, [isDarkMode]);

    return (
        // Adjusted background color for green theme
        <div style={{ background: isDarkMode ? '#081208' : '#f0f4f0', height: '100vh', width: '100vw' }}>
            <div ref={mountRef} style={{ width: '100%', height: '100vh' }} />
            {/* Updated info box style - Green Theme */}
            <div className="info" style={{
                position: 'absolute',
                top: '10px',
                left: '10px',
                padding: '10px',
                background: isDarkMode ? 'rgba(20,40,20,0.7)' : 'rgba(255,255,255,0.7)', // Greenish dark bg
                color: isDarkMode ? '#aaffaa' : '#333', // Greenish dark text
                borderRadius: '4px',
                boxShadow: isDarkMode ? '0 0 8px #00aa66' : '0 0 5px rgba(0,0,0,0.2)', // Green shadow
            }}>
                <p>Modern Smartphone with IoT Control Dashboard</p>
                <p>Press W to toggle wireframe mode</p>
                <p>Press D to toggle dark mode</p>
                <p>Use mouse to orbit, zoom and pan</p>
                <button
                    onClick={toggleDarkMode}
                    style={{
                        background: isDarkMode ? '#009966' : '#22aa88', // Green button bg
                        color: 'white',
                        border: 'none',
                        padding: '5px 10px',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        marginTop: '5px',
                        boxShadow: isDarkMode ? '0 0 5px #00aa66' : 'none', // Green button shadow
                    }}
                >
                    {isDarkMode ? 'Light Mode' : 'Dark Mode'}
                </button>
            </div>
        </div>
    );
}
