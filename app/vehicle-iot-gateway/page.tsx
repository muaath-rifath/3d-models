'use client';

import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

// Define interfaces for wave emission data structures
interface WaveData {
  mesh: THREE.Mesh;
  scale: number;
  opacity: number;
  created: number;
  coneHeight: number;
  coneRadius: number;
}

interface WaveEmitter {
  group: THREE.Group;
  waves: WaveData[];
  nextWaveTime: number;
  protocol: string;
  interval: number;
  color: THREE.Color;
}

export default function VehicleIoTGateway() {
  const mountRef = useRef<HTMLDivElement>(null);
  const [isDarkMode, setIsDarkMode] = useState(true);
  
  useEffect(() => {
    // Define this variable at the top of the useEffect function
    let displayUpdateInterval: NodeJS.Timeout | undefined;

    // Scene, camera, and renderer setup
    const scene = new THREE.Scene();
    // Use a soft green-gray instead of blue-gray for light mode
    scene.background = new THREE.Color(isDarkMode ? 0x0a1a20 : 0xe0f0e8);
    scene.fog = new THREE.FogExp2(isDarkMode ? 0x0a1a20 : 0xe0f0e8, 0.02);
    
    const camera = new THREE.PerspectiveCamera(
      45, 
      window.innerWidth / window.innerHeight, 
      0.1, 
      1000
    );
    camera.position.set(0, 15, 30);
    
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    
    // Mount the renderer to the DOM
    if (mountRef.current) {
      mountRef.current.appendChild(renderer.domElement);
    }
    
    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    
    // Lighting
    const ambientLight = new THREE.AmbientLight(isDarkMode ? 0xeef1f7 : 0xdcf0e5, 0.5);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(isDarkMode ? 0xeef1f7 : 0xdcf0e5, 0.8);
    directionalLight.position.set(5, 10, 5);
    directionalLight.castShadow = true;
    scene.add(directionalLight);
    
    const pointLight = new THREE.PointLight(isDarkMode ? 0xeef1f7 : 0xdcf0e5, 0.5);
    pointLight.position.set(-5, 5, -5);
    scene.add(pointLight);
    
    // Materials
    const mainBodyMaterial = new THREE.MeshStandardMaterial({
      color: isDarkMode ? 0x1a2e20 : 0xc0e8d0, // Softer green for light mode
      roughness: 0.7,
      metalness: 0.3
    });
    
    const antennaBaseMaterial = new THREE.MeshStandardMaterial({
      color: isDarkMode ? 0x8fffaa : 0x009977,
      roughness: 0.3,
      metalness: 0.7
    });
    
    const screenMaterial = new THREE.MeshStandardMaterial({
      color: isDarkMode ? 0x00ffaa : 0x00aa88,
      roughness: 0.2,
      metalness: 0.8,
      emissive: isDarkMode ? 0x00ffaa : 0x00aa88,
      emissiveIntensity: isDarkMode ? 0.5 : 0.3
    });
    
    const mountingMaterial = new THREE.MeshStandardMaterial({
      color: isDarkMode ? 0x44ff66 : 0x006644,
      roughness: 0.3,
      metalness: 0.7
    });
    
    const connectorMaterial = new THREE.MeshStandardMaterial({
      color: 0x333333,
      roughness: 0.4,
      metalness: 0.7
    });
    
    const rubberizerMaterial = new THREE.MeshStandardMaterial({
      color: 0x444444,
      roughness: 0.9,
      metalness: 0.1
    });
    
    const glassMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x88ccff,
      roughness: 0.1,
      metalness: 0.9,
      transparent: true,
      opacity: 0.7,
      clearcoat: 1.0,
      clearcoatRoughness: 0.1
    });
    
    const vehiclePowerMaterial = new THREE.MeshStandardMaterial({
      color: 0x111111,
      roughness: 0.2,
      metalness: 0.9
    });
    
    // Dimensions (12cm length, 8cm width, 3cm height - scaled up for visibility)
    const length = 12;
    const width = 8;
    const height = 3;
    
    // Gateway body
    const gatewayGroup = new THREE.Group();
    scene.add(gatewayGroup);
    
    // Main body - rugged box with rounded edges
    const mainBody = (() => {
      // Create a geometry with rounded corners
      const bodyGroup = new THREE.Group();
      
      // Create base box
      const bodyGeometry = new THREE.BoxGeometry(length, height, width);
      const body = new THREE.Mesh(bodyGeometry, mainBodyMaterial);
      body.castShadow = true;
      body.receiveShadow = true;
      bodyGroup.add(body);
      
      // Add edge bevels for rugged look
      const edgeRadius = 0.5;
      const bevelSegments = 3;
      
      // Helper function to add beveled edge
      const addEdge = (x: number, y: number, z: number, rx: number, ry: number, rz: number, length: number) => {
        const edgeGeometry = new THREE.CylinderGeometry(edgeRadius, edgeRadius, length, bevelSegments * 2);
        const edge = new THREE.Mesh(edgeGeometry, mainBodyMaterial);
        edge.position.set(x, y, z);
        edge.rotation.set(rx, ry, rz);
        edge.castShadow = true;
        bodyGroup.add(edge);
      };
      
      // Vertical edges
      const halfLength = length / 2;
      const halfWidth = width / 2;
      const halfHeight = height / 2;
      
      // Front vertical edges
      addEdge(halfLength - edgeRadius, 0, halfWidth - edgeRadius, 0, 0, 0, height);
      addEdge(halfLength - edgeRadius, 0, -halfWidth + edgeRadius, 0, 0, 0, height);
      
      // Back vertical edges
      addEdge(-halfLength + edgeRadius, 0, halfWidth - edgeRadius, 0, 0, 0, height);
      addEdge(-halfLength + edgeRadius, 0, -halfWidth + edgeRadius, 0, 0, 0, height);
      
      // Horizontal edges - top face
      addEdge(0, halfHeight - edgeRadius, halfWidth - edgeRadius, Math.PI/2, 0, 0, length - edgeRadius * 2);
      addEdge(0, halfHeight - edgeRadius, -halfWidth + edgeRadius, Math.PI/2, 0, 0, length - edgeRadius * 2);
      
      // Horizontal edges - front and back of top face
      addEdge(halfLength - edgeRadius, halfHeight - edgeRadius, 0, 0, 0, Math.PI/2, width - edgeRadius * 2);
      addEdge(-halfLength + edgeRadius, halfHeight - edgeRadius, 0, 0, 0, Math.PI/2, width - edgeRadius * 2);
      
      // Horizontal edges - bottom face
      addEdge(0, -halfHeight + edgeRadius, halfWidth - edgeRadius, Math.PI/2, 0, 0, length - edgeRadius * 2);
      addEdge(0, -halfHeight + edgeRadius, -halfWidth + edgeRadius, Math.PI/2, 0, 0, length - edgeRadius * 2);
      
      // Horizontal edges - front and back of bottom face
      addEdge(halfLength - edgeRadius, -halfHeight + edgeRadius, 0, 0, 0, Math.PI/2, width - edgeRadius * 2);
      addEdge(-halfLength + edgeRadius, -halfHeight + edgeRadius, 0, 0, 0, Math.PI/2, width - edgeRadius * 2);
      
      // Corner spheres to complete the rounded edges
      const addCornerSphere = (x: number, y: number, z: number) => {
        const cornerGeometry = new THREE.SphereGeometry(edgeRadius, bevelSegments * 2, bevelSegments * 2);
        const corner = new THREE.Mesh(cornerGeometry, mainBodyMaterial);
        corner.position.set(x, y, z);
        corner.castShadow = true;
        bodyGroup.add(corner);
      };
      
      // Top corners
      addCornerSphere(halfLength - edgeRadius, halfHeight - edgeRadius, halfWidth - edgeRadius);
      addCornerSphere(halfLength - edgeRadius, halfHeight - edgeRadius, -halfWidth + edgeRadius);
      addCornerSphere(-halfLength + edgeRadius, halfHeight - edgeRadius, halfWidth - edgeRadius);
      addCornerSphere(-halfLength + edgeRadius, halfHeight - edgeRadius, -halfWidth + edgeRadius);
      
      // Bottom corners
      addCornerSphere(halfLength - edgeRadius, -halfHeight + edgeRadius, halfWidth - edgeRadius);
      addCornerSphere(halfLength - edgeRadius, -halfHeight + edgeRadius, -halfWidth + edgeRadius);
      addCornerSphere(-halfLength + edgeRadius, -halfHeight + edgeRadius, halfWidth - edgeRadius);
      addCornerSphere(-halfLength + edgeRadius, -halfHeight + edgeRadius, -halfWidth + edgeRadius);
      
      return bodyGroup;
    })();
    
    gatewayGroup.add(mainBody);
    
    // Add shock absorbers/vibration isolators at each corner
    const addShockAbsorber = (x: number, y: number, z: number) => {
      const shockGroup = new THREE.Group();
      
      // Rubber isolator part
      const rubberGeometry = new THREE.CylinderGeometry(0.6, 0.6, 0.5, 16);
      const rubber = new THREE.Mesh(rubberGeometry, rubberizerMaterial);
      rubber.position.y = -0.25;
      shockGroup.add(rubber);
      
      // Metal cap
      const capGeometry = new THREE.CylinderGeometry(0.5, 0.5, 0.2, 16);
      const cap = new THREE.Mesh(capGeometry, connectorMaterial);
      cap.position.y = -0.6;
      shockGroup.add(cap);
      
      shockGroup.position.set(x, y, z);
      return shockGroup;
    };
    
    // Position shock absorbers slightly inward from corners
    const shockPositionOffset = 0.8;
    const halfLength = length / 2;
    const halfWidth = width / 2;
    const halfHeight = height / 2;
    
    // Add shock absorbers at each corner of the bottom face
    gatewayGroup.add(addShockAbsorber(halfLength - shockPositionOffset, -halfHeight, halfWidth - shockPositionOffset));
    gatewayGroup.add(addShockAbsorber(halfLength - shockPositionOffset, -halfHeight, -halfWidth + shockPositionOffset));
    gatewayGroup.add(addShockAbsorber(-halfLength + shockPositionOffset, -halfHeight, halfWidth - shockPositionOffset));
    gatewayGroup.add(addShockAbsorber(-halfLength + shockPositionOffset, -halfHeight, -halfWidth + shockPositionOffset));
    
    // Antenna section on top
    const antennaSection = (() => {
      const antennaGroup = new THREE.Group();
      
      // Update wave configuration parameters with improved values
      const WAVE_CONFIG = {
        coneAngle: Math.PI/6,      // 30 degrees cone angle
        maxHeight: 10,             // Maximum propagation height
        rotationSpeed: 0.03,       // Rotation speed
        segments: 32,              // Ring segment count for smoother circles
        lifespan: 3000,            // Wave lifetime in milliseconds
        initialRingSize: 0.15,     // Initial ring radius
        fadeStart: 0.7,            // Start fading after 70% progress
        expansionRate: 1.5         // Controls cone expansion speed
      };

      // Main antenna housing - elevated platform on top of device
      const housingGeometry = new THREE.BoxGeometry(length / 2, 0.8, width / 2);
      const housing = new THREE.Mesh(housingGeometry, antennaBaseMaterial);
      housing.position.y = halfHeight + 0.4;
      housing.position.x = -length / 4; // Position toward the rear
      antennaGroup.add(housing);
      
      // Store wave emission points and their data
      const waveEmitters: WaveEmitter[] = [];
      const waveGroups: WaveEmitter[] = [];
      
      // Cellular antenna (tallest)
      const createAntenna = (x: number, z: number, height: number, label: string, waveColor: THREE.Color) => {
        const subGroup = new THREE.Group();
        
        // Antenna base
        const baseGeometry = new THREE.CylinderGeometry(0.4, 0.5, 0.3, 16);
        const base = new THREE.Mesh(baseGeometry, connectorMaterial);
        subGroup.add(base);
        
        // Antenna rod
        const rodGeometry = new THREE.CylinderGeometry(0.2, 0.2, height, 8);
        const rod = new THREE.Mesh(rodGeometry, connectorMaterial);
        rod.position.y = height / 2 + 0.15;
        subGroup.add(rod);
        
        // Antenna tip
        const tipGeometry = new THREE.ConeGeometry(0.2, 0.4, 8);
        const tip = new THREE.Mesh(tipGeometry, antennaBaseMaterial);
        tip.position.y = height + 0.35;
        subGroup.add(tip);
        
        // Create wave emission point at the tip of the antenna
        const waveGroup = new THREE.Group();
        waveGroup.position.y = height + 0.55; // Position at the very tip
        subGroup.add(waveGroup);
        
        // Store for animation
        waveGroups.push({
          group: waveGroup,
          waves: [],
          nextWaveTime: 0,
          protocol: label,
          interval: 1500 + Math.random() * 1000, // Random interval between 1.5-2.5 seconds
          color: waveColor
        });
        
        // Label
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.width = 64;
        canvas.height = 32;
        
        if (context) {
          context.fillStyle = isDarkMode ? '#ccddee' : '#335544'; // Greenish text for light mode
          context.font = '12px Arial';
          context.fillText(label, 5, 20);
          
          const texture = new THREE.CanvasTexture(canvas);
          const material = new THREE.MeshBasicMaterial({
            map: texture,
            transparent: true,
            side: THREE.DoubleSide
          });
          
          const labelGeometry = new THREE.PlaneGeometry(1, 0.5);
          const labelMesh = new THREE.Mesh(labelGeometry, material);
          labelMesh.position.set(0, 0.5, 0.5);
          labelMesh.rotation.x = -Math.PI / 6;
          subGroup.add(labelMesh);
        }
        
        subGroup.position.set(x, halfHeight + 0.8, z);
        return subGroup;
      };
      
      // Add different antennas with varying heights and different wave colors
      antennaGroup.add(createAntenna(-length/4 - 1, 0, 2.5, "CELL", new THREE.Color(0x00aaff)));
      antennaGroup.add(createAntenna(-length/4, -width/6, 2.0, "GPS", new THREE.Color(0xffaa00)));
      antennaGroup.add(createAntenna(-length/4, width/6, 1.5, "WIFI", new THREE.Color(0x00ff88)));
      antennaGroup.add(createAntenna(-length/4 + 1, 0, 1.8, "BT/ZB", new THREE.Color(0x8844ff)));
      
      // Function to create and animate waves
      const createWave = (waveData: WaveEmitter) => {
        const { group, color } = waveData;
        
        // Create a ring geometry with more segments for smoothness
        const ringGeometry = new THREE.RingGeometry(
          WAVE_CONFIG.initialRingSize * 0.7,  // Inner radius
          WAVE_CONFIG.initialRingSize,        // Outer radius
          WAVE_CONFIG.segments                // Segments for smooth circle
        );
        
        // Create material with depth writing disabled for better transparency
        const waveMaterial = new THREE.MeshStandardMaterial({
          color: color,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.8,
          depthWrite: false,
          metalness: 0.3,
          roughness: 0.4,
          emissive: color,
          emissiveIntensity: 0.3
        });
        
        const wave = new THREE.Mesh(ringGeometry, waveMaterial);
        
        // Critical rotation adjustment: Rotate 90 degrees around X-axis
        // This makes the ring vertical (parallel to the antenna)
        wave.rotation.x = Math.PI / 2;
        
        // Initial position at antenna tip
        wave.position.set(0, 0, 0);
        
        group.add(wave);
        
        // Store wave data for animation
        waveData.waves.push({
          mesh: wave,
          scale: 1,
          opacity: 0.8,
          created: Date.now(),
          coneHeight: 0,
          coneRadius: WAVE_CONFIG.initialRingSize
        });
      };
      
      // Animation function for waves
      const animateWaves = () => {
        const now = Date.now();
        
        waveGroups.forEach(waveData => {
          // Create new wave at intervals
          if (now >= waveData.nextWaveTime) {
            createWave(waveData);
            waveData.nextWaveTime = now + waveData.interval;
          }
          
          // Animate existing waves
          for (let i = waveData.waves.length - 1; i >= 0; i--) {
            const wave = waveData.waves[i];
            const age = now - wave.created;
            const lifespan = WAVE_CONFIG.lifespan;
            
            if (age < lifespan) {
              const progress = age / lifespan;
              
              // Calculate height based on progress
              const height = progress * WAVE_CONFIG.maxHeight;
              
              // Calculate radius based on cone angle and height
              // This uses proper trigonometry for conical expansion
              const radius = Math.tan(WAVE_CONFIG.coneAngle) * height;
              
              // Update position - move upward along Y axis (antenna direction)
              wave.mesh.position.y = height;
              
              // Scale the ring to match the cone radius at current height
              // This creates the conical expansion effect
              const ringScale = 1 + radius / WAVE_CONFIG.initialRingSize;
              wave.mesh.scale.set(ringScale, ringScale, 1);
              
              // Add rotation animation for better visual effect
              wave.mesh.rotation.z += WAVE_CONFIG.rotationSpeed;
              
              // Fade out gradually - more transparent as it moves up
              const newOpacity = 0.8 * (1 - progress);
              
              if (wave.mesh.material) {
                if (Array.isArray(wave.mesh.material)) {
                  wave.mesh.material.forEach(mat => {
                    mat.opacity = newOpacity;
                  });
                } else {
                  wave.mesh.material.opacity = newOpacity;
                }
              }
              
              // Update tracking values
              wave.coneHeight = height;
              wave.opacity = newOpacity;
              
            } else {
              // Remove expired waves
              waveData.group.remove(wave.mesh);
              wave.mesh.geometry.dispose();
              
              if (Array.isArray(wave.mesh.material)) {
                wave.mesh.material.forEach(mat => {
                  mat.dispose();
                });
              } else {
                wave.mesh.material.dispose();
              }
              
               waveData.waves.splice(i, 1);
            }
          }
        });
      };
      
      // Store animation function on group for access in main loop
      antennaGroup.userData.animateWaves = animateWaves;
      
      return antennaGroup;
    })();
    
    gatewayGroup.add(antennaSection);
    
    // Status display on the front
    const statusDisplay = (() => {
      const displayGroup = new THREE.Group();
      
      // Display housing
      const displayWidth = 6;
      const displayHeight = 2;
      const displayDepth = 0.1;
      
      // Display bezel
      const bezelGeometry = new THREE.BoxGeometry(displayWidth + 0.4, displayHeight + 0.4, displayDepth);
      const bezel = new THREE.Mesh(bezelGeometry, mainBodyMaterial);
      bezel.position.set(length/2 - 0.05, 0, 0);
      bezel.rotation.y = Math.PI / 2;
      displayGroup.add(bezel);
      
      // Display screen
      const screenGeometry = new THREE.PlaneGeometry(displayWidth, displayHeight);
      const screen = new THREE.Mesh(screenGeometry, screenMaterial);
      screen.position.set(length/2 + 0.01, 0, 0);
      screen.rotation.y = Math.PI / 2;
      displayGroup.add(screen);
      
      // Create texture for display content
      const createDisplayContent = () => {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.width = 512;
        canvas.height = 256;
        
        if (context) {
          // Background
          context.fillStyle = '#000000';
          context.fillRect(0, 0, canvas.width, canvas.height);
          
          // Draw border
          context.strokeStyle = isDarkMode ? '#00ffaa' : '#00aa88';
          context.lineWidth = 4;
          context.strokeRect(4, 4, canvas.width - 8, canvas.height - 8);
          
          // Title
          context.font = 'bold 24px Arial';
          context.fillStyle = isDarkMode ? '#00ffaa' : '#00aa88';
          context.textAlign = 'center';
          context.fillText("VEHICLE IoT GATEWAY", canvas.width / 2, 35);
          
          // Connection indicators
          const drawConnectionBar = (y: number, label: string, strength: number) => {
            const barWidth = 150;
            const barHeight = 15;
            const x = 120;
            
            // Label
            context.font = '16px Arial';
            context.fillStyle = '#ccddee'; // Changed from #ffffff
            context.textAlign = 'left';
            context.fillText(label, 20, y + 5);
            
            // Background bar
            context.fillStyle = '#333333';
            context.fillRect(x, y - barHeight / 2, barWidth, barHeight);
            
            // Active bar
            context.fillStyle = strength > 70 ? '#00ff00' : strength > 30 ? '#ffff00' : '#ff0000';
            context.fillRect(x, y - barHeight / 2, barWidth * (strength / 100), barHeight);
            
            // Strength text
            context.font = '12px Arial';
            context.fillStyle = '#ccddee'; // Changed from #ffffff
            context.textAlign = 'left';
            context.fillText(`${Math.round(strength)}%`, x + barWidth + 10, y + 4);
          };
          
          // Current time
          const now = new Date();
          context.font = '16px Arial';
          context.fillStyle = '#ccddee'; // Changed from #ffffff
          context.textAlign = 'right';
          context.fillText(now.toLocaleTimeString(), canvas.width - 20, 35);
          
          // Draw connection bars with simulated fluctuating strength
          const time = Date.now() / 1000;
          const cellStrength = 75 + 15 * Math.sin(time * 0.3);
          const gpsStrength = 85 + 10 * Math.sin(time * 0.2 + 1);
          const wifiStrength = 60 + 20 * Math.sin(time * 0.4 + 2);
          const vehicleStrength = 95 + 5 * Math.sin(time * 0.1);
          
          drawConnectionBar(80, "CELL", cellStrength);
          drawConnectionBar(110, "GPS", gpsStrength);
          drawConnectionBar(140, "WIFI", wifiStrength);
          drawConnectionBar(170, "VEHICLE", vehicleStrength);
          
          // Status indicator
          context.font = 'bold 16px Arial';
          context.fillStyle = '#00ff00';
          context.textAlign = 'center';
          context.fillText("● ONLINE", canvas.width / 2, canvas.height - 20);
          
          // Apply texture to screen
          const texture = new THREE.CanvasTexture(canvas);
          screen.material = new THREE.MeshStandardMaterial({
            map: texture,
            emissive: isDarkMode ? 0x00ffaa : 0x00aa88,
            emissiveIntensity: isDarkMode ? 0.5 : 0.3,
            roughness: 0.2,
            metalness: 0.8
          });
        }
      };
      
      createDisplayContent();
      
      // Update display periodically
      displayUpdateInterval = setInterval(createDisplayContent, 1000);
      
      return displayGroup;
    })();
    
    gatewayGroup.add(statusDisplay);
    
    // SIM card slot and memory expansion
    const cardSlots = (() => {
      const slotGroup = new THREE.Group();
      
      // SIM card slot
      const simSlotGeometry = new THREE.BoxGeometry(2, 0.2, 1);
      const simSlot = new THREE.Mesh(simSlotGeometry, connectorMaterial);
      simSlot.position.set(-length/2 + 1.5, 0.5, width/2 + 0.01);
      simSlot.rotation.y = Math.PI / 2;
      simSlot.rotation.z = Math.PI / 2;
      slotGroup.add(simSlot);
      
      // SIM card label
      const simCanvas = document.createElement('canvas');
      const simContext = simCanvas.getContext('2d');
      simCanvas.width = 128;
      simCanvas.height = 64;
      
      if (simContext) {
        simContext.fillStyle = isDarkMode ? '#ccddee' : '#335544'; // Greenish text for light mode
        simContext.font = '14px Arial';
        simContext.fillText("SIM", 10, 20);
        
        const simTexture = new THREE.CanvasTexture(simCanvas);
        const simLabelMaterial = new THREE.MeshBasicMaterial({
          map: simTexture,
          transparent: true
        });
        
        const simLabelGeometry = new THREE.PlaneGeometry(0.8, 0.4);
        const simLabel = new THREE.Mesh(simLabelGeometry, simLabelMaterial);
        simLabel.position.set(-length/2 + 1.5, 0.9, width/2 + 0.05);
        simLabel.rotation.y = Math.PI / 2;
        slotGroup.add(simLabel);
      }
      
      // SD card slot
      const sdSlotGeometry = new THREE.BoxGeometry(2.2, 0.3, 1.2);
      const sdSlot = new THREE.Mesh(sdSlotGeometry, connectorMaterial);
      sdSlot.position.set(-length/2 + 1.5, -0.5, width/2 + 0.01);
      sdSlot.rotation.y = Math.PI / 2;
      sdSlot.rotation.z = Math.PI / 2;
      slotGroup.add(sdSlot);
      
      // SD card label
      const sdCanvas = document.createElement('canvas');
      const sdContext = sdCanvas.getContext('2d');
      sdCanvas.width = 128;
      sdCanvas.height = 64;
      
      if (sdContext) {
        sdContext.fillStyle = isDarkMode ? '#ccddee' : '#335544'; // Greenish text for light mode
        sdContext.font = '14px Arial';
        sdContext.fillText("SD", 10, 20);
        
        const sdTexture = new THREE.CanvasTexture(sdCanvas);
        const sdLabelMaterial = new THREE.MeshBasicMaterial({
          map: sdTexture,
          transparent: true
        });
        
        const sdLabelGeometry = new THREE.PlaneGeometry(0.8, 0.4);
        const sdLabel = new THREE.Mesh(sdLabelGeometry, sdLabelMaterial);
        sdLabel.position.set(-length/2 + 1.5, -1, width/2 + 0.05);
        sdLabel.rotation.y = Math.PI / 2;
        slotGroup.add(sdLabel);
      }
      
      return slotGroup;
    })();
    
    gatewayGroup.add(cardSlots);
    
    // Vehicle power adapter with voltage regulator
    const vehiclePower = (() => {
      const powerGroup = new THREE.Group();
      
      // Power connector housing
      const housingGeometry = new THREE.CylinderGeometry(1, 1, 1.5, 16);
      const housing = new THREE.Mesh(housingGeometry, vehiclePowerMaterial);
      housing.rotation.x = Math.PI / 2;
      housing.position.set(-length/2 - 1, 0, -width/4);
      powerGroup.add(housing);
      
      // Power connector tip
      const tipGeometry = new THREE.CylinderGeometry(0.7, 0.8, 0.5, 16);
      const tip = new THREE.Mesh(tipGeometry, connectorMaterial);
      tip.rotation.x = Math.PI / 2;
      tip.position.set(-length/2 - 2, 0, -width/4);
      powerGroup.add(tip);
      
      // Cable
      const cableGeometry = new THREE.CylinderGeometry(0.3, 0.3, 3, 8);
      const cable = new THREE.Mesh(cableGeometry, vehiclePowerMaterial);
      cable.position.set(-length/2 - 3, 0, -width/4);
      cable.rotation.z = Math.PI / 2;
      powerGroup.add(cable);
      
      // "12V-24V" label
      const voltageCanvas = document.createElement('canvas');
      const voltageContext = voltageCanvas.getContext('2d');
      voltageCanvas.width = 128;
      voltageCanvas.height = 64;
      
      if (voltageContext) {
        voltageContext.fillStyle = isDarkMode ? '#ccddee' : '#335544'; // Greenish text
        voltageContext.font = '16px Arial';
        voltageContext.fillText("12-24V", 10, 30);
        
        const voltageTexture = new THREE.CanvasTexture(voltageCanvas);
        const voltageLabelMaterial = new THREE.MeshBasicMaterial({
          map: voltageTexture,
          transparent: true
        });
        
        const voltageLabelGeometry = new THREE.PlaneGeometry(1.5, 0.7);
        const voltageLabel = new THREE.Mesh(voltageLabelGeometry, voltageLabelMaterial);
        voltageLabel.position.set(-length/2 - 1, 1, -width/4);
        voltageLabel.rotation.y = Math.PI / 2;
        powerGroup.add(voltageLabel);
      }
      
      return powerGroup;
    })();
    
    gatewayGroup.add(vehiclePower);
    
    // External antenna ports
    const antennaPorts = (() => {
      const portGroup = new THREE.Group();
      
      const createAntennaPort = (x: number, z: number, label: string) => {
        const subGroup = new THREE.Group();
        
        // Port base
        const baseGeometry = new THREE.CylinderGeometry(0.4, 0.4, 0.2, 16);
        const base = new THREE.Mesh(baseGeometry, connectorMaterial);
        base.rotation.x = Math.PI / 2;
        subGroup.add(base);
        
        // Port connector
        const connectorGeometry = new THREE.CylinderGeometry(0.25, 0.3, 0.3, 16);
        const connector = new THREE.Mesh(connectorGeometry, vehiclePowerMaterial);
        connector.rotation.x = Math.PI / 2;
        connector.position.z = -0.2;
        subGroup.add(connector);
        
        // Label
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.width = 64;
        canvas.height = 32;
        
        if (context) {
          context.fillStyle = isDarkMode ? '#ccddee' : '#335544'; // Greenish text for light mode
          context.font = '10px Arial';
          context.fillText(label, 5, 15);
          
          const texture = new THREE.CanvasTexture(canvas);
          const material = new THREE.MeshBasicMaterial({
            map: texture,
            transparent: true
          });
          
          const labelGeometry = new THREE.PlaneGeometry(0.8, 0.4);
          const labelMesh = new THREE.Mesh(labelGeometry, material);
          labelMesh.position.set(0, 0.5, 0);
          labelMesh.rotation.x = -Math.PI / 2;
          subGroup.add(labelMesh);
        }
        
        subGroup.position.set(x, z, -width/2 - 0.01);
        return subGroup;
      };
      
      // Add antenna ports to the back side
      portGroup.add(createAntennaPort(-length/4, 1, "ANT1"));
      portGroup.add(createAntennaPort(0, 1, "ANT2"));
      portGroup.add(createAntennaPort(length/4, 1, "ANT3"));
      
      return portGroup;
    })();
    
    gatewayGroup.add(antennaPorts);
    
    // Mounting options
    const mountingOptions = (() => {
      const mountGroup = new THREE.Group();
      
      // Bracket mount - this will be our permanent mount
      const bracketGroup = new THREE.Group();
      
      // Horizontal part
      const bracketBaseGeometry = new THREE.BoxGeometry(length + 2, 0.3, width);
      const bracketBase = new THREE.Mesh(bracketBaseGeometry, mountingMaterial);
      bracketBase.position.y = -halfHeight - 0.3;
      bracketGroup.add(bracketBase);
      
      // Vertical parts
      const bracketSideGeometry = new THREE.BoxGeometry(0.5, 2, width);
      
      const bracketSide1 = new THREE.Mesh(bracketSideGeometry, mountingMaterial);
      bracketSide1.position.set((length + 2) / 2 - 0.25, -halfHeight - 1.3, 0);
      bracketGroup.add(bracketSide1);
      
      const bracketSide2 = new THREE.Mesh(bracketSideGeometry, mountingMaterial);
      bracketSide2.position.set(-(length + 2) / 2 + 0.25, -halfHeight - 1.3, 0);
      bracketGroup.add(bracketSide2);
      
      // Mounting holes
      const holeGeometry = new THREE.CylinderGeometry(0.2, 0.2, 0.5, 16);
      const holeMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
      
      const hole1 = new THREE.Mesh(holeGeometry, holeMaterial);
      hole1.position.set((length + 2) / 2 - 0.25, -halfHeight - 2.3, width/3);
      hole1.rotation.x = Math.PI / 2;
      bracketGroup.add(hole1);
      
      const hole2 = new THREE.Mesh(holeGeometry, holeMaterial);
      hole2.position.set((length + 2) / 2 - 0.25, -halfHeight - 2.3, -width/3);
      hole2.rotation.x = Math.PI / 2;
      bracketGroup.add(hole2);
      
      const hole3 = new THREE.Mesh(holeGeometry, holeMaterial);
      hole3.position.set(-(length + 2) / 2 + 0.25, -halfHeight - 2.3, width/3);
      hole3.rotation.x = Math.PI / 2;
      bracketGroup.add(hole3);
      
      const hole4 = new THREE.Mesh(holeGeometry, holeMaterial);
      hole4.position.set(-(length + 2) / 2 + 0.25, -halfHeight - 2.3, -width/3);
      hole4.rotation.x = Math.PI / 2;
      bracketGroup.add(hole4);
      
      // Add the bracket mount to the group
      mountGroup.add(bracketGroup);
      
      return mountGroup;
    })();
    
    gatewayGroup.add(mountingOptions);
    
    // Status LEDs
    const statusLEDs = (() => {
      const ledGroup = new THREE.Group();
      
      // Create a row of LEDs on the top
      const createLED = (x: number, color: THREE.Color) => {
        const ledGeometry = new THREE.CylinderGeometry(0.2, 0.2, 0.1, 16);
        const ledMaterial = new THREE.MeshStandardMaterial({
          color: color,
          emissive: color,
          emissiveIntensity: 0.8
        });
        
        const led = new THREE.Mesh(ledGeometry, ledMaterial);
        led.position.set(x, halfHeight + 0.05, width/2 - 0.5);
        led.rotation.x = Math.PI / 2;
        
        // Add a small point light to enhance the glow effect
        const ledLight = new THREE.PointLight(color, 0.5, 1.5);
        ledLight.position.set(0, 0.1, 0);
        led.add(ledLight);
        
        return led;
      };
      
      // Add LEDs with different colors
      ledGroup.add(createLED(length/2 - 1, new THREE.Color(0x00ff00))); // Green - power
      ledGroup.add(createLED(length/2 - 2, new THREE.Color(0x0000ff))); // Blue - Bluetooth
      ledGroup.add(createLED(length/2 - 3, new THREE.Color(0xff0000))); // Red - error
      ledGroup.add(createLED(length/2 - 4, new THREE.Color(0xffff00))); // Yellow - activity
      
      return ledGroup;
    })();
    
    gatewayGroup.add(statusLEDs);
    
    // Set initial position
    gatewayGroup.rotation.y = Math.PI / 4;
    
    // Handle resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    
    window.addEventListener('resize', handleResize);
    
    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      
      // Animate the antenna waves if function exists
      if (antennaSection.userData && antennaSection.userData.animateWaves) {
        antennaSection.userData.animateWaves();
      }
      
      controls.update();
      renderer.render(scene, camera);
    };
    
    animate();
    
    // Toggle dark mode function
    const toggleDarkModeHandler = document.createElement('button');
    toggleDarkModeHandler.textContent = 'Toggle Dark/Light Mode';
    toggleDarkModeHandler.style.position = 'absolute';
    toggleDarkModeHandler.style.top = '20px';
    toggleDarkModeHandler.style.left = '20px';
    toggleDarkModeHandler.style.padding = '10px';
    toggleDarkModeHandler.style.backgroundColor = isDarkMode ? '#333' : '#497'; // Greenish background for light mode
    toggleDarkModeHandler.style.color = isDarkMode ? '#dfe6f0' : '#e0f0e8'; // Match scene background
    toggleDarkModeHandler.style.border = 'none';
    toggleDarkModeHandler.style.borderRadius = '5px';
    toggleDarkModeHandler.style.cursor = 'pointer';
    
    toggleDarkModeHandler.onclick = () => {
      setIsDarkMode(!isDarkMode);
    };
    
    if (mountRef.current) {
      mountRef.current.appendChild(toggleDarkModeHandler);
    }
    
    // Cleanup function
    return () => {
      if (displayUpdateInterval) {
        clearInterval(displayUpdateInterval);
      }
      
      if (mountRef.current) {
        mountRef.current.removeChild(renderer.domElement);
        
        // Remove any buttons we've added
        const buttons = mountRef.current.querySelectorAll('button');
        buttons.forEach(button => {
          if (mountRef.current?.contains(button)) {
            mountRef.current.removeChild(button);
          }
        });
      }
      
      window.removeEventListener('resize', handleResize);
      controls.dispose();
    };
  }, [isDarkMode]);
  
  return (
    <div className="relative w-full h-screen">
      <div ref={mountRef} className="w-full h-full"></div>
    </div>
  );
}
