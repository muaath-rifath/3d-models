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
            const cornerRadius = 0.7; // Rounded corners
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
            
            // --- Screen and UI Layering Fix ---
            // Increase Z offsets slightly to avoid z-fighting with the body
            const screenHeight = height - 0.4;
            const screenWidth = width - 0.3;
            const screenSurfaceZ = thickness / 2 + 0.005; // Increased offset
            const frontCameraZ = screenSurfaceZ + 0.001; 
            const uiElementZ = screenSurfaceZ + 0.002; 
            const panelZ = uiElementZ + 0.001; // Define panelZ once here

            const screenShape = new THREE.Shape();
             // Define screen shape centered around (0,0)
            screenShape.moveTo(-screenWidth / 2 + cornerRadius, -screenHeight / 2);
            screenShape.lineTo(screenWidth / 2 - cornerRadius, -screenHeight / 2);
            screenShape.quadraticCurveTo(screenWidth / 2, -screenHeight / 2, screenWidth / 2, -screenHeight / 2 + cornerRadius);
            screenShape.lineTo(screenWidth / 2, screenHeight / 2 - cornerRadius);
            screenShape.quadraticCurveTo(screenWidth / 2, screenHeight / 2, screenWidth / 2 - cornerRadius, screenHeight / 2);
            screenShape.lineTo(-screenWidth / 2 + cornerRadius, screenHeight / 2);
            screenShape.quadraticCurveTo(-screenWidth / 2, screenHeight / 2, -screenWidth / 2, screenHeight / 2 - cornerRadius);
            screenShape.lineTo(-screenWidth / 2, -screenHeight / 2 + cornerRadius);
            screenShape.quadraticCurveTo(-screenWidth / 2, -screenHeight / 2, -screenWidth / 2 + cornerRadius, -screenHeight / 2);
            
            // Create a hole for the notch
            const notchWidth = 1.5;
            const notchHeight = 0.5;
            const notchShape = new THREE.Shape();
            // Define notch shape relative to screen center
            notchShape.moveTo(-notchWidth/2, screenHeight/2);
            notchShape.lineTo(notchWidth/2, screenHeight/2);
            notchShape.lineTo(notchWidth/2, screenHeight/2 - notchHeight);
            notchShape.bezierCurveTo(
                notchWidth/2 - 0.2, screenHeight/2 - notchHeight - 0.1,
                -notchWidth/2 + 0.2, screenHeight/2 - notchHeight - 0.1,
                -notchWidth/2, screenHeight/2 - notchHeight
            );
            notchShape.lineTo(-notchWidth/2, screenHeight/2);
            screenShape.holes.push(notchShape);
            
            // Use PlaneGeometry for the screen surface, positioned exactly
            const screenGeometry = new THREE.ShapeGeometry(screenShape);
            const screen = new THREE.Mesh(screenGeometry, materials.screen);
            screen.position.z = screenSurfaceZ; 
            phone.add(screen);
            
            // Notch fill, positioned exactly at the screen surface
            const notchGeometry = new THREE.ShapeGeometry(notchShape);
            const notch = new THREE.Mesh(notchGeometry, materials.notch);
            notch.position.z = screenSurfaceZ;
            phone.add(notch);
            
            // --- Front Camera Visibility Fix ---
            const selfieCameraGeometry = new THREE.CircleGeometry(0.25, 32);
            const selfieCamera = new THREE.Mesh(selfieCameraGeometry, materials.selfieCamera);
            selfieCamera.position.set(0, screenHeight/2 - 0.25, frontCameraZ);
            phone.add(selfieCamera);
            
            const depthSensorGeometry = new THREE.CircleGeometry(0.12, 32);
            const depthSensor = new THREE.Mesh(depthSensorGeometry, materials.cameraLens);
            depthSensor.position.set(0.4, screenHeight/2 - 0.25, frontCameraZ);
            phone.add(depthSensor);
            
            // --- UI Element Layering Fix ---
            const createUIElement = (x: number, y: number, w: number, h: number, material: THREE.Material) => {
                const uiGeometry = new THREE.PlaneGeometry(w, h);
                const uiElement = new THREE.Mesh(uiGeometry, material);
                uiElement.position.set(x, y, uiElementZ); // Use consistent Z
                return uiElement;
            };
            
            // Create text element (simulated) - ensure correct Z
            const createTextElement = (x: number, y: number, width: number, height: number) => {
                const textGroup = new THREE.Group();
                const lineHeight = 0.12;
                const marginTop = 0.1;
                const numLines = Math.floor((height - marginTop) / (lineHeight * 1.5));
                const textLineZ = uiElementZ + 0.001; // Slightly above UI background

                for (let i = 0; i < numLines; i++) {
                    const lineWidth = width * (0.7 + Math.random() * 0.3);
                    const lineGeometry = new THREE.PlaneGeometry(lineWidth, lineHeight);
                    const line = new THREE.Mesh(lineGeometry, materials.textElement);
                    line.position.set(
                        x + (width - lineWidth) / 2 - width/2, // Adjust x for centering
                        y + height/2 - marginTop - i * lineHeight * 1.5 - lineHeight/2, // Adjust y for centering
                        textLineZ
                    );
                    textGroup.add(line);
                }
                return textGroup;
            };
            
            // Status bar
            const statusBar = createUIElement(0, screenHeight / 2 - 0.25, screenWidth, 0.5, materials.uiElement);
            phone.add(statusBar);
            
            // Status icons (battery, wifi, signal)
            const iconSize = 0.2;
            const iconSpacing = 0.4;
            for (let i = 0; i < 3; i++) {
                const icon = createUIElement(
                    screenWidth / 2 - 0.5 - i * iconSpacing, 
                    screenHeight / 2 - 0.25, 
                    iconSize, 
                    iconSize, 
                    materials.accent
                );
                phone.add(icon);
            }
            
            // Main dashboard area
            const dashboardWidth = screenWidth - 0.5;
            const dashboardHeight = 5.5;
            const dashboardY = screenHeight / 2 - dashboardHeight / 2 - 1;
            const dashboardMaterial = new THREE.MeshStandardMaterial({
                // ... dashboard material properties ...
                color: isDarkMode ? 0x003322 : 0xeeffff,
                roughness: 0.3,
                metalness: 0.2,
                transparent: true,
                opacity: 0.85,
                emissive: isDarkMode ? 0x001a11 : 0x000000,
                emissiveIntensity: isDarkMode ? 0.3 : 0,
                side: THREE.FrontSide // Ensure it only renders on the front
            });
            const dashboard = createUIElement(0, dashboardY, dashboardWidth, dashboardHeight, dashboardMaterial);
            phone.add(dashboard);
            
            // --- Graph and Device Status Visibility Fix ---
            // Temperature graph
            const createTemperatureGraph = () => {
                const graph = new THREE.Group();
                const graphWidth = 3.8;
                const graphHeight = 2.6;
                
                // Graph background
                const bgGeometry = new THREE.PlaneGeometry(graphWidth, graphHeight);
                const bgMaterial = new THREE.MeshStandardMaterial({
                    // ... bg material properties ...
                    color: isDarkMode ? 0x002a1a : 0xecfff5,
                    transparent: true,
                    opacity: 0.8,
                    metalness: 0.1, 
                    roughness: 0.5,
                    side: THREE.FrontSide
                });
                const bg = new THREE.Mesh(bgGeometry, bgMaterial);
                graph.add(bg); // Add background first
                
                // Graph title
                const titleGeometry = new THREE.PlaneGeometry(graphWidth - 0.2, 0.4);
                const titleMaterial = new THREE.MeshStandardMaterial({
                    // ... title material properties ...
                    name: 'text_element',
                    color: isDarkMode ? 0xeeffee : 0xffffff,
                    emissive: isDarkMode ? 0xccffcc : 0x000000,
                    emissiveIntensity: isDarkMode ? 0.7 : 0.0,
                    metalness: 0.1,
                    roughness: 0.2,
                    side: THREE.FrontSide
                });
                const title = new THREE.Mesh(titleGeometry, titleMaterial);
                title.position.y = graphHeight/2 - 0.3; // Position relative to background
                title.position.z = 0.001; // Slightly above background
                graph.add(title);
                
                // Graph line and points
                const points = [];
                const numPoints = 20;
                const plotWidth = graphWidth - 0.4;
                const plotHeight = graphHeight - 1.0;
                
                for (let i = 0; i < numPoints; i++) {
                    const x = (i / (numPoints - 1)) * plotWidth - plotWidth / 2;
                    const y = Math.sin(i * 0.5) * (plotHeight/2.5) + Math.random() * 0.15 - plotHeight/4; // Scale y to fit
                    points.push(new THREE.Vector2(x, y));
                }
                
                const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
                const lineMaterial = new THREE.LineBasicMaterial({ color: isDarkMode ? 0x66ffbb : 0x009977 });
                const line = new THREE.Line(lineGeometry, lineMaterial);
                line.position.z = 0.002; // Above title
                graph.add(line);
                
                // Add dots
                for (let i = 0; i < points.length; i += 3) {
                    const dotGeometry = new THREE.CircleGeometry(0.07, 16);
                    const dotMaterial = new THREE.MeshStandardMaterial({
                        // ... dot material properties ...
                        name: 'graph_element',
                        color: isDarkMode ? 0x88ffcc : 0x00dd99,
                        emissive: isDarkMode ? 0x44ffaa : 0x00aa77,
                        emissiveIntensity: isDarkMode ? 1.0 : 0.5,
                        metalness: 0.1,
                        roughness: 0.2,
                        side: THREE.FrontSide
                    });
                    const dot = new THREE.Mesh(dotGeometry, dotMaterial);
                    dot.position.set(points[i].x, points[i].y, 0.003); // Above line
                    graph.add(dot);
                }
                
                // Add axis lines
                const axisMaterial = materials.uiElement.clone();
                axisMaterial.side = THREE.FrontSide;
                const xAxisGeometry = new THREE.PlaneGeometry(plotWidth, 0.05);
                const xAxis = new THREE.Mesh(xAxisGeometry, axisMaterial);
                xAxis.position.y = -plotHeight/2 - 0.2;
                xAxis.position.z = 0.001;
                graph.add(xAxis);
                
                const yAxisGeometry = new THREE.PlaneGeometry(0.05, plotHeight);
                const yAxis = new THREE.Mesh(yAxisGeometry, axisMaterial);
                yAxis.position.x = -plotWidth/2;
                yAxis.position.z = 0.001;
                graph.add(yAxis);
                
                return graph;
            };
            
            // Device status indicators
            const createDeviceStatus = () => {
                const statusGroup = new THREE.Group();
                const panelWidth = 3.8;
                const panelHeight = 2.6;

                // Container
                const containerGeometry = new THREE.PlaneGeometry(panelWidth, panelHeight);
                const containerMaterial = new THREE.MeshStandardMaterial({
                    // ... container material properties ...
                    color: isDarkMode ? 0x001a33 : 0xf0f8ff,
                    transparent: true,
                    opacity: 0.8,
                    metalness: 0.1,
                    roughness: 0.5,
                    side: THREE.FrontSide
                });
                const container = new THREE.Mesh(containerGeometry, containerMaterial);
                statusGroup.add(container); // Add background first

                // Title
                const titleGeometry = new THREE.PlaneGeometry(panelWidth - 0.2, 0.4);
                const titleMaterial = new THREE.MeshStandardMaterial({
                    // ... title material properties ...
                    name: 'text_element',
                    color: isDarkMode ? 0xeeffee : 0xffffff,
                    emissive: isDarkMode ? 0xccffcc : 0x000000,
                    emissiveIntensity: isDarkMode ? 0.7 : 0.0,
                    side: THREE.FrontSide
                });
                const title = new THREE.Mesh(titleGeometry, titleMaterial);
                title.position.y = panelHeight/2 - 0.3;
                title.position.z = 0.001; // Above background
                statusGroup.add(title);

                // Define interface for device data
                interface DeviceStatus {
                    color: number;
                    status: boolean;
                }

                // Device circles and indicators
                const deviceSize = 0.4;
                const deviceSpacing = 1.0;
                // Explicitly type the devices array
                const devices: DeviceStatus[] = [
                    { color: 0x44ddff, status: true },
                    { color: 0xffaa44, status: false },
                    { color: 0x66ffaa, status: true },
                    { color: 0xff6644, status: true },
                    { color: 0xaa88ff, status: false },
                    { color: 0xffdd44, status: true },
                ];
                let index = 0;
                const itemZOffset = 0.002; // Z offset for items above background

                for (let row = 0; row < 2; row++) {
                    for (let col = 0; col < 3; col++) {
                        if (index < devices.length) {
                            const device = devices[index];
                            const circleX = (col - 1) * deviceSpacing;
                            const circleY = (panelHeight/2 - 1.0) - row * deviceSpacing; // Position relative to panel center

                            // Device circle
                            const circleGeometry = new THREE.CircleGeometry(deviceSize, 32);
                            const circleMaterial = new THREE.MeshStandardMaterial({
                                // ... circle material properties ...
                                color: device.color,
                                transparent: true,
                                opacity: 0.9,
                                emissive: device.color,
                                emissiveIntensity: isDarkMode ? 0.3 : 0.1,
                                side: THREE.FrontSide
                            });
                            const circle = new THREE.Mesh(circleGeometry, circleMaterial);
                            circle.position.set(circleX, circleY, itemZOffset);
                            statusGroup.add(circle);

                            // Status indicator
                            const statusGeometry = new THREE.CircleGeometry(0.12, 16);
                            const statusMaterial = new THREE.MeshStandardMaterial({
                                // ... status material properties ...
                                color: device.status ? 0x44ff66 : 0xff4422,
                                emissive: device.status ? 0x22cc44 : 0xcc2211,
                                emissiveIntensity: isDarkMode ? 0.8 : 0.5,
                                side: THREE.FrontSide
                            });
                            const statusIndicator = new THREE.Mesh(statusGeometry, statusMaterial);
                            statusIndicator.position.set(circleX + deviceSize * 0.7, circleY + deviceSize * 0.7, itemZOffset + 0.001);
                            statusGroup.add(statusIndicator);

                            // Label
                            const labelGeometry = new THREE.PlaneGeometry(deviceSize * 2.0, deviceSize * 0.6);
                            const labelMaterial = materials.textElement.clone();
                            labelMaterial.side = THREE.FrontSide;
                            const label = new THREE.Mesh(labelGeometry, labelMaterial);
                            label.position.set(circleX, circleY - deviceSize * 0.9, itemZOffset);
                            statusGroup.add(label);
                        }
                        index++;
                    }
                }
                return statusGroup;
            };

            // Position panels correctly on the screen surface
            const panelY = screenHeight/4 - 1;
            const panelXOffset = screenWidth/4 + 0.2; // Adjust spacing

            const tempGraph = createTemperatureGraph();
            tempGraph.position.set(-panelXOffset, panelY, panelZ);
            phone.add(tempGraph);
            
            const deviceStatus = createDeviceStatus();
            deviceStatus.position.set(panelXOffset, panelY, panelZ);
            phone.add(deviceStatus);
            
            // Text information section
            const textSection = createTextElement(0, -screenHeight/4 - 0.5, screenWidth - 0.8, 3);
            phone.add(textSection); // This group already handles internal Z positioning

            // Bottom navigation bar
            const navBarMaterial = new THREE.MeshStandardMaterial({ /* ... navBarMaterial properties ... */ });
            navBarMaterial.side = THREE.FrontSide;
            const navBarWidth = screenWidth - 0.2;
            const navBarY = -screenHeight / 2 + 0.5;
            const navBar = createUIElement(0, navBarY, navBarWidth, 1, navBarMaterial);
            phone.add(navBar);
            
            // Navigation icons
            const navIconSize = 0.5;
            const navIcons = 4;
            const totalNavWidth = (navIcons - 1) * 1.2;
            const navIconMaterial = materials.accent.clone();
            navIconMaterial.side = THREE.FrontSide;
            for (let i = 0; i < navIcons; i++) {
                const xPos = -totalNavWidth / 2 + i * 1.2;
                const navIcon = createUIElement(xPos, navBarY, navIconSize, navIconSize, navIconMaterial);
                phone.add(navIcon);
            }
            
            // --- Back Camera Visibility Fix ---
            const backSurfaceZ = -thickness / 2; // Define back surface Z
            const backElementOffset = 0.01; // Small offset to prevent z-fighting and ensure visibility

            // Camera lenses - Adjusted positioning and ring material
            const addCameraLens = (x: number, y: number, size: number) => {
                const housingDepth = 0.08; // How much the housing protrudes
                const ringDepth = 0.02; // Thickness of the ring
                const lensZOffset = 0.005; // Small offset between elements

                // Calculate Z positions relative to the back surface (more negative is further out)
                const housingZ = backSurfaceZ - housingDepth / 2 - backElementOffset; // Move housing outwards
                const ringZ = housingZ - housingDepth / 2 - ringDepth / 2; // Move ring outwards relative to housing
                const lensZ = ringZ - ringDepth / 2 - lensZOffset; // Move lens outwards relative to ring
                const innerLensZ = lensZ - lensZOffset; // Move inner lens outwards
                const highlightZ = innerLensZ - lensZOffset; // Move highlight outwards

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
            const flashSize = 0.3;
            const flashZ = backSurfaceZ - backElementOffset - 0.01; // Position slightly OUTSIDE back surface
            const flashGeometry = new THREE.CircleGeometry(flashSize, 32);
            const flashMaterial = new THREE.MeshStandardMaterial({
                color: 0xffffdd,
                emissive: 0xaaaa88,
                emissiveIntensity: 0.2,
                roughness: 0.3
             });
            const flash = new THREE.Mesh(flashGeometry, flashMaterial);
            // Adjust flash position relative to the new cluster center
            flash.position.set(cameraClusterX + 0.8, cameraClusterY - 0.5, flashZ);
            phone.add(flash);

            // Flash rim - Adjusted position and Z correction
            const flashRimGeometry = new THREE.RingGeometry(flashSize, flashSize + 0.05, 32);
            const flashRim = new THREE.Mesh(flashRimGeometry, materials.camera);
            // Position rim slightly BEHIND flash (less negative Z)
            flashRim.position.set(cameraClusterX + 0.8, cameraClusterY - 0.5, flashZ + 0.001);
            phone.add(flashRim);

            // Add simple logo on the back
            const logoWidth = 1.0;
            const logoHeight = 0.5;
            const logoGeometry = new THREE.PlaneGeometry(logoWidth, logoHeight);
            const logoMaterial = materials.accent.clone(); // Use accent material
            logoMaterial.side = THREE.FrontSide;
            const logo = new THREE.Mesh(logoGeometry, logoMaterial);
            // Position logo on the back, centered horizontally, below cameras
            logo.position.set(0, -height / 4, backSurfaceZ - backElementOffset); // Position slightly OUTSIDE back surface
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
                const portDepth = 0.1; // How deep the port indentation is
                const portGeometry = new THREE.BoxGeometry(w, 0.3, portDepth);
                const port = new THREE.Mesh(portGeometry, materials.port);
                // Position center of port exactly on the bottom surface - half its depth inwards
                port.position.set(x, -height / 2 - 0.15, -portDepth / 2); // Y adjusted slightly for visual centering, Z inwards
                port.castShadow = true;
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
