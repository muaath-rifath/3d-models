'use client';
import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

type BladeServerProps = {
  isDarkMode?: boolean;
  width?: number;
  height?: number;
}

export default function BladeServer({ isDarkMode = false, width = 500, height = 400 }: BladeServerProps) {
    const mountRef = useRef<HTMLDivElement>(null);
    const serverRef = useRef<THREE.Group | null>(null);
    const sceneRef = useRef<THREE.Scene | null>(null);
    
    useEffect(() => {
        if (!mountRef.current) return;
        
        const currentMount = mountRef.current;
        
        // Create scene
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(isDarkMode ? 0x081208 : 0xf0f4f0);
        sceneRef.current = scene;
        
        // Create camera
        const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
        camera.position.set(0, 0, 50);
        
        // Create renderer with better shadows and effects
        const renderer = new THREE.WebGLRenderer({ 
            antialias: true,
            alpha: true,
            powerPreference: "high-performance"
        });
        renderer.setSize(width, height);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        
        // Fix for compatibility with different Three.js versions
        try {
            // For newer versions
            if ('outputColorSpace' in renderer) {
                (renderer as any).outputColorSpace = THREE.SRGBColorSpace;
            } 
            // For older versions
            else if ('outputEncoding' in renderer) {
                (renderer as any).outputEncoding = THREE.SRGBColorSpace;
            }
        } catch (e) {
            console.warn("Could not set renderer color space", e);
        }
        
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.2;
        currentMount.appendChild(renderer.domElement);
        
        // Add orbit controls with better defaults
        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;
        controls.minDistance = 20;
        controls.maxDistance = 100;
        
        // Lighting setup for more realistic look
        const ambientLight = new THREE.AmbientLight(
          isDarkMode ? 0x445544 : 0x909090,
          isDarkMode ? 0.4 : 0.8
        );
        scene.add(ambientLight);
        
        const mainLight = new THREE.DirectionalLight(
          isDarkMode ? 0xaaffcc : 0xffffff,
          isDarkMode ? 0.7 : 0.9
        );
        mainLight.position.set(10, 10, 10);
        mainLight.castShadow = true;
        mainLight.shadow.mapSize.width = 1024;
        mainLight.shadow.mapSize.height = 1024;
        scene.add(mainLight);
        
        // Add subtle rim light to highlight edges
        const rimLight = new THREE.DirectionalLight(
          isDarkMode ? 0x00ffaa : 0xccffff,
          isDarkMode ? 0.3 : 0.2
        );
        rimLight.position.set(-10, 5, -10);
        scene.add(rimLight);
        
        // Create blade server rack
        const serverGroup = new THREE.Group();
        
        // Rack dimensions and materials
        const rackWidth = 30;
        const rackHeight = 20;
        const rackDepth = 8;
        
        // Materials
        const rackMaterial = new THREE.MeshStandardMaterial({
            color: isDarkMode ? 0x223322 : 0x444444,
            roughness: 0.7,
            metalness: 0.8,
            name: 'rack'
        });
        
        const serverMaterial = new THREE.MeshStandardMaterial({
            color: isDarkMode ? 0x003322 : 0x333333,
            roughness: 0.6,
            metalness: 0.9,
            name: 'server'
        });
        
        const frontPanelMaterial = new THREE.MeshStandardMaterial({
            color: isDarkMode ? 0x009977 : 0x555555,
            roughness: 0.5,
            metalness: 0.7,
            name: 'front_panel'
        });
        
        const ledMaterial = new THREE.MeshStandardMaterial({
            color: 0x00ff88,
            emissive: 0x00ff88,
            emissiveIntensity: 0.8,
            roughness: 0.2,
            metalness: 0.9,
            name: 'led'
        });
        
        // Create rack casing
        const rackGeometry = new THREE.BoxGeometry(rackWidth, rackHeight, rackDepth);
        const rack = new THREE.Mesh(rackGeometry, rackMaterial);
        rack.castShadow = true;
        rack.receiveShadow = true;
        serverGroup.add(rack);
        
        // Create individual blade servers
        const serverCount = 8;
        const serverHeight = 1.8;
        const serverSpacing = 0.2;
        
        for (let i = 0; i < serverCount; i++) {
            const y = (rackHeight / 2) - 2 - i * (serverHeight + serverSpacing);
            
            // Server blade
            const bladeGeometry = new THREE.BoxGeometry(rackWidth - 1, serverHeight, rackDepth - 0.5);
            const blade = new THREE.Mesh(bladeGeometry, serverMaterial);
            blade.position.set(0, y, 0);
            blade.castShadow = true;
            blade.receiveShadow = true;
            
            // Front panel with details
            const frontPanelGeometry = new THREE.BoxGeometry(rackWidth - 1, serverHeight, 0.2);
            const frontPanel = new THREE.Mesh(frontPanelGeometry, frontPanelMaterial);
            frontPanel.position.set(0, y, rackDepth / 2 - 0.1);
            frontPanel.castShadow = true;
            
            // Add LED indicators
            const ledGeometry = new THREE.CircleGeometry(0.1, 16);
            
            // Power LED
            const powerLED = new THREE.Mesh(ledGeometry, ledMaterial);
            powerLED.position.set(-rackWidth / 2 + 1, y, rackDepth / 2 + 0.01);
            powerLED.rotation.set(0, 0, 0);
            serverGroup.add(powerLED);
            
            // Activity LED - different color
            const activityLEDMaterial = ledMaterial.clone();
            activityLEDMaterial.color.set(0x00ffdd);
            activityLEDMaterial.emissive.set(0x00ffdd);
            
            const activityLED = new THREE.Mesh(ledGeometry, activityLEDMaterial);
            activityLED.position.set(-rackWidth / 2 + 1.5, y, rackDepth / 2 + 0.01);
            serverGroup.add(activityLED);
            
            // Network ports
            for (let p = 0; p < 2; p++) {
                const portGeometry = new THREE.BoxGeometry(0.8, 0.4, 0.1);
                const portMaterial = new THREE.MeshStandardMaterial({
                    color: isDarkMode ? 0x006655 : 0xaaaaaa,
                    roughness: 0.6,
                    metalness: 0.8,
                    name: 'port'
                });
                const port = new THREE.Mesh(portGeometry, portMaterial);
                port.position.set(rackWidth / 2 - 2 - p * 1.2, y, rackDepth / 2 + 0.01);
                serverGroup.add(port);
            }
            
            // Server handles
            const handleGeometry = new THREE.CylinderGeometry(0.2, 0.2, 0.8, 8);
            const handleMaterial = new THREE.MeshStandardMaterial({
                color: isDarkMode ? 0x77ccbb : 0x888888,
                roughness: 0.3,
                metalness: 0.9,
                name: 'handle'
            });
            
            // Left handle
            const leftHandle = new THREE.Mesh(handleGeometry, handleMaterial);
            leftHandle.rotation.set(0, 0, Math.PI / 2);
            leftHandle.position.set(-rackWidth / 2 + 0.6, y, rackDepth / 2 - 0.1);
            serverGroup.add(leftHandle);
            
            // Right handle
            const rightHandle = new THREE.Mesh(handleGeometry, handleMaterial);
            rightHandle.rotation.set(0, 0, Math.PI / 2);
            rightHandle.position.set(rackWidth / 2 - 0.6, y, rackDepth / 2 - 0.1);
            serverGroup.add(rightHandle);
            
            serverGroup.add(blade);
            serverGroup.add(frontPanel);
        }
        
        // Add ventilation grilles to the sides
        const ventDensity = 10;
        const ventSize = 0.3;
        
        for (let vx = -4; vx <= 4; vx++) {
            for (let vy = -4; vy <= 4; vy++) {
                // Skip some vents for variation
                if ((vx + vy) % 3 === 0) continue;
                
                // Create vent holes on sides
                const ventGeometry = new THREE.CircleGeometry(ventSize, 8);
                const ventMaterial = new THREE.MeshStandardMaterial({
                    color: isDarkMode ? 0x112211 : 0x222222,
                    roughness: 0.9,
                    metalness: 0.2
                });
                
                // Left side vents
                const leftVent = new THREE.Mesh(ventGeometry, ventMaterial);
                leftVent.position.set(-rackWidth / 2 - 0.01, vx * 2, vy * 1.5);
                leftVent.rotation.set(0, Math.PI / 2, 0);
                serverGroup.add(leftVent);
                
                // Right side vents
                const rightVent = new THREE.Mesh(ventGeometry, ventMaterial);
                rightVent.position.set(rackWidth / 2 + 0.01, vx * 2, vy * 1.5);
                rightVent.rotation.set(0, -Math.PI / 2, 0);
                serverGroup.add(rightVent);
            }
        }
        
        // Add rack mounting rails
        const railGeometry = new THREE.BoxGeometry(rackWidth + 2, 0.5, 0.5);
        const railMaterial = new THREE.MeshStandardMaterial({
            color: isDarkMode ? 0x444444 : 0x777777,
            roughness: 0.4,
            metalness: 0.8
        });
        
        // Top rail
        const topRail = new THREE.Mesh(railGeometry, railMaterial);
        topRail.position.set(0, rackHeight / 2 + 0.25, 0);
        serverGroup.add(topRail);
        
        // Bottom rail
        const bottomRail = new THREE.Mesh(railGeometry, railMaterial);
        bottomRail.position.set(0, -rackHeight / 2 - 0.25, 0);
        serverGroup.add(bottomRail);
        
        serverGroup.position.set(0, 0, 0);
        scene.add(serverGroup);
        serverRef.current = serverGroup;
        
        // Animation loop with smooth animations
        const animate = () => {
            requestAnimationFrame(animate);
            controls.update();
            renderer.render(scene, camera);
        };
        
        animate();
        
        // Handle window resize
        const handleResize = () => {
            camera.aspect = width / height;
            camera.updateProjectionMatrix();
            renderer.setSize(width, height);
        };
        
        window.addEventListener('resize', handleResize);
        
        // Cleanup function
        return () => {
            window.removeEventListener('resize', handleResize);
            if (currentMount.contains(renderer.domElement)) {
                currentMount.removeChild(renderer.domElement);
            }
            
            // Properly dispose of materials and geometries
            scene.traverse((object) => {
                if (object instanceof THREE.Mesh) {
                    if (object.geometry) {
                        object.geometry.dispose();
                    }
                    
                    if (Array.isArray(object.material)) {
                        object.material.forEach(material => material.dispose());
                    } else if (object.material) {
                        object.material.dispose();
                    }
                }
            });
            
            // No need to cancel animation frame as we're not storing the ID
        };
    }, [isDarkMode, width, height]);
    
    return (
        <div ref={mountRef} style={{ width, height }} />
    );
}