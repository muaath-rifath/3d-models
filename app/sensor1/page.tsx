'use client';

import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

export default function SensorModel() {
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
    currentMount.appendChild(renderer.domElement);
    
    // Add orbit controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 2;
    controls.maxDistance = 15;
    
    // Create sensor device group
    const sensorNode = new THREE.Group();
    
    // Create PCB - small and clean for IoT mesh visualization
    const pcbGeometry = new THREE.BoxGeometry(1.5, 0.1, 1.5);
    const pcbMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x006633, // PCB green
      roughness: 0.7,
      metalness: 0.3
    });
    const pcb = new THREE.Mesh(pcbGeometry, pcbMaterial);
    pcb.castShadow = true;
    pcb.receiveShadow = true;
    sensorNode.add(pcb);
    
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
    
    // Create simplified circuit pattern
    addCircuitTrace(0, 0, 0.05, 1.4);
    addCircuitTrace(0.3, 0, 0.05, 1.4);
    addCircuitTrace(-0.3, 0, 0.05, 1.4);
    addCircuitTrace(0, 0.3, 1.4, 0.05);
    addCircuitTrace(0, -0.3, 1.4, 0.05);
    
    // Main chip (simplified)
    const chipGeometry = new THREE.BoxGeometry(0.8, 0.1, 0.8);
    const chipMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x111111, 
      roughness: 0.5,
      metalness: 0.5
    });
    const chip = new THREE.Mesh(chipGeometry, chipMaterial);
    chip.position.y = 0.15;
    chip.castShadow = true;
    sensorNode.add(chip);
    
    // Add ECOSENSE label on chip
    const createLabel = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 128;
      canvas.height = 128;
      const ctx = canvas.getContext('2d');
      
      if (ctx) {
        ctx.fillStyle = 'white';
        ctx.font = '14px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('ECOSENSE', 64, 50);
        ctx.fillText('T2', 64, 70);
        
        const texture = new THREE.CanvasTexture(canvas);
        const material = new THREE.MeshBasicMaterial({
          map: texture,
          transparent: true
        });
        
        const geometry = new THREE.PlaneGeometry(0.6, 0.6);
        const label = new THREE.Mesh(geometry, material);
        label.rotation.x = -Math.PI / 2;
        label.position.y = 0.051;
        return label;
      }
      
      return null;
    };
    
    const chipLabel = createLabel();
    if (chipLabel) chip.add(chipLabel);
    
    // Add a small antenna (important for IoT visualization)
    const antennaGeometry = new THREE.CylinderGeometry(0.02, 0.02, 0.5, 8);
    const antennaMaterial = new THREE.MeshStandardMaterial({
      color: 0xCCCCCC,
      metalness: 0.8,
      roughness: 0.2
    });
    const antenna = new THREE.Mesh(antennaGeometry, antennaMaterial);
    antenna.position.set(0.6, 0.3, 0.6);
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
      signal.position.set(0.6, 0.5 + i * 0.2, 0.6);
      signal.rotation.x = Math.PI / 2;
      signal.scale.set(1, 1, 1);
      
      // Store the mesh and the data separately instead of trying to extend the mesh type
      signalRings.push({
        mesh: signal,
        initialY: 0.5 + i * 0.2,
        speed: 0.01 + i * 0.005
      });
      
      scene.add(signal);
    }
    
    // LED indicator
    const createLED = (x: number, z: number, color: number) => {
      const ledGeometry = new THREE.BoxGeometry(0.1, 0.05, 0.1);
      const ledMaterial = new THREE.MeshStandardMaterial({
        color: color,
        emissive: color,
        emissiveIntensity: 0.8,
        transparent: true,
        opacity: 0.9
      });
      const led = new THREE.Mesh(ledGeometry, ledMaterial);
      led.position.set(x, 0.125, z);
      led.castShadow = true;
      
      // Add subtle point light for glow effect
      const light = new THREE.PointLight(color, 0.5, 0.5);
      light.position.set(0, 0.05, 0);
      led.add(light);
      
      return { led, material: ledMaterial, light };
    };
    
    // Add a status LED
    const statusLED = createLED(-0.6, -0.6, 0x00FF00);
    sensorNode.add(statusLED.led);
    
    // Add connection pads on bottom of PCB
    const createConnectionPad = (x: number, z: number) => {
      const padGeometry = new THREE.CylinderGeometry(0.08, 0.08, 0.03, 8);
      const padMaterial = new THREE.MeshStandardMaterial({
        color: 0xCCCCCC,
        metalness: 0.9,
        roughness: 0.1
      });
      const pad = new THREE.Mesh(padGeometry, padMaterial);
      pad.position.set(x, -0.065, z);
      pad.rotation.x = Math.PI / 2;
      return pad;
    };
    
    // Add connection pads at corners
    sensorNode.add(createConnectionPad(0.6, 0.6));
    sensorNode.add(createConnectionPad(-0.6, 0.6));
    sensorNode.add(createConnectionPad(0.6, -0.6));
    sensorNode.add(createConnectionPad(-0.6, -0.6));
    
    // Add sensor component (cylindrical)
    const sensorGeometry = new THREE.CylinderGeometry(0.15, 0.15, 0.12, 16);
    const sensorMaterial = new THREE.MeshStandardMaterial({
      color: 0x444444,
      roughness: 0.6,
      metalness: 0.4
    });
    const sensor = new THREE.Mesh(sensorGeometry, sensorMaterial);
    sensor.position.set(0, 0.16, -0.5);
    sensor.rotation.x = Math.PI / 2;
    sensor.castShadow = true;
    sensorNode.add(sensor);
    
    // Add sensor mesh - small holes
    const sensorHoleGeometry = new THREE.CircleGeometry(0.02, 8);
    const sensorHoleMaterial = new THREE.MeshBasicMaterial({ color: 0x222222 });
    
    // Create pattern of sensor holes
    for (let i = -2; i <= 2; i++) {
      for (let j = -2; j <= 2; j++) {
        if (Math.abs(i) === 2 && Math.abs(j) === 2) continue; // Skip corners
        
        const hole = new THREE.Mesh(sensorHoleGeometry, sensorHoleMaterial);
        hole.position.set(i * 0.05, 0, j * 0.05);
        hole.rotation.x = Math.PI / 2;
        sensor.add(hole);
      }
    }
    
    // Add the whole sensor to the scene
    scene.add(sensorNode);
    
    // Floor removed to allow seeing the back of the sensor
    
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
      statusLED.material.emissiveIntensity = (Math.sin(time * 3) * 0.2 + 0.8);
      statusLED.light.intensity = (Math.sin(time * 3) * 0.2 + 0.8) * 0.5;
      
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
      
      <div className="absolute bottom-4 left-4 text-white dark:text-black bg-black/70 dark:bg-white/70 p-4 rounded-lg
                     backdrop-blur-sm shadow-lg max-w-xs">
        <h2 className="text-lg font-bold mb-2">EcoSense T2 Sensor</h2>
        <p className="text-sm mb-1"><span className="font-semibold">Purpose:</span> Environmental Monitoring</p>
        <p className="text-sm mb-1"><span className="font-semibold">Sensors:</span> Temperature, Humidity, Air Quality</p>
        <p className="text-sm"><span className="font-semibold">Connectivity:</span> Wireless</p>
      </div>
    </div>
  );
}
