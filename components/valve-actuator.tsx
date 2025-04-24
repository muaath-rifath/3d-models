'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

type SmartWaterValveProps = {
  isDarkMode?: boolean;
  width?: number;
  height?: number;
}

export default function SmartWaterValve({ isDarkMode = false, width = 500, height = 400 }: SmartWaterValveProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const valveRef = useRef<THREE.Group | null>(null);
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

    // Create valve device group
    const valveNode = new THREE.Group();
    valveRef.current = valveNode;

    // Create valve body (cylindrical)
    const valveBodyGeometry = new THREE.CylinderGeometry(0.3, 0.3, 1.2, 32);
    const valveBodyMaterial = new THREE.MeshStandardMaterial({
      color: isDarkMode ? 0x1a2e20 : 0xd0e8ff,
      roughness: 0.3,
      metalness: 0.8,
      name: 'valve_body'
    });
    const valveBody = new THREE.Mesh(valveBodyGeometry, valveBodyMaterial);
    valveBody.rotation.z = Math.PI / 2; // Rotate to horizontal position
    valveBody.castShadow = true;
    valveBody.receiveShadow = true;
    valveNode.add(valveBody);

    // Create connecting pipes
    const pipeGeometry = new THREE.CylinderGeometry(0.2, 0.2, 1.0, 16);
    const pipeMaterial = new THREE.MeshStandardMaterial({
      color: isDarkMode ? 0x333333 : 0x999999,
      roughness: 0.4,
      metalness: 0.6,
      name: 'pipe'
    });
    
    // Left pipe
    const leftPipe = new THREE.Mesh(pipeGeometry, pipeMaterial);
    leftPipe.position.set(-1.0, 0, 0);
    leftPipe.rotation.z = Math.PI / 2;
    leftPipe.castShadow = true;
    leftPipe.receiveShadow = true;
    valveNode.add(leftPipe);
    
    // Right pipe
    const rightPipe = new THREE.Mesh(pipeGeometry, pipeMaterial);
    rightPipe.position.set(1.0, 0, 0);
    rightPipe.rotation.z = Math.PI / 2;
    rightPipe.castShadow = true;
    rightPipe.receiveShadow = true;
    valveNode.add(rightPipe);
    
    // Create valve actuator housing (main body for the electronics)
    const housingGeometry = new THREE.BoxGeometry(0.9, 0.9, 1.0);
    const housingMaterial = new THREE.MeshStandardMaterial({
      color: isDarkMode ? 0x006633 : 0xc8e6c9,
      roughness: 0.7,
      metalness: 0.2,
      name: 'housing'
    });
    const actuatorHousing = new THREE.Mesh(housingGeometry, housingMaterial);
    actuatorHousing.position.set(0, 0.7, 0);
    actuatorHousing.castShadow = true;
    actuatorHousing.receiveShadow = true;
    valveNode.add(actuatorHousing);
    
    // Create electronic display
    const displayGeometry = new THREE.PlaneGeometry(0.6, 0.3);
    const displayMaterial = new THREE.MeshStandardMaterial({
      color: isDarkMode ? 0x003322 : 0x66aa88,
      emissive: isDarkMode ? 0x00aa88 : 0x66aa88,
      emissiveIntensity: isDarkMode ? 0.6 : 0.2,
      roughness: 0.2,
      metalness: 0.3,
      name: 'display'
    });
    const display = new THREE.Mesh(displayGeometry, displayMaterial);
    display.position.set(0, 0.7, 0.51);
    display.castShadow = false; // Usually displays don't cast shadows
    display.receiveShadow = false;
    valveNode.add(display);
    
    // Create status LED
    const ledGeometry = new THREE.CircleGeometry(0.1, 16);
    const ledMaterial = new THREE.MeshStandardMaterial({
      color: 0x00ff00, // Default green
      emissive: 0x00ff00,
      emissiveIntensity: isDarkMode ? 0.8 : 0.4,
      name: 'led'
    });
    const statusLED = new THREE.Mesh(ledGeometry, ledMaterial);
    statusLED.position.set(0.3, 0.8, 0.51);
    
    // Add point light to create LED glow
    const ledLight = new THREE.PointLight(0x00ff00, 0.5, 1);
    ledLight.position.set(0, 0, 0.1);
    statusLED.add(ledLight);
    valveNode.add(statusLED);
    
    // Create control buttons
    const buttonGeometry = new THREE.CylinderGeometry(0.08, 0.08, 0.05, 16);
    const buttonMaterial = new THREE.MeshStandardMaterial({
      color: isDarkMode ? 0x77ccbb : 0x888888,
      roughness: 0.3,
      metalness: 0.7,
      name: 'button'
    });
    
    // Add two control buttons
    const button1 = new THREE.Mesh(buttonGeometry, buttonMaterial);
    button1.position.set(-0.2, 1.0, 0.45);
    button1.rotation.x = Math.PI / 2;
    valveNode.add(button1);
    
    const button2 = new THREE.Mesh(buttonGeometry, buttonMaterial);
    button2.position.set(0.2, 1.0, 0.45);
    button2.rotation.x = Math.PI / 2;
    valveNode.add(button2);
    
    // Create valve handle/actuator
    const handleGeometry = new THREE.CylinderGeometry(0.15, 0.15, 0.3, 16);
    const handleMaterial = new THREE.MeshStandardMaterial({
      color: isDarkMode ? 0x44ff66 : 0x006644,
      roughness: 0.4,
      metalness: 0.6,
      name: 'handle'
    });
    const handle = new THREE.Mesh(handleGeometry, handleMaterial);
    handle.position.set(0, 0, 0.3);
    handle.rotation.x = Math.PI / 2;
    handle.castShadow = true;
    valveNode.add(handle);
    
    // Create flow indicator arrows
    const arrowGeometry = new THREE.ConeGeometry(0.1, 0.3, 8);
    const arrowMaterial = new THREE.MeshStandardMaterial({
      color: isDarkMode ? 0x00ffaa : 0x00aa88,
      emissive: isDarkMode ? 0x00aa88 : 0x008866,
      emissiveIntensity: isDarkMode ? 0.5 : 0.2,
      name: 'arrow'
    });
    
    // Flow direction arrows
    const arrow1 = new THREE.Mesh(arrowGeometry, arrowMaterial);
    arrow1.position.set(-0.5, 0, 0);
    arrow1.rotation.z = -Math.PI / 2;
    valveNode.add(arrow1);
    
    // Create mounting brackets
    const bracketGeometry = new THREE.BoxGeometry(0.1, 0.3, 0.5);
    const bracketMaterial = new THREE.MeshStandardMaterial({
      color: isDarkMode ? 0x444444 : 0x888888,
      roughness: 0.5,
      metalness: 0.5,
      name: 'bracket'
    });
    
    // Add two brackets for mounting
    const bracket1 = new THREE.Mesh(bracketGeometry, bracketMaterial);
    bracket1.position.set(0, -0.3, 0);
    valveNode.add(bracket1);
    
    const bracket2 = new THREE.Mesh(bracketGeometry, bracketMaterial);
    bracket2.position.set(0, -0.3, -0.6);
    valveNode.add(bracket2);
    
    // Add valve to scene
    scene.add(valveNode);
    
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
  
  return (
    <div ref={mountRef} style={{ width, height }} />
  );
}
