'use client';

import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

export default function IoTGateway() {
  const mountRef = useRef<HTMLDivElement>(null);
  const [isDarkMode, setIsDarkMode] = useState(true);
  
  useEffect(() => {
    // Scene, camera, and renderer setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(isDarkMode ? 0x0a1a20 : 0xf0f8ff);
    
    const camera = new THREE.PerspectiveCamera(
      45, 
      window.innerWidth / window.innerHeight, 
      0.1, 
      1000
    );
    camera.position.set(0, 10, 40);
    
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    
    // Mount the renderer to the DOM
    if (mountRef.current) {
      mountRef.current.appendChild(renderer.domElement);
    }
    
    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    
    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 10, 5);
    directionalLight.castShadow = true;
    scene.add(directionalLight);
    
    const pointLight = new THREE.PointLight(0xffffff, 0.5);
    pointLight.position.set(-5, 5, -5);
    scene.add(pointLight);
    
    // Materials
    const mainBodyMaterial = new THREE.MeshStandardMaterial({
      color: isDarkMode ? 0x1a2e20 : 0xd0e8ff,
      roughness: 0.7,
      metalness: 0.3
    });
    
    const topSurfaceMaterial = new THREE.MeshStandardMaterial({
      color: isDarkMode ? 0x8fffaa : 0x009977,
      roughness: 0.3,
      metalness: 0.7
    });
    
    // Renamed the first declaration to avoid redeclaration
    const screenMaterial = new THREE.MeshStandardMaterial({
      color: isDarkMode ? 0x00ffaa : 0x00aa88,
      roughness: 0.2,
      metalness: 0.8,
      emissive: isDarkMode ? 0x00ffaa : 0x00aa88,
      emissiveIntensity: isDarkMode ? 0.5 : 0.3
    });
    
    const lightRingMaterial = new THREE.MeshStandardMaterial({
      color: isDarkMode ? 0x44ff66 : 0x006644,
      roughness: 0.1,
      metalness: 0.9,
      emissive: isDarkMode ? 0x44ff66 : 0x006644,
      emissiveIntensity: isDarkMode ? 0.8 : 0.4
    });
    
    const ventilationMaterial = new THREE.MeshStandardMaterial({
      color: isDarkMode ? 0x2a3e30 : 0xb0c8df,
      roughness: 0.6,
      metalness: 0.2
    });
    
    const portMaterial = new THREE.MeshStandardMaterial({
      color: 0x222222,
      roughness: 0.8,
      metalness: 0.5
    });
    
    const antennaBaseMaterial = new THREE.MeshStandardMaterial({
      color: 0x333333,
      roughness: 0.4,
      metalness: 0.7
    });
    
    const antennaRodMaterial = new THREE.MeshStandardMaterial({
      color: 0x888888,
      roughness: 0.2,
      metalness: 0.9
    });
    
    // Dimensions
    const height = 15;
    const diameter = 8;
    const radius = diameter / 2;
    
    // Gateway body
    const gatewayGroup = new THREE.Group();
    scene.add(gatewayGroup);
    
    // Main body
    const cylinderGeometry = new THREE.CylinderGeometry(radius, radius, height, 32);
    const cylinder = new THREE.Mesh(cylinderGeometry, mainBodyMaterial);
    cylinder.castShadow = true;
    cylinder.receiveShadow = true;
    gatewayGroup.add(cylinder);
    
    // Top surface
    const topSurfaceGeometry = new THREE.CylinderGeometry(radius, radius, 0.5, 32);
    const topSurface = new THREE.Mesh(topSurfaceGeometry, topSurfaceMaterial);
    topSurface.position.y = height / 2;
    topSurface.castShadow = true;
    topSurface.receiveShadow = true;
    gatewayGroup.add(topSurface);
    
    // Status display - curved to match cylinder
    const displayWidth = 4;
    const displayHeight = 2;
    const displayCurveRadius = radius + 0.05;
    const displayCurveSegments = 16;
    const displayAngle = Math.atan2(displayWidth / 2, displayCurveRadius) * 2;
    
    // Create a curved display geometry to follow cylinder curvature
    const displayGeometry = new THREE.CylinderGeometry(
      displayCurveRadius,
      displayCurveRadius,
      displayHeight,
      displayCurveSegments,
      1,
      true,
      -displayAngle / 2,
      displayAngle
    );
    
    // Create display material with higher emissive intensity for glow effect
    const displayMaterial = new THREE.MeshStandardMaterial({
      color: isDarkMode ? 0x00ffaa : 0x00aa88,
      roughness: 0.2,
      metalness: 0.8,
      emissive: isDarkMode ? 0x00ffaa : 0x00aa88,
      emissiveIntensity: isDarkMode ? 1.5 : 0.8
    });
    
    const display = new THREE.Mesh(displayGeometry, displayMaterial);
    display.position.set(0, 2, 0);
    display.rotation.y = 0;
    display.castShadow = false;
    display.receiveShadow = true;
    gatewayGroup.add(display);
    
    // Add a subtle glow effect around the display
    const displayGlowGeometry = new THREE.CylinderGeometry(
      displayCurveRadius + 0.05,
      displayCurveRadius + 0.05,
      displayHeight + 0.1,
      displayCurveSegments,
      1,
      true,
      -displayAngle / 2 - 0.05,
      displayAngle + 0.1
    );
    
    const glowMaterial = new THREE.MeshBasicMaterial({
      color: isDarkMode ? 0x00ffaa : 0x00aa88,
      transparent: true,
      opacity: 0.3,
      side: THREE.BackSide
    });
    
    const displayGlow = new THREE.Mesh(displayGlowGeometry, glowMaterial);
    displayGlow.position.copy(display.position);
    displayGlow.rotation.copy(display.rotation);
    gatewayGroup.add(displayGlow);
    
    // LED light ring
    const ringGeometry = new THREE.TorusGeometry(radius + 0.1, 0.2, 16, 100);
    const lightRing = new THREE.Mesh(ringGeometry, lightRingMaterial);
    lightRing.position.y = height / 4;
    lightRing.rotation.x = Math.PI / 2;
    lightRing.castShadow = true;
    gatewayGroup.add(lightRing);
    
    // Ventilation pattern
    const createVentSlots = () => {
      const ventGroup = new THREE.Group();
      const slotWidth = 0.2;
      const slotHeight = 0.8;
      const slotDepth = 0.2;
      const slotCount = 12;
      const slotRows = 3;
      const rowSpacing = 2;
      
      for (let row = 0; row < slotRows; row++) {
        const rowY = -height / 4 + row * rowSpacing;
        for (let i = 0; i < slotCount; i++) {
          const angle = (i / slotCount) * Math.PI * 2;
          const slotGeometry = new THREE.BoxGeometry(slotWidth, slotHeight, slotDepth);
          const slot = new THREE.Mesh(slotGeometry, ventilationMaterial);
          
          slot.position.x = Math.sin(angle) * (radius + 0.01);
          slot.position.z = Math.cos(angle) * (radius + 0.01);
          slot.position.y = rowY;
          
          slot.rotation.y = angle;
          
          ventGroup.add(slot);
        }
      }
      
      return ventGroup;
    };
    
    const ventilation = createVentSlots();
    gatewayGroup.add(ventilation);
    
    // Connection ports
    const createPorts = () => {
      const portGroup = new THREE.Group();
      
      // Port base panel - moved to the front (0 radians instead of PI radians)
      const portPanelGeometry = new THREE.CylinderGeometry(
        radius + 0.01,     // radius
        radius + 0.01,     // radius
        3.5,               // height
        32,                // radial segments
        1,                 // height segments
        true,              // open-ended
        -Math.PI/3,        // start angle (adjusted for front-facing)
        Math.PI/1.5        // angle length
      );
      const portPanel = new THREE.Mesh(portPanelGeometry, ventilationMaterial);
      portPanel.position.set(0, -height / 2 + 1.75, 0);
      portGroup.add(portPanel);
      
      // Helper function to position objects on the curved surface - unchanged
      const positionOnCurve = (obj: THREE.Object3D, angleRad: number, height: number) => {
        obj.position.x = Math.sin(angleRad) * (radius + 0.1);
        obj.position.z = Math.cos(angleRad) * (radius + 0.1);
        obj.position.y = height;
        obj.rotation.y = angleRad;
      };
      
      // Updated position angles for front-facing ports
      
      // Ethernet port - moved to front
      const ethernetGroup = new THREE.Group();
      const ethernetGeometry = new THREE.BoxGeometry(1.5, 0.6, 0.2);
      const ethernet = new THREE.Mesh(ethernetGeometry, portMaterial);
      
      // Add the connector pin holes to ethernet port
      const pinHoleGeometry = new THREE.BoxGeometry(0.05, 0.05, 0.1);
      const pinMaterial = new THREE.MeshStandardMaterial({ color: 0x111111 });
      
      for (let i = 0; i < 8; i++) {
        const pinHole = new THREE.Mesh(pinHoleGeometry, pinMaterial);
        pinHole.position.set((i - 3.5) * 0.15, 0, 0.1);
        ethernet.add(pinHole);
      }
      
      ethernetGroup.add(ethernet);
      positionOnCurve(ethernetGroup, 0, -height / 2 + 1.5); // 0 radians = front
      portGroup.add(ethernetGroup);
      
      // USB ports - moved to front
      const createUSBPort = (angleOffset: number) => {
        const usbGroup = new THREE.Group();
        
        // Main USB port
        const usbGeometry = new THREE.BoxGeometry(0.9, 0.4, 0.2);
        const usb = new THREE.Mesh(usbGeometry, portMaterial);
        usbGroup.add(usb);
        
        // Inner connector
        const connectorGeometry = new THREE.BoxGeometry(0.7, 0.2, 0.05);
        const connectorMaterial = new THREE.MeshStandardMaterial({ color: 0x222222 });
        const connector = new THREE.Mesh(connectorGeometry, connectorMaterial);
        connector.position.z = 0.08;
        usb.add(connector);
        
        positionOnCurve(usbGroup, angleOffset, -height / 2 + 1.5);
        return usbGroup;
      };
      
      const usb1 = createUSBPort(-Math.PI/8);
      portGroup.add(usb1);
      
      const usb2 = createUSBPort(Math.PI/8);
      portGroup.add(usb2);
      
      // Power port - moved to front
      const powerGroup = new THREE.Group();
      
      // Outer ring
      const powerRingGeometry = new THREE.TorusGeometry(0.35, 0.05, 16, 32);
      const powerRingMaterial = new THREE.MeshStandardMaterial({ color: 0x333333 });
      const powerRing = new THREE.Mesh(powerRingGeometry, powerRingMaterial);
      powerGroup.add(powerRing);
      
      // Inner power connector
      const powerGeometry = new THREE.CylinderGeometry(0.25, 0.25, 0.2, 32);
      const power = new THREE.Mesh(powerGeometry, portMaterial);
      power.rotation.x = Math.PI / 2;
      power.position.z = 0.1;
      powerGroup.add(power);
      
      // Power center pin
      const pinGeometry = new THREE.CylinderGeometry(0.05, 0.05, 0.25, 16);
      const pin = new THREE.Mesh(pinGeometry, new THREE.MeshStandardMaterial({ color: 0x777777 }));
      pin.rotation.x = Math.PI / 2;
      pin.position.z = 0.1;
      power.add(pin);
      
      positionOnCurve(powerGroup, 0, -height / 2 + 0.5); // 0 radians = front
      portGroup.add(powerGroup);
      
      // Reset button - moved to front
      const resetGroup = new THREE.Group();
      const resetGeometry = new THREE.CylinderGeometry(0.15, 0.15, 0.05, 16);
      const resetMaterial = new THREE.MeshStandardMaterial({ color: 0xff3333 });
      const resetButton = new THREE.Mesh(resetGeometry, resetMaterial);
      resetButton.rotation.x = Math.PI / 2;
      resetButton.position.z = 0.05;
      resetGroup.add(resetButton);
      
      positionOnCurve(resetGroup, Math.PI/4, -height / 2 + 0.5); // Adjusted to front quadrant
      portGroup.add(resetGroup);
      
      // Port labels - adjusted for front-facing ports
      const createPortLabel = (text: string, angleRad: number, height: number, width = 1.2, heightVal = 0.5) => {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.width = 256;
        canvas.height = 128;
        
        if (context) {
          context.fillStyle = 'transparent';
          context.clearRect(0, 0, canvas.width, canvas.height);
          
          // Draw text with shadow for better visibility
          context.font = 'bold 36px Arial';
          context.textAlign = 'center';
          context.textBaseline = 'middle';
          
          if (isDarkMode) {
            context.fillStyle = '#ffffff';
            context.shadowColor = '#000000';
          } else {
            context.fillStyle = '#000000';
            context.shadowColor = '#ffffff';
          }
          
          context.shadowBlur = 5;
          context.fillText(text, canvas.width / 2, canvas.height / 2);
          
          const texture = new THREE.CanvasTexture(canvas);
          const material = new THREE.MeshBasicMaterial({
            map: texture,
            transparent: true
          });
          
          const labelGeometry = new THREE.PlaneGeometry(width, heightVal);
          const label = new THREE.Mesh(labelGeometry, material);
          
          // Position label on the curved surface
          const labelGroup = new THREE.Group();
          labelGroup.add(label);
          label.position.z = 0.15;
          
          positionOnCurve(labelGroup, angleRad, height);
          
          return labelGroup;
        }
        return null;
      };
      
      const ethernetLabel = createPortLabel('ETHERNET', 0, -height / 2 + 2.1);
      if (ethernetLabel) portGroup.add(ethernetLabel);
      
      const usb1Label = createPortLabel('USB 1', -Math.PI/8, -height / 2 + 2.1);
      if (usb1Label) portGroup.add(usb1Label);
      
      const usb2Label = createPortLabel('USB 2', Math.PI/8, -height / 2 + 2.1);
      if (usb2Label) portGroup.add(usb2Label);
      
      const powerLabel = createPortLabel('POWER', 0, -height / 2 + 0.9);
      if (powerLabel) portGroup.add(powerLabel);
      
      const resetLabel = createPortLabel('RESET', Math.PI/4, -height / 2 + 0.9, 0.8, 0.4);
      if (resetLabel) portGroup.add(resetLabel);
      
      return portGroup;
    };
    
    const ports = createPorts();
    gatewayGroup.add(ports);
    
    // Touch-sensitive control panel on top
    const createControlPanel = () => {
      const panelGroup = new THREE.Group();
      
      // Center button
      const centerButtonGeometry = new THREE.CylinderGeometry(0.8, 0.8, 0.1, 32);
      const centerButton = new THREE.Mesh(centerButtonGeometry, displayMaterial);
      centerButton.position.y = height / 2 + 0.05;
      panelGroup.add(centerButton);
      
      // Touch buttons
      const touchButtonGeometry = new THREE.CircleGeometry(0.4, 32);
      const touchMaterial = new THREE.MeshStandardMaterial({
        color: isDarkMode ? 0x00ffaa : 0x00aa88,
        roughness: 0.2,
        metalness: 0.5,
        emissive: isDarkMode ? 0x00ffaa : 0x00aa88,
        emissiveIntensity: isDarkMode ? 0.5 : 0.3
      });
      
      const buttonPositions = [
        { x: 2, z: 0 },
        { x: -2, z: 0 },
        { x: 0, z: 2 },
        { x: 0, z: -2 }
      ];
      
      buttonPositions.forEach(pos => {
        const button = new THREE.Mesh(touchButtonGeometry, touchMaterial);
        button.position.set(pos.x, height / 2 + 0.05, pos.z);
        button.rotation.x = -Math.PI / 2;
        panelGroup.add(button);
      });
      
      return panelGroup;
    };
    
    const controlPanel = createControlPanel();
    gatewayGroup.add(controlPanel);
    
    // Antennas (internal visualization)
    const createAntennas = () => {
      const antennaGroup = new THREE.Group();
      
      const protocols = ['WiFi', 'Zigbee', 'Z-Wave', 'BLE'];
      const antennaPositions = [
        { x: 0, y: 3, z: 0 },
        { x: 2, y: 1, z: 0 },
        { x: -2, y: -1, z: 0 },
        { x: 0, y: -3, z: 0 }
      ];
      
      protocols.forEach((protocol, index) => {
        const baseGeometry = new THREE.CylinderGeometry(0.3, 0.3, 0.5, 16);
        const base = new THREE.Mesh(baseGeometry, antennaBaseMaterial);
        base.position.copy(antennaPositions[index]);
        
        const rodGeometry = new THREE.CylinderGeometry(0.1, 0.1, 3, 16);
        const rod = new THREE.Mesh(rodGeometry, antennaRodMaterial);
        rod.position.y = 1.5;
        base.add(rod);
        
        // Label
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.width = 128;
        canvas.height = 64;
        
        if (context) {
          context.fillStyle = isDarkMode ? '#ffffff' : '#000000';
          context.font = '18px Arial';
          context.fillText(protocol, 10, 30);
          
          const texture = new THREE.CanvasTexture(canvas);
          const material = new THREE.MeshBasicMaterial({
            map: texture,
            transparent: true
          });
          
          const labelGeometry = new THREE.PlaneGeometry(1.2, 0.6);
          const label = new THREE.Mesh(labelGeometry, material);
          label.position.y = 2.5;
          label.rotation.y = Math.PI / 4;
          base.add(label);
        }
        
        antennaGroup.add(base);
      });
      
      return antennaGroup;
    };
    
    const antennas = createAntennas();
    // Make antennas semi-transparent to show "internal" components
    antennas.traverse(object => {
      if (object instanceof THREE.Mesh && object.material instanceof THREE.MeshStandardMaterial) {
        object.material.transparent = true;
        object.material.opacity = 0.5;
      }
    });
    gatewayGroup.add(antennas);
    
    // Status display content with enhanced dynamic information and improved text visibility
    const createDisplayContent = () => {
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      // Increase resolution for sharper text
      canvas.width = 1024; 
      canvas.height = 512;
      
      if (context) {
        // Clear canvas
        context.clearRect(0, 0, canvas.width, canvas.height);
        
        // Higher contrast background based on theme
        const gradient = context.createLinearGradient(0, 0, 0, canvas.height);
        if (isDarkMode) {
          gradient.addColorStop(0, '#000a08');
          gradient.addColorStop(1, '#000504');
        } else {
          gradient.addColorStop(0, '#001a12');
          gradient.addColorStop(1, '#00100a');
        }
        context.fillStyle = gradient;
        context.fillRect(0, 0, canvas.width, canvas.height);
        
        // Stronger border for better definition
        context.strokeStyle = isDarkMode ? '#00ff88' : '#00dd66';
        context.lineWidth = 12;
        context.strokeRect(8, 8, canvas.width - 16, canvas.height - 16);
        
        // Header section with more contrast
        context.fillStyle = isDarkMode ? '#000504' : '#000a06'; 
        context.fillRect(20, 20, canvas.width - 40, 90);
        
        // Header text - extremely high contrast for both themes
        context.fillStyle = isDarkMode ? '#ffff00' : '#ffff00'; // Yellow for both themes for maximum visibility
        context.font = 'bold 56px Arial';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        
        // Strong text shadow for better legibility
        context.shadowColor = '#000000';
        context.shadowBlur = 4;
        context.shadowOffsetX = 2;
        context.shadowOffsetY = 2;
        
        context.fillText('SMART HOME IoT GATEWAY', canvas.width / 2, 65);
        
        // Reset shadow for cleaner text elsewhere
        context.shadowOffsetX = 1;
        context.shadowOffsetY = 1;
        context.shadowBlur = 2;
        
        // Information labels - extremely bright, no emissive color dilution
        context.font = 'bold 48px Arial';
        context.textAlign = 'left';
        context.fillStyle = isDarkMode ? '#ff9900' : '#ff6600'; // Orange for high contrast
        context.fillText('Status:', 40, 180);
        context.fillText('Network:', 40, 260);
        context.fillText('Devices:', 40, 340);
        context.fillText('System:', 40, 420);
        
        // Dynamic values - pure white with slight shadow for maximum contrast
        context.fillStyle = '#ffffff'; // White for both themes
        context.font = 'bold 48px Arial';
        context.textAlign = 'right';
        context.fillText('ONLINE', canvas.width - 40, 180);
        context.fillText('WiFi + Ethernet', canvas.width - 40, 260);
        context.fillText('12 Connected', canvas.width - 40, 340);
        
        // Load bar with extreme contrast
        const loadPercent = 60;
        context.fillText(`${loadPercent}%`, canvas.width - 40, 420);
        
        // Draw progress bar with highly visible colors
        const barWidth = 300;
        const barHeight = 30;
        const barX = canvas.width - barWidth - 260;
        const barY = 405;
        
        // Bar background - true black
        context.fillStyle = '#000000';
        context.fillRect(barX, barY, barWidth, barHeight);
        
        // Bar border - pure white for contrast
        context.strokeStyle = '#ffffff';
        context.lineWidth = 2;
        context.strokeRect(barX, barY, barWidth, barHeight);
        
        // Bar progress - high visibility color
        context.fillStyle = isDarkMode ? '#ff3300' : '#ff3300'; // Bright red-orange
        context.fillRect(barX, barY, barWidth * (loadPercent / 100), barHeight);
        
        // Time display
        const now = new Date();
        const timeString = now.toLocaleTimeString();
        context.fillStyle = '#ffffff';
        context.font = 'bold 36px Arial';
        context.textAlign = 'center';
        context.fillText(timeString, canvas.width / 2, canvas.height - 30);
        
        // Apply texture to display with anisotropic filtering for sharper text
        const texture = new THREE.CanvasTexture(canvas);
        texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
        texture.minFilter = THREE.LinearFilter;
        texture.magFilter = THREE.LinearFilter;
        
        // Update the display material with new texture and stronger emission
        display.material = new THREE.MeshStandardMaterial({
          map: texture,
          emissive: isDarkMode ? 0x00ff88 : 0x00dd66,
          emissiveIntensity: isDarkMode ? 1.0 : 0.6,
          roughness: 0.2,
          metalness: 0.8
        });
      }
    };
    
    createDisplayContent();
    
    // Add point light near display for extra glow effect
    const displayLight = new THREE.PointLight(isDarkMode ? 0x00ff88 : 0x00dd66, 1.2, 10);
    displayLight.position.set(0, 2, radius + 1);
    gatewayGroup.add(displayLight);
    
    // Update display periodically to show real-time data
    const displayUpdateInterval = setInterval(createDisplayContent, 1000);
    
    // Handle resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    
    window.addEventListener('resize', handleResize);
    
    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    
    animate();
    
    // Toggle dark mode function
    const toggleDarkModeHandler = document.createElement('button');
    toggleDarkModeHandler.textContent = 'Toggle Dark/Light Mode';
    toggleDarkModeHandler.style.position = 'absolute';
    toggleDarkModeHandler.style.top = '20px';
    toggleDarkModeHandler.style.left = '20px';
    toggleDarkModeHandler.style.padding = '10px';
    toggleDarkModeHandler.style.backgroundColor = '#333';
    toggleDarkModeHandler.style.color = '#fff';
    toggleDarkModeHandler.style.border = 'none';
    toggleDarkModeHandler.style.borderRadius = '5px';
    toggleDarkModeHandler.style.cursor = 'pointer';
    
    toggleDarkModeHandler.onclick = () => {
      setIsDarkMode(!isDarkMode);
    };
    
    if (mountRef.current) {
      mountRef.current.appendChild(toggleDarkModeHandler);
    }
    
    // Cleanup function
    return () => {
      if (mountRef.current) {
        mountRef.current.removeChild(renderer.domElement);
        if (mountRef.current.contains(toggleDarkModeHandler)) {
          mountRef.current.removeChild(toggleDarkModeHandler);
        }
      }
      window.removeEventListener('resize', handleResize);
      controls.dispose();
      clearInterval(displayUpdateInterval);  // Clear the display update interval
    };
  }, [isDarkMode]);
  
  return (
    <div className="relative w-full h-screen">
      <div ref={mountRef} className="w-full h-full"></div>
    </div>
  );
}