'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

type EnvSensorProps = {
  isDarkMode?: boolean;
  width?: number;
  height?: number;
}

export default function EnvSensor({ isDarkMode = false, width = 500, height = 400 }: EnvSensorProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const sensorRef = useRef<THREE.Group | null>(null);
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
    camera.position.set(5, 3, 5);
    
    // Create renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
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
      color: isDarkMode ? 0x006633 : 0x00aa55, // PCB green
      roughness: 0.7,
      metalness: 0.3,
      name: 'pcb'
    });
    const pcb = new THREE.Mesh(pcbGeometry, pcbMaterial);
    pcb.castShadow = true;
    pcb.receiveShadow = true;
    sensorNode.add(pcb);
    
    // Add a temperature sensor component (small cylinder)
    const tempSensorGeometry = new THREE.CylinderGeometry(0.1, 0.1, 0.2, 16);
    const tempSensorMaterial = new THREE.MeshStandardMaterial({
      color: isDarkMode ? 0xcccccc : 0xeeeeee, 
      roughness: 0.5,
      metalness: 0.8,
      name: 'temp_sensor'
    });
    const tempSensor = new THREE.Mesh(tempSensorGeometry, tempSensorMaterial);
    tempSensor.position.set(0.5, 0.15, 0.5);
    tempSensor.castShadow = true;
    sensorNode.add(tempSensor);
    
    // Add a humidity sensor component (small box)
    const humidSensorGeometry = new THREE.BoxGeometry(0.25, 0.1, 0.25);
    const humidSensorMaterial = new THREE.MeshStandardMaterial({
      color: isDarkMode ? 0xaaaaaa : 0xdddddd,
      roughness: 0.6,
      metalness: 0.5,
      name: 'humid_sensor'
    });
    const humidSensor = new THREE.Mesh(humidSensorGeometry, humidSensorMaterial);
    humidSensor.position.set(-0.5, 0.15, 0.5);
    humidSensor.castShadow = true;
    sensorNode.add(humidSensor);
    
    // Add an air quality sensor chip (rectangular)
    const aqSensorGeometry = new THREE.BoxGeometry(0.4, 0.15, 0.4);
    const aqSensorMaterial = new THREE.MeshStandardMaterial({
      color: isDarkMode ? 0x333333 : 0x555555,
      roughness: 0.4,
      metalness: 0.9,
      name: 'aq_sensor'
    });
    const aqSensor = new THREE.Mesh(aqSensorGeometry, aqSensorMaterial);
    aqSensor.position.set(0, 0.15, -0.5);
    aqSensor.castShadow = true;
    sensorNode.add(aqSensor);
    
    // Add MCU chip (microcontroller - largest chip)
    const mcuGeometry = new THREE.BoxGeometry(0.6, 0.2, 0.6);
    const mcuMaterial = new THREE.MeshStandardMaterial({
      color: isDarkMode ? 0x111111 : 0x333333,
      roughness: 0.3,
      metalness: 0.7,
      name: 'mcu'
    });
    const mcu = new THREE.Mesh(mcuGeometry, mcuMaterial);
    mcu.position.set(0, 0.15, 0);
    mcu.castShadow = true;
    sensorNode.add(mcu);
    
    // Add a small LED indicator
    const ledGeometry = new THREE.CylinderGeometry(0.05, 0.05, 0.05, 16);
    const ledMaterial = new THREE.MeshStandardMaterial({
      color: 0x00ff00,
      emissive: 0x00ff00,
      emissiveIntensity: isDarkMode ? 0.8 : 0.4,
      name: 'led'
    });
    const led = new THREE.Mesh(ledGeometry, ledMaterial);
    led.position.set(0.6, 0.15, -0.6);
    led.castShadow = true;
    
    // Add tiny point light to create glow effect from LED
    const ledLight = new THREE.PointLight(0x00ff00, 0.5, 1);
    ledLight.position.set(0, 0.1, 0);
    led.add(ledLight);
    sensorNode.add(led);
    
    // Battery holder on the bottom side
    const batteryHolderGeometry = new THREE.BoxGeometry(1.0, 0.2, 0.5);
    const batteryHolderMaterial = new THREE.MeshStandardMaterial({
      color: isDarkMode ? 0x333333 : 0x666666,
      roughness: 0.7, 
      metalness: 0.3,
      name: 'battery_holder'
    });
    const batteryHolder = new THREE.Mesh(batteryHolderGeometry, batteryHolderMaterial);
    batteryHolder.position.set(0, -0.15, 0);
    batteryHolder.castShadow = true;
    sensorNode.add(batteryHolder);
    
    // Add antenna (thin wire)
    const antennaGeometry = new THREE.CylinderGeometry(0.01, 0.01, 1.0, 8);
    const antennaMaterial = new THREE.MeshStandardMaterial({
      color: isDarkMode ? 0xcccccc : 0x999999,
      roughness: 0.4,
      metalness: 0.8,
      name: 'antenna'
    });
    const antenna = new THREE.Mesh(antennaGeometry, antennaMaterial);
    antenna.position.set(-0.6, 0.5, -0.6);
    antenna.castShadow = true;
    sensorNode.add(antenna);
    
    // Add sensor to scene
    scene.add(sensorNode);
    sensorRef.current = sensorNode;
    
    // Add lighting
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
    
    // Create ground plane to receive shadows
    const groundGeometry = new THREE.PlaneGeometry(20, 20);
    const groundMaterial = new THREE.MeshStandardMaterial({
      color: isDarkMode ? 0x223322 : 0xd8e8d8,
      roughness: 0.9,
      metalness: 0
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -2;
    ground.receiveShadow = true;
    scene.add(ground);
    
    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      sensorNode.rotation.y += 0.005;
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
    
    // Cleanup on unmount
    return () => {
      window.removeEventListener('resize', handleResize);
      if (currentMount.contains(renderer.domElement)) {
        currentMount.removeChild(renderer.domElement);
      }
      
      // Dispose materials and geometries
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          object.geometry.dispose();
          if (Array.isArray(object.material)) {
            object.material.forEach(material => material.dispose());
          } else {
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
