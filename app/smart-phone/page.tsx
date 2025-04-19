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

    // Function to update materials based on dark mode
    const updateMaterials = (isDark: boolean) => {
        if (!sceneRef.current || !phoneRef.current) return;

        // Update scene background
        sceneRef.current.background = new THREE.Color(isDark ? 0x001208 : 0xf0f0f0);

        // Update phone materials
        phoneRef.current.traverse((object) => {
            if (object instanceof THREE.Mesh) {
                const material = object.material as THREE.MeshStandardMaterial; // Revert type hint

                // Identify parts by their name and update accordingly
                if (material.name === 'phone_body') {
                    material.color.set(isDark ? 0x1a2e20 : 0xd0e8ff);
                    material.emissive.set(isDark ? 0x0a1a10 : 0x000000);
                    material.emissiveIntensity = isDark ? 0.2 : 0;
                }
                else if (material.name === 'screen') {
                    material.color.set(isDark ? 0x00ffaa : 0x00aa88);
                    material.emissive.set(isDark ? 0x00aa88 : 0x008866);
                    material.emissiveIntensity = isDark ? 0.5 : 0.2;
                }
                else if (material.name === 'ui_element') {
                    material.color.set(isDark ? 0x8fffaa : 0x009977);
                    material.emissive.set(isDark ? 0x44ff66 : 0x000000);
                    material.emissiveIntensity = isDark ? 0.7 : 0.0;
                }
                else if (material.name === 'accent') {
                    material.color.set(isDark ? 0x44ff66 : 0x006644);
                    material.emissive.set(isDark ? 0x22ff44 : 0x000000);
                    material.emissiveIntensity = isDark ? 0.6 : 0.0;
                }
                else if (material.name === 'camera') {
                    material.color.set(isDark ? 0x224433 : 0x445566);
                    material.emissive.set(isDark ? 0x002211 : 0x000000);
                    material.emissiveIntensity = isDark ? 0.3 : 0.0;
                }
                else if (material.name === 'camera_lens') {
                    material.color.set(isDark ? 0x225544 : 0x000000);
                    material.emissive.set(isDark ? 0x113322 : 0x000000);
                    material.emissiveIntensity = isDark ? 0.1 : 0.0;
                }
                else if (material.name === 'port') {
                    material.color.set(isDark ? 0x333333 : 0x777777);
                }
                else if (material.name === 'buttons') {
                    material.color.set(isDark ? 0x1a2e20 : 0xd0e8ff);
                    material.emissive.set(isDark ? 0x0a1a10 : 0x000000);
                    material.emissiveIntensity = isDark ? 0.15 : 0.0;
                }
                else if (material.name === 'notch') {
                    material.color.set(isDark ? 0x112211 : 0x333333);
                    material.emissive.set(isDark ? 0x001100 : 0x000000);
                    material.emissiveIntensity = isDark ? 0.1 : 0.0;
                }
                else if (material.name === 'selfie_camera') {
                    material.color.set(isDark ? 0x001111 : 0x000000);
                    material.emissive.set(isDark ? 0x001111 : 0x000000);
                    material.emissiveIntensity = isDark ? 0.1 : 0.0;
                }
                else if (material.name === 'graph_element') {
                    material.color.set(isDark ? 0x66ffbb : 0x00cc88);
                    material.emissive.set(isDark ? 0x22dd88 : 0x008866);
                    material.emissiveIntensity = isDark ? 0.8 : 0.3;
                }
                else if (material.name === 'chart_element') {
                    material.color.set(isDark ? 0x44ddff : 0x0088ff);
                    material.emissive.set(isDark ? 0x22bbee : 0x0066cc);
                    material.emissiveIntensity = isDark ? 0.8 : 0.3;
                }
                else if (material.name === 'text_element') {
                    material.color.set(isDark ? 0xeeffee : 0xffffff);
                    material.emissive.set(isDark ? 0xccffcc : 0xf0f0f0);
                    material.emissiveIntensity = isDark ? 0.6 : 0.2;
                }
                // Add update logic for the new camera ring material
                else if (material.name === 'camera_ring') {
                    material.color.set(isDark ? 0x44ff66 : 0xaaaaaa); // Ring color
                    material.emissive.set(isDark ? 0x22ff44 : 0x555555); // Glow color
                    material.emissiveIntensity = isDark ? 0.8 : 0.2; // Glow intensity
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
        scene.background = new THREE.Color(isDarkMode ? 0x001208 : 0xf0f0f0);
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
        
        // Lighting
        const ambientLight = new THREE.AmbientLight(
            isDarkMode ? 0x335533 : 0x909090, 
            isDarkMode ? 0.5 : 0.8
        );
        scene.add(ambientLight);
        
        const directionalLight = new THREE.DirectionalLight(
            isDarkMode ? 0x88ffaa : 0xffffff, 
            isDarkMode ? 0.8 : 0.9
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
            isDarkMode ? 0x2266ff : 0xddeeff, 
            isDarkMode ? 0.4 : 0.3
        );
        backLight.position.set(-3, 5, -5);
        scene.add(backLight);
        
        // Add a spotlight for the screen to make it pop
        const screenLight = new THREE.SpotLight(
            isDarkMode ? 0x66ffaa : 0xffffff,
            isDarkMode ? 0.7 : 0.4
        );
        screenLight.position.set(0, 0, 20);
        screenLight.angle = 0.3;
        screenLight.penumbra = 1;
        screenLight.decay = 2;
        screenLight.distance = 30;
        scene.add(screenLight);
        
        // Materials with enhanced properties
        const createMaterials = (isDark: boolean) => {
            return {
                phoneBody: new THREE.MeshStandardMaterial({
                    name: 'phone_body',
                    color: isDark ? 0x1a2e20 : 0xd0e8ff,
                    metalness: 0.8,
                    roughness: 0.2,
                    emissive: isDark ? 0x0a1a10 : 0x000000,
                    emissiveIntensity: isDark ? 0.2 : 0,
                    side: THREE.DoubleSide // Ensure visibility even if normals are flipped
                }),
                
                screen: new THREE.MeshStandardMaterial({
                    name: 'screen',
                    color: isDark ? 0x00ffaa : 0x00aa88,
                    metalness: 0.1,
                    roughness: 0.05,
                    emissive: isDark ? 0x00aa88 : 0x008866,
                    emissiveIntensity: isDark ? 0.5 : 0.2,
                    side: THREE.FrontSide // Only render front
                }),
                
                uiElement: new THREE.MeshStandardMaterial({
                    name: 'ui_element',
                    color: isDark ? 0x8fffaa : 0x009977,
                    metalness: 0.1,
                    roughness: 0.1,
                    emissive: isDark ? 0x44ff66 : 0x000000,
                    emissiveIntensity: isDark ? 0.7 : 0.0
                }),
                
                accent: new THREE.MeshStandardMaterial({
                    name: 'accent',
                    color: isDark ? 0x44ff66 : 0x006644,
                    metalness: 0.7,
                    roughness: 0.3,
                    emissive: isDark ? 0x22ff44 : 0x000000,
                    emissiveIntensity: isDark ? 0.6 : 0.0
                }),
                
                camera: new THREE.MeshStandardMaterial({
                    name: 'camera',
                    color: isDark ? 0x224433 : 0x445566,
                    metalness: 0.9,
                    roughness: 0.4,
                    emissive: isDark ? 0x002211 : 0x000000,
                    emissiveIntensity: isDark ? 0.3 : 0.0
                }),
                
                cameraLens: new THREE.MeshStandardMaterial({
                    name: 'camera_lens',
                    color: isDark ? 0x225544 : 0x000000,
                    metalness: 0.1,
                    roughness: 0.1,
                    emissive: isDark ? 0x113322 : 0x000000,
                    emissiveIntensity: isDark ? 0.1 : 0.0
                }),
                
                port: new THREE.MeshStandardMaterial({
                    name: 'port',
                    color: isDark ? 0x333333 : 0x777777,
                    metalness: 0.8,
                    roughness: 0.5
                }),
                
                buttons: new THREE.MeshStandardMaterial({
                    name: 'buttons',
                    color: isDark ? 0x1a2e20 : 0xd0e8ff,
                    metalness: 0.9,
                    roughness: 0.3,
                    emissive: isDark ? 0x0a1a10 : 0x000000,
                    emissiveIntensity: isDark ? 0.15 : 0.0
                }),
                
                // New materials for enhanced display and cameras
                notch: new THREE.MeshStandardMaterial({
                    name: 'notch',
                    color: isDark ? 0x112211 : 0x333333,
                    metalness: 0.5,
                    roughness: 0.8,
                    emissive: isDark ? 0x001100 : 0x000000,
                    emissiveIntensity: isDark ? 0.1 : 0.0
                }),
                
                selfieCamera: new THREE.MeshStandardMaterial({
                    name: 'selfie_camera',
                    color: isDark ? 0x001111 : 0x000000,
                    metalness: 0.2,
                    roughness: 0.3,
                    emissive: isDark ? 0x001111 : 0x000000,
                    emissiveIntensity: isDark ? 0.1 : 0.0
                }),
                
                graphElement: new THREE.MeshStandardMaterial({
                    name: 'graph_element',
                    color: isDark ? 0x66ffbb : 0x00cc88,
                    metalness: 0.1,
                    roughness: 0.2,
                    emissive: isDark ? 0x22dd88 : 0x008866,
                    emissiveIntensity: isDark ? 0.8 : 0.3,
                    transparent: true,
                    opacity: 0.9
                }),
                
                chartElement: new THREE.MeshStandardMaterial({
                    name: 'chart_element',
                    color: isDark ? 0x44ddff : 0x0088ff,
                    metalness: 0.1,
                    roughness: 0.2,
                    emissive: isDark ? 0x22bbee : 0x0066cc,
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
                // New material for glowing camera rings
                cameraRing: new THREE.MeshStandardMaterial({
                    name: 'camera_ring',
                    color: isDark ? 0x44ff66 : 0xaaaaaa, // Ring color
                    metalness: 0.6,
                    roughness: 0.3,
                    emissive: isDark ? 0x22ff44 : 0x555555, // Glow color
                    emissiveIntensity: isDark ? 0.8 : 0.2, // Glow intensity
                    side: THREE.DoubleSide // Ensure visibility
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
            const cornerRadius = 0.7; // Rounded corners for phone body
            const screenCornerRadius = 0.5; // Slightly smaller radius for screen/dashboard
            const widgetCornerRadius = 0.2; // Radius for widgets
            const bevelSize = 0.1; // Consistent bevel size

            // Main phone body with rounded corners
            const phoneShape = new THREE.Shape();
            // Define shape centered around (0,0)
            phoneShape.moveTo(-width / 2 + cornerRadius, -height / 2);
            phoneShape.lineTo(width / 2 - cornerRadius, -height / 2);
            phoneShape.quadraticCurveTo(width / 2, -height / 2, width / 2, -height / 2 + cornerRadius);
            phoneShape.lineTo(width / 2, height / 2 - cornerRadius);
            phoneShape.quadraticCurveTo(width / 2, height / 2, width / 2 - cornerRadius, height / 2);
            phoneShape.lineTo(-width / 2 + cornerRadius, height / 2);
            phoneShape.quadraticCurveTo(-width / 2, height / 2, -width / 2, height / 2 - cornerRadius);
            phoneShape.lineTo(-width / 2, -height / 2 + cornerRadius);
            phoneShape.quadraticCurveTo(-width / 2, -height / 2, -width / 2 + cornerRadius, -height / 2);
            
            // Simplify extrude settings temporarily to rule out bevel issues
            const extrudeSettings = {
                steps: 1,
                depth: thickness,
                bevelEnabled: false // Disable bevel temporarily
                // bevelThickness: bevelSize,
                // bevelSize: bevelSize,
                // bevelOffset: -bevelSize, 
                // bevelSegments: 5
            };
            
            const phoneGeometry = new THREE.ExtrudeGeometry(phoneShape, extrudeSettings);
            // Center the geometry after creation
            phoneGeometry.center(); 
            const phoneBody = new THREE.Mesh(phoneGeometry, materials.phoneBody);
            phoneBody.castShadow = true;
            phoneBody.receiveShadow = true;
            // Ensure position is (0,0,0) within the group
            phoneBody.position.set(0, 0, 0); 
            phone.add(phoneBody);
            
            // --- Screen and UI Layering ---
            const screenHeight = height - 0.4;
            const screenWidth = width - 0.3;
            const screenSurfaceZ = thickness / 2 + 0.01; // Base Z for screen elements
            const dashboardBgZ = screenSurfaceZ + 0.001; // Dashboard background slightly above screen
            const widgetZ = dashboardBgZ + 0.002; // Widgets above dashboard background
            const widgetContentZ = widgetZ + 0.001; // Text/icons on widgets
            // Remove notchZ
            const frontCameraZ = dashboardBgZ + 0.005; // Camera slightly above dashboard bg

            // --- IoT Dashboard Design ---

            // Helper function to create rounded rectangle shapes
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

            // Dashboard Background
            const dashboardWidth = screenWidth - 0.2; // Slightly inset
            const dashboardHeight = screenHeight - 0.2; // Slightly inset
            const dashboardShape = createRoundedRectShape(dashboardWidth, dashboardHeight, screenCornerRadius);

            // Create a hole for the punch-hole camera
            const punchHoleRadius = 0.25;
            const punchHoleX = 0; // Centered horizontally
            const punchHoleY = dashboardHeight / 2 - 0.4; // Position near the top

            const punchHolePath = new THREE.Path();
            punchHolePath.absarc(punchHoleX, punchHoleY, punchHoleRadius, 0, Math.PI * 2, false);
            dashboardShape.holes.push(punchHolePath); // Add the punch hole

            const dashboardMaterial = new THREE.MeshStandardMaterial({
                color: isDarkMode ? 0x08241a : 0xe0f4e8, // Slightly adjusted colors
                roughness: 0.5, // Slightly less rough
                metalness: 0.05, // Slightly less metallic
                side: THREE.FrontSide,
                transparent: true,
                opacity: 0.98, // Slightly more opaque
                emissive: isDarkMode ? 0x000502 : 0x000000, // Very subtle dark mode glow
                emissiveIntensity: isDarkMode ? 0.05 : 0,
            });
            const dashboardGeometry = new THREE.ShapeGeometry(dashboardShape);
            const dashboardBg = new THREE.Mesh(dashboardGeometry, dashboardMaterial);
            dashboardBg.position.z = dashboardBgZ;
            phone.add(dashboardBg);

            // Add Dashboard Border (Optional, subtle)
            const borderPoints = dashboardShape.getPoints(50); // Get points from the shape
            const borderGeometry = new THREE.BufferGeometry().setFromPoints(borderPoints);
            const borderMaterial = new THREE.LineBasicMaterial({
                color: isDarkMode ? 0x226644 : 0xaaaaaa,
                linewidth: 1, // Note: linewidth > 1 may not work on all platforms
                transparent: true,
                opacity: 0.5
            });
            const dashboardBorder = new THREE.LineLoop(borderGeometry, borderMaterial); // Use LineLoop for closed shape
            dashboardBorder.position.z = dashboardBgZ + 0.0001; // Slightly above the background
            phone.add(dashboardBorder);

            // --- Front Camera ---
            const selfieCameraGeometry = new THREE.CircleGeometry(punchHoleRadius * 0.9, 32); // Slightly smaller than hole
            const selfieCamera = new THREE.Mesh(selfieCameraGeometry, materials.selfieCamera);
            // Position camera within the punch hole area, slightly above the dashboard background
            selfieCamera.position.set(punchHoleX, punchHoleY, frontCameraZ);
            phone.add(selfieCamera);

            // Create Widget function
            const createWidget = (x: number, y: number, w: number, h: number, title: string) => {
                const widgetGroup = new THREE.Group();
                widgetGroup.position.set(x, y, widgetZ); // Set base position for the group

                // Widget Background
                const widgetShape = createRoundedRectShape(w, h, widgetCornerRadius);
                const widgetGeometry = new THREE.ShapeGeometry(widgetShape);
                const widgetMaterial = new THREE.MeshStandardMaterial({
                    color: isDarkMode ? 0x154530 : 0xf8fefc, // Adjusted colors
                    roughness: 0.3, // Smoother
                    metalness: 0.0,
                    side: THREE.FrontSide,
                    transparent: true,
                    opacity: 0.85, // Slightly more transparent
                    emissive: isDarkMode ? 0x081f14 : 0x000000,
                    emissiveIntensity: isDarkMode ? 0.15 : 0,
                });
                const widgetBg = new THREE.Mesh(widgetGeometry, widgetMaterial);
                widgetBg.castShadow = false;
                widgetBg.receiveShadow = true;
                widgetGroup.add(widgetBg); // Add to group

                // Widget Title (Simulated with a plane - keep simple)
                const titleHeight = 0.25; // Slightly smaller
                const titleWidth = w * 0.7;
                const titleGeometry = new THREE.PlaneGeometry(titleWidth, titleHeight);
                const titleMaterial = materials.textElement.clone();
                titleMaterial.color.set(isDarkMode ? 0xccffdd : 0x333333); // Adjust text color
                titleMaterial.emissive.set(isDarkMode ? 0x88ccaa : 0x000000);
                titleMaterial.emissiveIntensity = isDarkMode ? 0.3 : 0;
                titleMaterial.side = THREE.FrontSide;
                const titleMesh = new THREE.Mesh(titleGeometry, titleMaterial);
                titleMesh.position.set(0, h / 2 - titleHeight / 2 - 0.15, widgetContentZ - widgetZ); // Adjusted Y
                widgetGroup.add(titleMesh);

                // Widget Data Area (Simulated Bar Chart)
                const chartAreaHeight = h * 0.4;
                const chartAreaWidth = w * 0.7;
                const barCount = 5;
                const barWidth = chartAreaWidth / (barCount * 1.5); // Bars with spacing
                const barSpacing = barWidth * 0.5;
                const maxBarHeight = chartAreaHeight * 0.8;

                for (let i = 0; i < barCount; i++) {
                    const barHeight = Math.random() * maxBarHeight; // Random height for demo
                    const barGeometry = new THREE.BoxGeometry(barWidth, barHeight, 0.01); // Very thin box
                    // Alternate materials for bars
                    const barMaterial = (i % 2 === 0) ? materials.graphElement.clone() : materials.chartElement.clone();
                    barMaterial.side = THREE.FrontSide;
                    const barMesh = new THREE.Mesh(barGeometry, barMaterial);
                    // Position bars within the data area
                    const barX = -chartAreaWidth / 2 + barWidth / 2 + i * (barWidth + barSpacing);
                    const barY = -chartAreaHeight / 2 + barHeight / 2; // Align bottom of bar
                    barMesh.position.set(barX, barY, widgetContentZ - widgetZ + 0.001); // Slightly above title plane Z
                    widgetGroup.add(barMesh);
                }

                // Widget Status/Icon Area (Small Circle)
                const statusRadius = 0.15;
                const statusGeometry = new THREE.CircleGeometry(statusRadius, 16);
                const statusMaterial = materials.accent.clone(); // Reuse accent material
                statusMaterial.side = THREE.FrontSide;
                const statusMesh = new THREE.Mesh(statusGeometry, statusMaterial);
                // Position status at the bottom-left, slightly forward
                statusMesh.position.set(-w / 2 + statusRadius + 0.1, -h / 2 + statusRadius + 0.1, widgetContentZ - widgetZ);
                widgetGroup.add(statusMesh);

                return widgetGroup;
            };

            // --- Arrange Widgets ---
            const padding = 0.2; // Padding around dashboard edges and between widgets
            const usableWidth = dashboardWidth - padding * 2;
            const usableHeight = dashboardHeight - padding * 2;
            const widgetCols = 2;
            const widgetRows = 3;
            const widgetWidth = (usableWidth - padding * (widgetCols - 1)) / widgetCols;
            const widgetHeight = (usableHeight - padding * (widgetRows - 1)) / widgetRows;

            const startX = -usableWidth / 2 + widgetWidth / 2;
            const startY = usableHeight / 2 - widgetHeight / 2;

            let widgetCount = 0;
            for (let r = 0; r < widgetRows; r++) {
                for (let c = 0; c < widgetCols; c++) {
                    widgetCount++;
                    const x = startX + c * (widgetWidth + padding);
                    const y = startY - r * (widgetHeight + padding);
                    const widget = createWidget(x, y, widgetWidth, widgetHeight, `Widget ${widgetCount}`);
                    phone.add(widget); // Add widget group directly to the phone
                }
            }

            // --- Remove Old UI Elements ---
            // The code for statusBar, dashboard, tempGraph, deviceStatus, textSection, navBar, etc.
            // has been effectively replaced by the new dashboard and widget creation logic above.
            // No need to explicitly remove them if they are not created.

            // --- Back Camera, Buttons, Ports (Keep Existing) ---
            const backSurfaceZ = -thickness / 2; // Define back surface Z
            const backElementOffset = 0.01; // Base offset to prevent z-fighting with back surface

            // Camera lenses - Adjusted positioning and ring material
            const addCameraLens = (x: number, y: number, size: number) => {
                const housingDepth = 0.08; // How much the housing protrudes
                const ringDepth = 0.02; // Thickness of the ring
                const lensZOffset = 0.005; // Small offset between elements

                // Calculate Z positions relative to the back surface (more negative is further out)
                // Ensure elements are slightly offset from each other and the back surface
                const housingZ = backSurfaceZ - housingDepth / 2 - backElementOffset; 
                const ringZ = housingZ - housingDepth / 2 - ringDepth / 2 - 0.001; // Ring slightly behind housing face
                const lensZ = ringZ - ringDepth / 2 - lensZOffset; 
                const innerLensZ = lensZ - lensZOffset; 
                const highlightZ = innerLensZ - lensZOffset; 

                // Housing
                const housingGeometry = new THREE.CylinderGeometry(size + 0.1, size + 0.1, housingDepth, 32);
                housingGeometry.rotateX(Math.PI / 2);
                const housing = new THREE.Mesh(housingGeometry, materials.camera);
                housing.position.set(x, y, housingZ);
                housing.castShadow = true;
                phone.add(housing);

                // Ring - Use the new glowing material
                const ringGeometry = new THREE.TorusGeometry(size + 0.035, ringDepth, 16, 48); // Use Torus for thickness
                const ring = new THREE.Mesh(ringGeometry, materials.cameraRing); // Use cameraRing material
                ring.position.set(x, y, ringZ);
                phone.add(ring);

                // Main lens - Reverted back to MeshStandardMaterial
                const lensGeometry = new THREE.CircleGeometry(size, 32);
                // Use MeshStandardMaterial instead of MeshPhysicalMaterial
                const lensMaterial = new THREE.MeshStandardMaterial({
                    name: 'camera_lens_main', // Keep distinct name
                    color: 0x111111,
                    metalness: 0.1,
                    roughness: 0.05,
                    opacity: 0.9, // Simulate transparency with opacity
                    transparent: true,
                    side: THREE.DoubleSide
                 });
                const lens = new THREE.Mesh(lensGeometry, lensMaterial);
                lens.position.set(x, y, lensZ);
                phone.add(lens);

                // Inner lens
                const innerLensGeometry = new THREE.CircleGeometry(size * 0.7, 32);
                const innerLens = new THREE.Mesh(innerLensGeometry, materials.cameraLens);
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

            // Add camera lenses (positions adjusted for top-left corner from front view)
            const cameraClusterX = width / 2 - 1.5; // Move towards right edge (appears left from front)
            const cameraClusterY = height / 2 - 1.5; // Move towards top edge
            addCameraLens(cameraClusterX - 0.6, cameraClusterY + 0.6, 0.45); // Top-left lens relative to cluster center
            addCameraLens(cameraClusterX + 0.6, cameraClusterY + 0.6, 0.35); // Top-right lens relative to cluster center
            addCameraLens(cameraClusterX, cameraClusterY - 0.5, 0.4); // Bottom-center lens relative to cluster center

            // Flash - Adjusted position for top-left cluster (from front view)
            const flashSize = 0.15; // Further reduced flash radius
            const flashDepth = 0.05; // Give the flash some thickness
            const flashDetailSize = flashSize * 0.6; // Size of the inner detail
            const flashDetailOffset = 0.002; // How far detail sits in front of flash face

            // Position the CENTER of the flash cylinder slightly proud of the back surface
            const flashBaseZ = backSurfaceZ - backElementOffset - 0.005; // Base Z for flash elements
            const flashZ = flashBaseZ - flashDepth / 2; // Center of the cylinder
            // Use CylinderGeometry for thickness
            const flashGeometry = new THREE.CylinderGeometry(flashSize, flashSize, flashDepth, 32);
            flashGeometry.rotateX(Math.PI / 2); // Rotate so flat face points outwards
            // Revert to original material
            const flashMaterial = new THREE.MeshStandardMaterial({
                color: 0xffffdd,
                emissive: 0xaaaa88,
                emissiveIntensity: 0.2,
                roughness: 0.3
             });
            const flash = new THREE.Mesh(flashGeometry, flashMaterial);
            flash.castShadow = false; // Disable shadow casting for flash
            flash.renderOrder = 1; // Ensure flash renders after phone body
            // Adjust flash position: Left of cluster, aligned with bottom lens
            const flashX = cameraClusterX - 1.0; // Move further left
            const flashY = cameraClusterY - 0.5; // Align with bottom lens
            flash.position.set(flashX, flashY, flashZ);
            phone.add(flash);

            // Add inner flash detail - Make it more visible
            const flashDetailGeometry = new THREE.CircleGeometry(flashDetailSize, 32);
            const flashDetailMaterial = materials.cameraLens.clone(); // Use a darker lens material
            flashDetailMaterial.color.set(0xeeeecc); // Lighter base color for detail
            flashDetailMaterial.emissive.set(0xffffaa); // Brighter yellow emissive for detail
            flashDetailMaterial.emissiveIntensity = 0.5; // Increased intensity
            const flashDetail = new THREE.Mesh(flashDetailGeometry, flashDetailMaterial);
            // Position detail slightly in front of the flash cylinder's front face
            const flashDetailZ = flashZ - flashDepth / 2 - flashDetailOffset; 
            flashDetail.position.set(flashX, flashY, flashDetailZ);
            flashDetail.renderOrder = 3; // Render detail last to ensure visibility
            phone.add(flashDetail);


            // Flash rim - Adjusted position and Z correction for new size and detail
            const flashRimGeometry = new THREE.RingGeometry(flashSize, flashSize + 0.035, 32); // Slightly thinner rim
            const flashRim = new THREE.Mesh(flashRimGeometry, materials.camera);
            flashRim.renderOrder = 2; // Render rim after flash body but before detail
            // Position rim exactly at the flash cylinder's front face, slightly behind detail
            const flashRimZ = flashDetailZ - 0.0005; 
            flashRim.position.set(flashX, flashY, flashRimZ);
            phone.add(flashRim);

            // Add simple logo on the back
            const logoWidth = 1.0;
            const logoHeight = 0.5;
            const logoGeometry = new THREE.PlaneGeometry(logoWidth, logoHeight);
            const logoMaterial = materials.accent.clone(); // Use accent material
            logoMaterial.side = THREE.FrontSide;
            const logo = new THREE.Mesh(logoGeometry, logoMaterial);
            // Position logo on the back, slightly OUTSIDE back surface
            logo.position.set(0, -height / 4, backSurfaceZ - backElementOffset - 0.001); 
            // logo.rotation.y = Math.PI; // No need to rotate PlaneGeometry if created facing +Z
            phone.add(logo);

            // --- Side Buttons Fix ---
            const addButton = (y: number, h: number, isRight: boolean = true) => {
                const buttonDepth = 0.1; // How much button protrudes
                const buttonGeometry = new THREE.BoxGeometry(buttonDepth, h, 0.25);
                const button = new THREE.Mesh(buttonGeometry, materials.buttons);
                const x = isRight ? width / 2 : -width / 2;
                // Position center of button exactly on the side surface + half its depth outwards
                button.position.set(x + (isRight ? buttonDepth / 2 : -buttonDepth / 2), y, 0); 
                button.castShadow = true;
                phone.add(button);
            };
            
            addButton(1, 1.2, true);   
            addButton(2, 0.8, false);  
            addButton(0.8, 0.8, false); 
            
            // --- Bottom Ports Centering Fix ---
            const addPort = (x: number, w: number) => {
                const portDepth = 0.1; // How deep the port indentation is along Z
                const portHeight = 0.07; // Height of the port along Y
                const portGeometry = new THREE.BoxGeometry(w, portHeight, portDepth);
                const port = new THREE.Mesh(portGeometry, materials.port);
                // Position:
                // x: As provided
                // y: Center the port height (portHeight) on the bottom edge (y = -height / 2)
                // z: Center the port depth (portDepth) so its front face is at z=0 and it extends inwards to z = -portDepth
                port.position.set(x, -height / 2, -portDepth / 2);
                // Indentations don't usually cast shadows this way
                // port.castShadow = true; 
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
        window.addEventListener('keydown', (event) => {
            if (event.key === 'w') {
                toggleWireframe();
            }
            else if (event.key === 'd') {
                toggleDarkMode();
            }
        });

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
            window.removeEventListener('keydown', (event) => {
                if (event.key === 'w') toggleWireframe();
                if (event.key === 'd') toggleDarkMode();
            });
            mountRef.current?.removeChild(renderer.domElement);
        };
    }, [isDarkMode]);

    // Apply dark mode when state changes
    useEffect(() => {
        updateMaterials(isDarkMode);
    }, [isDarkMode]);

    return (
        <div style={{ background: isDarkMode ? '#001208' : '#f0f0f0', height: '100vh', width: '100vw' }}>
            <div ref={mountRef} style={{ width: '100%', height: '100vh' }} />
            <div className="info" style={{ 
                position: 'absolute', 
                top: '10px', 
                left: '10px',
                padding: '10px',
                background: isDarkMode ? 'rgba(0,40,20,0.7)' : 'rgba(255,255,255,0.7)',
                color: isDarkMode ? '#88ffaa' : '#333',
                borderRadius: '4px',
                boxShadow: isDarkMode ? '0 0 8px #00aa66' : '0 0 5px rgba(0,0,0,0.2)',
            }}>
                <p>Modern Smartphone with IoT Control Dashboard</p>
                <p>Press W to toggle wireframe mode</p>
                <p>Press D to toggle dark mode</p>
                <p>Use mouse to orbit, zoom and pan</p>
                <button 
                    onClick={toggleDarkMode} 
                    style={{
                        background: isDarkMode ? '#007744' : '#2266cc',
                        color: 'white',
                        border: 'none',
                        padding: '5px 10px',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        marginTop: '5px',
                        boxShadow: isDarkMode ? '0 0 5px #00aa66' : 'none',
                    }}
                >
                    {isDarkMode ? 'Light Mode' : 'Dark Mode'}
                </button>
            </div>
        </div>
    );
}
