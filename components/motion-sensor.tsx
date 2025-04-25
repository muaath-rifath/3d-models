'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

type MotionSensorProps = {
  isDarkMode?: boolean;
  width?: number;
  height?: number;
}

export default function MotionSensor({ isDarkMode = false, width = 500, height = 400 }: MotionSensorProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const sensorRef = useRef<THREE.Group | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const animationFrameId = useRef<number | null>(null); // Add ref for animation frame ID

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
    // Disable shadows
    renderer.shadowMap.enabled = false; 
    // Enable clipping for the entire scene
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

    // Create PCB base
    const pcbGeometry = new THREE.BoxGeometry(1.8, 0.1, 1.8);
    const pcbMaterial = new THREE.MeshStandardMaterial({ 
      color: isDarkMode ? 0x006633 : 0x00aa55,
      roughness: 0.7,
      metalness: 0.3,
      name: 'pcb'
    });
    const pcb = new THREE.Mesh(pcbGeometry, pcbMaterial);
    sensorNode.add(pcb);

    // Create motion sensor dome
    const domeGeometry = new THREE.SphereGeometry(0.7, 32, 32, 0, Math.PI * 2, 0, Math.PI * 0.5);
    const domeMaterial = new THREE.MeshStandardMaterial({ 
      color: isDarkMode ? 0x333333 : 0xdddddd,
      roughness: 0.2,
      metalness: 0.8,
      transparent: true,
      opacity: 0.8,
      name: 'dome'
    });
    const dome = new THREE.Mesh(domeGeometry, domeMaterial);
    dome.position.y = 0.7;
    sensorNode.add(dome);

    // Create PIR sensor inside the dome
    const pirGeometry = new THREE.CylinderGeometry(0.4, 0.4, 0.2, 16);
    const pirMaterial = new THREE.MeshStandardMaterial({ 
      color: isDarkMode ? 0x222222 : 0x444444,
      roughness: 0.6,
      metalness: 0.4,
      name: 'pir_sensor'
    });
    const pir = new THREE.Mesh(pirGeometry, pirMaterial);
    pir.position.y = 0.4;
    sensorNode.add(pir);

    // Create motion detection area (visualization)
    const detectionAreaGeometry = new THREE.ConeGeometry(3, 6, 32, 1, true);
    const detectionAreaMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x00ff88, 
      transparent: true,
      opacity: 0.1,
      side: THREE.DoubleSide,
      name: 'detection_area'
    });
    const detectionArea = new THREE.Mesh(detectionAreaGeometry, detectionAreaMaterial);
    detectionArea.position.y = 3.5;
    detectionArea.rotation.x = Math.PI;
    sensorNode.add(detectionArea);

    // Add microcontroller chip
    const chipGeometry = new THREE.BoxGeometry(0.4, 0.1, 0.4);
    const chipMaterial = new THREE.MeshStandardMaterial({ 
      color: isDarkMode ? 0x111111 : 0x333333,
      roughness: 0.3,
      metalness: 0.7,
      name: 'chip'
    });
    const chip = new THREE.Mesh(chipGeometry, chipMaterial);
    chip.position.set(0.5, 0.1, 0.5);
    sensorNode.add(chip);

    // Add status LED
    const ledGeometry = new THREE.CircleGeometry(0.1, 16);
    const ledMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x00ff00,
      emissive: 0x00ff00,
      emissiveIntensity: isDarkMode ? 0.8 : 0.4,
      name: 'led'
    });
    const led = new THREE.Mesh(ledGeometry, ledMaterial);
    led.position.set(-0.5, 0.06, 0.7);
    led.rotation.x = -Math.PI / 2;

    // Add a point light to create LED glow
    const ledLight = new THREE.PointLight(0x00ff00, 0.5, 2);
    led.add(ledLight);
    sensorNode.add(led);

    // Add mounting holes
    const holeGeometry = new THREE.CylinderGeometry(0.1, 0.1, 0.2, 16);
    const holeMaterial = new THREE.MeshStandardMaterial({ 
      color: isDarkMode ? 0x222222 : 0x111111,
      name: 'hole'
    });

    // Add 4 mounting holes in the corners
    const holePositions = [
      { x: 0.75, z: 0.75 },
      { x: 0.75, z: -0.75 },
      { x: -0.75, z: 0.75 },
      { x: -0.75, z: -0.75 }
    ];

    holePositions.forEach(pos => {
      const hole = new THREE.Mesh(holeGeometry, holeMaterial);
      hole.position.set(pos.x, -0.05, pos.z);
      sensorNode.add(hole);
    });

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
    scene.add(mainLight);

    // Animation loop to show motion detection area pulsing
    const animate = () => {
      // Store the frame ID so we can cancel it
      animationFrameId.current = requestAnimationFrame(animate);

      // Pulse detection area opacity for visual effect
      if (detectionAreaMaterial) {
        const time = Date.now() * 0.001;
        detectionAreaMaterial.opacity = 0.05 + Math.sin(time) * 0.05;
      }

      controls.update();
      // Ensure scene and camera are available before rendering
      if (scene && camera) {
        renderer.render(scene, camera);
      }
    };

    // Start the animation loop
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
      // Cancel the animation frame loop
      if (animationFrameId.current !== null) {
        cancelAnimationFrame(animationFrameId.current);
      }

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