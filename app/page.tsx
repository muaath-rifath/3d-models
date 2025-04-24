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
import { useEffect, useState } from "react";

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

  return (
    <div className="min-h-screen p-6 bg-gray-50 dark:bg-gray-900">
      <h1 className="text-3xl font-bold mb-8 text-center text-gray-800 dark:text-gray-100">3D IoT Components Gallery</h1>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {/* Each component is wrapped in a card with title */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 flex flex-col items-center">
          <h3 className="text-lg font-semibold mb-3 text-gray-800 dark:text-gray-100">5G Tower</h3>
          <div className="h-[300px] w-full">
            <FivegTower isDarkMode={isDarkMode} width={300} height={300} />
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 flex flex-col items-center">
          <h3 className="text-lg font-semibold mb-3 text-gray-800 dark:text-gray-100">Air Quality Sensor</h3>
          <div className="h-[300px] w-full">
            <AirQualitySensor isDarkMode={isDarkMode} width={300} height={300} />
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 flex flex-col items-center">
          <h3 className="text-lg font-semibold mb-3 text-gray-800 dark:text-gray-100">Blade Server</h3>
          <div className="h-[300px] w-full">
            <BladeServer isDarkMode={isDarkMode} width={300} height={300} />
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 flex flex-col items-center">
          <h3 className="text-lg font-semibold mb-3 text-gray-800 dark:text-gray-100">Environmental Sensor</h3>
          <div className="h-[300px] w-full">
            <EnvSensor isDarkMode={isDarkMode} width={300} height={300} />
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 flex flex-col items-center">
          <h3 className="text-lg font-semibold mb-3 text-gray-800 dark:text-gray-100">Laptop</h3>
          <div className="h-[300px] w-full">
            <Laptop isDarkMode={isDarkMode} width={300} height={300} />
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 flex flex-col items-center">
          <h3 className="text-lg font-semibold mb-3 text-gray-800 dark:text-gray-100">Motion Sensor</h3>
          <div className="h-[300px] w-full">
            <MotionSensor isDarkMode={isDarkMode} width={300} height={300} />
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 flex flex-col items-center">
          <h3 className="text-lg font-semibold mb-3 text-gray-800 dark:text-gray-100">Motor Actuator</h3>
          <div className="h-[300px] w-full">
            <MotorActuator isDarkMode={isDarkMode} width={300} height={300} />
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 flex flex-col items-center">
          <h3 className="text-lg font-semibold mb-3 text-gray-800 dark:text-gray-100">Residential IoT Gateway</h3>
          <div className="h-[300px] w-full">
            <ResidentialIotGateway isDarkMode={isDarkMode} width={300} height={300} />
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 flex flex-col items-center">
          <h3 className="text-lg font-semibold mb-3 text-gray-800 dark:text-gray-100">Smartphone</h3>
          <div className="h-[300px] w-full">
            <SmartPhone isDarkMode={isDarkMode} width={300} height={300} />
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 flex flex-col items-center">
          <h3 className="text-lg font-semibold mb-3 text-gray-800 dark:text-gray-100">Tablet</h3>
          <div className="h-[300px] w-full">
            <Tablet isDarkMode={isDarkMode} width={300} height={300} />
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 flex flex-col items-center">
          <h3 className="text-lg font-semibold mb-3 text-gray-800 dark:text-gray-100">Valve Actuator</h3>
          <div className="h-[300px] w-full">
            <ValveActuator isDarkMode={isDarkMode} width={300} height={300} />
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 flex flex-col items-center">
          <h3 className="text-lg font-semibold mb-3 text-gray-800 dark:text-gray-100">Vehicle IoT Gateway</h3>
          <div className="h-[300px] w-full">
            <VehicleIotGateway isDarkMode={isDarkMode} width={300} height={300} />
          </div>
        </div>
      </div>
    </div>
  );
}
