"use client";

import FivegTower from "../components/5g-tower";
import AirQualitySensor from "../components/air-quality-sensor";
import BladeServer from "../components/blade-server";
import EnvSensor from "../components/env-sensor";
import Laptop from "../components/laptop";
import MotionSensor from "../components/motion-sensor";
import MotorActuator from "../components/motor-actuator";
import ResidentialIotGateway from "../components/residential-iot-gateway";
import SmartPhone from "../components/smart-phone";
import Tablet from "../components/tablet";
import ValveActuator from "../components/valve-actuator";
import VehicleIotGateway from "../components/vehicle-iot-gateway";
import { useEffect, useState, Suspense } from "react";
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei'; // Make sure drei is installed

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
    [15, 0, 15],   // Air Quality Sensor
    [-15, 0, 15],  // Blade Server
    [30, 0, 0],    // Env Sensor
    [-30, 0, 0],   // Laptop
    [15, 0, -15],  // Motion Sensor
    [-15, 0, -15], // Motor Actuator
    [0, 0, 30],    // Residential IoT Gateway
    [0, 0, -30],   // Smartphone
    [25, 0, -25],  // Tablet
    [-25, 0, -25], // Valve Actuator
    [0, 0, -45],   // Vehicle IoT Gateway
  ];

  // Array of model components
  const ModelComponents = [
    FivegTower,
    AirQualitySensor,
    BladeServer,
    EnvSensor,
    Laptop,
    MotionSensor,
    MotorActuator,
    ResidentialIotGateway,
    SmartPhone,
    Tablet,
    ValveActuator,
    VehicleIotGateway,
  ];

  return (
    <div className="h-screen w-screen p-6 bg-gray-50 dark:bg-gray-900 flex flex-col">
      <h1 className="text-3xl font-bold mb-4 text-center text-gray-800 dark:text-gray-100">
        3D IoT Network Visualization
      </h1>
      <div className="flex-grow relative">
        {/* Use React Three Fiber Canvas */}
        <Canvas shadows camera={{ position: [0, 15, 60], fov: 50 }}>
          <Suspense fallback={null}>
            {/* R3F Lighting */}
            <ambientLight intensity={isDarkMode ? 0.3 : 0.6} />
            <directionalLight
              position={[10, 10, 5]}
              intensity={1}
              castShadow
              shadow-mapSize-width={2048}
              shadow-mapSize-height={2048}
            />
            <directionalLight position={[-10, 10, -5]} intensity={0.5} />

            {/* Map over components and positions */}
            {ModelComponents.map((ModelComponent, index) => (
              <group key={index} position={modelPositions[index]}>
                <ModelComponent isDarkMode={isDarkMode} />
              </group>
            ))}

            {/* Optional: Add environment for reflections */}
            <Environment preset={isDarkMode ? "night" : "city"} background={false} />

          </Suspense>
          {/* R3F OrbitControls */}
          <OrbitControls makeDefault autoRotate autoRotateSpeed={0.5} />
        </Canvas>
      </div>
    </div>
  );
}
