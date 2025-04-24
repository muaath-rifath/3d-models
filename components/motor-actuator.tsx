"use client"
import { useEffect, useRef, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

type MotorActuatorProps = {
  isDarkMode?: boolean;
  width?: number;
  height?: number;
}

export default function MotorActuator({ isDarkMode = false, width = 500, height = 400 }: MotorActuatorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const motorRef = useRef<THREE.Group | null>(null);
  const ledRef = useRef<THREE.Mesh | null>(null);

  // Wrap createMotor in useCallback to maintain stable function reference
  const createMotor = useCallback((isDark: boolean) => {
    const motorGroup = new THREE.Group();
    if (!sceneRef.current) return;
    sceneRef.current.add(motorGroup);
    motorRef.current = motorGroup;
    
    // Colors
    const housingColor = isDark ? 0x1a2e20 : 0xd0e8ff;
    const endCapColor = isDark ? 0x8fffaa : 0x009977;
    const shaftColor = isDark ? 0x44ff66 : 0x006644;
    const ledColor = isDark ? 0x00ffaa : 0x00aa88;
    
    // Motor housing (cylindrical body with cooling ribs)
    const housingLength = 25;
    const housingRadius = 2.5;
    
    // Main cylinder
    const housingGeometry = new THREE.CylinderGeometry(housingRadius, housingRadius, housingLength, 32);
    const housingMaterial = new THREE.MeshPhongMaterial({ 
      color: housingColor,
      shininess: 30,
      name: 'housing'
    });
    const housing = new THREE.Mesh(housingGeometry, housingMaterial);
    housing.rotation.z = Math.PI / 2;
    motorGroup.add(housing);
    
    // Cooling ribs
    const ribCount = 20;
    const ribHeight = 0.3;
    
    for (let i = 0; i < ribCount; i++) {
      const angle = (i / ribCount) * Math.PI * 2;
      const ribGeometry = new THREE.CylinderGeometry(
        housingRadius + ribHeight, 
        housingRadius + ribHeight, 
        housingLength - 4, 
        8,
        1,
        false,
        angle - 0.06,
        0.12
      );
      const ribMaterial = new THREE.MeshPhongMaterial({ 
        color: housingColor,
        shininess: 50,
        name: 'rib'
      });
      const rib = new THREE.Mesh(ribGeometry, ribMaterial);
      rib.rotation.z = Math.PI / 2;
      motorGroup.add(rib);
    }
    
    // Front end cap
    const frontCapGeometry = new THREE.CylinderGeometry(housingRadius + 0.5, housingRadius + 0.5, 1.5, 32);
    const endCapMaterial = new THREE.MeshPhongMaterial({ 
      color: endCapColor,
      shininess: 60,
      name: 'end_cap'
    });
    const frontCap = new THREE.Mesh(frontCapGeometry, endCapMaterial);
    frontCap.rotation.z = Math.PI / 2;
    frontCap.position.x = housingLength / 2 + 0.75;
    motorGroup.add(frontCap);
    
    // Rear end cap
    const rearCapGeometry = new THREE.CylinderGeometry(housingRadius + 0.5, housingRadius + 0.5, 2.5, 32);
    const rearCap = new THREE.Mesh(rearCapGeometry, endCapMaterial);
    rearCap.rotation.z = Math.PI / 2;
    rearCap.position.x = -housingLength / 2 - 1.25;
    motorGroup.add(rearCap);
    
    // Motor shaft
    const shaftGeometry = new THREE.CylinderGeometry(1, 1, 5, 16);
    const shaftMaterial = new THREE.MeshStandardMaterial({ 
      color: shaftColor,
      metalness: 0.8,
      roughness: 0.2,
      name: 'shaft'
    });
    const shaft = new THREE.Mesh(shaftGeometry, shaftMaterial);
    shaft.rotation.z = Math.PI / 2;
    shaft.position.x = housingLength / 2 + 4;
    motorGroup.add(shaft);
    
    // Connector box on rear end
    const connectorBoxGeometry = new THREE.BoxGeometry(3, 2, 4);
    const connectorBoxMaterial = new THREE.MeshPhongMaterial({ 
      color: endCapColor,
      shininess: 50,
      name: 'connector_box'
    });
    const connectorBox = new THREE.Mesh(connectorBoxGeometry, connectorBoxMaterial);
    connectorBox.position.set(-housingLength / 2 - 2, 0, 3);
    motorGroup.add(connectorBox);
    
    // Connector pins
    const pinGeometry = new THREE.CylinderGeometry(0.3, 0.3, 1, 8);
    const pinMaterial = new THREE.MeshStandardMaterial({ 
      color: 0xdddddd, 
      metalness: 0.9,
      roughness: 0.1,
      name: 'pin'
    });
    
    const pins = [];
    for (let i = 0; i < 3; i++) {
      const pin = new THREE.Mesh(pinGeometry, pinMaterial);
      pin.position.set(-housingLength / 2 - 2, 0, 3 + i * 0.8 - 1.6);
      pin.rotation.x = Math.PI / 2;
      pins.push(pin);
      motorGroup.add(pin);
    }
    
    // Status LED
    const ledGeometry = new THREE.SphereGeometry(0.4, 16, 16);
    const ledMaterial = new THREE.MeshPhongMaterial({ 
      color: ledColor,
      emissive: ledColor,
      emissiveIntensity: 0.8,
      shininess: 90,
      name: 'led'
    });
    const led = new THREE.Mesh(ledGeometry, ledMaterial);
    led.position.set(-housingLength / 2 - 2, 1.5, 3);
    ledRef.current = led;
    motorGroup.add(led);
    
    // Mounting brackets
    const bracketGeometry = new THREE.BoxGeometry(1.5, 1, 5);
    const bracketMaterial = new THREE.MeshPhongMaterial({ 
      color: endCapColor,
      shininess: 40,
      name: 'bracket'
    });
    
    // Left bracket (near back)
    const leftBracket = new THREE.Mesh(bracketGeometry, bracketMaterial);
    leftBracket.position.set(-housingLength / 3, -housingRadius - 0.5, 0);
    motorGroup.add(leftBracket);
    
    // Right bracket (near front)
    const rightBracket = new THREE.Mesh(bracketGeometry, bracketMaterial);
    rightBracket.position.set(housingLength / 3, -housingRadius - 0.5, 0);
    motorGroup.add(rightBracket);
    
    // Add mounting holes
    const mountingHoleGeometry = new THREE.CylinderGeometry(0.4, 0.4, 1.2, 16);
    const mountingHoleMaterial = new THREE.MeshPhongMaterial({ 
      color: 0x000000,
      name: 'hole'
    });
    
    const mountingPositions = [
      { x: -housingLength / 3, y: -housingRadius - 1, z: 1.5 },
      { x: -housingLength / 3, y: -housingRadius - 1, z: -1.5 },
      { x: housingLength / 3, y: -housingRadius - 1, z: 1.5 },
      { x: housingLength / 3, y: -housingRadius - 1, z: -1.5 }
    ];
    
    mountingPositions.forEach(pos => {
      const hole = new THREE.Mesh(mountingHoleGeometry, mountingHoleMaterial);
      hole.position.set(pos.x, pos.y, pos.z);
      hole.rotation.x = Math.PI / 2;
      motorGroup.add(hole);
    });
    
    // Add motor leads/wires
    const wireGeometry = new THREE.CylinderGeometry(0.15, 0.15, 5, 8);
    const wireMaterials = [
      new THREE.MeshPhongMaterial({ color: 0xff0000, name: 'wire_red' }), // Red
      new THREE.MeshPhongMaterial({ color: 0x000000, name: 'wire_black' }), // Black
      new THREE.MeshPhongMaterial({ color: 0x0000ff, name: 'wire_blue' })  // Blue
    ];
    
    for (let i = 0; i < 3; i++) {
      const wire = new THREE.Mesh(wireGeometry, wireMaterials[i]);
      wire.position.set(-housingLength / 2 - 4.5, 0, 3 + i * 0.8 - 1.6);
      wire.rotation.z = Math.PI / 2;
      motorGroup.add(wire);
    }
    
    return motorGroup;
  }, []);

  // Setup the scene once on mount
  useEffect(() => {
    if (!containerRef.current) return;
    
    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(isDarkMode ? 0x081208 : 0xf0f4f0);
    sceneRef.current = scene;
    
    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      45, 
      width / height, 
      0.1, 
      1000
    );
    camera.position.set(0, 15, 30);
    
    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    containerRef.current.appendChild(renderer.domElement);
    
    // Controls setup
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    
    // Add lighting
    const ambientLight = new THREE.AmbientLight(
      isDarkMode ? 0x445544 : 0x909090,
      isDarkMode ? 0.4 : 0.8
    );
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(
      isDarkMode ? 0xaaffcc : 0xffffff,
      isDarkMode ? 0.7 : 0.9
    );
    directionalLight.position.set(10, 10, 10);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 1024;
    directionalLight.shadow.mapSize.height = 1024;
    scene.add(directionalLight);
    
    // Add point light for better highlights on metal parts
    const pointLight = new THREE.PointLight(
      isDarkMode ? 0x00ffcc : 0xffffee,
      0.8,
      50
    );
    pointLight.position.set(-10, 15, 0);
    scene.add(pointLight);
    
    // Create the motor model
    createMotor(isDarkMode);
    
    // Add optional ground plane
    const groundGeometry = new THREE.PlaneGeometry(100, 100);
    const groundMaterial = new THREE.MeshStandardMaterial({ 
      color: isDarkMode ? 0x223322 : 0xd8e8d8,
      roughness: 0.9,
      metalness: 0
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -8;
    ground.receiveShadow = true;
    scene.add(ground);
    
    // Start animation loop
    let lastTime = 0;
    const rotationSpeed = 0.4; // Radians per second
    
    const animate = (time: number) => {
      const delta = time - lastTime;
      lastTime = time;
      
      requestAnimationFrame(animate);
      
      // Rotate the motor shaft
      if (motorRef.current) {
        // Get the shaft (6th child - index 5)
        const shaft = motorRef.current.children[5];
        if (shaft) {
          shaft.rotation.x += rotationSpeed * (delta / 1000);
        }
      }
      
      controls.update();
      renderer.render(scene, camera);
    };
    
    animate(0);
    
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
      
      if (containerRef.current?.contains(renderer.domElement)) {
        containerRef.current.removeChild(renderer.domElement);
      }
      
      // Dispose of resources
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
  }, [isDarkMode, width, height, createMotor]);

  return (
    <div ref={containerRef} style={{ width, height }} />
  );
}
