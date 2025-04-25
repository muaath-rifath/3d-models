'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

type IoTGatewayProps = {
  isDarkMode?: boolean;
  width?: number;
  height?: number;
}

export default function IoTGateway({ isDarkMode = false, width = 500, height = 400 }: IoTGatewayProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  
  useEffect(() => {
    // Define this variable at the top of the useEffect function
    let displayUpdateInterval: NodeJS.Timeout | undefined;

    if (!mountRef.current) return;
    const currentMount = mountRef.current;

    // Scene, camera, and renderer setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(isDarkMode ? 0x0a1a20 : 0xf0f8ff);
    sceneRef.current = scene;
    
    const camera = new THREE.PerspectiveCamera(
      45, 
      width / height, 
      0.1, 
      1000
    );
    camera.position.set(0, 10, 60);  // Increased Z position to prevent clipping
    
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    
    // Mount the renderer to the DOM
    currentMount.appendChild(renderer.domElement);
    
    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    
    // Lighting
    const ambientLight = new THREE.AmbientLight(
      isDarkMode ? 0x445544 : 0x909090,
      isDarkMode ? 0.4 : 0.8
    );
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(
      isDarkMode ? 0xaaffcc : 0xffffff,
      isDarkMode ? 0.7 : 0.9
    );
    directionalLight.position.set(5, 10, 5);
    scene.add(directionalLight);
    
    const pointLight = new THREE.PointLight(
      isDarkMode ? 0x00ffcc : 0xffffff,
      0.5
    );
    pointLight.position.set(-5, 5, 5);
    scene.add(pointLight);
    
    // Create the gateway model
    const gatewayGroup = new THREE.Group();
    
    // Gateway base/housing
    const baseGeometry = new THREE.BoxGeometry(12, 2, 9);
    const baseMaterial = new THREE.MeshStandardMaterial({
      color: isDarkMode ? 0x1a2e20 : 0xffffff,
      roughness: 0.8,
      metalness: 0.2,
      name: 'base'
    });
    const base = new THREE.Mesh(baseGeometry, baseMaterial);
    base.position.y = 1;
    gatewayGroup.add(base);
    
    // Top section with vents
    const topGeometry = new THREE.BoxGeometry(11, 1, 8);
    const topMaterial = new THREE.MeshStandardMaterial({
      color: isDarkMode ? 0x00aa88 : 0xf0f0f0,
      roughness: 0.5,
      metalness: 0.3,
      name: 'top'
    });
    const top = new THREE.Mesh(topGeometry, topMaterial);
    top.position.y = 2.5;
    gatewayGroup.add(top);
    
    // Add ventilation holes
    const ventGeometry = new THREE.BoxGeometry(0.6, 1.1, 0.6);
    const ventMaterial = new THREE.MeshStandardMaterial({
      color: isDarkMode ? 0x003322 : 0x000000,
      roughness: 1.0,
      metalness: 0,
      name: 'vent'
    });
    
    // Add vents in a grid pattern on top
    for (let x = -4; x <= 4; x += 2) {
      for (let z = -2.5; z <= 2.5; z += 1.5) {
        const vent = new THREE.Mesh(ventGeometry, ventMaterial);
        vent.position.set(x, 2.5, z);
        gatewayGroup.add(vent);
      }
    }
    
    // Add status LEDs on front
    const ledGeometry = new THREE.CircleGeometry(0.2, 16);
    
    // Power LED
    const powerLedMaterial = new THREE.MeshStandardMaterial({
      color: 0x00ff00,
      emissive: 0x00ff00,
      emissiveIntensity: isDarkMode ? 0.8 : 0.4,
      name: 'power_led'
    });
    const powerLed = new THREE.Mesh(ledGeometry, powerLedMaterial);
    powerLed.position.set(-5, 1.5, 4.51);
    powerLed.rotation.y = Math.PI / 2;
    gatewayGroup.add(powerLed);
    
    // Internet LED
    const internetLedMaterial = new THREE.MeshStandardMaterial({
      color: 0x0077ff,
      emissive: 0x0077ff,
      emissiveIntensity: isDarkMode ? 0.8 : 0.4,
      name: 'internet_led'
    });
    const internetLed = new THREE.Mesh(ledGeometry, internetLedMaterial);
    internetLed.position.set(-4, 1.5, 4.51);
    internetLed.rotation.y = Math.PI / 2;
    gatewayGroup.add(internetLed);
    
    // WiFi LED
    const wifiLedMaterial = new THREE.MeshStandardMaterial({
      color: 0x00ffff,
      emissive: 0x00ffff,
      emissiveIntensity: isDarkMode ? 0.8 : 0.4,
      name: 'wifi_led'
    });
    const wifiLed = new THREE.Mesh(ledGeometry, wifiLedMaterial);
    wifiLed.position.set(-3, 1.5, 4.51);
    wifiLed.rotation.y = Math.PI / 2;
    gatewayGroup.add(wifiLed);
    
    // IoT LED
    const iotLedMaterial = new THREE.MeshStandardMaterial({
      color: 0xff77ff,
      emissive: 0xff77ff,
      emissiveIntensity: isDarkMode ? 0.8 : 0.4,
      name: 'iot_led'
    });
    const iotLed = new THREE.Mesh(ledGeometry, iotLedMaterial);
    iotLed.position.set(-2, 1.5, 4.51);
    iotLed.rotation.y = Math.PI / 2;
    gatewayGroup.add(iotLed);
    
    // Add logo (simplified)
    const logoGeometry = new THREE.PlaneGeometry(3, 1);
    const logoMaterial = new THREE.MeshStandardMaterial({
      color: isDarkMode ? 0x00ffaa : 0x009977,
      emissive: isDarkMode ? 0x00aa88 : 0x000000,
      emissiveIntensity: isDarkMode ? 0.3 : 0,
      name: 'logo'
    });
    const logo = new THREE.Mesh(logoGeometry, logoMaterial);
    logo.position.set(0, 1.5, 4.51);
    logo.rotation.y = Math.PI / 2;
    gatewayGroup.add(logo);
    
    // Add rear ports
    const portWidth = 1.5;
    const portSpacing = 2;
    const portStartX = -4.5;
    
    // Power port
    const powerPortGeometry = new THREE.CylinderGeometry(0.6, 0.6, 0.5, 16);
    const powerPortMaterial = new THREE.MeshStandardMaterial({
      color: 0x333333,
      roughness: 0.7,
      metalness: 0.3,
      name: 'power_port'
    });
    const powerPort = new THREE.Mesh(powerPortGeometry, powerPortMaterial);
    powerPort.rotation.x = Math.PI / 2;
    powerPort.position.set(portStartX, 1, -4.51);
    gatewayGroup.add(powerPort);
    
    // Ethernet ports
    const ethernetPortGeometry = new THREE.BoxGeometry(portWidth, 0.8, 0.5);
    const ethernetPortMaterial = new THREE.MeshStandardMaterial({
      color: isDarkMode ? 0x444444 : 0x888888,
      roughness: 0.5,
      metalness: 0.5,
      name: 'ethernet_port'
    });
    
    // Create 4 ethernet ports
    for (let i = 0; i < 4; i++) {
      const ethernetPort = new THREE.Mesh(ethernetPortGeometry, ethernetPortMaterial);
      ethernetPort.position.set(portStartX + portSpacing * (i + 1), 1, -4.51);
      gatewayGroup.add(ethernetPort);
    }
    
    // Add antennas
    const antennaBaseGeometry = new THREE.CylinderGeometry(0.3, 0.3, 0.5, 8);
    const antennaRodGeometry = new THREE.CylinderGeometry(0.15, 0.15, 5, 8);
    
    const antennaMaterial = new THREE.MeshStandardMaterial({
      color: isDarkMode ? 0x333333 : 0x333333,
      roughness: 0.4,
      metalness: 0.6,
      name: 'antenna'
    });
    
    // Create antennas
    for (let i = 0; i < 2; i++) {
      const antennaX = 4 - i * 8;
      
      // Antenna base
      const antennaBase = new THREE.Mesh(antennaBaseGeometry, antennaMaterial);
      antennaBase.position.set(antennaX, 3, 0);
      gatewayGroup.add(antennaBase);
      
      // Antenna rod
      const antennaRod = new THREE.Mesh(antennaRodGeometry, antennaMaterial);
      antennaRod.position.set(antennaX, 5.5, 0);
      gatewayGroup.add(antennaRod);
    }
    
    // Add gateway to scene
    scene.add(gatewayGroup);
    
    // Remove the floor object
    /* 
    // Add floor for shadow
    const floorGeometry = new THREE.PlaneGeometry(50, 50);
    const floorMaterial = new THREE.MeshStandardMaterial({
      color: isDarkMode ? 0x223322 : 0xd8e8d8,
      roughness: 0.9, 
      metalness: 0
    });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = 0;
    floor.receiveShadow = true;
    scene.add(floor);
    */
    
    // Animation loop
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
      
      if (displayUpdateInterval) {
        clearInterval(displayUpdateInterval);
      }
      
      if (currentMount.contains(renderer.domElement)) {
        currentMount.removeChild(renderer.domElement);
      }
      
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
    };
  }, [isDarkMode, width, height]);
  
  return (
    <div ref={mountRef} style={{ width, height }} />
  );
}