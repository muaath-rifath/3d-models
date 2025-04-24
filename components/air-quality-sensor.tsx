'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

type AirQualitySensorProps = {
  isDarkMode?: boolean;
  width?: number;
  height?: number;
}

export default function AirQualitySensor({ isDarkMode = false, width = 500, height = 400 }: AirQualitySensorProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const sensorRef = useRef<THREE.Group | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);

  // Function to update materials based on dark mode
  const updateMaterials = (isDark: boolean) => {
    if (!sceneRef.current || !sensorRef.current) return;

    // Update scene background
    sceneRef.current.background = new THREE.Color(isDark ? 0x081208 : 0xf0f4f0);

    // Update sensor materials
    sensorRef.current.traverse((object) => {
      if (object instanceof THREE.Mesh) {
        const material = object.material as THREE.MeshStandardMaterial;

        if (material.name === 'housing') {
          material.color.set(isDark ? 0x006633 : 0xc8e6c9);
          material.roughness = 0.7;
          material.metalness = 0.3;
        }
        else if (material.name === 'sensor_panel') {
          material.color.set(isDark ? 0x002211 : 0x99ccaa);
          material.emissive.set(isDark ? 0x004422 : 0x000000);
          material.emissiveIntensity = isDark ? 0.5 : 0;
        }
        else if (material.name === 'led') {
          material.color.set(isDark ? 0x00ff66 : 0x33ff99);
          material.emissive.set(isDark ? 0x00ff66 : 0x33ff99);
          material.emissiveIntensity = isDark ? 0.8 : 0.4;
        }
        else if (material.name === 'display') {
          material.color.set(isDark ? 0x003322 : 0x66aa88);
          material.emissive.set(isDark ? 0x00aa88 : 0x66aa88);
          material.emissiveIntensity = isDark ? 0.6 : 0.2;
        }
        
        if (material.needsUpdate) {
          material.needsUpdate = true;
        }
      }
    });
  };

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

    // Create main housing - using a rounded shape
    const housingGeometry = new THREE.CylinderGeometry(1.2, 1.2, 0.8, 32);
    const housingMaterial = new THREE.MeshStandardMaterial({
      color: isDarkMode ? 0x006633 : 0xc8e6c9,
      roughness: 0.7,
      metalness: 0.3,
      name: 'housing'
    });
    const housing = new THREE.Mesh(housingGeometry, housingMaterial);
    housing.castShadow = true;
    housing.receiveShadow = true;

    // Create sensor panel on top
    const sensorGeometry = new THREE.CircleGeometry(0.8, 32);
    const sensorMaterial = new THREE.MeshStandardMaterial({
      color: isDarkMode ? 0x002211 : 0x99ccaa,
      emissive: isDarkMode ? 0x004422 : 0x000000,
      emissiveIntensity: isDarkMode ? 0.5 : 0,
      roughness: 0.4,
      transparent: true,
      opacity: 0.9,
      name: 'sensor_panel'
    });
    const sensorPanel = new THREE.Mesh(sensorGeometry, sensorMaterial);
    sensorPanel.rotation.x = -Math.PI / 2;
    sensorPanel.position.y = 0.401;
    
    // Create status LED
    const ledGeometry = new THREE.CircleGeometry(0.1, 16);
    const ledMaterial = new THREE.MeshStandardMaterial({
      color: isDarkMode ? 0x00ff66 : 0x33ff99,
      emissive: isDarkMode ? 0x00ff66 : 0x33ff99,
      emissiveIntensity: isDarkMode ? 0.8 : 0.4,
      name: 'led'
    });
    const statusLED = new THREE.Mesh(ledGeometry, ledMaterial);
    statusLED.position.set(0.8, 0, 0);
    statusLED.rotation.set(0, 0, Math.PI / 2);
    
    // Create display panel
    const displayGeometry = new THREE.PlaneGeometry(0.8, 0.4);
    const displayMaterial = new THREE.MeshStandardMaterial({
      color: isDarkMode ? 0x003322 : 0x66aa88,
      emissive: isDarkMode ? 0x00aa88 : 0x66aa88,
      emissiveIntensity: isDarkMode ? 0.6 : 0.2,
      name: 'display'
    });
    const display = new THREE.Mesh(displayGeometry, displayMaterial);
    display.position.set(0, 0, 1.21);
    
    // Add all elements to the sensor node
    sensorNode.add(housing);
    sensorNode.add(sensorPanel);
    sensorNode.add(statusLED);
    sensorNode.add(display);

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

  // Apply dark mode changes when it changes
  useEffect(() => {
    updateMaterials(isDarkMode);
  }, [isDarkMode]);

  return (
    <div ref={mountRef} style={{ width, height }} />
  );
}