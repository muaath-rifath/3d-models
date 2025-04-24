'use client';
import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

export default function BladeServer() {
    const mountRef = useRef<HTMLDivElement>(null);
    const [darkMode, setDarkMode] = useState(true);
    
    useEffect(() => {
        if (!mountRef.current) return;
        
        let animationFrameId: number;
        const currentMount = mountRef.current;
        
        // Create scene
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(darkMode ? 0x111111 : 0xffffff);
        
        // Create camera
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.set(0, 0, 50);
        
        // Create renderer with better shadows and effects
        const renderer = new THREE.WebGLRenderer({ 
            antialias: true,
            alpha: true,
            powerPreference: "high-performance"
        });
        renderer.setSize(window.innerWidth, window.innerHeight);
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
        
        // IMPORTANT: Remove all document-level event listeners that were preventing interactions
        
        // Set up orbit controls - simplified configuration
        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;
        controls.minDistance = 5;
        controls.maxDistance = 100;
        controls.enableZoom = true;
        controls.zoomSpeed = 1.2;
        controls.rotateSpeed = 1.5; // Increased for better responsiveness
        controls.enablePan = true;
        controls.enableRotate = true;
        controls.autoRotate = false;
        
        // Main group for all visuals
        const mainGroup = new THREE.Group();
        scene.add(mainGroup);
        
        // Define colors that blend realism with visual appeal
        const primaryColor = new THREE.Color(darkMode ? 0x0055aa : 0x0077cc); // More subdued blue
        const accentColor = new THREE.Color(darkMode ? 0x00aa77 : 0x00cc88); // Slightly muted teal
        const glowColor = new THREE.Color(darkMode ? 0x66ccff : 0x3399ff); // Less intense blue glow
        const chassisColor = new THREE.Color(darkMode ? 0x1e2e33 : 0xcfdee5); // Server chassis color
        
        // Create a realistic blade server chassis
        const createServerChassis = () => {
            const chassisGroup = new THREE.Group();
            
            // Main server enclosure - standard blade server dimensions
            const chassisGeometry = new THREE.BoxGeometry(16, 4, 30);
            const chassisMaterial = new THREE.MeshPhysicalMaterial({
                color: chassisColor,
                metalness: 0.7,
                roughness: 0.3,
                clearcoat: 0.2,
                clearcoatRoughness: 0.2
            });
            const chassis = new THREE.Mesh(chassisGeometry, chassisMaterial);
            chassis.castShadow = true;
            chassis.receiveShadow = true;
            chassisGroup.add(chassis);
            
            // Add ventilation lines on top surface
            const ventCount = 15;
            for (let i = 0; i < ventCount; i++) {
                const ventGeometry = new THREE.BoxGeometry(14, 0.1, 0.2);
                const ventMaterial = new THREE.MeshStandardMaterial({
                    color: darkMode ? 0x111111 : 0x999999,
                    metalness: 0.5,
                    roughness: 0.8
                });
                const vent = new THREE.Mesh(ventGeometry, ventMaterial);
                vent.position.set(0, 2.05, -13 + i * 2);
                chassisGroup.add(vent);
            }
            
            // Add front panel with more detail
            const frontPanel = createServerFrontPanel();
            frontPanel.position.z = 15;
            chassisGroup.add(frontPanel);
            
            // Add rear connectors panel
            const rearPanel = createServerRearPanel();
            rearPanel.position.z = -15;
            chassisGroup.add(rearPanel);
            
            // Add side rails (blade server guide rails)
            const railGeometry = new THREE.BoxGeometry(0.3, 0.6, 28);
            const railMaterial = new THREE.MeshStandardMaterial({
                color: darkMode ? 0x444444 : 0x888888,
                metalness: 0.8,
                roughness: 0.3
            });
            
            const leftRail = new THREE.Mesh(railGeometry, railMaterial);
            leftRail.position.set(-7.85, -1.5, 0);
            chassisGroup.add(leftRail);
            
            const rightRail = new THREE.Mesh(railGeometry, railMaterial);
            rightRail.position.set(7.85, -1.5, 0);
            chassisGroup.add(rightRail);
            
            return chassisGroup;
        };
        
        // Create detailed front panel for server
        const createServerFrontPanel = () => {
            const frontGroup = new THREE.Group();
            
            // Front face plate
            const frontPlateGeometry = new THREE.BoxGeometry(16, 4, 0.5);
            const frontPlateMaterial = new THREE.MeshPhysicalMaterial({
                color: darkMode ? 0x1a2a2e : 0xbfd0d4,
                metalness: 0.6,
                roughness: 0.3
            });
            const frontPlate = new THREE.Mesh(frontPlateGeometry, frontPlateMaterial);
            frontGroup.add(frontPlate);
            
            // Create a simple label with direct text instead of using textures
            // Create a backing plate for the label
            const labelBackingGeometry = new THREE.BoxGeometry(5.5, 1.5, 0.1);
            const labelBackingMaterial = new THREE.MeshStandardMaterial({
                color: darkMode ? 0x333344 : 0xccccdd,
                metalness: 0.7,
                roughness: 0.3
            });
            
            const labelBacking = new THREE.Mesh(labelBackingGeometry, labelBackingMaterial);
            labelBacking.position.set(-5, 0, 0.3); // Position it slightly out from the front panel
            frontGroup.add(labelBacking);
            
            // Remove TextGeometry implementation since it's not available in standard Three.js
            // We'll use the simpler approach with colored segments directly
            
            // Create a visible model badge as colored segments
            const createModelBadge = () => {
                const badgeGroup = new THREE.Group();
                
                // Main badge background
                const bgGeometry = new THREE.BoxGeometry(5, 1.2, 0.05);
                const bgMaterial = new THREE.MeshPhongMaterial({
                    color: darkMode ? 0x222233 : 0xddddee,
                    shininess: 80,
                    specular: darkMode ? 0x4444aa : 0x8888cc
                });
                
                const bg = new THREE.Mesh(bgGeometry, bgMaterial);
                badgeGroup.add(bg);
                
                // Add colored accent line
                const lineGeometry = new THREE.BoxGeometry(5, 0.1, 0.06);
                // Fix: Remove emissive property from MeshBasicMaterial
                const lineMaterial = new THREE.MeshBasicMaterial({
                    color: darkMode ? 0x00aaff : 0x0088cc
                });
                
                const line = new THREE.Mesh(lineGeometry, lineMaterial);
                line.position.y = 0.4;
                badgeGroup.add(line);
                
                // Add model number with individual letter blocks
                const letters = "BLADEX3000".split("");
                const lettersWidth = 4;
                const spacing = lettersWidth / letters.length;
                
                letters.forEach((letter, i) => {
                    // Create a contrasting colored block for each character
                    const letterGeometry = new THREE.BoxGeometry(spacing * 0.7, 0.4, 0.07);
                    // Use MeshStandardMaterial which supports emissive property
                    const letterMaterial = new THREE.MeshStandardMaterial({
                        color: darkMode ? 0xffffff : 0x000000, 
                        emissive: darkMode ? 0x555555 : 0x222222,
                        emissiveIntensity: 0.5
                    });
                    
                    const letterMesh = new THREE.Mesh(letterGeometry, letterMaterial);
                    letterMesh.position.x = -lettersWidth/2 + i * spacing + spacing/2;
                    letterMesh.position.y = 0.1;
                    badgeGroup.add(letterMesh);
                });
                
                // Add SERVER label
                const serverGeometry = new THREE.BoxGeometry(2, 0.25, 0.07);
                // Use MeshStandardMaterial which supports shininess-like properties
                const serverMaterial = new THREE.MeshStandardMaterial({
                    color: darkMode ? 0xcccccc : 0x333333,
                    roughness: 0.3,
                    metalness: 0.7
                });
                
                const serverMesh = new THREE.Mesh(serverGeometry, serverMaterial);
                serverMesh.position.y = -0.3;
                badgeGroup.add(serverMesh);
                
                return badgeGroup;
            };
            
            const modelBadge = createModelBadge();
            modelBadge.position.set(-5, 0, 0.35); // Position it in front of the backing
            frontGroup.add(modelBadge);
            
            // Add a small spotlight to illuminate the label
            const labelLight = new THREE.PointLight(darkMode ? 0xaaaaff : 0xffffff, 0.5, 3);
            labelLight.position.set(-5, 0, 1);
            frontGroup.add(labelLight);
            
            // Status LEDs
            createStatusLED(frontGroup, 6.5, 1, 0x00ff00, 0.8); // Power LED
            createStatusLED(frontGroup, 6.5, 0.5, 0x0088ff, 0.5); // Network LED
            createStatusLED(frontGroup, 6.5, 0, 0xffcc00, 0.3); // Status LED
            createStatusLED(frontGroup, 6.5, -0.5, 0xff0000, 0.15); // Error LED
            
            // Handle for extraction
            const handleBaseGeometry = new THREE.BoxGeometry(2, 0.5, 0.3);
            const handleBaseMaterial = new THREE.MeshStandardMaterial({
                color: accentColor, 
                metalness: 0.5,
                roughness: 0.5
            });
            const handleBase = new THREE.Mesh(handleBaseGeometry, handleBaseMaterial);
            handleBase.position.set(6.5, -1.25, 0.3);
            frontGroup.add(handleBase);
            
            // Handle grip
            const handleGripGeometry = new THREE.CylinderGeometry(0.25, 0.25, 1.8, 8);
            const handleGripMaterial = new THREE.MeshStandardMaterial({ 
                color: accentColor,
                metalness: 0.7,
                roughness: 0.3
            });
            const handleGrip = new THREE.Mesh(handleGripGeometry, handleGripMaterial);
            handleGrip.rotation.set(0, 0, Math.PI/2);
            handleGrip.position.set(6.5, -1.25, 0.6);
            frontGroup.add(handleGrip);
            
            // Drive bays
            for (let i = 0; i < 2; i++) {
                const driveGeometry = new THREE.BoxGeometry(3, 0.8, 0.2);
                const driveMaterial = new THREE.MeshPhysicalMaterial({
                    color: darkMode ? 0x333333 : 0x999999,
                    metalness: 0.7,
                    roughness: 0.3
                });
                const drive = new THREE.Mesh(driveGeometry, driveMaterial);
                drive.position.set(-3, i * 1.2 - 0.5, 0.3);
                frontGroup.add(drive);
                
                // Drive activity LED
                createStatusLED(frontGroup, -4.2, i * 1.2 - 0.5, 0x00ff00, i === 0 ? 0.4 : 0.1, 0.15);
            }
            
            return frontGroup;
        };
        
        // Create rear panel with connectors
        const createServerRearPanel = () => {
            const rearGroup = new THREE.Group();
            
            // Rear plate
            const rearPlateGeometry = new THREE.BoxGeometry(16, 4, 0.5);
            const rearPlateMaterial = new THREE.MeshPhysicalMaterial({
                color: darkMode ? 0x222222 : 0xaaaaaa,
                metalness: 0.7,
                roughness: 0.3
            });
            const rearPlate = new THREE.Mesh(rearPlateGeometry, rearPlateMaterial);
            rearGroup.add(rearPlate);
            
            // Power supply
            const psuGeometry = new THREE.BoxGeometry(5, 3, 0.4);
            const psuMaterial = new THREE.MeshStandardMaterial({
                color: darkMode ? 0x333333 : 0x777777,
                metalness: 0.6,
                roughness: 0.4
            });
            const psu = new THREE.Mesh(psuGeometry, psuMaterial);
            psu.position.set(-5, 0, 0.3);
            rearGroup.add(psu);
            
            // Network ports
            for (let i = 0; i < 4; i++) {
                const portGeometry = new THREE.BoxGeometry(1, 0.5, 0.3);
                const portMaterial = new THREE.MeshStandardMaterial({
                    color: 0x333333,
                    metalness: 0.5,
                    roughness: 0.5
                });
                const port = new THREE.Mesh(portGeometry, portMaterial);
                port.position.set(2 + i * 1.3, 1, 0.3);
                rearGroup.add(port);
            }
            
            // Management port
            const mgmtPortGeometry = new THREE.BoxGeometry(1, 0.5, 0.3);
            const mgmtPortMaterial = new THREE.MeshStandardMaterial({
                color: 0x3366cc,
                metalness: 0.5,
                roughness: 0.5
            });
            const mgmtPort = new THREE.Mesh(mgmtPortGeometry, mgmtPortMaterial);
            mgmtPort.position.set(2, 0, 0.3);
            rearGroup.add(mgmtPort);
            
            // Backplane connector
            const connectorGeometry = new THREE.BoxGeometry(10, 2, 0.4);
            const connectorMaterial = new THREE.MeshStandardMaterial({
                color: 0x222222,
                metalness: 0.6,
                roughness: 0.4
            });
            const connector = new THREE.Mesh(connectorGeometry, connectorMaterial);
            connector.position.set(2, -0.8, 0.3);
            rearGroup.add(connector);
            
            return rearGroup;
        };
        
        // Helper function to create status LEDs
        const createStatusLED = (parent: THREE.Object3D, x: number, y: number, color: number, intensity: number, size: number = 0.2) => {
            const ledGeometry = new THREE.CircleGeometry(size, 16);
            const ledMaterial = new THREE.MeshBasicMaterial({
                color: color,
                transparent: true,
                opacity: 0.9
            });
            const led = new THREE.Mesh(ledGeometry, ledMaterial);
            led.position.set(x, y, 0.26);
            
            // Add subtle glow
            if (intensity > 0.2) {
                const glowGeometry = new THREE.CircleGeometry(size * 2, 16);
                const glowMaterial = new THREE.MeshBasicMaterial({
                    color: color,
                    transparent: true,
                    opacity: 0.3 * intensity,
                    blending: THREE.AdditiveBlending
                });
                const glow = new THREE.Mesh(glowGeometry, glowMaterial);
                glow.position.z = 0.01;
                led.add(glow);
            }
            
            parent.add(led);
            return led;
        };
        
        // Helper to create text textures for labels with better rendering
        const createTextTexture = (mainText: string, subText: string = '', isDark: boolean = true) => {
            const canvas = document.createElement('canvas');
            canvas.width = 512; // Increased resolution
            canvas.height = 128; // Increased resolution
            const ctx = canvas.getContext('2d');
            
            if (ctx) {
                // Background with slight transparency
                ctx.fillStyle = isDark ? 'rgba(40, 40, 40, 0.9)' : 'rgba(220, 220, 220, 0.9)';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                
                // Main text - use a more visible font with better rendering
                ctx.fillStyle = isDark ? '#ffffff' : '#000000';
                ctx.font = 'bold 48px Arial, Helvetica, sans-serif';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(mainText, canvas.width / 2, canvas.height / 2 - (subText ? 24 : 0));
                
                // Sub text if provided
                if (subText) {
                    ctx.font = '28px Arial, Helvetica, sans-serif';
                    ctx.fillText(subText, canvas.width / 2, canvas.height / 2 + 30);
                }
                
                // Add subtle border - make it cleaner
                ctx.strokeStyle = isDark ? '#666666' : '#999999';
                ctx.lineWidth = 4;
                ctx.strokeRect(8, 8, canvas.width - 16, canvas.height - 16);
            }
            
            const texture = new THREE.CanvasTexture(canvas);
            texture.needsUpdate = true;
            texture.minFilter = THREE.LinearFilter; // Improve texture quality
            texture.magFilter = THREE.LinearFilter; // Improve texture quality
            
            // Remove the invalid encoding property
            // Using ColorSpace instead in compatible versions
            try {
                if ('colorSpace' in texture) {
                    (texture as any).colorSpace = THREE.SRGBColorSpace;
                }
            } catch (e) {
                console.warn("Could not set texture color space", e);
            }
            
            return texture;
        };
        
        // Create the server and add internal components
        const serverGroup = new THREE.Group();
        const serverChassis = createServerChassis();
        serverGroup.add(serverChassis);
        
        // REMOVED: Particle system (snow effect) as requested by user
        
        // Create data visualization hologram above the server
        const createDataHologram = () => {
            const hologramGroup = new THREE.Group();
            
            // Base hologram plane
            const hologramGeometry = new THREE.PlaneGeometry(16, 8);
            const hologramMaterial = new THREE.MeshBasicMaterial({
                color: accentColor,
                transparent: true,
                opacity: 0.15,
                side: THREE.DoubleSide
            });
            
            const hologram = new THREE.Mesh(hologramGeometry, hologramMaterial);
            hologram.rotation.x = Math.PI / 2;
            hologram.position.y = 8;
            hologramGroup.add(hologram);
            
            // Add grid lines
            const lineCount = 10;
            const lineSpacing = 16 / lineCount;
            
            for (let i = 0; i <= lineCount; i++) {
                // Horizontal lines
                const hLineGeometry = new THREE.BufferGeometry().setFromPoints([
                    new THREE.Vector3(-8, 8, -4 + i * (8 / lineCount)),
                    new THREE.Vector3(8, 8, -4 + i * (8 / lineCount))
                ]);
                
                const line = new THREE.Line(
                    hLineGeometry,
                    new THREE.LineBasicMaterial({ 
                        color: accentColor,
                        transparent: true, 
                        opacity: 0.3 
                    })
                );
                hologramGroup.add(line);
                
                // Vertical lines
                if (i <= lineCount) {
                    const vLineGeometry = new THREE.BufferGeometry().setFromPoints([
                        new THREE.Vector3(-8 + i * lineSpacing, 8, -4),
                        new THREE.Vector3(-8 + i * lineSpacing, 8, 4)
                    ]);
                    
                    const vLine = new THREE.Line(
                        vLineGeometry,
                        new THREE.LineBasicMaterial({ 
                            color: accentColor,
                            transparent: true, 
                            opacity: 0.3 
                        })
                    );
                    hologramGroup.add(vLine);
                }
            }
            
            // Data bars for visualization
            const barCount = 8;
            for (let i = 0; i < barCount; i++) {
                const height = 1 + Math.random() * 3;
                const barGeometry = new THREE.BoxGeometry(1, height, 1);
                const barMaterial = new THREE.MeshBasicMaterial({
                    color: accentColor,
                    transparent: true,
                    opacity: 0.4
                });
                const bar = new THREE.Mesh(barGeometry, barMaterial);
                bar.position.set(-6 + i * 2, 8 + height/2, 0);
                bar.userData = { originalHeight: height, index: i }; // Store for animation
                hologramGroup.add(bar);
            }
            
            return hologramGroup;
        };
        
        const dataHologram = createDataHologram();
        serverGroup.add(dataHologram);
        
        // Internal components visible through semitransparent top (optional)
        const createInternalComponents = () => {
            const componentsGroup = new THREE.Group();
            
            // Main system board
            const boardGeometry = new THREE.BoxGeometry(14, 0.2, 28);
            const boardMaterial = new THREE.MeshPhysicalMaterial({
                color: darkMode ? 0x112211 : 0x225522,
                metalness: 0.3,
                roughness: 0.8
            });
            const board = new THREE.Mesh(boardGeometry, boardMaterial);
            board.position.y = -1;
            componentsGroup.add(board);
            
            // CPUs
            for (let i = 0; i < 2; i++) {
                const cpuGeometry = new THREE.BoxGeometry(3, 0.4, 3);
                const cpuMaterial = new THREE.MeshPhysicalMaterial({
                    color: darkMode ? 0x444444 : 0x888888,
                    metalness: 0.7,
                    roughness: 0.2
                });
                const cpu = new THREE.Mesh(cpuGeometry, cpuMaterial);
                cpu.position.set(-3.5 + i * 7, -0.7, -5);
                componentsGroup.add(cpu);
                
                // Add heatsink
                const heatsinkGeometry = new THREE.BoxGeometry(3.5, 0.8, 3.5);
                const heatsinkMaterial = new THREE.MeshStandardMaterial({
                    color: 0x777777,
                    metalness: 0.8,
                    roughness: 0.3
                });
                const heatsink = new THREE.Mesh(heatsinkGeometry, heatsinkMaterial);
                heatsink.position.set(-3.5 + i * 7, -0.1, -5);
                componentsGroup.add(heatsink);
                
                // Heatsink fins
                for (let j = 0; j < 6; j++) {
                    const finGeometry = new THREE.BoxGeometry(3.5, 0.6, 0.15);
                    const fin = new THREE.Mesh(finGeometry, heatsinkMaterial);
                    fin.position.set(-3.5 + i * 7, 0.1, -6 + j * 0.4);
                    componentsGroup.add(fin);
                }
            }
            
            // Memory DIMMs
            for (let i = 0; i < 8; i++) {
                const dimmGeometry = new THREE.BoxGeometry(0.3, 1.2, 3);
                const dimmMaterial = new THREE.MeshPhysicalMaterial({
                    color: accentColor,
                    metalness: 0.4,
                    roughness: 0.6
                });
                const dimm = new THREE.Mesh(dimmGeometry, dimmMaterial);
                
                // Position 4 DIMMs on each side of the CPUs
                if (i < 4) {
                    dimm.position.set(-5.5 + i * 0.8, -0.2, -5);
                } else {
                    dimm.position.set(2.5 + (i-4) * 0.8, -0.2, -5);
                }
                componentsGroup.add(dimm);
            }
            
            return componentsGroup;
        };
        
        const internalComponents = createInternalComponents();
        serverGroup.add(internalComponents);
        
        // Add the server to the main group
        mainGroup.add(serverGroup);
        
        // Add environment - subtle platform for the server
        const platformGeometry = new THREE.CylinderGeometry(16, 18, 1, 32);
        const platformMaterial = new THREE.MeshStandardMaterial({
            color: darkMode ? 0x1a1a22 : 0xe0e0e8,
            metalness: 0.7,
            roughness: 0.3,
            emissive: darkMode ? 0x0a0a14 : 0x8080a0,
            emissiveIntensity: 0.2
        });
        const platform = new THREE.Mesh(platformGeometry, platformMaterial);
        platform.position.y = -6;
        platform.receiveShadow = true;
        mainGroup.add(platform);
        
        // Add a subtle ring around the platform
        const ringGeometry = new THREE.RingGeometry(16, 16.3, 64);
        const ringMaterial = new THREE.MeshBasicMaterial({
            color: accentColor,
            transparent: true,
            opacity: 0.7,
            side: THREE.DoubleSide
        });
        const ring = new THREE.Mesh(ringGeometry, ringMaterial);
        ring.rotation.x = -Math.PI / 2;
        ring.position.y = -5.5;
        mainGroup.add(ring);
        
        // Lighting setup for dramatic effect
        const ambientLight = new THREE.AmbientLight(darkMode ? 0x222233 : 0x666677, 0.5);
        scene.add(ambientLight);
        
        // Main dramatic light
        const mainLight = new THREE.SpotLight(0xffffff, 1, 100, Math.PI / 6, 0.5, 1);
        mainLight.position.set(0, 30, 10);
        mainLight.castShadow = true;
        mainLight.shadow.mapSize.width = 2048;
        mainLight.shadow.mapSize.height = 2048;
        mainLight.shadow.camera.near = 1;
        mainLight.shadow.camera.far = 100;
        scene.add(mainLight);
        
        // Create colored accent lights
        const createAccentLight = (color: THREE.Color, position: THREE.Vector3, intensity: number) => {
            const light = new THREE.PointLight(color, intensity, 30);
            light.position.copy(position);
            return light;
        };
        
        // Add multiple colored accent lights around the scene
        scene.add(createAccentLight(primaryColor, new THREE.Vector3(15, 5, 15), 1));
        scene.add(createAccentLight(accentColor, new THREE.Vector3(-15, 8, -15), 1));
        
        // Animation loop
        let time = 0;

        // Define the animateHologram function
        const animateHologram = (hologram: THREE.Group, time: number) => {
            hologram.children.forEach(child => {
                if (child instanceof THREE.Mesh && child.userData && child.userData.originalHeight) {
                    // Animate the height of data bars
                    const newHeight = child.userData.originalHeight + Math.sin(time * 2 + child.userData.index) * 0.5;
                    child.scale.y = newHeight / child.userData.originalHeight;
                    
                    // Adjust position since scaling occurs from center
                    const heightDiff = (newHeight - child.userData.originalHeight) / 2;
                    child.position.y = 8 + child.userData.originalHeight/2 + heightDiff;
                }
                
                // Add subtle rotation to the entire hologram
                if (child instanceof THREE.Mesh && child.geometry instanceof THREE.PlaneGeometry) {
                    child.rotation.z = Math.sin(time * 0.5) * 0.05;
                }
            });
        };
        
        const animate = () => {
            time += 0.01;
            
            // REMOVED: Particle animation
            
            // Animate hologram
            animateHologram(dataHologram, time);
            
            // Subtle pulsing effect on the platform ring
            ringMaterial.opacity = 0.6 + Math.sin(time) * 0.1;
            
            // REMOVED: Mouse-based rotation to prevent conflicts with OrbitControls
            
            // Animate status LEDs on the front panel
            const frontPanel = serverChassis.children.find(child => child.position.z === 15);
            if (frontPanel) {
                frontPanel.children.forEach(child => {
                    if (child instanceof THREE.Mesh && 
                        child.material instanceof THREE.MeshBasicMaterial && 
                        'emissiveIntensity' in child.material) {
                        
                        // Make network LED blink
                        if (child.position.y === 0.5) {
                            child.material.emissiveIntensity = 0.3 + Math.sin(time * 3) * 0.2;
                        }
                        
                        // Make drive activity LED occasionally flash
                        if (child.position.y === -0.5 && child.position.x === -4.2) {
                            child.material.emissiveIntensity = 
                                Math.sin(time * 5) > 0.9 ? 0.8 : 0.1;
                        }
                    }
                });
            }
            
            controls.update(); // This is crucial for controls to work properly
            renderer.render(scene, camera);
            animationFrameId = requestAnimationFrame(animate);
        };
        
        animate();
        
        // Handle window resize
        const handleResize = () => {
            if (!currentMount) return;
            
            const width = window.innerWidth;
            const height = window.innerHeight;
            
            camera.aspect = width / height;
            camera.updateProjectionMatrix();
            renderer.setSize(width, height);
        };
        
        window.addEventListener('resize', handleResize);
        
        // Cleanup
        return () => {
            window.removeEventListener('resize', handleResize);
            cancelAnimationFrame(animationFrameId);
            
            if (currentMount && currentMount.contains(renderer.domElement)) {
                currentMount.removeChild(renderer.domElement);
            }
            
            // REMOVED: Document-level event listener cleanup that was causing issues
            
            scene.traverse((object) => {
                if (object instanceof THREE.Mesh) {
                    object.geometry.dispose();
                    
                    if (object.material instanceof THREE.Material) {
                        object.material.dispose();
                    } else if (Array.isArray(object.material)) {
                        object.material.forEach(material => material.dispose());
                    }
                }
            });
        };
    }, [darkMode]); // Removed unnecessary dependencies

    return (
        <div className="relative w-full h-screen">
            {/* Simplified container div without event handling interference */}
            <div ref={mountRef} className="w-full h-full"></div>
            
            <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-center text-white dark:text-white text-opacity-80 text-lg font-light">
                <p className="text-sm mb-1 tracking-wider">ENTERPRISE BLADE SERVER</p>
                <p className="text-xs opacity-70">Click and drag to rotate | Scroll to zoom</p>
            </div>
            
            <button 
                onClick={(e) => {
                    e.stopPropagation(); // Prevent this from affecting the 3D context
                    setDarkMode(!darkMode);
                }}
                className="absolute top-4 right-4 bg-gray-800 text-white dark:bg-gray-200 dark:text-black px-4 py-2 rounded-md 
                          transition-all hover:bg-gray-700 dark:hover:bg-gray-300 shadow-lg"
            >
                {darkMode ? '☀️ Light Mode' : '🌙 Dark Mode'}
            </button>
        </div>
    );
}