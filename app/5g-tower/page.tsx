"use client";
import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

export default function Tower5G() {
    const mountRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!mountRef.current) return;

        // Scene setup
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0xf0f0f0);
        
        // Camera setup
        const camera = new THREE.PerspectiveCamera(
            75, 
            window.innerWidth / window.innerHeight, 
            0.1, 
            1000
        );
        camera.position.set(20, 15, 20);
        
        // Renderer setup
        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        mountRef.current.appendChild(renderer.domElement);
        
        // Controls
        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;
        
        // Lighting
        const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
        scene.add(ambientLight);
        
        const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        directionalLight.position.set(10, 20, 10);
        scene.add(directionalLight);

        // Materials
        const metalMaterial = new THREE.MeshStandardMaterial({
            color: 0x777788,
            roughness: 0.5,
            metalness: 0.8,
        });
        
        const darkMetalMaterial = new THREE.MeshStandardMaterial({
            color: 0x444455,
            roughness: 0.6,
            metalness: 0.7,
        });

        const antennaMaterial = new THREE.MeshStandardMaterial({
            color: 0xdddddd,
            roughness: 0.3,
            metalness: 0.7,
        });

        const equipmentMaterial = new THREE.MeshStandardMaterial({
            color: 0x333333,
            roughness: 0.7,
            metalness: 0.5,
        });

        // Create Foundation
        const createFoundation = () => {
            const foundation = new THREE.Group();
            
            // Concrete base
            const baseGeometry = new THREE.BoxGeometry(12, 1, 12);
            const baseMaterial = new THREE.MeshStandardMaterial({ 
                color: 0x888888,
                roughness: 0.9,
                metalness: 0.1 
            });
            const base = new THREE.Mesh(baseGeometry, baseMaterial);
            base.position.y = -0.5;
            foundation.add(base);

            // Anchor bolts
            for (let x = -5; x <= 5; x += 10) {
                for (let z = -5; z <= 5; z += 10) {
                    const boltGeometry = new THREE.CylinderGeometry(0.2, 0.2, 0.5, 8);
                    const bolt = new THREE.Mesh(boltGeometry, darkMetalMaterial);
                    bolt.position.set(x, 0, z);
                    foundation.add(bolt);
                }
            }

            return foundation;
        };

        // Create lattice section
        const createLatticeSection = (
            height: number, 
            baseWidth: number, 
            topWidth: number, 
            levels: number
        ) => {
            const section = new THREE.Group();
            
            // Create four corner columns
            for (let i = 0; i < 4; i++) {
                const angle = (i * Math.PI) / 2;
                const baseX = Math.cos(angle) * baseWidth / 2;
                const baseZ = Math.sin(angle) * baseWidth / 2;
                const topX = Math.cos(angle) * topWidth / 2;
                const topZ = Math.sin(angle) * topWidth / 2;
                
                // Create tapered column
                const points = [];
                points.push(new THREE.Vector3(baseX, 0, baseZ)); // Start at the base
                points.push(new THREE.Vector3(topX, height, topZ)); // End at the top
                
                const beamGeometry = new THREE.TubeGeometry(
                    new THREE.CatmullRomCurve3(points),
                    8,
                    0.2,
                    8,
                    false
                );
                const beam = new THREE.Mesh(beamGeometry, metalMaterial);
                section.add(beam);

                // Create diagonal beams to connect top and bottom columns
                if (baseWidth !== topWidth) {
                    const diagonalPoints = [];
                    diagonalPoints.push(new THREE.Vector3(baseX, 0, baseZ));
                    diagonalPoints.push(new THREE.Vector3(topX, height, topZ));
                    
                    const diagonalCurve = new THREE.CatmullRomCurve3(diagonalPoints);
                    const diagonalGeometry = new THREE.TubeGeometry(
                        diagonalCurve,
                        8,
                        0.15,
                        8,
                        false
                    );
                    
                    const diagonalBeam = new THREE.Mesh(diagonalGeometry, metalMaterial);
                    section.add(diagonalBeam);
                }
            }
            
            // Add horizontal cross members at each level
            for (let level = 0; level <= levels; level++) {
                const y = (height / levels) * level;
                const levelWidth = baseWidth - (level / levels) * (baseWidth - topWidth);
                
                for (let i = 0; i < 4; i++) {
                    const angle1 = (i * Math.PI) / 2;
                    const angle2 = ((i + 1) % 4 * Math.PI) / 2;
                    
                    const x1 = Math.cos(angle1) * levelWidth / 2;
                    const z1 = Math.sin(angle1) * levelWidth / 2;
                    const x2 = Math.cos(angle2) * levelWidth / 2;
                    const z2 = Math.sin(angle2) * levelWidth / 2;
                    
                    const horizontalPoints = [];
                    horizontalPoints.push(new THREE.Vector3(x1, y, z1));
                    horizontalPoints.push(new THREE.Vector3(x2, y, z2));
                    
                    const horizontalCurve = new THREE.CatmullRomCurve3(horizontalPoints);
                    const horizontalGeometry = new THREE.TubeGeometry(
                        horizontalCurve,
                        8,
                        0.15,
                        8,
                        false
                    );
                    
                    const horizontalBeam = new THREE.Mesh(horizontalGeometry, metalMaterial);
                    section.add(horizontalBeam);
                }
                
                // Add cross braces for each face
                if (level < levels) {
                    for (let i = 0; i < 4; i++) {
                        const angle1 = (i * Math.PI) / 2;
                        const angle2 = ((i + 1) % 4 * Math.PI) / 2;
                        
                        const currentWidth = baseWidth - (level / levels) * (baseWidth - topWidth);
                        const nextWidth = baseWidth - ((level + 1) / levels) * (baseWidth - topWidth);
                        
                        const x1 = Math.cos(angle1) * currentWidth / 2;
                        const z1 = Math.sin(angle1) * currentWidth / 2;
                        const x2 = Math.cos(angle2) * nextWidth / 2;
                        const z2 = Math.sin(angle2) * nextWidth / 2;
                        
                        // Cross brace 1
                        const crossPoints1 = [];
                        crossPoints1.push(new THREE.Vector3(x1, y, z1));
                        crossPoints1.push(new THREE.Vector3(x2, y + height/levels, z2));
                        
                        const crossCurve1 = new THREE.CatmullRomCurve3(crossPoints1);
                        const crossGeometry1 = new THREE.TubeGeometry(
                            crossCurve1,
                            8,
                            0.1,
                            8,
                            false
                        );
                        
                        const crossBeam1 = new THREE.Mesh(crossGeometry1, darkMetalMaterial);
                        section.add(crossBeam1);
                        
                        // Cross brace 2
                        const x3 = Math.cos(angle2) * currentWidth / 2;
                        const z3 = Math.sin(angle2) * currentWidth / 2;
                        const x4 = Math.cos(angle1) * nextWidth / 2;
                        const z4 = Math.sin(angle1) * nextWidth / 2;
                        
                        const crossPoints2 = [];
                        crossPoints2.push(new THREE.Vector3(x3, y, z3));
                        crossPoints2.push(new THREE.Vector3(x4, y + height/levels, z4));
                        
                        const crossCurve2 = new THREE.CatmullRomCurve3(crossPoints2);
                        const crossGeometry2 = new THREE.TubeGeometry(
                            crossCurve2,
                            8,
                            0.1,
                            8,
                            false
                        );
                        
                        const crossBeam2 = new THREE.Mesh(crossGeometry2, darkMetalMaterial);
                        section.add(crossBeam2);
                    }
                }
            }
            
            return section;
        };

        // Create antenna array
        const createAntennaArray = (width: number) => {
            const antennaGroup = new THREE.Group();
            
            // Base plate
            const baseGeometry = new THREE.BoxGeometry(width, 0.2, width/2);
            const base = new THREE.Mesh(baseGeometry, darkMetalMaterial);
            antennaGroup.add(base);
            
            // Add antennas
            const antennaCount = 3;
            const antennaWidth = width / (antennaCount + 1);
            
            for (let i = 0; i < antennaCount; i++) {
                const x = (i - (antennaCount - 1) / 2) * antennaWidth;
                
                const panelGeometry = new THREE.BoxGeometry(antennaWidth * 0.8, 1.5, 0.2);
                const panel = new THREE.Mesh(panelGeometry, antennaMaterial);
                panel.position.set(x, 0.85, width/4 - 0.1);
                antennaGroup.add(panel);
                
                // Add cables
                const cableGeometry = new THREE.CylinderGeometry(0.05, 0.05, 0.5, 8);
                const cable = new THREE.Mesh(cableGeometry, darkMetalMaterial);
                cable.position.set(x, 0.2, 0);
                cable.rotation.x = Math.PI / 2;
                antennaGroup.add(cable);
            }
            
            return antennaGroup;
        };

        // Create microwave dish
        const createMicrowaveDish = (size: number) => {
            const dishGroup = new THREE.Group();
            
            // Dish
            const dishGeometry = new THREE.SphereGeometry(size, 32, 32, 0, Math.PI * 2, 0, Math.PI / 2);
            const dish = new THREE.Mesh(dishGeometry, antennaMaterial);
            dish.rotation.x = Math.PI;
            dish.position.y = size;
            dishGroup.add(dish);
            
            // Mount
            const mountGeometry = new THREE.BoxGeometry(size * 0.5, size * 0.5, size * 0.2);
            const mount = new THREE.Mesh(mountGeometry, darkMetalMaterial);
            mount.position.y = size * 0.25;
            mount.position.z = -size * 0.1;
            dishGroup.add(mount);
            
            // Receiver
            const receiverGeometry = new THREE.CylinderGeometry(size * 0.1, size * 0.1, size * 0.3, 8);
            const receiver = new THREE.Mesh(receiverGeometry, darkMetalMaterial);
            receiver.position.y = size;
            receiver.position.z = size * 0.5;
            receiver.rotation.x = Math.PI / 2;
            dishGroup.add(receiver);
            
            return dishGroup;
        };

        // Create equipment shelter
        const createEquipmentShelter = (width: number) => {
            const shelterGroup = new THREE.Group();
            
            // Main housing
            const housingGeometry = new THREE.BoxGeometry(width, width * 0.6, width * 0.8);
            const housing = new THREE.Mesh(housingGeometry, equipmentMaterial);
            shelterGroup.add(housing);
            
            // Cooling vents
            for (let i = 0; i < 3; i++) {
                const ventGeometry = new THREE.BoxGeometry(width * 0.2, width * 0.05, width * 0.05);
                const vent = new THREE.Mesh(ventGeometry, darkMetalMaterial);
                vent.position.set(0, width * 0.2, width * 0.4 - i * width * 0.15);
                shelterGroup.add(vent);
            }
            
            return shelterGroup;
        };

        // Build complete tower
        const buildTower = () => {
            const tower = new THREE.Group();
            
            // Add foundation
            const foundation = createFoundation();
            tower.add(foundation);
            
            // Section heights and widths
            const sectionHeights = [8, 6, 5, 4];
            let sectionWidths = [10, 7, 5, 3, 1.5];
            let currentHeight = 0;
            
            // Build tower sections
            for (let i = 0; i < sectionHeights.length; i++) {
                const section = createLatticeSection(
                    sectionHeights[i],
                    sectionWidths[i],
                    sectionWidths[i+1],
                    i === 0 ? 4 : 3
                );
                section.position.y = currentHeight;
                currentHeight += sectionHeights[i];
                tower.add(section);
                
                // Add platform at each section
                if (i < sectionHeights.length - 1) {
                    const platformGeometry = new THREE.BoxGeometry(
                        sectionWidths[i+1] * 1.1,
                        0.2,
                        sectionWidths[i+1] * 1.1
                    );
                    const platform = new THREE.Mesh(platformGeometry, darkMetalMaterial);
                    platform.position.y = currentHeight;
                    tower.add(platform);
                    
                    // Add railings
                    const railingHeight = 1;
                    for (let j = 0; j < 4; j++) {
                        const angle = (j * Math.PI) / 2;
                        const width = sectionWidths[i+1] * 1.1;
                        const x = Math.cos(angle) * width / 2;
                        const z = Math.sin(angle) * width / 2;
                        
                        const railingGeometry = new THREE.BoxGeometry(width, 0.05, 0.05);
                        const railing = new THREE.Mesh(railingGeometry, darkMetalMaterial);
                        railing.position.y = currentHeight + railingHeight;
                        railing.rotation.y = angle + Math.PI / 2;
                        tower.add(railing);
                        
                        // Add vertical supports
                        for (let k = 0; k <= 2; k++) {
                            const supportGeometry = new THREE.CylinderGeometry(0.03, 0.03, railingHeight, 8);
                            const support = new THREE.Mesh(supportGeometry, darkMetalMaterial);
                            const offset = (k - 1) * width / 2;
                            support.position.x = x + (j % 2 === 0 ? offset : 0);
                            support.position.z = z + (j % 2 === 1 ? offset : 0);
                            support.position.y = currentHeight + railingHeight / 2;
                            tower.add(support);
                        }
                    }
                }
                
                // Add equipment at various levels
                if (i === 1) {
                    // Equipment shelter
                    const shelter = createEquipmentShelter(sectionWidths[i+1] * 0.8);
                    shelter.position.y = currentHeight + 0.1;
                    tower.add(shelter);
                }
                
                if (i === 2 || i === 0) {
                    // Microwave dishes at two levels
                    for (let j = 0; j < 2; j++) {
                        const dish = createMicrowaveDish(0.8);
                        const angle = j * Math.PI;
                        dish.position.x = Math.cos(angle) * (sectionWidths[i+1] * 0.6);
                        dish.position.z = Math.sin(angle) * (sectionWidths[i+1] * 0.6);
                        dish.position.y = currentHeight - 1;
                        dish.rotation.y = angle + Math.PI;
                        tower.add(dish);
                    }
                }
            }
            
            // Add antenna arrays at the top
            const topAntennas = new THREE.Group();
            
            for (let i = 0; i < 3; i++) {
                const antenna = createAntennaArray(1.5);
                antenna.position.y = currentHeight + 0.1;
                antenna.rotation.y = i * (Math.PI * 2 / 3);
                topAntennas.add(antenna);
            }
            
            tower.add(topAntennas);
            
            // Add fiber optic cables
            const cablesGroup = new THREE.Group();
            
            for (let i = 0; i < 4; i++) {
                const angle = (i * Math.PI) / 2 + Math.PI / 4;
                const points = [];
                
                for (let j = 0; j <= 20; j++) {
                    const height = j * currentHeight / 20;
                    const width = sectionWidths[0] - 
                                            (height / currentHeight) * (sectionWidths[0] - sectionWidths[sectionWidths.length - 1]);
                    const x = Math.cos(angle) * width / 2;
                    const z = Math.sin(angle) * width / 2;
                    
                    // Add some randomness to cable path
                    const randomOffset = j > 0 && j < 20 ? (Math.random() - 0.5) * 0.1 : 0;
                    points.push(new THREE.Vector3(
                        x + randomOffset, 
                        height, 
                        z + randomOffset
                    ));
                }
                
                const cableCurve = new THREE.CatmullRomCurve3(points);
                const cableGeometry = new THREE.TubeGeometry(cableCurve, 50, 0.05, 8, false);
                const cableMaterial = new THREE.MeshStandardMaterial({ 
                    color: i % 2 === 0 ? 0x222222 : 0x333333,
                    roughness: 0.7
                });
                const cable = new THREE.Mesh(cableGeometry, cableMaterial);
                cablesGroup.add(cable);
            }
            
            tower.add(cablesGroup);
            
            return tower;
        };

        // Create tower and add to scene
        const tower = buildTower();
        scene.add(tower);

        // Wireframe state
        let wireframeEnabled = false;
        
        // Toggle wireframe function
        const toggleWireframe = () => {
            wireframeEnabled = !wireframeEnabled;
            scene.traverse((object) => {
                if (object instanceof THREE.Mesh) {
                    object.material.wireframe = wireframeEnabled;
                }
            });
        };

        // Event listener for keyboard
        window.addEventListener('keydown', (event) => {
            if (event.key === 'w') {
                toggleWireframe();
            }
        });

        // Animation loop
        const animate = () => {
            requestAnimationFrame(animate);
            controls.update();
            renderer.render(scene, camera);
        };

        animate();

        // Handle window resize
        const handleResize = () => {
            const width = window.innerWidth;
            const height = window.innerHeight;

            camera.aspect = width / height;
            camera.updateProjectionMatrix();

            renderer.setSize(width, height);
        };

        window.addEventListener('resize', handleResize);

        // Cleanup function
        return () => {
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('keydown', toggleWireframe);
            mountRef.current?.removeChild(renderer.domElement);
        };
    }, []);

    return (
        <div>
            <div ref={mountRef} style={{ width: '100%', height: '100vh' }} />
            <div className="info" style={{ 
                position: 'absolute', 
                top: '10px', 
                left: '10px',
                padding: '10px',
                background: 'rgba(0,0,0,0.7)',
                color: 'white',
                borderRadius: '4px'
            }}>
                <p>Press W to toggle wireframe mode</p>
                <p>Use mouse to orbit, zoom and pan</p>
            </div>
        </div>
    );
}