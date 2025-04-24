"use client"
import { useEffect, useState, useRef, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

export default function MotorActuator() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isLEDOn, setIsLEDOn] = useState(false);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const motorRef = useRef<THREE.Group | null>(null);
  const ledRef = useRef<THREE.Mesh | null>(null);

  // Wrap createMotor in useCallback to maintain stable function reference
  const createMotor = useCallback((isDarkMode: boolean) => {
    const motorGroup = new THREE.Group();
    if (!sceneRef.current) return;
    sceneRef.current.add(motorGroup);
    motorRef.current = motorGroup;
    
    // Colors
    const housingColor = isDarkMode ? 0x1a2e20 : 0xd0e8ff;
    const endCapColor = isDarkMode ? 0x8fffaa : 0x009977;
    const shaftColor = isDarkMode ? 0x44ff66 : 0x006644;
    const ledColor = isDarkMode ? 0x00ffaa : 0x00aa88;
    
    // Motor housing (cylindrical body with cooling ribs)
    const housingLength = 25;
    const housingRadius = 2.5;
    
    // Main cylinder
    const housingGeometry = new THREE.CylinderGeometry(housingRadius, housingRadius, housingLength, 32);
    const housingMaterial = new THREE.MeshPhongMaterial({ 
      color: housingColor,
      shininess: 30
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
        angle, 
        Math.PI / ribCount
      );
      
      const rib = new THREE.Mesh(ribGeometry, housingMaterial);
      rib.rotation.z = Math.PI / 2;
      motorGroup.add(rib);
    }
    
    // End caps
    const endCapGeometry = new THREE.CylinderGeometry(housingRadius + 0.2, housingRadius + 0.2, 1, 32);
    const endCapMaterial = new THREE.MeshPhongMaterial({ 
      color: endCapColor,
      shininess: 50
    });
    
    // Left end cap
    const leftEndCap = new THREE.Mesh(endCapGeometry, endCapMaterial);
    leftEndCap.rotation.z = Math.PI / 2;
    leftEndCap.position.x = -housingLength / 2;
    motorGroup.add(leftEndCap);
    
    // Right end cap
    const rightEndCap = new THREE.Mesh(endCapGeometry, endCapMaterial);
    rightEndCap.rotation.z = Math.PI / 2;
    rightEndCap.position.x = housingLength / 2;
    motorGroup.add(rightEndCap);
    
    // Drive shaft
    const shaftGeometry = new THREE.CylinderGeometry(0.8, 0.8, 4, 16);
    const shaftMaterial = new THREE.MeshStandardMaterial({ 
      color: shaftColor,
      metalness: 0.8,
      roughness: 0.2
    });
    const shaft = new THREE.Mesh(shaftGeometry, shaftMaterial);
    shaft.rotation.z = Math.PI / 2;
    shaft.position.x = housingLength / 2 + 2;
    motorGroup.add(shaft);
    
    // Shaft adapter (hexagonal)
    const adapterGeometry = new THREE.CylinderGeometry(1.2, 1.2, 1, 6);
    const adapter = new THREE.Mesh(adapterGeometry, shaftMaterial);
    adapter.rotation.z = Math.PI / 2;
    adapter.position.x = housingLength / 2 + 4;
    motorGroup.add(adapter);
    
    // Limit switch adjustment ports
    const portGeometry = new THREE.CylinderGeometry(0.3, 0.3, 0.2, 16);
    const portMaterial = new THREE.MeshPhongMaterial({ color: 0x222222 });
    
    // Port 1
    const port1 = new THREE.Mesh(portGeometry, portMaterial);
    port1.position.set(-housingLength / 2 + 2, housingRadius, 0);
    port1.rotation.x = Math.PI / 2;
    motorGroup.add(port1);
    
    // Port 2
    const port2 = new THREE.Mesh(portGeometry, portMaterial);
    port2.position.set(-housingLength / 2 + 4, housingRadius, 0);
    port2.rotation.x = Math.PI / 2;
    motorGroup.add(port2);
    
    // Control board housing
    const boardGeometry = new THREE.BoxGeometry(4, 2, 1.5);
    const boardMaterial = new THREE.MeshPhongMaterial({ color: 0x333333 });
    const board = new THREE.Mesh(boardGeometry, boardMaterial);
    board.position.set(-housingLength / 2 + 6, -housingRadius - 1, 0);
    motorGroup.add(board);
    
    // Status LED
    const ledGeometry = new THREE.SphereGeometry(0.3, 16, 16);
    const ledMaterial = new THREE.MeshPhongMaterial({ 
      color: ledColor,
      emissive: ledColor,
      emissiveIntensity: 0.5,
      shininess: 100
    });
    const led = new THREE.Mesh(ledGeometry, ledMaterial);
    led.position.set(-housingLength / 2 + 6, -housingRadius - 0.5, 0.8);
    motorGroup.add(led);
    ledRef.current = led;
    
    // Power cable
    const cableGeometry = new THREE.TubeGeometry(
      new THREE.CatmullRomCurve3([
        new THREE.Vector3(-housingLength / 2 + 8, -housingRadius - 1, 0),
        new THREE.Vector3(-housingLength / 2 + 10, -housingRadius - 2, 0),
        new THREE.Vector3(-housingLength / 2 + 12, -housingRadius - 3, 2),
        new THREE.Vector3(-housingLength / 2 + 14, -housingRadius - 5, 4)
      ]),
      20,
      0.3,
      8,
      false
    );
    const cableMaterial = new THREE.MeshPhongMaterial({ color: 0x222222 });
    const cable = new THREE.Mesh(cableGeometry, cableMaterial);
    motorGroup.add(cable);
    
    // Mounting brackets
    const bracketMaterial = new THREE.MeshPhongMaterial({ color: 0x666666 });
    
    // Left bracket
    const leftBracketGroup = new THREE.Group();
    leftBracketGroup.position.set(-housingLength / 2 - 0.5, 0, 0);
    motorGroup.add(leftBracketGroup);
    
    const leftBracketBase = new THREE.Mesh(
      new THREE.BoxGeometry(0.5, 5, 5),
      bracketMaterial
    );
    leftBracketGroup.add(leftBracketBase);
    
    const leftBracketHole = new THREE.Mesh(
      new THREE.CylinderGeometry(housingRadius + 0.1, housingRadius + 0.1, 0.6, 32),
      bracketMaterial
    );
    leftBracketHole.rotation.z = Math.PI / 2;
    leftBracketHole.position.x = 0.3;
    leftBracketGroup.add(leftBracketHole);
    
    // Right bracket
    const rightBracketGroup = new THREE.Group();
    rightBracketGroup.position.set(housingLength / 2 + 0.5, 0, 0);
    motorGroup.add(rightBracketGroup);
    
    const rightBracketBase = new THREE.Mesh(
      new THREE.BoxGeometry(0.5, 5, 5),
      bracketMaterial
    );
    rightBracketGroup.add(rightBracketBase);
    
    const rightBracketHole = new THREE.Mesh(
      new THREE.CylinderGeometry(housingRadius + 0.1, housingRadius + 0.1, 0.6, 32),
      bracketMaterial
    );
    rightBracketHole.rotation.z = Math.PI / 2;
    rightBracketHole.position.x = -0.3;
    rightBracketGroup.add(rightBracketHole);
    
    // Center the entire motor
    motorGroup.position.y = 0;

    // Add IoT connectivity hardware (simple non-interactive antenna)
    const iotModule = new THREE.Group();
    iotModule.position.set(housingLength / 2 - 5, -housingRadius - 1.5, 0);
    motorGroup.add(iotModule);
    
    // Module base - communication module housing
    const moduleBaseGeometry = new THREE.BoxGeometry(4, 1.2, 2.5);
    const moduleBaseMaterial = new THREE.MeshPhongMaterial({
      color: isDarkMode ? 0x222222 : 0x444444,
      shininess: 50
    });
    const moduleBase = new THREE.Mesh(moduleBaseGeometry, moduleBaseMaterial);
    iotModule.add(moduleBase);
    
    // Add small details to make it look like a communication module
    // PCB Board visible through translucent cover
    const pcbGeometry = new THREE.BoxGeometry(3.5, 0.2, 2);
    const pcbMaterial = new THREE.MeshPhongMaterial({
      color: 0x006600,
      shininess: 30
    });
    const pcb = new THREE.Mesh(pcbGeometry, pcbMaterial);
    pcb.position.y = -0.4;
    iotModule.add(pcb);
    
    // Add electronic components to PCB
    const addComponent = (x: number, z: number, size: number, color: number) => {
      const compGeometry = new THREE.BoxGeometry(size, 0.3, size);
      const compMaterial = new THREE.MeshPhongMaterial({
        color: color,
        shininess: 80
      });
      const component = new THREE.Mesh(compGeometry, compMaterial);
      component.position.set(x, -0.25, z);
      iotModule.add(component);
    };
    
    // Add various components
    addComponent(-1, -0.5, 0.8, 0x111111); // Main chip
    addComponent(0.8, -0.5, 0.5, 0x999999); // RF module
    addComponent(0, 0.5, 0.6, 0x333333); // Another component
    
    // Antenna - simple but clearly visible
    const antennaBaseGeometry = new THREE.CylinderGeometry(0.2, 0.3, 0.3, 16);
    const antennaMaterial = new THREE.MeshPhongMaterial({ 
      color: 0x333333,
      shininess: 60
    });
    const antennaBase = new THREE.Mesh(antennaBaseGeometry, antennaMaterial);
    antennaBase.position.set(1.5, 0.75, 0);
    iotModule.add(antennaBase);
    
    // Main antenna rod
    const antennaRodGeometry = new THREE.CylinderGeometry(0.05, 0.05, 3, 8);
    const antennaRodMaterial = new THREE.MeshStandardMaterial({
      color: isDarkMode ? 0x444444 : 0x222222, 
      metalness: 0.8,
      roughness: 0.2
    });
    const antennaRod = new THREE.Mesh(antennaRodGeometry, antennaRodMaterial);
    antennaRod.position.set(1.5, 2.25, 0);
    iotModule.add(antennaRod);
    
    // Antenna tip with small indicator
    const antennaTipGeometry = new THREE.SphereGeometry(0.1, 16, 16);
    const antennaTipMaterial = new THREE.MeshPhongMaterial({
      color: 0x00ffff,
      emissive: 0x00ffff,
      emissiveIntensity: 0.5,
      shininess: 100
    });
    const antennaTip = new THREE.Mesh(antennaTipGeometry, antennaTipMaterial);
    antennaTip.position.set(1.5, 3.5, 0);
    iotModule.add(antennaTip);
    
    // Secondary antenna (shorter, different angle)
    const antenna2Base = antennaBase.clone();
    antenna2Base.position.set(0.5, 0.75, 0.8);
    iotModule.add(antenna2Base);
    
    const antenna2Rod = new THREE.Mesh(
      new THREE.CylinderGeometry(0.04, 0.04, 2, 8),
      antennaRodMaterial
    );
    antenna2Rod.position.set(0.5, 1.75, 0.8);
    antenna2Rod.rotation.x = Math.PI / 6; // Slight angle
    iotModule.add(antenna2Rod);
    
    const antenna2Tip = antennaTip.clone();
    antenna2Tip.position.set(0.5, 2.7, 1.2); // Position adjusted for angle
    antenna2Tip.scale.set(0.8, 0.8, 0.8); // Slightly smaller
    iotModule.add(antenna2Tip);
    
    // Add WiFi symbol to show it's a connected device
    const createWifiIcon = () => {
      const wifiGroup = new THREE.Group();
      
      // Create three curved lines for WiFi symbol
      for (let i = 0; i < 3; i++) {
        const curve = new THREE.EllipseCurve(
          0, 0,               // Center
          0.3 + (i * 0.2),    // xRadius, yRadius
          0.3 + (i * 0.2),
          Math.PI / 4,        // StartAngle
          Math.PI * 3/4,      // EndAngle
          false               // Clockwise
        );
        
        const points = curve.getPoints(12);
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const material = new THREE.LineBasicMaterial({ color: 0x00ffff });
        const arc = new THREE.Line(geometry, material);
        
        arc.position.y = -i * 0.1;
        wifiGroup.add(arc);
      }
      
      // Add dot at bottom
      const dotGeometry = new THREE.SphereGeometry(0.05, 8, 8);
      const dotMaterial = new THREE.MeshBasicMaterial({ color: 0x00ffff });
      const dot = new THREE.Mesh(dotGeometry, dotMaterial);
      dot.position.y = -0.4;
      wifiGroup.add(dot);
      
      return wifiGroup;
    };
    
    const wifiIcon = createWifiIcon();
    wifiIcon.position.set(-1, 0.6, 1.26);
    wifiIcon.rotation.x = -Math.PI / 2;
    iotModule.add(wifiIcon);
  }, [sceneRef, motorRef, ledRef]); // Include all refs that are used in the function

  useEffect(() => {
    // Check system preference for dark mode
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setIsDarkMode(true);
    }

    if (!containerRef.current) return;

    // Scene setup
    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;
    
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(isDarkMode ? 0x121212 : 0xf0f0f0);
    sceneRef.current = scene;
    
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 10, 50);
    
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.shadowMap.enabled = true;
    containerRef.current.appendChild(renderer.domElement);
    
    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 20, 15);
    directionalLight.castShadow = true;
    scene.add(directionalLight);
    
    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.1;
    controls.enablePan = false;
    
    // Create the motor
    createMotor(isDarkMode);
    
    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();
    
    // LED blinking effect
    const ledInterval = setInterval(() => {
      setIsLEDOn(prev => !prev);
    }, 2000);
    
    // Handle window resize
    const handleResize = () => {
      if (!containerRef.current) return;
      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    window.addEventListener('resize', handleResize);
    
    // Capture current ref for cleanup
    const currentContainer = containerRef.current;

    return () => {
      window.removeEventListener('resize', handleResize);
      if (currentContainer) {
        currentContainer.removeChild(renderer.domElement);
      }
      clearInterval(ledInterval);
    };
  }, [isDarkMode, createMotor]); // Add createMotor to dependency array
  
  // Update colors when dark mode changes
  useEffect(() => {
    if (sceneRef.current) {
      sceneRef.current.background = new THREE.Color(isDarkMode ? 0x121212 : 0xf0f0f0);
      updateMotorColors(isDarkMode);
    }
  }, [isDarkMode]);
  
  // Update LED status
  useEffect(() => {
    if (ledRef.current) {
      const material = ledRef.current.material as THREE.MeshPhongMaterial;
      material.emissive = new THREE.Color(isLEDOn ? (isDarkMode ? 0x00ffaa : 0x00aa88) : 0x001100);
      material.needsUpdate = true;
    }
  }, [isLEDOn, isDarkMode]);
  
  function updateMotorColors(isDarkMode: boolean) {
    if (!motorRef.current) return;
    
    const housingColor = isDarkMode ? 0x1a2e20 : 0xd0e8ff;
    const endCapColor = isDarkMode ? 0x8fffaa : 0x009977;
    const shaftColor = isDarkMode ? 0x44ff66 : 0x006644;
    
    motorRef.current.traverse((child: THREE.Object3D) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        // Update housing color
        if (mesh.geometry.type === 'CylinderGeometry' && 
            (mesh.geometry as THREE.CylinderGeometry).parameters.radiusTop === 2.5) {
          (mesh.material as THREE.MeshPhongMaterial).color.set(housingColor);
        }
        
        // Update end caps color
        if (mesh.geometry.type === 'CylinderGeometry' && 
            (mesh.geometry as THREE.CylinderGeometry).parameters.radiusTop === 2.7) {
          (mesh.material as THREE.MeshPhongMaterial).color.set(endCapColor);
        }
        
        // Update shaft color
        if (mesh.geometry.type === 'CylinderGeometry' && 
            ((mesh.geometry as THREE.CylinderGeometry).parameters.radiusTop === 0.8 || 
             (mesh.geometry as THREE.CylinderGeometry).parameters.radiusTop === 1.2)) {
          (mesh.material as THREE.MeshPhongMaterial).color.set(shaftColor);
        }
      }
    });
  }
  
  return (
    <div className="relative w-full h-screen">
      <div ref={containerRef} className="w-full h-full"></div>
      <div className="absolute bottom-5 right-5 flex gap-2.5">
        <button 
          onClick={() => setIsDarkMode(!isDarkMode)}
          className={`px-5 py-2.5 border-none rounded cursor-pointer transition-all duration-200 ${
            isDarkMode 
              ? 'bg-gray-800 text-white hover:bg-gray-700' 
              : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
          }`}
        >
          Toggle {isDarkMode ? 'Light' : 'Dark'} Mode
        </button>
      </div>
    </div>
  );
}
