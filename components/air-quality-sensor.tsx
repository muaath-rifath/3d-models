'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

type AirQualitySensorProps = {
  isDarkMode?: boolean;
  width?: number;
  height?: number;
}

// Define a type for signal ring with the required userData properties
interface SignalRingData {
  mesh: THREE.Mesh;
  initialY: number;
  speed: number;
}

export default function AirQualitySensor({ isDarkMode = false, width = 500, height = 400 }: AirQualitySensorProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const sensorRef = useRef<THREE.Group | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const animationFrameIdRef = useRef<number | null>(null);
  const signalRingsRef = useRef<SignalRingData[]>([]);
  const particlesRef = useRef<THREE.Mesh[]>([]);
  const timeRef = useRef(0);

  // Function to update materials based on dark mode
  const updateMaterials = (isDark: boolean) => {
    if (!sceneRef.current || !sensorRef.current) return;

    // Update scene background
    sceneRef.current.background = new THREE.Color(isDark ? 0x111111 : 0xffffff);

    // Update sensor materials
    sensorRef.current.traverse((object) => {
      if (object instanceof THREE.Mesh) {
        const material = object.material as THREE.MeshStandardMaterial | THREE.MeshBasicMaterial | THREE.MeshPhysicalMaterial;
        const name = object.userData.materialName || object.name; // Use userData if available

        // Housing & Stem
        if (name === 'housing' || name === 'stem') {
          (material as THREE.MeshStandardMaterial).color.set(isDark ? 0x006633 : 0xc8e6c9);
        }
        // Antenna
        else if (name === 'antenna') {
          // Antenna color might not change much
        }
        // Signal Rings (Basic Material)
        else if (name === 'signalRing') {
          // Basic material color might not change
        }
        // PCB
        else if (name === 'pcb') {
          (material as THREE.MeshStandardMaterial).color.set(isDark ? 0x006633 : 0x008844); // Darker/lighter green
        }
        // Circuit Traces
        else if (name === 'circuitTrace') {
          (material as THREE.MeshStandardMaterial).emissive?.set(isDark ? 0x332200 : 0x000000);
          (material as THREE.MeshStandardMaterial).emissiveIntensity = isDark ? 0.2 : 0;
        }
        // Vent Housing
        else if (name === 'ventHousing') {
          (material as THREE.MeshStandardMaterial).color.set(isDark ? 0x222222 : 0x444444);
        }
        // Vent Filter (Wireframe)
        else if (name === 'ventFilter') {
          // Wireframe color might not change
        }
        // Chamber (Physical Material)
        else if (name === 'chamber') {
          // Physical material properties might remain constant
        }
        // Laser Emitter/Receiver
        else if (name === 'laserDevice') {
          // Color might remain constant
        }
        // Laser Beam (Basic Material)
        else if (name === 'laserBeam') {
          // Basic material color might not change
        }
        // Particles
        else if (name === 'particle') {
          // Particle color/emissive might remain constant
        }
        // Gas Sensor Base
        else if (name === 'gasSensorBase') {
          // Color might remain constant
        }
        // Gas Sensor Top (Colors are specific, maybe don't change with theme)
        else if (name === 'gasSensorTop') {
          // Keep specific colors
        }
        // Gas Sensor Mesh (Basic Material)
        else if (name === 'gasSensorMesh') {
          // Wireframe color might not change
        }
        // Display Background
        else if (name === 'displayBackground') {
          (material as THREE.MeshStandardMaterial).color.set(isDark ? 0x000000 : 0x222222);
        }
        // Display Text (Basic Material - Texture needs update)
        else if (name === 'displayText' || name === 'aqiLabel') {
            // Need to regenerate canvas texture for text color change
            const textMesh = object as THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial>;
            const canvas = (textMesh.material.map as THREE.CanvasTexture).image as HTMLCanvasElement;
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.fillStyle = isDark ? '#00ff88' : '#00ff88'; // Keep green for now, or change if needed
                ctx.font = name === 'displayText' ? 'bold 80px monospace' : 'bold 24px sans-serif';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                const text = name === 'displayText' ? '42' : 'AQI';
                const x = canvas.width / 2;
                const y = canvas.height / 2;
                ctx.fillText(text, x, y);
                textMesh.material.map!.needsUpdate = true;
            }
        }
        // Status Indicator
        else if (name === 'statusIndicator') {
          // Emissive color might remain green
        }
        // USB Port Housing
        else if (name === 'usbPortHousing') {
          // Color might remain constant
        }
        // USB Port Connector
        else if (name === 'usbPortConnector') {
          // Color might remain constant
        }
        // Bracket Base
        else if (name === 'bracketBase') {
          (material as THREE.MeshStandardMaterial).color.set(isDark ? 0x444444 : 0x888888);
        }
        // Mounting Hole
        else if (name === 'mountingHole') {
          // Color might remain constant
        }

        if (material.needsUpdate) {
          material.needsUpdate = true;
        }
      }
    });

    // Update lights
    const ambientLight = sceneRef.current.getObjectByName('ambientLight') as THREE.AmbientLight;
    const mainLight = sceneRef.current.getObjectByName('mainLight') as THREE.DirectionalLight;
    const fillLight = sceneRef.current.getObjectByName('fillLight') as THREE.DirectionalLight;

    if (ambientLight) {
        ambientLight.color.set(isDark ? 0x333333 : 0x666666);
    }
    if (mainLight) {
        // Main light color might stay white
    }
    if (fillLight) {
        fillLight.color.set(isDark ? 0x2244FF : 0xFFCC88);
    }
  };

  useEffect(() => {
    if (!mountRef.current) return;

    const currentMount = mountRef.current;
    signalRingsRef.current = []; // Reset refs on re-render
    particlesRef.current = [];
    timeRef.current = 0;

    // Create scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(isDarkMode ? 0x111111 : 0xffffff);
    sceneRef.current = scene;

    // Create camera
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.set(5, 3, 5);
    cameraRef.current = camera;

    // Create renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.localClippingEnabled = true;
    currentMount.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Add orbit controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 2;
    controls.maxDistance = 15;
    controlsRef.current = controls;

    // Create sensor device group
    const sensorNode = new THREE.Group();
    sensorRef.current = sensorNode;

    // --- Start Copied Geometry/Materials from page.tsx ---

    // Create main housing - using a rounded shape instead of cube
    const housingGeometry = new THREE.CylinderGeometry(1.2, 1.2, 0.8, 32);
    const housingMaterial = new THREE.MeshStandardMaterial({
      color: isDarkMode ? 0x006633 : 0xc8e6c9, // Match green theme in both dark/light modes
      roughness: 0.7,
      metalness: 0.3
    });
    const housing = new THREE.Mesh(housingGeometry, housingMaterial);
    housing.castShadow = true;
    housing.receiveShadow = true;
    housing.position.y = 0.4;
    housing.userData.materialName = 'housing'; // For updateMaterials
    sensorNode.add(housing);

    // Add a small antenna (important for IoT visualization)
    const antennaGeometry = new THREE.CylinderGeometry(0.02, 0.02, 0.5, 8);
    const antennaMaterial = new THREE.MeshStandardMaterial({
      color: 0xCCCCCC,
      metalness: 0.8,
      roughness: 0.2
    });
    const antenna = new THREE.Mesh(antennaGeometry, antennaMaterial);
    antenna.position.set(0.8, 0.7, 0);
    antenna.castShadow = true;
    antenna.userData.materialName = 'antenna';
    sensorNode.add(antenna);

    // Add antenna top sphere
    const antennaSphereGeometry = new THREE.SphereGeometry(0.04, 8, 8);
    const antennaSphere = new THREE.Mesh(antennaSphereGeometry, antennaMaterial.clone()); // Clone material
    antennaSphere.position.y = 0.25;
    antennaSphere.userData.materialName = 'antenna';
    antenna.add(antennaSphere);

    // Add signal emitter effect around antenna (for visualization)
    const signalGeometry = new THREE.RingGeometry(0.1, 0.12, 16);
    const signalMaterial = new THREE.MeshBasicMaterial({
      color: 0x00FFAA,
      transparent: true,
      opacity: 0.7,
      side: THREE.DoubleSide
    });

    // Create multiple signal rings
    for (let i = 0; i < 3; i++) {
      const signal = new THREE.Mesh(signalGeometry, signalMaterial.clone());
      signal.position.set(0.8, 0.9 + i * 0.2, 0);
      signal.rotation.x = Math.PI / 2;
      signal.scale.set(1, 1, 1);
      signal.userData.materialName = 'signalRing';

      signalRingsRef.current.push({
        mesh: signal,
        initialY: 0.9 + i * 0.2,
        speed: 0.01 + i * 0.005
      });
      scene.add(signal); // Add directly to scene for animation independence
    }

    // Create PCB base inside the housing
    const pcbGeometry = new THREE.CylinderGeometry(1.0, 1.0, 0.1, 32);
    const pcbMaterial = new THREE.MeshStandardMaterial({
      color: isDarkMode ? 0x006633 : 0x008844,
      roughness: 0.7,
      metalness: 0.3
    });
    const pcb = new THREE.Mesh(pcbGeometry, pcbMaterial);
    pcb.position.y = 0.2;
    pcb.userData.materialName = 'pcb';
    housing.add(pcb);

    // Add circuit traces on PCB
    const addCircuitTrace = (x: number, z: number, width: number, length: number, rotation = 0) => {
      const traceGeometry = new THREE.BoxGeometry(width, 0.01, length);
      const traceMaterial = new THREE.MeshStandardMaterial({
        color: 0xCFB53B, // Gold color
        roughness: 0.2,
        metalness: 0.8,
        emissive: isDarkMode ? 0x332200 : 0x000000,
        emissiveIntensity: isDarkMode ? 0.2 : 0
      });
      const trace = new THREE.Mesh(traceGeometry, traceMaterial);
      trace.position.set(x, 0.06, z);
      trace.rotation.y = rotation;
      trace.userData.materialName = 'circuitTrace';
      pcb.add(trace);
    };

    // Create radial circuit pattern
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const x = Math.cos(angle) * 0.5;
      const z = Math.sin(angle) * 0.5;
      addCircuitTrace(x/2, z/2, 0.05, 0.8, angle);
    }

    // Create multiple intake vents with mesh filters
    const createIntakeVent = (angle: number) => {
      const ventGroup = new THREE.Group();

      // Vent opening
      const ventGeometry = new THREE.BoxGeometry(0.4, 0.2, 0.1);
      const ventMaterial = new THREE.MeshStandardMaterial({
        color: isDarkMode ? 0x222222 : 0x444444,
        roughness: 0.8,
        metalness: 0.2
      });
      const vent = new THREE.Mesh(ventGeometry, ventMaterial);
      vent.userData.materialName = 'ventHousing';
      ventGroup.add(vent);

      // Mesh filter (visible inside vent)
      const filterGeometry = new THREE.PlaneGeometry(0.35, 0.15);
      const filterMaterial = new THREE.MeshStandardMaterial({
        color: 0x888888,
        wireframe: true,
        side: THREE.DoubleSide
      });
      const filter = new THREE.Mesh(filterGeometry, filterMaterial);
      filter.position.z = 0.01;
      filter.userData.materialName = 'ventFilter';
      ventGroup.add(filter);

      // Position vent on housing
      ventGroup.position.set(
        Math.cos(angle) * 1.15,
        0,
        Math.sin(angle) * 1.15
      );
      ventGroup.rotation.y = angle + Math.PI/2;

      return ventGroup;
    };

    // Add vents around the housing
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2;
      housing.add(createIntakeVent(angle));
    }

    // Create visible particulate matter chamber with laser path
    const chamberGroup = new THREE.Group();
    chamberGroup.position.set(0, 0.3, 0);
    housing.add(chamberGroup);

    // Chamber housing (transparent)
    const chamberGeometry = new THREE.CylinderGeometry(0.3, 0.3, 0.3, 16);
    const chamberMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.3,
      roughness: 0,
      metalness: 0.1,
      clearcoat: 1.0,
      clearcoatRoughness: 0.1
    });
    const chamber = new THREE.Mesh(chamberGeometry, chamberMaterial);
    chamber.userData.materialName = 'chamber';
    chamberGroup.add(chamber);

    // Laser emitter
    const laserEmitterGeometry = new THREE.CylinderGeometry(0.05, 0.05, 0.1, 8);
    const laserEmitterMaterial = new THREE.MeshStandardMaterial({
      color: 0x333333,
      roughness: 0.5,
      metalness: 0.8
    });
    const laserEmitter = new THREE.Mesh(laserEmitterGeometry, laserEmitterMaterial);
    laserEmitter.position.set(0.3, 0, 0);
    laserEmitter.rotation.z = Math.PI/2;
    laserEmitter.userData.materialName = 'laserDevice';
    chamberGroup.add(laserEmitter);

    // Laser beam
    const laserGeometry = new THREE.CylinderGeometry(0.01, 0.01, 0.6, 8);
    const laserMaterial = new THREE.MeshBasicMaterial({
      color: 0xff0000,
      transparent: true,
      opacity: 0.7
    });
    const laser = new THREE.Mesh(laserGeometry, laserMaterial);
    laser.position.set(0, 0, 0);
    laser.rotation.z = Math.PI/2;
    laser.userData.materialName = 'laserBeam';
    chamberGroup.add(laser);

    // Laser receiver
    const laserReceiverGeometry = new THREE.CylinderGeometry(0.05, 0.05, 0.1, 8);
    const laserReceiverMaterial = new THREE.MeshStandardMaterial({
      color: 0x333333,
      roughness: 0.5,
      metalness: 0.8
    });
    const laserReceiver = new THREE.Mesh(laserReceiverGeometry, laserReceiverMaterial);
    laserReceiver.position.set(-0.3, 0, 0);
    laserReceiver.rotation.z = Math.PI/2;
    laserReceiver.userData.materialName = 'laserDevice';
    chamberGroup.add(laserReceiver);

    // Add floating particles in chamber (for visualization)
    for (let i = 0; i < 15; i++) {
      const particleGeometry = new THREE.SphereGeometry(0.01, 8, 8);
      const particleMaterial = new THREE.MeshStandardMaterial({
        color: 0xffff00,
        emissive: new THREE.Color(0xffff00),
        emissiveIntensity: 0.7,
        transparent: true,
        opacity: 0.7
      });
      const particle = new THREE.Mesh(particleGeometry, particleMaterial);

      // Random position within chamber
      const radius = Math.random() * 0.2;
      const angle = Math.random() * Math.PI * 2;
      const height = Math.random() * 0.2 - 0.1;

      particle.position.set(
        Math.cos(angle) * radius,
        height,
        Math.sin(angle) * radius
      );

      // Store initial position for animation
      particle.userData = {
        initialX: particle.position.x,
        initialZ: particle.position.z,
        speed: 0.01 + Math.random() * 0.02,
        angle: Math.random() * Math.PI * 2,
        materialName: 'particle' // Add material name
      };

      particlesRef.current.push(particle);
      chamberGroup.add(particle);
    }

    // Gas sensor array with 4 different chemical sensors
    const createGasSensor = (x: number, z: number, color: number) => {
      const sensorGroup = new THREE.Group();

      // Sensor base
      const baseGeometry = new THREE.CylinderGeometry(0.1, 0.1, 0.05, 16);
      const baseMaterial = new THREE.MeshStandardMaterial({
        color: 0x444444,
        roughness: 0.5,
        metalness: 0.8
      });
      const base = new THREE.Mesh(baseGeometry, baseMaterial);
      base.userData.materialName = 'gasSensorBase';
      sensorGroup.add(base);

      // Sensor top (different color for each gas type)
      const topGeometry = new THREE.CylinderGeometry(0.08, 0.08, 0.03, 16);
      const topMaterial = new THREE.MeshStandardMaterial({
        color: color,
        roughness: 0.3,
        metalness: 0.5
      });
      const top = new THREE.Mesh(topGeometry, topMaterial);
      top.position.y = 0.04;
      top.userData.materialName = 'gasSensorTop';
      sensorGroup.add(top);

      // Add mesh pattern on top
      const meshGeometry = new THREE.CircleGeometry(0.07, 16);
      const meshMaterial = new THREE.MeshBasicMaterial({
        color: 0x222222,
        wireframe: true
      });
      const mesh = new THREE.Mesh(meshGeometry, meshMaterial);
      mesh.rotation.x = -Math.PI/2;
      mesh.position.y = 0.06;
      mesh.userData.materialName = 'gasSensorMesh';
      sensorGroup.add(mesh);

      sensorGroup.position.set(x, 0.1, z);
      return sensorGroup;
    };

    // Add 4 different gas sensors
    housing.add(createGasSensor(0.5, 0.5, 0xff0000));  // CO
    housing.add(createGasSensor(-0.5, 0.5, 0x00ff00)); // VOC
    housing.add(createGasSensor(0.5, -0.5, 0x0000ff)); // NO2
    housing.add(createGasSensor(-0.5, -0.5, 0xffff00)); // O3

    // Digital display showing AQI number
    const displayGroup = new THREE.Group();
    displayGroup.position.set(0, 0.5, 0.9);
    housing.add(displayGroup);

    // Display background
    const displayGeometry = new THREE.PlaneGeometry(0.6, 0.3);
    const displayMaterial = new THREE.MeshStandardMaterial({
      color: isDarkMode ? 0x000000 : 0x222222,
      roughness: 0.1,
      metalness: 0.5
    });
    const display = new THREE.Mesh(displayGeometry, displayMaterial);
    display.userData.materialName = 'displayBackground';
    displayGroup.add(display);

    // Display text (AQI number) - Function to create canvas texture
    const createTextCanvas = (text: string, width: number, height: number, font: string, color: string) => {
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
            ctx.fillStyle = color;
            ctx.font = font;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(text, width / 2, height / 2);
        }
        return canvas;
    };

    const createTextMesh = (canvas: HTMLCanvasElement, planeWidth: number, planeHeight: number, zPos: number, materialName: string) => {
        const texture = new THREE.CanvasTexture(canvas);
        const material = new THREE.MeshBasicMaterial({
            map: texture,
            transparent: true
        });
        const geometry = new THREE.PlaneGeometry(planeWidth, planeHeight);
        const textMesh = new THREE.Mesh(geometry, material);
        textMesh.position.z = zPos;
        textMesh.userData.materialName = materialName;
        return textMesh;
    };

    const textColor = isDarkMode ? '#00ff88' : '#00ff88'; // Or adjust for light mode if needed

    const aqiTextCanvas = createTextCanvas('42', 256, 128, 'bold 80px monospace', textColor);
    const aqiTextMesh = createTextMesh(aqiTextCanvas, 0.55, 0.25, 0.01, 'displayText');
    displayGroup.add(aqiTextMesh);

    const aqiLabelCanvas = createTextCanvas('AQI', 128, 32, 'bold 24px sans-serif', textColor);
    const aqiLabelMesh = createTextMesh(aqiLabelCanvas, 0.3, 0.08, 0.01, 'aqiLabel');
    aqiLabelMesh.position.y = -0.15; // Position label below number
    displayGroup.add(aqiLabelMesh);


    // Multi-color status indicator
    const indicatorGeometry = new THREE.CylinderGeometry(0.1, 0.1, 0.05, 16);
    const indicatorMaterial = new THREE.MeshStandardMaterial({
      color: 0x00ff00,
      emissive: 0x00ff00,
      emissiveIntensity: 0.8,
      transparent: true,
      opacity: 0.9
    });
    const indicator = new THREE.Mesh(indicatorGeometry, indicatorMaterial);
    indicator.position.set(0, 0.5, -0.9);
    indicator.rotation.x = Math.PI/2;
    indicator.userData.materialName = 'statusIndicator';
    housing.add(indicator);

    // Add subtle point light for indicator glow
    const indicatorLight = new THREE.PointLight(0x00ff00, 0.5, 1);
    indicatorLight.position.set(0, 0, 0);
    indicatorLight.name = 'indicatorLight'; // Name for animation access
    indicator.add(indicatorLight);

    // USB-C power port
    const usbPortGroup = new THREE.Group();
    usbPortGroup.position.set(0, 0, -1.1);
    housing.add(usbPortGroup);

    // Port housing
    const portGeometry = new THREE.BoxGeometry(0.3, 0.1, 0.05);
    const portMaterial = new THREE.MeshStandardMaterial({
      color: 0x333333,
      roughness: 0.5,
      metalness: 0.8
    });
    const port = new THREE.Mesh(portGeometry, portMaterial);
    port.userData.materialName = 'usbPortHousing';
    usbPortGroup.add(port);

    // Port connector
    const connectorGeometry = new THREE.BoxGeometry(0.25, 0.06, 0.02);
    const connectorMaterial = new THREE.MeshStandardMaterial({
      color: 0x888888,
      roughness: 0.1,
      metalness: 0.9
    });
    const connector = new THREE.Mesh(connectorGeometry, connectorMaterial);
    connector.position.z = -0.02;
    connector.userData.materialName = 'usbPortConnector';
    usbPortGroup.add(connector);

    // Wall mounting bracket
    const bracketGroup = new THREE.Group();
    bracketGroup.position.set(0, -0.8, 0); // Lowered position further down
    sensorNode.add(bracketGroup);

    // Connection stem between housing and bracket
    const stemGeometry = new THREE.CylinderGeometry(0.15, 0.15, 1.2, 16); // Increased height to 1.2
    const stemMaterial = new THREE.MeshStandardMaterial({
      color: isDarkMode ? 0x006633 : 0xc8e6c9, // Match housing color
      roughness: 0.7,
      metalness: 0.3
    });
    const stem = new THREE.Mesh(stemGeometry, stemMaterial);
    stem.position.y = -0.4; // Adjusted position to accommodate increased length
    stem.userData.materialName = 'stem';
    sensorNode.add(stem);

    // Bracket base
    const bracketBaseGeometry = new THREE.BoxGeometry(1.5, 0.1, 1.5);
    const bracketBaseMaterial = new THREE.MeshStandardMaterial({
      color: isDarkMode ? 0x444444 : 0x888888,
      roughness: 0.7,
      metalness: 0.3
    });
    const bracketBase = new THREE.Mesh(bracketBaseGeometry, bracketBaseMaterial);
    bracketBase.position.y = -0.2; // Lowered from -0.05 to -0.2 to make stem pierce through
    bracketBase.userData.materialName = 'bracketBase';
    bracketGroup.add(bracketBase);

    // Mounting holes
    const createMountingHole = (x: number, z: number) => {
      const holeGeometry = new THREE.CylinderGeometry(0.05, 0.05, 0.12, 16);
      const holeMaterial = new THREE.MeshStandardMaterial({
        color: 0x222222,
        roughness: 0.5,
        metalness: 0.3
      });
      const hole = new THREE.Mesh(holeGeometry, holeMaterial);
      hole.position.set(x, 0, z);
      hole.rotation.x = Math.PI/2;
      hole.userData.materialName = 'mountingHole';
      return hole;
    };

    bracketGroup.add(createMountingHole(0.6, 0.6));
    bracketGroup.add(createMountingHole(-0.6, 0.6));
    bracketGroup.add(createMountingHole(0.6, -0.6));
    bracketGroup.add(createMountingHole(-0.6, -0.6));

    // --- End Copied Geometry/Materials ---

    // Add the whole sensor to the scene
    scene.add(sensorNode);

    // Lighting (Adapted from page.tsx)
    const ambientLight = new THREE.AmbientLight(isDarkMode ? 0x333333 : 0x666666);
    ambientLight.name = 'ambientLight';
    scene.add(ambientLight);

    const mainLight = new THREE.DirectionalLight(0xffffff, 0.8);
    mainLight.position.set(3, 5, 2);
    mainLight.castShadow = true;
    mainLight.shadow.mapSize.width = 1024;
    mainLight.shadow.mapSize.height = 1024;
    mainLight.shadow.camera.near = 0.5;
    mainLight.shadow.camera.far = 20;
    mainLight.shadow.camera.left = -5;
    mainLight.shadow.camera.right = 5;
    mainLight.shadow.camera.top = 5;
    mainLight.shadow.camera.bottom = -5;
    mainLight.name = 'mainLight';
    scene.add(mainLight);

    const fillLight = new THREE.DirectionalLight(isDarkMode ? 0x2244FF : 0xFFCC88, 0.3);
    fillLight.position.set(-2, 3, -2);
    fillLight.name = 'fillLight';
    scene.add(fillLight);

    // Animation loop
    const animate = () => {
      timeRef.current += 0.01;
      const currentTime = timeRef.current;

      // Gentle PCB hover animation
      if (sensorRef.current) {
        sensorRef.current.position.y = Math.sin(currentTime * 0.8) * 0.05;
      }

      // Status LED blink
      const indicatorMesh = sensorRef.current?.getObjectByName('statusIndicator') as THREE.Mesh<THREE.CylinderGeometry, THREE.MeshStandardMaterial>;
      const indLight = sensorRef.current?.getObjectByName('indicatorLight') as THREE.PointLight;
      if (indicatorMesh && indLight) {
          const intensityFactor = (Math.sin(currentTime * 2) * 0.2 + 0.8);
          indicatorMesh.material.emissiveIntensity = intensityFactor;
          indLight.intensity = intensityFactor * 0.5;
      }


      // Animate signal rings
      signalRingsRef.current.forEach(ring => {
        ring.mesh.position.y += ring.speed;
        const material = ring.mesh.material as THREE.MeshBasicMaterial;
        material.opacity = 1 - ((ring.mesh.position.y - ring.initialY) / 0.5);
        ring.mesh.scale.x = 1 + ((ring.mesh.position.y - ring.initialY) * 2);
        ring.mesh.scale.z = 1 + ((ring.mesh.position.y - ring.initialY) * 2);

        if (material.opacity <= 0) {
          ring.mesh.position.y = ring.initialY;
          material.opacity = 0.7;
          ring.mesh.scale.set(1, 1, 1);
        }
      });

      // Animate particles in chamber
      particlesRef.current.forEach(particle => {
        const userData = particle.userData;
        userData.angle += userData.speed;
        particle.position.x = userData.initialX + Math.sin(userData.angle) * 0.05;
        particle.position.z = userData.initialZ + Math.cos(userData.angle) * 0.05;
        particle.position.y = Math.sin(currentTime * userData.speed * 5) * 0.05;
      });


      controlsRef.current?.update();
      rendererRef.current?.render(sceneRef.current!, cameraRef.current!);
      animationFrameIdRef.current = requestAnimationFrame(animate);
    };
    animate();

    // Handle window resize (using component props)
    const handleResize = () => {
        if (!rendererRef.current || !cameraRef.current) return;
        cameraRef.current.aspect = width / height;
        cameraRef.current.updateProjectionMatrix();
        rendererRef.current.setSize(width, height);
    };
    handleResize(); // Initial call

    // Cleanup on unmount
    return () => {
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
      // Remove renderer from DOM
      if (rendererRef.current && currentMount.contains(rendererRef.current.domElement)) {
        currentMount.removeChild(rendererRef.current.domElement);
      }
      // Dispose Three.js resources
      // Ensure scene exists before traversing
      if (sceneRef.current) {
        sceneRef.current.traverse((object) => {
          if (object instanceof THREE.Mesh) {
            object.geometry.dispose(); // Takes 0 arguments
            if (Array.isArray(object.material)) {
              object.material.forEach(material => {
                  // Check if material has a map property before trying to dispose it
                  if ('map' in material && material.map instanceof THREE.Texture) {
                      material.map.dispose(); // Takes 0 arguments
                  }
                  material.dispose(); // Takes 0 arguments
              });
            } else if (object.material instanceof THREE.Material) {
              // Check if material has a map property before trying to dispose it
              if ('map' in object.material && object.material.map instanceof THREE.Texture) {
                  object.material.map.dispose(); // Takes 0 arguments
              }
              object.material.dispose(); // Takes 0 arguments
            }
          }
        });
      }
      
      // Dispose signal ring geometries/materials
      signalRingsRef.current.forEach(ring => {
          // Ensure mesh and material exist
          if (ring.mesh) {
            ring.mesh.geometry.dispose(); // Takes 0 arguments
            const material = ring.mesh.material as THREE.Material;
            if (material) {
              // Check if material has a map property
              if ('map' in material && material.map instanceof THREE.Texture) {
                  material.map.dispose(); // Takes 0 arguments
              }
              material.dispose(); // Takes 0 arguments
            }
          }
      });

      rendererRef.current?.dispose(); // Takes 0 arguments
      controlsRef.current?.dispose(); // Takes 0 arguments

      // Clear refs
      sceneRef.current = null;
      cameraRef.current = null;
      rendererRef.current = null;
      controlsRef.current = null;
      sensorRef.current = null;
      signalRingsRef.current = [];
      particlesRef.current = [];
    };
  }, [isDarkMode, width, height]); // Dependencies remain the same

  // Apply dark mode changes when it changes (separate effect for clarity)
  useEffect(() => {
    updateMaterials(isDarkMode);
  }, [isDarkMode]);

  // Effect to handle resizing based on props
  useEffect(() => {
    if (!rendererRef.current || !cameraRef.current) return;
    cameraRef.current.aspect = width / height;
    cameraRef.current.updateProjectionMatrix();
    rendererRef.current.setSize(width, height);
  }, [width, height]);


  return (
    <div ref={mountRef} style={{ width, height, overflow: 'hidden' }} /> // Added overflow hidden
  );
}