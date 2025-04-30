'use client';

import React, { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';

type SmartPhoneProps = {
    isDarkMode?: boolean;
}

export default function SmartPhone({ isDarkMode = false }: SmartPhoneProps) {
    const phoneGroupRef = useRef<THREE.Group>(null);
    const screenMeshRef = useRef<THREE.Mesh | null>(null);
    
    // Materials definition based on standalone page
    const materials = useMemo(() => ({
        phoneBody: new THREE.MeshStandardMaterial({
            name: 'phone_body',
            color: isDarkMode ? 0x505e50 : 0xe0ffe0,
            metalness: 0.7,
            roughness: 0.3,
            emissive: isDarkMode ? 0x253025 : 0x000000,
            emissiveIntensity: isDarkMode ? 0.30 : 0,
        }),
        
        screen: new THREE.MeshStandardMaterial({
            name: 'screen',
            color: isDarkMode ? 0x00ffbb : 0x00aa99,
            metalness: 0.1, 
            roughness: 0.05,
            emissive: isDarkMode ? 0x00aa88 : 0x008866,
            emissiveIntensity: isDarkMode ? 5 : 0.2,
        }),
        
        uiElement: new THREE.MeshStandardMaterial({
            name: 'ui_element',
            color: isDarkMode ? 0xafffaf : 0x00aa88,
            metalness: 0.1,
            roughness: 0.1,
            emissive: isDarkMode ? 0x66cc66 : 0x000000,
            emissiveIntensity: isDarkMode ? 0.7 : 0.0
        }),
        
        accent: new THREE.MeshStandardMaterial({
            name: 'accent',
            color: isDarkMode ? 0x66ffaa : 0x00aa66,
            metalness: 0.7,
            roughness: 0.3,
            emissive: isDarkMode ? 0x44cc88 : 0x000000,
            emissiveIntensity: isDarkMode ? 0.6 : 0.0
        }),
        
        camera: new THREE.MeshStandardMaterial({
            name: 'camera',
            color: isDarkMode ? 0x334433 : 0x556655,
            metalness: 0.9,
            roughness: 0.4,
            emissive: isDarkMode ? 0x112211 : 0x000000,
            emissiveIntensity: isDarkMode ? 0.3 : 0.0
        }),
        
        cameraLens: new THREE.MeshStandardMaterial({
            name: 'camera_lens',
            color: isDarkMode ? 0x445544 : 0x111111,
            metalness: 0.1,
            roughness: 0.1,
            emissive: isDarkMode ? 0x223322 : 0x000000,
            emissiveIntensity: isDarkMode ? 0.1 : 0.0
        }),
        
        cameraLensMain: new THREE.MeshStandardMaterial({
            name: 'camera_lens_main',
            color: isDarkMode ? 0x445544 : 0x111111,
            metalness: 0.1,
            roughness: 0.05,
            opacity: 0.9,
            transparent: true,
            side: THREE.DoubleSide,
            emissive: isDarkMode ? 0x223322 : 0x000000,
            emissiveIntensity: isDarkMode ? 0.1 : 0.0
        }),
        
        port: new THREE.MeshStandardMaterial({
            name: 'port',
            color: isDarkMode ? 0x444444 : 0x888888,
            metalness: 0.8,
            roughness: 0.5
        }),
        
        buttons: new THREE.MeshStandardMaterial({
            name: 'buttons',
            color: isDarkMode ? 0x505e50 : 0xe0ffe0,
            metalness: 0.9, 
            roughness: 0.3,
            emissive: isDarkMode ? 0x253025 : 0x000000,
            emissiveIntensity: isDarkMode ? 0.3 : 0.0
        }),
        
        notch: new THREE.MeshStandardMaterial({
            name: 'notch',
            color: isDarkMode ? 0x112211 : 0x333333,
            metalness: 0.5,
            roughness: 0.8,
            emissive: isDarkMode ? 0x001100 : 0x000000,
            emissiveIntensity: isDarkMode ? 0.1 : 0.0
        }),
        
        selfieCamera: new THREE.MeshStandardMaterial({
            name: 'selfie_camera',
            color: isDarkMode ? 0x111111 : 0x000000,
            metalness: 0.2,
            roughness: 0.3,
            emissive: isDarkMode ? 0x111111 : 0x000000,
            emissiveIntensity: isDarkMode ? 0.1 : 0.0
        }),
        
        cameraRing: new THREE.MeshStandardMaterial({
            name: 'camera_ring',
            color: isDarkMode ? 0x66ffaa : 0xbbbbbb,
            metalness: 0.6,
            roughness: 0.3,
            emissive: isDarkMode ? 0x44cc88 : 0x666666,
            emissiveIntensity: isDarkMode ? 0.8 : 0.2,
            side: THREE.DoubleSide
        }),
        
        graphElement: new THREE.MeshStandardMaterial({
            name: 'graph_element',
            color: isDarkMode ? 0x88ffcc : 0x00ccaa,
            metalness: 0.1,
            roughness: 0.2,
            emissive: isDarkMode ? 0x44ddaa : 0x00aa88,
            emissiveIntensity: isDarkMode ? 0.8 : 0.3,
            transparent: true,
            opacity: 0.9
        }),
        
        chartElement: new THREE.MeshStandardMaterial({
            name: 'chart_element',
            color: isDarkMode ? 0xccff66 : 0x88cc00,
            metalness: 0.1,
            roughness: 0.2,
            emissive: isDarkMode ? 0xaadd33 : 0x66aa00,
            emissiveIntensity: isDarkMode ? 0.8 : 0.3,
            transparent: true,
            opacity: 0.9
        }),
        
        textElement: new THREE.MeshStandardMaterial({
            name: 'text_element',
            color: isDarkMode ? 0xeeffee : 0xffffff,
            metalness: 0.1,
            roughness: 0.2,
            emissive: isDarkMode ? 0xccffcc : 0xf0f0f0,
            emissiveIntensity: isDarkMode ? 0.6 : 0.2
        })
    }), [isDarkMode]);
    
    // Animate screen content and subtle phone movement
    useFrame((state) => {
        const time = state.clock.getElapsedTime();
        
        if (screenMeshRef.current && screenMeshRef.current.material instanceof THREE.MeshStandardMaterial) {
            const pulsedIntensity = isDarkMode ? 
                0.8 + Math.sin(time * 0.5) * 0.2 : 
                0.2 + Math.sin(time * 0.5) * 0.05;
                
            screenMeshRef.current.material.emissiveIntensity = pulsedIntensity;
        }
        
        // Subtle rotation of the phone
        if (phoneGroupRef.current) {
            phoneGroupRef.current.rotation.y = Math.sin(state.clock.getElapsedTime() * 0.2) * 0.05;
        }
    });
    
    // Create a rounded rectangle shape for the phone
    const createRoundedRectShape = (width: number, height: number, radius: number) => {
        const shape = new THREE.Shape();
        shape.moveTo(-width / 2 + radius, -height / 2);
        shape.lineTo(width / 2 - radius, -height / 2);
        shape.quadraticCurveTo(width / 2, -height / 2, width / 2, -height / 2 + radius);
        shape.lineTo(width / 2, height / 2 - radius);
        shape.quadraticCurveTo(width / 2, height / 2, width / 2 - radius, height / 2);
        shape.lineTo(-width / 2 + radius, height / 2);
        shape.quadraticCurveTo(-width / 2, height / 2, -width / 2, height / 2 - radius);
        shape.lineTo(-width / 2, -height / 2 + radius);
        shape.quadraticCurveTo(-width / 2, -height / 2, -width / 2 + radius, -height / 2);
        return shape;
    };
    
    // Helper function to create an annulus shape
    const createAnnulusShape = (outerRadius: number, innerRadius: number) => {
        const shape = new THREE.Shape();
        shape.absarc(0, 0, outerRadius, 0, Math.PI * 2, false);
        const holePath = new THREE.Path();
        holePath.absarc(0, 0, innerRadius, 0, Math.PI * 2, true);
        shape.holes.push(holePath);
        return shape;
    };

    // Define extrusion settings for the rings
    const ringExtrudeSettings = {
        steps: 1,
        depth: 0.05, // Thickness of the ring
        bevelEnabled: false
    };

    // Create geometries for the rings using the annulus shape
    const firstRingShape = useMemo(() => createAnnulusShape(0.5, 0.45), []);
    const firstRingGeometry = useMemo(() => new THREE.ExtrudeGeometry(firstRingShape, ringExtrudeSettings), [firstRingShape]);

    const secondThirdRingShape = useMemo(() => createAnnulusShape(0.35, 0.3), []);
    const secondThirdRingGeometry = useMemo(() => new THREE.ExtrudeGeometry(secondThirdRingShape, ringExtrudeSettings), [secondThirdRingShape]);

    // Phone dimensions
    const height = 14;
    const width = 7;
    const thickness = 0.8;
    const cornerRadius = 0.7;
    const screenCornerRadius = 0.5;
    const widgetCornerRadius = 0.2; // Added for widgets
    const punchHoleRadius = 0.2; // Selfie camera radius

    // Create geometries
    const phoneShape = useMemo(() => createRoundedRectShape(width, height, cornerRadius), []);

    const phoneGeometry = useMemo(() => {
        const extrudeSettings = {
            steps: 1,
            depth: thickness,
            bevelEnabled: false
        };
        const geometry = new THREE.ExtrudeGeometry(phoneShape, extrudeSettings);
        geometry.center();
        return geometry;
    }, [phoneShape]);

    // Screen geometry
    const screenWidth = width - 0.3;
    const screenHeight = height - 0.4;
    const screenShape = useMemo(() => createRoundedRectShape(screenWidth, screenHeight, screenCornerRadius), []);
    const screenGeometry = useMemo(() => new THREE.ShapeGeometry(screenShape), [screenShape]);

    // Z Positions for layering on screen
    const screenSurfaceZ = thickness / 2 + 0.01;
    const dashboardBgZ = screenSurfaceZ + 0.001;
    const widgetZ = dashboardBgZ + 0.002;
    const widgetContentZ = widgetZ + 0.001;
    const frontCameraZ = dashboardBgZ + 0.005; // Z for notch/camera area

    // REMOVE OLD Camera bump geometry
    // const cameraBumpGeometry = useMemo(() => { ... });

    // REIMPLEMENT createDashboardWidgets based on reference
    const createDashboardWidgets = () => {
        const widgets: Widget[] = []; // Use the Widget type defined later

        // Dashboard parameters
        const dashboardWidth = screenWidth - 0.2;
        const dashboardHeight = screenHeight - 0.2;
        const padding = 0.2;
        const punchHoleRadius = 0.15; // Use the actual selfie camera radius
        const topOffsetForCamera = punchHoleRadius * 2 + 0.4; // Keep offset for spacing below camera
        const usableWidth = dashboardWidth - padding * 2;
        // Correct calculation for usable height considering the top offset
        const usableHeight = dashboardHeight - padding * 2 - topOffsetForCamera;

        // Widget layout
        const widgetCols = 2;
        const widgetRows = 3;
        const widgetWidth = (usableWidth - padding * (widgetCols - 1)) / widgetCols;
        const adjustedWidgetHeight = (usableHeight - padding * (widgetRows - 1)) / widgetRows; // Use adjusted height

        const startX = -usableWidth / 2 + widgetWidth / 2;
        // Correct startY calculation based on reference file logic
        const startY = (dashboardHeight / 2 - topOffsetForCamera) - adjustedWidgetHeight / 2;

        // Deterministic random function
        const seededRandom = (index: number, offset = 0) => {
            const seed = (index + 1) * 1234;
            let x = Math.sin(seed + offset) * 10000;
            return x - Math.floor(x);
        };

        const widgetTypes = ["Temperature", "Humidity", "Light Level", "Energy Usage", "Device Status", "Network Traffic"];

        // Create widget for each grid position
        let widgetIndex = 0;
        for (let r = 0; r < widgetRows; r++) {
            for (let c = 0; c < widgetCols; c++) {
                const x = startX + c * (widgetWidth + padding);
                const y = startY - r * (adjustedWidgetHeight + padding);
                const widgetTypeIndex = widgetIndex % widgetTypes.length;

                // Widget Background
                const widgetShape = createRoundedRectShape(widgetWidth, adjustedWidgetHeight, widgetCornerRadius);
                widgets.push({
                    type: 'widget_bg',
                    position: [x, y, widgetZ], // Use correct Z
                    geometry: new THREE.ShapeGeometry(widgetShape), // Use ShapeGeometry for rounded corners
                    material: new THREE.MeshStandardMaterial({
                        color: isDarkMode ? 0x304530 : 0xfcfffc,
                        roughness: 0.4,
                        metalness: 0.0,
                        transparent: true,
                        opacity: 0.88,
                        emissive: isDarkMode ? 0x141f14 : 0x000000,
                        emissiveIntensity: isDarkMode ? 0.15 : 0,
                    })
                });

                // Widget Title
                const titleHeight = 0.25;
                widgets.push({
                    type: 'widget_title',
                    position: [x, y + adjustedWidgetHeight / 2 - titleHeight / 2 - 0.15, widgetContentZ], // Position relative to widget bg
                    geometry: new THREE.PlaneGeometry(widgetWidth * 0.7, titleHeight),
                    material: (() => {
                        const mat = materials.textElement.clone();
                        mat.color.set(isDarkMode ? 0xddffdd : 0x333333);
                        mat.emissive.set(isDarkMode ? 0xaaccaa : 0x000000);
                        mat.emissiveIntensity = isDarkMode ? 0.3 : 0;
                        return mat;
                    })()
                });

                // Widget content based on type
                const contentY = y - 0.15; // Adjust content Y based on new widget height/title position
                const contentWidth = widgetWidth * 0.8;
                const contentHeight = adjustedWidgetHeight * 0.45;
                const currentContentZ = widgetContentZ + 0.001; // Slightly in front of title

                // Widget data visualization based on type (similar to reference)
                switch (widgetTypeIndex) {
                    case 0: // Temperature - graph
                        const points: THREE.Vector3[] = [];
                        const segments = 10;
                        for (let i = 0; i <= segments; i++) {
                            const px = x - contentWidth / 2 + (i / segments) * contentWidth;
                            const py = contentY + (seededRandom(widgetIndex, i) - 0.5) * contentHeight;
                            points.push(new THREE.Vector3(px, py, currentContentZ)); // Use correct Z
                        }
                        widgets.push({
                            type: 'line',
                            position: [0, 0, 0], // Position embedded in points
                            geometry: new THREE.BufferGeometry().setFromPoints(points),
                            material: new THREE.LineBasicMaterial({
                                color: isDarkMode ? 0xffaaaa : 0xcc0000
                            })
                        });
                        break;

                    case 1: // Humidity - gauge
                        const arcValue = seededRandom(widgetIndex);
                        const gaugeRadius = contentHeight * 0.6;
                        // Background arc
                        widgets.push({
                            type: 'gauge_bg',
                            position: [x, contentY - gaugeRadius * 0.2, currentContentZ], // Position gauge correctly
                            geometry: new THREE.RingGeometry(
                                gaugeRadius * 0.8,
                                gaugeRadius,
                                32, 1, 0, Math.PI // Full background arc
                            ),
                            rotation: [0, 0, -Math.PI / 2], // Rotate to be a semi-circle on top
                            material: new THREE.MeshStandardMaterial({
                                color: isDarkMode ? 0x335533 : 0xcccccc,
                                transparent: true,
                                opacity: 0.3,
                                side: THREE.DoubleSide
                            })
                        });
                        // Value arc
                        widgets.push({
                            type: 'gauge',
                            position: [x, contentY - gaugeRadius * 0.2, currentContentZ + 0.001], // Slightly in front
                            geometry: new THREE.RingGeometry(
                                gaugeRadius * 0.8,
                                gaugeRadius,
                                32, 1, 0, Math.PI * arcValue // Value arc
                            ),
                            rotation: [0, 0, -Math.PI / 2], // Match background rotation
                            material: materials.chartElement
                        });
                        break;

                    case 2: // Light level - circle
                        const indicatorRadius = contentHeight * 0.5;
                        widgets.push({
                            type: 'light_indicator',
                            position: [x, contentY, currentContentZ], // Center indicator
                            geometry: new THREE.CircleGeometry(
                                indicatorRadius * seededRandom(widgetIndex),
                                32
                            ),
                            material: new THREE.MeshBasicMaterial({
                                color: isDarkMode ? 0xffffcc : 0xffcc00
                            })
                        });
                        widgets.push({
                            type: 'light_ring',
                            position: [x, contentY, currentContentZ - 0.001], // Slightly behind indicator
                            geometry: new THREE.RingGeometry(
                                indicatorRadius * 0.95,
                                indicatorRadius,
                                32
                            ),
                            material: new THREE.MeshBasicMaterial({
                                color: isDarkMode ? 0xaaaa88 : 0x888888,
                                side: THREE.DoubleSide
                            })
                        });
                        break;

                    // Add cases 3, 4, 5 here, adapting from reference page.tsx if needed
                    // Ensure correct geometry, position [x, y, currentContentZ], and materials are used.

                }

                // Widget status indicator
                const statusRadius = 0.15;
                widgets.push({
                    type: 'widget_status',
                    position: [x - widgetWidth / 2 + statusRadius + 0.1, y - adjustedWidgetHeight / 2 + statusRadius + 0.1, currentContentZ], // Bottom-left corner
                    geometry: new THREE.CircleGeometry(statusRadius, 16),
                    material: (() => {
                        const statusMat = materials.accent.clone();
                        const statusColorsCycle = [0xff6666, 0x66ff66, 0x6666ff, 0xffff66, 0xff66ff, 0x66ffff];
                        const color = statusColorsCycle[widgetIndex % statusColorsCycle.length];
                        statusMat.color.set(color);
                        statusMat.emissive.set(color);
                        statusMat.emissiveIntensity = isDarkMode ? 0.4 : 0.1;
                        return statusMat;
                    })()
                });

                widgetIndex++;
            }
        }

        return widgets;
    };

    const dashboardWidgets = useMemo(() => createDashboardWidgets(), [isDarkMode, screenWidth, screenHeight]); // Add dependencies

    // Update the type definition of the widgets to properly specify position and rotation types
    type Widget = {
        type: string;
        position: [number, number, number];
        geometry: THREE.BufferGeometry;
        material: THREE.Material;
        rotation?: [number, number, number];
    };

    return (
        <group ref={phoneGroupRef}>
            {/* Phone body */}
            <mesh
                geometry={phoneGeometry}
                material={materials.phoneBody}
                castShadow
                receiveShadow
            />

            {/* Screen */}
            <mesh
                ref={screenMeshRef}
                geometry={screenGeometry}
                material={materials.screen} // Use screen material (can be overridden by widgets)
                position={[0, 0, screenSurfaceZ]} // Use screenSurfaceZ
                receiveShadow
            />

            {/* Dashboard widgets - RENDER NEW IMPLEMENTATION */}
            {dashboardWidgets.map((widget, idx) => {
                if (widget.type === 'line') {
                    // Handle line type widgets
                    return (
                        <primitive
                            key={`line-${idx}`}
                            object={new THREE.Line(widget.geometry, widget.material)}
                            // No position/rotation needed here as it's in the geometry points
                        />
                    );
                } else {
                    // Handle mesh type widgets
                    return (
                        <mesh
                            key={`${widget.type}-${idx}`}
                            geometry={widget.geometry}
                            material={widget.material}
                            position={widget.position} // Use the calculated position
                            rotation={widget.rotation ?? [0, 0, 0]} // Apply rotation if defined, default to none
                        />
                    );
                }
            })}

            {/* Notch / Front Camera Area - REMOVE NOTCH MESH */}
            {/*
            <mesh
                material={materials.notch}
                position={[0, screenHeight / 2 - 0.4, frontCameraZ]} // Use frontCameraZ
            >
                <boxGeometry args={[1.5, 0.3, 0.01]} />
            </mesh>
            */}

            {/* Selfie camera (Punch-hole) */}
            <mesh
                material={materials.selfieCamera}
                // Position centered horizontally, slightly below the top edge
                position={[0, screenHeight / 2 - 0.4, frontCameraZ + 0.001]}
            >
                {/* Use the radius defined for punchHoleRadius */}
                <circleGeometry args={[punchHoleRadius, 32]} />
            </mesh>

            {/* Camera area on back - Move to top-right and arrange vertically */}
            <group position={[width/3, height/2.7, -thickness/2 - 0.075]}>
                 {/* ... existing camera code ... */}
                 {/* Camera 1 (Top) */}
                 <mesh
                    material={materials.cameraRing}
                    geometry={secondThirdRingGeometry}
                    position={[0, 0.8, 0.1]}
                    rotation={[Math.PI, 0, 0]}
                 />
                 <mesh
                    material={new THREE.MeshStandardMaterial({ color: 0x000000, /* ... */ })}
                    position={[0, 0.8, 0.05]}
                 >
                    <circleGeometry args={[0.3, 32]} />
                 </mesh>

                 {/* Flashlight */}
                 <mesh
                    position={[-0.8, 0, 0.075]}
                    rotation={[Math.PI / 2, 0, 0]}
                 >
                    <cylinderGeometry args={[0.15, 0.15, 0.05, 32]} />
                    <meshStandardMaterial color={0xffffdd} emissive={0xffffaa} /* ... */ />
                 </mesh>

                 {/* Camera 2 (Middle) */}
                 <mesh
                    material={materials.cameraRing}
                    geometry={secondThirdRingGeometry}
                    position={[0, 0, 0.1]}
                    rotation={[Math.PI, 0, 0]}
                 />
                 <mesh
                    material={new THREE.MeshStandardMaterial({ color: 0x000000, /* ... */ })}
                    position={[0, 0, 0.05]}
                 >
                    <circleGeometry args={[0.3, 32]} />
                 </mesh>

                 {/* Camera 3 (Bottom) */}
                 <mesh
                    material={materials.cameraRing}
                    geometry={secondThirdRingGeometry}
                    position={[0, -0.8, 0.1]}
                    rotation={[Math.PI, 0, 0]}
                 />
                 <mesh
                    material={new THREE.MeshStandardMaterial({ color: 0x000000, /* ... */ })}
                    position={[0, -0.8, 0.05]}
                 >
                    <circleGeometry args={[0.3, 32]} />
                 </mesh>
            </group>

            {/* Side buttons */}
            <mesh
                material={materials.buttons}
                position={[-width/2 - 0.1, height/4, 0]}
                castShadow
            >
                <boxGeometry args={[0.1, 1.2, 0.25]} />
            </mesh>
            
            <mesh
                material={materials.buttons}
                position={[width/2 + 0.1, height/4, 0]}
                castShadow
            >
                <boxGeometry args={[0.1, 1.2, 0.25]} />
            </mesh>

            {/* Bottom port - REMOVED */}
            {/*
            <mesh
                material={materials.port}
                position={[0, -height/2 - 0.05, 0]}
                rotation={[Math.PI/2, 0, 0]}
            >
                <cylinderGeometry args={[0.4, 0.4, 0.1, 16]} />
            </mesh>
            */}
        </group>
    );
}
