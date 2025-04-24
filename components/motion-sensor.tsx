'use client';

import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

export default function MotionSensor() {
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
      color: 0x006633,
      roughness: 0.7,
      metalness: 0.3
    });
    const pcb = new THREE.Mesh(pcbGeometry, pcbMaterial);
    pcb.castShadow = true;
    pcb.receiveShadow = true;
    pcb.position.y = 0.05;
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
    addCircuitTrace(0, 0, 0.05, 1.6);
    addCircuitTrace(0.4, 0, 0.05, 1.6);
    addCircuitTrace(-0.4, 0, 0.05, 1.6);
    addCircuitTrace(0, 0.4, 1.6, 0.05);
    addCircuitTrace(0, -0.4, 1.6, 0.05);
    addCircuitTrace(0, 0.2, 0.8, 0.05);
    addCircuitTrace(0, -0.2, 0.8, 0.05);
    addCircuitTrace(0.2, 0, 0.05, 0.8);
    addCircuitTrace(-0.2, 0, 0.05, 0.8);
    
    // Small IC/processor chip
    const chipGeometry = new THREE.BoxGeometry(0.4, 0.08, 0.4);
    const chipMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x111111, 
      roughness: 0.5,
      metalness: 0.5
    });
    const chip = new THREE.Mesh(chipGeometry, chipMaterial);
    chip.position.set(-0.4, 0.14, -0.4);
    chip.castShadow = true;
    sensorNode.add(chip);
    
    // Add chip pins
    const addChipPins = () => {
      const pinSize = 0.03;
      const pinGeometry = new THREE.BoxGeometry(pinSize, 0.02, pinSize);
      const pinMaterial = new THREE.MeshStandardMaterial({
        color: 0xC0C0C0,
        metalness: 0.8,
        roughness: 0.2
      });
      
      const pins = [];
      const pinOffset = 0.2 - pinSize/2;
      
      // Create pins around the chip
      for (let i = -1; i <= 1; i += 2) {
        for (let j = -1; j <= 1; j += 0.5) {
          // Left and right sides
          const pinRight = new THREE.Mesh(pinGeometry, pinMaterial);
          pinRight.position.set(pinOffset * i, 0, j * pinOffset);
          pins.push(pinRight);
          
          // Top and bottom sides
          const pinTop = new THREE.Mesh(pinGeometry, pinMaterial);
          pinTop.position.set(j * pinOffset, 0, pinOffset * i);
          pins.push(pinTop);
        }
      }
      
      return pins;
    };
    
    const chipPins = addChipPins();
    chipPins.forEach(pin => chip.add(pin));
    
    // Create model name label on chip
    const createChipLabel = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 128;
      canvas.height = 128;
      const ctx = canvas.getContext('2d');
      
      if (ctx) {
        ctx.fillStyle = 'white';
        ctx.font = '12px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('PIR', 64, 50);
        ctx.fillText('CTRL-X2', 64, 70);
        
        const texture = new THREE.CanvasTexture(canvas);
        const material = new THREE.MeshBasicMaterial({
          map: texture,
          transparent: true
        });
        
        const geometry = new THREE.PlaneGeometry(0.3, 0.3);
        const label = new THREE.Mesh(geometry, material);
        label.rotation.x = -Math.PI / 2;
        label.position.y = 0.041;
        return label;
      }
      
      return null;
    };
    
    const chipLabel = createChipLabel();
    if (chipLabel) chip.add(chipLabel);
    
    // Add a small antenna
    const antennaGeometry = new THREE.CylinderGeometry(0.02, 0.02, 0.6, 8);
    const antennaMaterial = new THREE.MeshStandardMaterial({
      color: 0xCCCCCC,
      metalness: 0.8,
      roughness: 0.2
    });
    const antenna = new THREE.Mesh(antennaGeometry, antennaMaterial);
    antenna.position.set(0.75, 0.4, 0.75);
    antenna.castShadow = true;
    sensorNode.add(antenna);
    
    // Add antenna top sphere
    const antennaSphereGeometry = new THREE.SphereGeometry(0.04, 8, 8);
    const antennaSphere = new THREE.Mesh(antennaSphereGeometry, antennaMaterial);
    antennaSphere.position.y = 0.3;
    antenna.add(antennaSphere);
    
    // Add more electronic components for realism
    
    // Resistors
    const createResistor = (x: number, z: number, rotation = 0) => {
      const resistorGroup = new THREE.Group();
      
      const bodyGeometry = new THREE.BoxGeometry(0.25, 0.08, 0.08);
      const bodyMaterial = new THREE.MeshStandardMaterial({
        color: 0x925002, // Brown
        roughness: 0.8,
        metalness: 0.2
      });
      const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
      resistorGroup.add(body);
      
      // Add colored bands
      const bandColors = [0xFF0000, 0x000000, 0x964B00, 0xFFD700];
      const bandWidth = 0.03;
      
      bandColors.forEach((color, i) => {
        const bandGeometry = new THREE.BoxGeometry(bandWidth, 0.085, 0.085);
        const bandMaterial = new THREE.MeshStandardMaterial({ color });
        const band = new THREE.Mesh(bandGeometry, bandMaterial);
        band.position.x = -0.09 + (i * 0.06);
        resistorGroup.add(band);
      });
      
      resistorGroup.position.set(x, 0.14, z);
      resistorGroup.rotation.y = rotation;
      return resistorGroup;
    };
    
    // Add resistors
    sensorNode.add(createResistor(0.5, -0.7, Math.PI / 4));
    sensorNode.add(createResistor(0.7, -0.5, Math.PI / 2));
    
    // Capacitors
    const createCapacitor = (x: number, z: number) => {
      const capGroup = new THREE.Group();
      
      const cylinderGeometry = new THREE.CylinderGeometry(0.06, 0.06, 0.12, 16);
      const cylinderMaterial = new THREE.MeshStandardMaterial({
        color: 0x404040, // Dark gray
        roughness: 0.5,
        metalness: 0.7
      });
      const cylinder = new THREE.Mesh(cylinderGeometry, cylinderMaterial);
      capGroup.add(cylinder);
      
      // Add the + marking on top
      const createPlusMark = () => {
        const canvas = document.createElement('canvas');
        canvas.width = 64;
        canvas.height = 64;
        const ctx = canvas.getContext('2d');
        
        if (ctx) {
          ctx.fillStyle = 'white';
          ctx.fillRect(26, 16, 12, 32);
          ctx.fillRect(16, 26, 32, 12);
          
          const texture = new THREE.CanvasTexture(canvas);
          const material = new THREE.MeshBasicMaterial({
            map: texture,
            transparent: true
          });
          
          const geometry = new THREE.CircleGeometry(0.05, 16);
          const plusMark = new THREE.Mesh(geometry, material);
          plusMark.rotation.x = -Math.PI / 2;
          plusMark.position.y = 0.061;
          return plusMark;
        }
        
        return null;
      };
      
      const plusMark = createPlusMark();
      if (plusMark) cylinder.add(plusMark);
      
      capGroup.position.set(x, 0.16, z);
      return capGroup;
    };
    
    // Add capacitors 
    sensorNode.add(createCapacitor(-0.6, -0.7));
    sensorNode.add(createCapacitor(-0.7, -0.5));
    
    // Create screw terminals for wiring at the corners
    const createTerminal = (x: number, z: number) => {
      const terminalGroup = new THREE.Group();
      
      // Terminal base
      const termBaseGeometry = new THREE.BoxGeometry(0.15, 0.1, 0.15);
      const termBaseMaterial = new THREE.MeshStandardMaterial({
        color: 0x444444,
        metalness: 0.8,
        roughness: 0.2
      });
      const termBase = new THREE.Mesh(termBaseGeometry, termBaseMaterial);
      termBase.position.y = 0.05;
      terminalGroup.add(termBase);
      
      // Terminal screw
      const screwGeometry = new THREE.CylinderGeometry(0.05, 0.05, 0.12, 16);
      const screwMaterial = new THREE.MeshStandardMaterial({
        color: 0x888888,
        metalness: 0.9,
        roughness: 0.1
      });
      const screw = new THREE.Mesh(screwGeometry, screwMaterial);
      screw.position.y = 0.08;
      screw.rotation.x = Math.PI/2;
      terminalGroup.add(screw);
      
      // Add detail to screw head
      const screwDetailGeometry = new THREE.BoxGeometry(0.08, 0.02, 0.01);
      const screwDetail = new THREE.Mesh(screwDetailGeometry, screwMaterial);
      screwDetail.position.z = 0.06;
      screw.add(screwDetail);
      
      terminalGroup.position.set(x, 0, z);
      return terminalGroup;
    };
    
    // Add four terminals at the corners
    sensorNode.add(createTerminal(0.75, 0.35));
    sensorNode.add(createTerminal(-0.75, 0.75));
    sensorNode.add(createTerminal(0.35, -0.75));
    sensorNode.add(createTerminal(-0.75, -0.75));
    
    // Create proper hemispherical dome for motion sensor
    const domeGroup = new THREE.Group();
    domeGroup.position.set(-0.4, 0.1, 0.5); // Positioned away from antenna
    sensorNode.add(domeGroup);
    
    // Define clipping plane that cuts off anything below the PCB surface
    const clippingPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
    
    // Create the hemisphere dome with reduced thickness
    const domeRadius = 0.35;
    const domeThickness = 0.03; // Reduced thickness
    const domeSegments = 32;
    
    // Create opaque plate at the bottom of the dome to completely seal it
    // This plate blocks any view of the underside of the dome
    const basePlateGeometry = new THREE.CircleGeometry(domeRadius, 32);
    const basePlateMaterial = new THREE.MeshStandardMaterial({
      color: 0x006633, // Match PCB color exactly
      metalness: 0.3,
      roughness: 0.7,
      side: THREE.DoubleSide
    });
    const basePlate = new THREE.Mesh(basePlateGeometry, basePlateMaterial);
    basePlate.rotation.x = Math.PI / 2;
    basePlate.position.y = 0;
    domeGroup.add(basePlate);
    
    // Outer dome shell (with clipping)
    const domeOuterGeometry = new THREE.SphereGeometry(domeRadius, domeSegments, domeSegments, 0, Math.PI * 2, 0, Math.PI / 2);
    const domeMaterial = new THREE.MeshStandardMaterial({
      color: 0xffffff, // White color
      metalness: 0.2,
      roughness: 0.5,
      side: THREE.FrontSide, // Only render front face
      clippingPlanes: [clippingPlane]
    });
    const domeOuter = new THREE.Mesh(domeOuterGeometry, domeMaterial);
    domeOuter.castShadow = true;
    domeGroup.add(domeOuter);
    
    // Inner dome shell (with clipping)
    const domeInnerGeometry = new THREE.SphereGeometry(domeRadius - domeThickness, domeSegments, domeSegments, 0, Math.PI * 2, 0, Math.PI / 2);
    const domeInnerMaterial = new THREE.MeshStandardMaterial({
      color: 0xffffff, 
      side: THREE.BackSide, // Render inside
      clippingPlanes: [clippingPlane]
    });
    const domeInner = new THREE.Mesh(domeInnerGeometry, domeInnerMaterial);
    domeGroup.add(domeInner);
    
    // Add fresnel lens pattern underneath the dome
    const createFresnelPattern = () => {
      const fresnelGroup = new THREE.Group();
      const rings = 6;
      const baseRadius = 0.32;
      const ringWidth = 0.05;
      
      for (let i = 0; i < rings; i++) {
        const radius = baseRadius - (i * ringWidth / rings);
        const ringGeometry = new THREE.TorusGeometry(radius, 0.003, 8, 32);
        const ringMaterial = new THREE.MeshStandardMaterial({
          color: darkMode ? 0x8fffaa : 0x009977,
          transparent: true,
          opacity: 0.4,
        });
        const ring = new THREE.Mesh(ringGeometry, ringMaterial);
        fresnelGroup.add(ring);
      }
      
      fresnelGroup.position.y = 0.01;
      return fresnelGroup;
    };
    
    const fresnelPattern = createFresnelPattern();
    domeGroup.add(fresnelPattern);
    
    // Create detection lens inside dome (PIR sensor)
    const lensGeometry = new THREE.SphereGeometry(0.2, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2);
    const lensMaterial = new THREE.MeshStandardMaterial({
      color: darkMode ? 0x8fffaa : 0x009977,
      transparent: true,
      opacity: 0.7,
      metalness: 0.1,
      roughness: 0.2
    });
    const lens = new THREE.Mesh(lensGeometry, lensMaterial);
    lens.position.y = 0.15; // Position inside dome
    domeGroup.add(lens);
    
    // Create IR emitter and receiver inside dome
    const createSensor = (x: number, color: number) => {
      const sensorGroup = new THREE.Group();
      
      // Sensor base
      const sensorBaseGeometry = new THREE.CylinderGeometry(0.04, 0.04, 0.04, 16);
      const sensorBaseMaterial = new THREE.MeshStandardMaterial({
        color: 0x222222,
        metalness: 0.8,
        roughness: 0.2
      });
      const sensorBase = new THREE.Mesh(sensorBaseGeometry, sensorBaseMaterial);
      sensorGroup.add(sensorBase);
      
      // Sensor lens
      const sensorLensGeometry = new THREE.SphereGeometry(0.035, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2);
      const sensorLensMaterial = new THREE.MeshStandardMaterial({
        color: color,
        transparent: true,
        opacity: 0.8,
        metalness: 0.2,
        roughness: 0.1
      });
      const sensorLens = new THREE.Mesh(sensorLensGeometry, sensorLensMaterial);
      sensorLens.position.y = 0.02;
      sensorGroup.add(sensorLens);
      
      return sensorGroup;
    };
    
    // Position IR sensors inside dome
    const irEmitter = createSensor(0, 0x660000); // IR emitter (red tint)
    irEmitter.position.set(0.15, 0.1, 0);
    irEmitter.rotation.x = -Math.PI/3;
    domeGroup.add(irEmitter);
    
    const irReceiver = createSensor(0, 0x000066); // IR receiver (blue tint)
    irReceiver.position.set(-0.15, 0.1, 0);
    irReceiver.rotation.x = -Math.PI/3;
    domeGroup.add(irReceiver);
    
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
    const statusLED = createLED(0.5, -0.5, darkMode ? 0x00ffaa : 0x009977);
    sensorNode.add(statusLED.led);
    
    // Add the whole sensor to the scene
    scene.add(sensorNode);
    
    // Add visual detection conical field effect ABOVE the dome (with clipping)
    const createDetectionField = () => {
      // Use a specialized geometry to ensure we only have the top portion of the cone
      // Start y position higher to prevent bottom from reaching below the PCB
      const fieldGeometry = new THREE.ConeGeometry(0.8, 0.8, 32, 1, true);
      const fieldMaterial = new THREE.MeshBasicMaterial({
        color: darkMode ? 0x00ffaa : 0x00aa88,
        transparent: true,
        opacity: 0.05,
        wireframe: true,
        clippingPlanes: [clippingPlane]
      });
      const field = new THREE.Mesh(fieldGeometry, fieldMaterial);
      field.rotation.x = Math.PI; // Point upward
      field.position.y = 0.5; // Position higher above the dome
      return field;
    };
    
    const detectionField = createDetectionField();
    domeGroup.add(detectionField);
    
    // Create a thin bottom plate to hide any potential rendering issues with clipping
    const bottomCoverGeometry = new THREE.CircleGeometry(domeRadius + 0.02, 32);
    const bottomCoverMaterial = new THREE.MeshStandardMaterial({
      color: darkMode ? 0x1a2e20 : 0xd0e8ff,
      metalness: 0.4,
      roughness: 0.6,
    });
    const bottomCover = new THREE.Mesh(bottomCoverGeometry, bottomCoverMaterial);
    bottomCover.rotation.x = Math.PI / 2;
    bottomCover.position.y = 0; // Align with the PCB top
    domeGroup.add(bottomCover);
    
    // Add components to the underside of the PCB for better appearance
    const underComponents = new THREE.Group();
    
    // Create SMD components on bottom of PCB
    const createSMDComponent = (x: number, z: number, width: number, length: number, color: number) => {
      const smdGeometry = new THREE.BoxGeometry(width, 0.04, length);
      const smdMaterial = new THREE.MeshStandardMaterial({
        color: color,
        metalness: 0.3,
        roughness: 0.7
      });
      const smd = new THREE.Mesh(smdGeometry, smdMaterial);
      smd.position.set(x, -0.07, z);
      return smd;
    };
    
    // Add various SMD components to bottom
    underComponents.add(createSMDComponent(0.3, 0.4, 0.3, 0.2, 0x222222));   // IC
    underComponents.add(createSMDComponent(-0.5, 0.3, 0.2, 0.1, 0x333333));  // Small IC
    underComponents.add(createSMDComponent(0.6, -0.3, 0.1, 0.2, 0x222222));  // Voltage regulator
    
    // Add small SMD resistors and capacitors
    for (let i = 0; i < 8; i++) {
      const x = Math.random() * 1.4 - 0.7;
      const z = Math.random() * 1.4 - 0.7;
      // Skip adding component if it's near dome center
      if (Math.sqrt(Math.pow(x + 0.4, 2) + Math.pow(z - 0.5, 2)) < 0.35) {
        continue;
      }
      
      // Random choice between resistor (rectangular) and capacitor (square)
      if (Math.random() > 0.5) {
        // Resistor (rectangular)
        underComponents.add(createSMDComponent(x, z, 0.1, 0.05, 0x111111));
      } else {
        // Capacitor (square)
        underComponents.add(createSMDComponent(x, z, 0.06, 0.06, 0x222222));
      }
    }
    
    // Add trace lines on bottom
    const createBottomTrace = (x: number, z: number, width: number, length: number, rotation = 0) => {
      const traceGeometry = new THREE.BoxGeometry(width, 0.01, length);
      const traceMaterial = new THREE.MeshStandardMaterial({
        color: 0xCFB53B, // Gold color
        roughness: 0.2,
        metalness: 0.8,
        emissive: darkMode ? 0x332200 : 0x000000,
        emissiveIntensity: darkMode ? 0.2 : 0
      });
      const trace = new THREE.Mesh(traceGeometry, traceMaterial);
      trace.position.set(x, -0.05, z);
      trace.rotation.y = rotation;
      return trace;
    };
    
    // Create grid pattern for bottom traces
    for (let i = -0.6; i <= 0.6; i += 0.3) {
      underComponents.add(createBottomTrace(i, 0, 0.03, 1.6, 0));
      underComponents.add(createBottomTrace(0, i, 1.6, 0.03, 0));
    }
    
    // Create JTAG debug connector
    const debugConnectorGeometry = new THREE.BoxGeometry(0.4, 0.1, 0.1);
    const debugConnectorMaterial = new THREE.MeshStandardMaterial({
      color: 0x333333,
      roughness: 0.5,
      metalness: 0.5
    });
    const debugConnector = new THREE.Mesh(debugConnectorGeometry, debugConnectorMaterial);
    debugConnector.position.set(0.6, -0.1, 0.6);
    
    // Add pins to the debug connector
    for (let i = 0; i < 5; i++) {
      const pinGeometry = new THREE.CylinderGeometry(0.01, 0.01, 0.06, 8);
      const pinMaterial = new THREE.MeshStandardMaterial({
        color: 0xCCCCCC,
        metalness: 0.9,
        roughness: 0.1
      });
      const pin = new THREE.Mesh(pinGeometry, pinMaterial);
      pin.position.set((i - 2) * 0.08, 0, 0);
      pin.rotation.x = Math.PI / 2;
      debugConnector.add(pin);
    }
    
    underComponents.add(debugConnector);
    
    // Add QR code or barcode on bottom
    const createBarcode = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 128;
      canvas.height = 128;
      const ctx = canvas.getContext('2d');
      
      if (ctx) {
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, 128, 128);
        
        // Draw barcode-like pattern
        ctx.fillStyle = 'black';
        for (let i = 0; i < 20; i++) {
          if (Math.random() > 0.5) {
            const x = i * 6 + 4;
            const width = 4;
            ctx.fillRect(x, 10, width, 108);
          }
        }
        
        const texture = new THREE.CanvasTexture(canvas);
        const material = new THREE.MeshBasicMaterial({
          map: texture
        });
        
        const geometry = new THREE.PlaneGeometry(0.4, 0.15);
        const barcode = new THREE.Mesh(geometry, material);
        barcode.rotation.x = Math.PI;
        barcode.position.set(-0.5, -0.051, -0.5);
        return barcode;
      }
      
      return null;
    };
    
    const barcode = createBarcode();
    if (barcode) underComponents.add(barcode);
    
    sensorNode.add(underComponents);
    
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
      signal.position.set(0.75, 0.7 + i * 0.2, 0.75);
      signal.rotation.x = Math.PI / 2;
      signal.scale.set(1, 1, 1);
      
      signalRings.push({
        mesh: signal,
        initialY: 0.7 + i * 0.2,
        speed: 0.01 + i * 0.005
      });
      
      scene.add(signal);
    }
    
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
      statusLED.material.emissiveIntensity = (Math.sin(time * 2) * 0.2 + 0.8);
      statusLED.light.intensity = (Math.sin(time * 2) * 0.2 + 0.8) * 0.5;
      
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
      
      // Pulse detection field
      if (detectionField.material instanceof THREE.MeshBasicMaterial) {
        detectionField.material.opacity = 0.03 + Math.sin(time * 1.5) * 0.02;
      }
      
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
        <h2 className="text-lg font-bold mb-2">MotionSense PIR-X200</h2>
        <p className="text-sm mb-1"><span className="font-semibold">Type:</span> PIR & IR Proximity</p>
        <p className="text-sm mb-1"><span className="font-semibold">Range:</span> Up to 7m (Motion), 2m (Proximity)</p>
        <p className="text-sm mb-1"><span className="font-semibold">Coverage:</span> 120° Detection Field</p>
        <p className="text-sm"><span className="font-semibold">Features:</span> Wireless, LED Status Indicator</p>
      </div>
    </div>
  );
}