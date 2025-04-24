'use client';

import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

export default function SmartWaterValve() {
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

    // Create valve device group
    const valveNode = new THREE.Group();

    // Create valve body (cylindrical)
    const valveBodyGeometry = new THREE.CylinderGeometry(0.3, 0.3, 1.2, 32);
    const valveBodyMaterial = new THREE.MeshStandardMaterial({
      color: darkMode ? 0x1a2e20 : 0xd0e8ff,
      roughness: 0.3,
      metalness: 0.8
    });
    const valveBody = new THREE.Mesh(valveBodyGeometry, valveBodyMaterial);
    valveBody.rotation.z = Math.PI / 2; // Rotate to horizontal position
    valveBody.castShadow = true;
    valveBody.receiveShadow = true;
    valveNode.add(valveBody);

    // Create pipe connection threads
    const createPipeThread = (position: number) => {
      const threadGeometry = new THREE.CylinderGeometry(0.35, 0.35, 0.1, 32);
      const threadMaterial = new THREE.MeshStandardMaterial({
        color: 0x888888,
        roughness: 0.5,
        metalness: 0.9
      });
      const thread = new THREE.Mesh(threadGeometry, threadMaterial);
      thread.position.x = position;
      thread.rotation.z = Math.PI / 2;
      valveNode.add(thread);

      // Add thread details
      const threadDetailGeometry = new THREE.TorusGeometry(0.35, 0.02, 16, 32);
      const threadDetail = new THREE.Mesh(threadDetailGeometry, threadMaterial);
      threadDetail.position.x = position;
      if (position > 0) {
        threadDetail.position.x = position - 0.05;
      } else {
        threadDetail.position.x = position + 0.05;
      }
      threadDetail.rotation.y = Math.PI / 2;
      valveNode.add(threadDetail);
    };

    // Add pipe threads at both ends
    createPipeThread(-0.65);
    createPipeThread(0.65);

    // Create motor housing (rectangular electronic box instead of cylindrical)
    const motorHousingGeometry = new THREE.BoxGeometry(0.8, 0.5, 0.6);
    const motorHousingMaterial = new THREE.MeshStandardMaterial({
      color: darkMode ? 0x444444 : 0x666666,
      roughness: 0.7,
      metalness: 0.5
    });
    const motorHousing = new THREE.Mesh(motorHousingGeometry, motorHousingMaterial);
    motorHousing.position.y = 0.5;
    motorHousing.castShadow = true;
    valveNode.add(motorHousing);

    // Create electronic panel on top of the housing
    const panelGeometry = new THREE.BoxGeometry(0.6, 0.05, 0.5);
    const panelMaterial = new THREE.MeshStandardMaterial({
      color: darkMode ? 0x222222 : 0x333333,
      roughness: 0.5,
      metalness: 0.7
    });
    const controlPanel = new THREE.Mesh(panelGeometry, panelMaterial);
    controlPanel.position.y = 0.75;
    valveNode.add(controlPanel);

    // Add control buttons
    const addControlButton = (x: number, z: number, color: number) => {
      const buttonGeometry = new THREE.CylinderGeometry(0.05, 0.05, 0.02, 16);
      const buttonMaterial = new THREE.MeshStandardMaterial({
        color: color,
        roughness: 0.3,
        metalness: 0.5,
        emissive: color,
        emissiveIntensity: 0.3
      });
      const button = new THREE.Mesh(buttonGeometry, buttonMaterial);
      button.position.set(x, 0.76, z);
      button.rotation.x = Math.PI / 2;
      valveNode.add(button);
    };

    // Add control buttons with different colors
    addControlButton(-0.2, -0.1, 0x00ff00);  // Green button
    addControlButton(0, -0.1, 0xff0000);     // Red button
    addControlButton(0.2, -0.1, 0xffff00);   // Yellow button

    // Create small digital display
    const displayGeometry = new THREE.PlaneGeometry(0.3, 0.15);
    const displayMaterial = new THREE.MeshStandardMaterial({
      color: 0x00aaff,
      emissive: 0x00aaff,
      emissiveIntensity: 0.5,
      roughness: 0.2,
      metalness: 0.8
    });
    const display = new THREE.Mesh(displayGeometry, displayMaterial);
    display.position.set(0, 0.77, 0.15);
    display.rotation.x = -Math.PI / 2.5;
    valveNode.add(display);

    // Create ventilation grills
    const addVentGrill = (x: number, z: number) => {
      const grillGroup = new THREE.Group();
      
      for (let i = 0; i < 5; i++) {
        const slotGeometry = new THREE.BoxGeometry(0.25, 0.01, 0.02);
        const slotMaterial = new THREE.MeshStandardMaterial({ color: 0x222222 });
        const slot = new THREE.Mesh(slotGeometry, slotMaterial);
        slot.position.y = i * 0.04 - 0.08;
        grillGroup.add(slot);
      }
      
      grillGroup.position.set(x, 0.5, z);
      grillGroup.rotation.x = Math.PI / 2;
      valveNode.add(grillGroup);
    };
    
    // Add vents on both sides
    addVentGrill(0.4, 0);
    addVentGrill(-0.4, 0);

    // Create manual emergency override (smaller and more technical looking)
    const overrideGeometry = new THREE.CylinderGeometry(0.08, 0.08, 0.05, 6);
    const overrideMaterial = new THREE.MeshStandardMaterial({
      color: 0xff3300,
      roughness: 0.3,
      metalness: 0.5
    });
    const emergencyOverride = new THREE.Mesh(overrideGeometry, overrideMaterial);
    emergencyOverride.position.y = 0.85;
    emergencyOverride.rotation.x = Math.PI / 2;
    valveNode.add(emergencyOverride);

    // Add override handle
    const handleGeometry = new THREE.BoxGeometry(0.15, 0.03, 0.03);
    const handle = new THREE.Mesh(handleGeometry, overrideMaterial);
    handle.position.y = 0.9;
    valveNode.add(handle);

    // Replace cooling fins with electronics housing features
    // (Remove the previous cooling fins code)

    // Create status LED indicators
    const createStatusLED = (position: THREE.Vector3, color: number) => {
      const ledGeometry = new THREE.CircleGeometry(0.04, 16);
      const ledMaterial = new THREE.MeshStandardMaterial({
        color: color,
        emissive: color,
        emissiveIntensity: 0.8,
        roughness: 0.3
      });
      const led = new THREE.Mesh(ledGeometry, ledMaterial);
      led.position.copy(position);
      led.rotation.x = -Math.PI / 2;
      valveNode.add(led);
      
      return { led, ledMaterial };
    };
    
    // Add multiple status LEDs
    const greenLED = createStatusLED(new THREE.Vector3(-0.15, 0.77, 0.25), 0x00ff00);
    const redLED = createStatusLED(new THREE.Vector3(0.15, 0.77, 0.25), 0xff0000);

    // Create manual override knob
    const knobGeometry = new THREE.CylinderGeometry(0.15, 0.15, 0.1, 32);
    const knobMaterial = new THREE.MeshStandardMaterial({
      color: darkMode ? 0x44ff66 : 0x006644,
      roughness: 0.3,
      metalness: 0.5
    });
    const knob = new THREE.Mesh(knobGeometry, knobMaterial);
    knob.position.y = 0.8;
    knob.castShadow = true;
    valveNode.add(knob);

    // Add knob grip details
    const knobGripGeometry = new THREE.BoxGeometry(0.25, 0.03, 0.03);
    const knobGrip = new THREE.Mesh(knobGripGeometry, knobMaterial);
    knobGrip.position.y = 0.85;
    valveNode.add(knobGrip);

    // Create flow direction arrows on valve body
    const createFlowArrow = () => {
      const arrowGroup = new THREE.Group();
      
      // Arrow body
      const arrowBodyGeometry = new THREE.BoxGeometry(0.3, 0.05, 0.05);
      const arrowMaterial = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        roughness: 0.5,
        metalness: 0.3
      });
      const arrowBody = new THREE.Mesh(arrowBodyGeometry, arrowMaterial);
      arrowGroup.add(arrowBody);
      
      // Arrow head
      const arrowHeadGeometry = new THREE.ConeGeometry(0.05, 0.1, 8);
      const arrowHead = new THREE.Mesh(arrowHeadGeometry, arrowMaterial);
      arrowHead.position.x = 0.2;
      arrowHead.rotation.z = -Math.PI / 2;
      arrowGroup.add(arrowHead);
      
      return arrowGroup;
    };

    // Add flow direction arrow
    const flowArrow = createFlowArrow();
    flowArrow.position.x = 0;
    flowArrow.position.y = -0.2;
    flowArrow.position.z = 0.35;
    valveNode.add(flowArrow);

    // Create status LED ring
    const ledRingGeometry = new THREE.TorusGeometry(0.25, 0.03, 16, 32);
    const ledRingMaterial = new THREE.MeshStandardMaterial({
      color: darkMode ? 0x00ffaa : 0x00aa88,
      emissive: darkMode ? 0x00ffaa : 0x00aa88,
      emissiveIntensity: 0.8,
      transparent: true,
      opacity: 0.9
    });
    const ledRing = new THREE.Mesh(ledRingGeometry, ledRingMaterial);
    ledRing.position.y = 0.3;
    ledRing.rotation.x = Math.PI / 2;
    valveNode.add(ledRing);

    // Add subtle point light for LED glow
    const ledLight = new THREE.PointLight(darkMode ? 0x00ffaa : 0x00aa88, 0.5, 1);
    ledLight.position.set(0, 0.3, 0);
    valveNode.add(ledLight);

    // Create visible ball valve indicator
    const createBallValveIndicator = () => {
      const indicatorGroup = new THREE.Group();
      
      // Transparent window
      const windowGeometry = new THREE.CylinderGeometry(0.15, 0.15, 0.2, 16);
      const windowMaterial = new THREE.MeshPhysicalMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.3,
        roughness: 0,
        metalness: 0.1,
        clearcoat: 1.0,
        clearcoatRoughness: 0.1
      });
      const window = new THREE.Mesh(windowGeometry, windowMaterial);
      window.rotation.x = Math.PI / 2;
      indicatorGroup.add(window);
      
      // Ball valve inside
      const ballGeometry = new THREE.SphereGeometry(0.12, 16, 16);
      const ballMaterial = new THREE.MeshStandardMaterial({
        color: 0xffcc00,
        roughness: 0.3,
        metalness: 0.8
      });
      const ball = new THREE.Mesh(ballGeometry, ballMaterial);
      
      // Add hole through ball
      const holeGeometry = new THREE.CylinderGeometry(0.06, 0.06, 0.3, 16);
      const holeMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
      const hole = new THREE.Mesh(holeGeometry, holeMaterial);
      hole.rotation.x = Math.PI / 2;
      ball.add(hole);
      
      indicatorGroup.add(ball);
      
      return { indicatorGroup, ball };
    };

    const { indicatorGroup, ball } = createBallValveIndicator();
    indicatorGroup.position.z = 0;
    indicatorGroup.position.y = 0;
    valveNode.add(indicatorGroup);

    // Create wiring terminals
    const createWiringTerminal = (position: THREE.Vector3) => {
      const terminalGroup = new THREE.Group();
      
      // Terminal base
      const termBaseGeometry = new THREE.BoxGeometry(0.15, 0.1, 0.15);
      const termBaseMaterial = new THREE.MeshStandardMaterial({
        color: 0x444444,
        metalness: 0.8,
        roughness: 0.2
      });
      const termBase = new THREE.Mesh(termBaseGeometry, termBaseMaterial);
      terminalGroup.add(termBase);
      
      // Terminal screw
      const screwGeometry = new THREE.CylinderGeometry(0.05, 0.05, 0.05, 16);
      const screwMaterial = new THREE.MeshStandardMaterial({
        color: 0x888888,
        metalness: 0.9,
        roughness: 0.1
      });
      const screw = new THREE.Mesh(screwGeometry, screwMaterial);
      screw.position.y = 0.05;
      terminalGroup.add(screw);
      
      // Add detail to screw head
      const screwDetailGeometry = new THREE.BoxGeometry(0.08, 0.02, 0.01);
      const screwDetail = new THREE.Mesh(screwDetailGeometry, screwMaterial);
      screwDetail.position.y = 0.05;
      screwDetail.rotation.y = Math.PI / 4;
      screw.add(screwDetail);
      
      terminalGroup.position.copy(position);
      return terminalGroup;
    };

    // Add wiring terminals at the back of the motor housing
    valveNode.add(createWiringTerminal(new THREE.Vector3(-0.3, 0.5, -0.4)));
    valveNode.add(createWiringTerminal(new THREE.Vector3(0, 0.5, -0.4)));
    valveNode.add(createWiringTerminal(new THREE.Vector3(0.3, 0.5, -0.4)));

    // Create water-resistant seal
    const sealGeometry = new THREE.TorusGeometry(0.4, 0.03, 16, 32);
    const sealMaterial = new THREE.MeshStandardMaterial({
      color: 0x444444,
      roughness: 0.9,
      metalness: 0.1
    });
    const seal = new THREE.Mesh(sealGeometry, sealMaterial);
    seal.position.y = 0.25;
    seal.rotation.x = Math.PI / 2;
    valveNode.add(seal);

    // Add the whole valve to the scene
    scene.add(valveNode);

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
    let valveOpen = true;
    const animate = () => {
      time += 0.01;
      
      // Gentle valve hover animation
      valveNode.position.y = Math.sin(time * 0.8) * 0.05;
      
      // Status LED pulse
      ledRingMaterial.emissiveIntensity = (Math.sin(time * 2) * 0.2 + 0.8);
      ledLight.intensity = (Math.sin(time * 2) * 0.2 + 0.8) * 0.5;
      
      // Animate valve position every 5 seconds
      if (Math.floor(time) % 5 === 0 && Math.floor(time) !== Math.floor(time - 0.01)) {
        valveOpen = !valveOpen;
        
        // Update LED states based on valve state
        greenLED.ledMaterial.emissiveIntensity = valveOpen ? 0.8 : 0.1;
        redLED.ledMaterial.emissiveIntensity = valveOpen ? 0.1 : 0.8;
      }
      
      // Rotate ball valve indicator based on open/closed state
      const targetRotation = valveOpen ? 0 : Math.PI / 2;
      ball.rotation.z += (targetRotation - ball.rotation.z) * 0.1;
      
      // Update LED color based on valve state
      const openColor = new THREE.Color(darkMode ? 0x00ffaa : 0x00aa88);
      const closedColor = new THREE.Color(0xff3333);
      const currentColor = valveOpen ? openColor : closedColor;
      
      ledRingMaterial.color.lerp(currentColor, 0.1);
      ledRingMaterial.emissive.lerp(currentColor, 0.1);
      ledLight.color.lerp(currentColor, 0.1);
      
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
        <h2 className="text-lg font-bold mb-2">Smart Water Valve Controller</h2>
        <p className="text-sm mb-1"><span className="font-semibold">Type:</span> Electric Actuator Valve</p>
        <p className="text-sm mb-1"><span className="font-semibold">Size:</span> 12cm × 8cm × 6cm</p>
        <p className="text-sm mb-1"><span className="font-semibold">Connection:</span> 3/4&quot; NPT Threads</p>
        <p className="text-sm"><span className="font-semibold">Features:</span> Digital Display, Emergency Override, Multi-LED Status</p>
      </div>
    </div>
  );
}
