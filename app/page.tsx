"use client";

import FivegTower from "../components/5g-tower";
import BladeServer from "../components/blade-server";
import Laptop from "../components/laptop";
import MotionSensor from "../components/motion-sensor";
import MotorActuator from "../components/motor-actuator";
import ResidentialIotGateway from "../components/residential-iot-gateway";
import SmartPhone from "../components/smart-phone";
import ValveActuator from "../components/valve-actuator"; // Import the ValveActuator component
import Tablet from "../components/tablet"; // Import the Tablet component
import { useEffect, useState, Suspense } from "react";
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';

export default function Home() {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    // Check if user prefers dark mode
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    setIsDarkMode(prefersDark);

    // Listen for changes in color scheme preference
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = (e: MediaQueryListEvent) => setIsDarkMode(e.matches);
    mediaQuery.addEventListener("change", handleChange);

    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  // Define approximate positions for each model in the scene
  const modelPositions: [number, number, number][] = [
    [0, 0, 0],    // 5G Tower (center)
    [15, 0, 15],   // Air Quality Sensor (Increased spacing) - Placeholder
    [-15, 0, 15],  // Blade Server
    [30, 0, 0],    // Env Sensor - Placeholder
    [-30, 0, 0],   // Laptop
    [15, 0, -15],  // Motion Sensor
    [20, 0, 10],   // Motor Actuator (Custom position)
    [0, 7, 25],    // Residential IoT Gateway (Custom position)
    [-25, 5, 0],   // Smartphone (Custom position)
    [25, 0, -25],  // Tablet (Adjusted)
    [-25, 0, -25], // Valve Actuator (Adjusted) - Placeholder
    [0, 0, -45],   // Vehicle IoT Gateway (Adjusted) - Placeholder
  ];

  return (
    <div className="h-screen w-screen p-6 bg-gray-50 dark:bg-gray-900 flex flex-col">
      <h1 className="text-3xl font-bold mb-4 text-center text-gray-800 dark:text-gray-100">
        3D IoT Network Visualization
      </h1>
      <div className="flex-grow relative">
        {/* Adjusted camera position - further back */}
        <Canvas shadows camera={{ position: [0, 15, 60], fov: 50 }}>
          <Suspense fallback={null}>
            {/* Add helpers for debugging */}
            <axesHelper args={[5]} />
            <gridHelper args={[50, 50]} />

            {/* Background color */}
            <color attach="background" args={[isDarkMode ? '#111827' : '#f9fafb']} />

            {/* Enhanced lighting setup that doesn't require external files */}
            <ambientLight intensity={isDarkMode ? 0.3 : 0.6} />
            <directionalLight
              position={[10, 10, 5]}
              intensity={1}
              castShadow
              shadow-mapSize-width={2048}
              shadow-mapSize-height={2048}
            />
            <directionalLight position={[-10, 10, -5]} intensity={0.5} />
            
            {/* Add a soft hemisphere light to simulate environment lighting */}
            <hemisphereLight 
              args={[isDarkMode ? '#334155' : '#e0f2fe', isDarkMode ? '#0f172a' : '#f8fafc', 0.7]} 
            />
            
            {/* Add a subtle point light for extra highlights */}
            <pointLight 
              position={[0, 15, 0]} 
              intensity={0.4} 
              color={isDarkMode ? '#4ade80' : '#ffffff'} 
              distance={60}
            />

            {/* Position each model using groups, removed scale prop */}
            <group position={[0, -28.8, 0]} scale={2}> {/* Centered vertically at origin and scaled */}
              <FivegTower isDarkMode={isDarkMode} />
            </group>
            {/* <group position={modelPositions[1]}>
              <AirQualitySensor isDarkMode={isDarkMode} />
            </group> */}
            <group position={modelPositions[2]}>
              <BladeServer isDarkMode={isDarkMode} />
            </group>
            {/* <group position={modelPositions[3]}>
              <EnvSensor isDarkMode={isDarkMode} />
            </group> */}
            <group position={modelPositions[4]}>
              <Laptop isDarkMode={isDarkMode} />
            </group>
            <group position={modelPositions[5]} scale={3}>  {/* Increased scale from default to 3x */}
              <MotionSensor isDarkMode={isDarkMode} />
            </group>
            <group position={[20, 0, 10]} scale={0.7}> {/* Changed position and reduced scale */}
              <MotorActuator isDarkMode={isDarkMode} />
            </group>
            {/* Updated positioning for cylindrical IoT Gateway */}
            <group 
              position={[0, 7, 25]} 
              scale={1} 
              rotation={[0, Math.PI, 0]}
            >
              <ResidentialIotGateway isDarkMode={isDarkMode} />
            </group>
            {/* Updated position for SmartPhone */}
            <group 
              position={[-25, 5, 0]} 
              scale={1} 
              rotation={[0, Math.PI/3, 0]}
            >
              <SmartPhone isDarkMode={isDarkMode} />
            </group>
            <group position={modelPositions[9]} scale={1.5}> {/* Add Tablet */}
              <Tablet isDarkMode={isDarkMode} />
            </group>
            <group position={modelPositions[10]}> {/* Add ValveActuator */}
              <ValveActuator isDarkMode={isDarkMode} />
            </group>
            {/* <group position={modelPositions[11]}>
              <VehicleIotGateway isDarkMode={isDarkMode} />
            </group> */}

            {/* Remove Environment component that's causing the error */}

          </Suspense>
          {/* Add OrbitControls for interaction */}
          <OrbitControls makeDefault autoRotate autoRotateSpeed={0.5} />
        </Canvas>
      </div>
    </div>
  );
}
