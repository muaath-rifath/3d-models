'use client';

import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

export default function AirQualitySensor() {
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
    camera.position.set(5, 3, 5);

    // Create renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.localClippingEnabled = true;
    currentMount.appendChild(renderer.domElement);

    // Add orbit controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 2;
    controls.maxDistance = 15;

    // Create sensor device group
    const sensorNode = new THREE.Group();

    // Create main housing - using a rounded shape instead of cube
    const housingGeometry = new THREE.CylinderGeometry(1.2, 1.2, 0.8, 32);
    const housingMaterial = new THREE.MeshStandardMaterial({
      color: darkMode ? 0x006633 : 0xc8e6c9, // Match green theme in both dark/light modes
      roughness: 0.7,
      metalness: 0.3
    });
    const housing = new THREE.Mesh(housingGeometry, housingMaterial);
    housing.castShadow = true;
    housing.receiveShadow = true;
    housing.position.y = 0.4;
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
    sensorNode.add(antenna);
    
    // Add antenna top sphere
    const antennaSphereGeometry = new THREE.SphereGeometry(0.04, 8, 8);
    const antennaSphere = new THREE.Mesh(antennaSphereGeometry, antennaMaterial);
    antennaSphere.position.y = 0.25;
    antenna.add(antennaSphere);

    // Add signal emitter effect around antenna (for visualization)
    const signalGeometry = new THREE.RingGeometry(0.1, 0.12, 16);
    const signalMaterial = new THREE.MeshBasicMaterial({
      color: 0x00FFAA,
      transparent: true,
      opacity: 0.7,
      side: THREE.DoubleSide
    });
    
    // Define a type for signal ring with the required userData properties
    interface SignalRingData {
      mesh: THREE.Mesh;
      initialY: number;
      speed: number;
    }
    
    // Create multiple signal rings
    const signalRings: SignalRingData[] = [];
    for (let i = 0; i < 3; i++) {
      const signal = new THREE.Mesh(signalGeometry, signalMaterial.clone());
      
      // Position and configure the signal ring
      signal.position.set(0.8, 0.9 + i * 0.2, 0);
      signal.rotation.x = Math.PI / 2;
      signal.scale.set(1, 1, 1);
      
      // Store the mesh and the data separately instead of trying to extend the mesh type
      signalRings.push({
        mesh: signal,
        initialY: 0.9 + i * 0.2,
        speed: 0.01 + i * 0.005
      });
      
      scene.add(signal);
    }

    // Create PCB base inside the housing
    const pcbGeometry = new THREE.CylinderGeometry(1.0, 1.0, 0.1, 32);
    const pcbMaterial = new THREE.MeshStandardMaterial({
      color: 0x006633,
      roughness: 0.7,
      metalness: 0.3
    });
    const pcb = new THREE.Mesh(pcbGeometry, pcbMaterial);
    pcb.position.y = 0.2;
    housing.add(pcb);

    // Add circuit traces on PCB
    const addCircuitTrace = (x: number, z: number, width: number, length: number, rotation = 0) => {
      const traceGeometry = new THREE.BoxGeometry(width, 0.01, length);
      const traceMaterial = new THREE.MeshStandardMaterial({
        color: 0xCFB53B, // Gold color
        roughness: 0.2,
        metalness: 0.8,
        emissive: darkMode ? 0x332200 : 0x000000,
        emissiveIntensity: darkMode ? 0.2 : 0
      });
      const trace = new THREE.Mesh(traceGeometry, traceMaterial);
      trace.position.set(x, 0.06, z);
      trace.rotation.y = rotation;
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
        color: darkMode ? 0x222222 : 0x444444,
        roughness: 0.8,
        metalness: 0.2
      });
      const vent = new THREE.Mesh(ventGeometry, ventMaterial);
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
    chamberGroup.add(laserReceiver);

    // Add floating particles in chamber (for visualization)
    const particles: THREE.Mesh[] = [];
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
        angle: Math.random() * Math.PI * 2
      };

      particles.push(particle);
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
      color: darkMode ? 0x000000 : 0x222222,
      roughness: 0.1,
      metalness: 0.5
    });
    const display = new THREE.Mesh(displayGeometry, displayMaterial);
    displayGroup.add(display);

    // Display text (AQI number)
    const createDisplayText = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 256;
      canvas.height = 128;
      const ctx = canvas.getContext('2d');

      if (ctx) {
        ctx.fillStyle = darkMode ? '#00ff88' : '#00ff88';
        ctx.font = 'bold 80px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('42', 128, 64);

        const texture = new THREE.CanvasTexture(canvas);
        const material = new THREE.MeshBasicMaterial({
          map: texture,
          transparent: true
        });

        const geometry = new THREE.PlaneGeometry(0.55, 0.25);
        const textMesh = new THREE.Mesh(geometry, material);
        textMesh.position.z = 0.01;
        return textMesh;
      }

      return null;
    };

    const displayText = createDisplayText();
    if (displayText) displayGroup.add(displayText);

    // Add "AQI" label
    const createAQILabel = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 128;
      canvas.height = 32;
      const ctx = canvas.getContext('2d');

      if (ctx) {
        ctx.fillStyle = darkMode ? '#00ff88' : '#00ff88';
        ctx.font = 'bold 24px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('AQI', 64, 16);

        const texture = new THREE.CanvasTexture(canvas);
        const material = new THREE.MeshBasicMaterial({
          map: texture,
          transparent: true
        });

        const geometry = new THREE.PlaneGeometry(0.3, 0.08);
        const labelMesh = new THREE.Mesh(geometry, material);
        labelMesh.position.set(0, -0.15, 0.01);
        return labelMesh;
      }

      return null;
    };

    const aqiLabel = createAQILabel();
    if (aqiLabel) displayGroup.add(aqiLabel);

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
    housing.add(indicator);

    // Add subtle point light for indicator glow
    const indicatorLight = new THREE.PointLight(0x00ff00, 0.5, 1);
    indicatorLight.position.set(0, 0, 0);
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
    usbPortGroup.add(connector);

    // Wall mounting bracket
    const bracketGroup = new THREE.Group();
    bracketGroup.position.set(0, -0.3, 0);
    sensorNode.add(bracketGroup);

    // Bracket base
    const bracketBaseGeometry = new THREE.BoxGeometry(1.5, 0.1, 1.5);
    const bracketBaseMaterial = new THREE.MeshStandardMaterial({
      color: darkMode ? 0x444444 : 0x888888,
      roughness: 0.7,
      metalness: 0.3
    });
    const bracketBase = new THREE.Mesh(bracketBaseGeometry, bracketBaseMaterial);
    bracketBase.position.y = -0.05;
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
      return hole;
    };

    bracketGroup.add(createMountingHole(0.6, 0.6));
    bracketGroup.add(createMountingHole(-0.6, 0.6));
    bracketGroup.add(createMountingHole(0.6, -0.6));
    bracketGroup.add(createMountingHole(-0.6, -0.6));

    // Add the whole sensor to the scene
    scene.add(sensorNode);

    // Lighting
    const ambientLight = new THREE.AmbientLight(darkMode ? 0x333333 : 0x666666);
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
    scene.add(mainLight);

    const fillLight = new THREE.DirectionalLight(darkMode ? 0x2244FF : 0xFFCC88, 0.3);
    fillLight.position.set(-2, 3, -2);
    scene.add(fillLight);

    // Animation loop
    let time = 0;
    const animate = () => {
      time += 0.01;

      // Gentle PCB hover animation
      sensorNode.position.y = Math.sin(time * 0.8) * 0.05;

      // Status LED blink
      indicator.material.emissiveIntensity = (Math.sin(time * 2) * 0.2 + 0.8);
      indicatorLight.intensity = (Math.sin(time * 2) * 0.2 + 0.8) * 0.5;

      // Animate signal rings
      signalRings.forEach(ring => {
        // Move up and fade out
        ring.mesh.position.y += ring.speed;
        
        // Cast the material to MeshBasicMaterial to access opacity property
        const material = ring.mesh.material as THREE.MeshBasicMaterial;
        material.opacity = 1 - ((ring.mesh.position.y - ring.initialY) / 0.5);
        
        ring.mesh.scale.x = 1 + ((ring.mesh.position.y - ring.initialY) * 2);
        ring.mesh.scale.z = 1 + ((ring.mesh.position.y - ring.initialY) * 2);
        
        // Reset when completely faded
        if (material.opacity <= 0) {
          ring.mesh.position.y = ring.initialY;
          material.opacity = 0.7;
          ring.mesh.scale.set(1, 1, 1);
        }
      });

      // Animate particles in chamber
      particles.forEach(particle => {
        // Move particles in a circular pattern
        const userData = particle.userData;
        userData.angle += userData.speed;

        particle.position.x = userData.initialX + Math.sin(userData.angle) * 0.05;
        particle.position.z = userData.initialZ + Math.cos(userData.angle) * 0.05;

        // Random vertical movement
        particle.position.y = Math.sin(time * userData.speed * 5) * 0.05;
      });

      controls.update();
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

      // Dispose resources
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
  }, [darkMode]);

  return (
    <div className="relative w-full h-screen">
      <div ref={mountRef} className="w-full h-full"></div>

      <button
        onClick={() => setDarkMode(!darkMode)}
        className="absolute top-4 right-4 bg-gray-800 text-white dark:bg-gray-200 dark:text-black px-4 py-2 rounded-md
                  transition-all hover:bg-gray-700 dark:hover:bg-gray-300 shadow-lg"
      >
        {darkMode ? '☀️ Light Mode' : '🌙 Dark Mode'}
      </button>

      <div className="absolute bottom-4 left-4 text-white dark:text-black bg.black/70 dark:bg.white/70 p-4 rounded-lg
                    backdrop-blur-sm shadow-lg max-w-xs">
        <h2 className="text-lg font-bold mb-2">AirQuality Monitor X200</h2>
        <p className="text-sm mb-1"><span className="font-semibold">Type:</span> PM2.5, CO2, VOC, NO2, O3</p>
        <p className="text-sm mb-1"><span className="font-semibold">Range:</span> 0-500 AQI</p>
        <p className="text-sm mb-1"><span className="font-semibold">Accuracy:</span> ±5% at 25°C</p>
        <p className="text-sm"><span className="font-semibold">Features:</span> Digital Display, Status Indicator</p>
      </div>
    </div>
  );
}