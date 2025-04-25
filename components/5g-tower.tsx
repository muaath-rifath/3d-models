"use client";
import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

type Tower5GProps = {
  isDarkMode?: boolean;
  width?: number;
  height?: number;
}

export default function Tower5G({ isDarkMode = false, width = 500, height = 400 }: Tower5GProps) {
    const mountRef = useRef<HTMLDivElement>(null);
    const sceneRef = useRef<THREE.Scene | null>(null);
    const towerRef = useRef<THREE.Group | null>(null);
    // Add refs for renderer, camera, controls, and animation frame
    const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
    const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
    const controlsRef = useRef<OrbitControls | null>(null);
    const requestRef = useRef<number | null>(null);

    // Function to update materials based on dark mode
    const updateMaterials = (isDark: boolean) => {
        if (!sceneRef.current || !towerRef.current) return;
        
        // Update scene background - change to dark green for dark mode
        sceneRef.current.background = new THREE.Color(isDark ? 0x001208 : 0xf0f0f0);
        
        // Update tower materials
        towerRef.current.traverse((object) => {
            if (object instanceof THREE.Mesh) {
                // Check material type to assign appropriate color scheme
                const material = object.material as THREE.MeshStandardMaterial;
                
                // Identify materials by name and update accordingly
                if (material.name === 'metal') {
                    material.color.set(isDark ? 0x00cc66 : 0x6699cc);
                    material.emissive.set(isDark ? 0x006633 : 0x000000);
                    material.emissiveIntensity = isDark ? 0.4 : 0;
                }
                else if (material.name === 'dark_metal') {
                    material.color.set(isDark ? 0x115533 : 0x445566);
                    material.emissive.set(isDark ? 0x002211 : 0x000000);
                    material.emissiveIntensity = isDark ? 0.2 : 0;
                }
                else if (material.name === 'antenna') {
                    material.color.set(isDark ? 0xccffdd : 0xeeeeee);
                    material.emissive.set(isDark ? 0x66ffaa : 0x000000);
                    material.emissiveIntensity = isDark ? 0.5 : 0;
                }
                else if (material.name === 'equipment') {
                    material.color.set(isDark ? 0x224433 : 0x223344);
                    material.emissive.set(isDark ? 0x001100 : 0x000000);
                    material.emissiveIntensity = isDark ? 0.2 : 0;
                }
                else if (material.name === 'warning') {
                    material.color.set(isDark ? 0xffaa00 : 0xff6600);
                    material.emissive.set(isDark ? 0xff7700 : 0xff3300);
                    material.emissiveIntensity = isDark ? 0.6 : 0.3;
                }
            }
        });
    };

    useEffect(() => {
        if (!mountRef.current) return;

        const currentMount = mountRef.current; // Capture mount point

        // Scene setup
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(isDarkMode ? 0x001208 : 0xf0f0f0);
        sceneRef.current = scene;

        // Camera setup
        const camera = new THREE.PerspectiveCamera(
            50,
            width / height,
            0.1,
            1000
        );
        camera.position.set(20, 15, 20);
        cameraRef.current = camera; // Store camera in ref

        // Renderer setup
        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(width, height);
        renderer.shadowMap.enabled = false;
        rendererRef.current = renderer; // Store renderer in ref
        currentMount.appendChild(renderer.domElement);

        // Controls setup
        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;
        controls.minDistance = 10;
        controls.maxDistance = 50;
        controlsRef.current = controls; // Store controls in ref

        // Create lighting
        const ambientLight = new THREE.AmbientLight(
          isDarkMode ? 0x223322 : 0x909090,
          isDarkMode ? 0.4 : 0.8
        );
        scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(
          isDarkMode ? 0xaaffcc : 0xffffff,
          isDarkMode ? 0.7 : 0.9
        );
        directionalLight.position.set(50, 200, 100);
        // Disable shadows
        directionalLight.castShadow = false; 
        scene.add(directionalLight);

        // Create 5G Tower
        const tower = createTower();
        scene.add(tower);
        towerRef.current = tower;

        // Create Tower function
        function createTower() {
            const towerGroup = new THREE.Group();
            
            // Materials
            const metalMaterial = new THREE.MeshStandardMaterial({
                color: isDarkMode ? 0x00cc66 : 0x6699cc,
                roughness: 0.4,
                metalness: 0.8,
                name: 'metal'
            });
            
            const darkMetalMaterial = new THREE.MeshStandardMaterial({
                color: isDarkMode ? 0x115533 : 0x445566,
                roughness: 0.3,
                metalness: 0.7,
                name: 'dark_metal'
            });
            
            const antennaMaterial = new THREE.MeshStandardMaterial({
                color: isDarkMode ? 0xccffdd : 0xeeeeee,
                roughness: 0.2,
                metalness: 0.9,
                name: 'antenna'
            });
            
            const equipmentMaterial = new THREE.MeshStandardMaterial({
                color: isDarkMode ? 0x224433 : 0x223344,
                roughness: 0.5,
                metalness: 0.6,
                name: 'equipment'
            });
            
            const warningMaterial = new THREE.MeshStandardMaterial({
                color: isDarkMode ? 0xffaa00 : 0xff6600,
                emissive: isDarkMode ? 0xff7700 : 0xff3300,
                emissiveIntensity: isDarkMode ? 0.6 : 0.3,
                roughness: 0.4,
                metalness: 0.5,
                name: 'warning'
            });

            // Tower base
            const baseGeometry = new THREE.BoxGeometry(4, 1, 4);
            const base = new THREE.Mesh(baseGeometry, darkMetalMaterial);
            base.position.y = 0;
            towerGroup.add(base);
            
            // Tower main shaft
            const mainTowerHeight = 25;
            const shaftGeometry = new THREE.BoxGeometry(1.5, mainTowerHeight, 1.5);
            const shaft = new THREE.Mesh(shaftGeometry, metalMaterial);
            shaft.position.y = mainTowerHeight / 2 + 0.5;
            towerGroup.add(shaft);
            
            // Tower sections/supports
            const sectionHeight = 2.5;
            const sectionCount = 8;
            for (let i = 0; i < sectionCount; i++) {
                const y = (i + 1) * mainTowerHeight / (sectionCount + 1) + 0.5;
                createTowerSection(y, towerGroup, metalMaterial, darkMetalMaterial);
            }
            
            // Top equipment platform
            const platformGeometry = new THREE.CylinderGeometry(3, 3, 0.5, 8);
            const platform = new THREE.Mesh(platformGeometry, darkMetalMaterial);
            platform.position.y = mainTowerHeight + 1;
            towerGroup.add(platform);
            
            // Antennas & Equipment
            const antennaCount = 3;
            for (let i = 0; i < antennaCount; i++) {
                const angle = (i / antennaCount) * Math.PI * 2;
                const radius = 2.5;
                const x = Math.cos(angle) * radius;
                const z = Math.sin(angle) * radius;
                
                // Create sector antenna panel
                createSectorAntenna(x, mainTowerHeight + 1.5, z, angle, towerGroup, antennaMaterial, equipmentMaterial);
            }
            
            // Warning light at top
            const warningLightGeometry = new THREE.SphereGeometry(0.3, 16, 16);
            const warningLight = new THREE.Mesh(warningLightGeometry, warningMaterial);
            warningLight.position.y = mainTowerHeight + 3.5;
            
            // Add point light to warning light
            const pointLight = new THREE.PointLight(0xff3300, 1, 50);
            pointLight.position.set(0, 0.2, 0);
            warningLight.add(pointLight);
            towerGroup.add(warningLight);
            
            // Small dishes
            const dishPositions = [
                { y: mainTowerHeight * 0.8, angle: Math.PI / 6 },
                { y: mainTowerHeight * 0.6, angle: Math.PI / 2 + Math.PI / 6 },
                { y: mainTowerHeight * 0.4, angle: Math.PI + Math.PI / 6 },
            ];
            
            dishPositions.forEach(pos => {
                createDish(pos.y, pos.angle, towerGroup, antennaMaterial, darkMetalMaterial);
            });
            
            return towerGroup;
        }

        function createTowerSection(y: number, parent: THREE.Group, metalMaterial: THREE.MeshStandardMaterial, darkMetalMaterial: THREE.MeshStandardMaterial) {
            const sectionGroup = new THREE.Group();
            sectionGroup.position.y = y;
            
            // Horizontal supports
            const horizontalGeometry = new THREE.BoxGeometry(4, 0.3, 4);
            const horizontal = new THREE.Mesh(horizontalGeometry, darkMetalMaterial);
            sectionGroup.add(horizontal);
            
            // Diagonal supports
            const height = 2;
            const diagonalGeometry = new THREE.CylinderGeometry(0.15, 0.15, height * 1.5, 8);
            
            for (let i = 0; i < 4; i++) {
                const angle = (i / 4) * Math.PI * 2 + Math.PI / 4;
                const x = Math.cos(angle) * 1.5;
                const z = Math.sin(angle) * 1.5;
                
                const diagonal = new THREE.Mesh(diagonalGeometry, metalMaterial);
                diagonal.position.set(x, 0, z);
                
                // Rotate to point from center out and down
                diagonal.rotation.x = Math.PI / 4;
                diagonal.rotation.y = -angle;
                
                sectionGroup.add(diagonal);
            }
            
            parent.add(sectionGroup);
        }

        function createSectorAntenna(x: number, y: number, z: number, angle: number, parent: THREE.Group, antennaMaterial: THREE.MeshStandardMaterial, equipmentMaterial: THREE.MeshStandardMaterial) {
            const antennaGroup = new THREE.Group();
            antennaGroup.position.set(x, y, z);
            antennaGroup.rotation.y = angle;
            
            // Main panel
            const panelGeometry = new THREE.BoxGeometry(0.5, 4, 1.5);
            const panel = new THREE.Mesh(panelGeometry, antennaMaterial);
            antennaGroup.add(panel);
            
            // Equipment box
            const boxGeometry = new THREE.BoxGeometry(0.8, 1.5, 1);
            const box = new THREE.Mesh(boxGeometry, equipmentMaterial);
            box.position.set(-0.7, -0.5, 0);
            antennaGroup.add(box);
            
            parent.add(antennaGroup);
        }

        function createDish(y: number, angle: number, parent: THREE.Group, antennaMaterial: THREE.MeshStandardMaterial, darkMetalMaterial: THREE.MeshStandardMaterial) {
            const dishGroup = new THREE.Group();
            dishGroup.position.y = y;
            
            // Support arm
            const armGeometry = new THREE.BoxGeometry(3, 0.3, 0.3);
            const arm = new THREE.Mesh(armGeometry, darkMetalMaterial);
            arm.position.x = 1.5;
            dishGroup.add(arm);
            
            // Dish
            const dishGeometry = new THREE.SphereGeometry(1, 32, 16, 0, Math.PI);
            const dish = new THREE.Mesh(dishGeometry, antennaMaterial);
            dish.rotation.y = Math.PI;
            dish.rotation.x = Math.PI / 2;
            dish.position.set(3, 0, 0);
            dishGroup.add(dish);
            
            // Mount
            const mountGeometry = new THREE.CylinderGeometry(0.3, 0.3, 0.5, 8);
            const mount = new THREE.Mesh(mountGeometry, darkMetalMaterial);
            mount.rotation.x = Math.PI / 2;
            mount.position.set(3, 0, 0);
            dishGroup.add(mount);
            
            // Rotate the whole dish assembly
            dishGroup.rotation.y = angle;
            
            parent.add(dishGroup);
        }

        // Animation loop
        const animate = () => {
            // Use refs and check for existence
            if (rendererRef.current && sceneRef.current && cameraRef.current && controlsRef.current) {
                controlsRef.current.update();
                rendererRef.current.render(sceneRef.current, cameraRef.current);
            }
            requestRef.current = requestAnimationFrame(animate); // Store request ID
        };
        // Start animation loop only once refs are likely set
        requestRef.current = requestAnimationFrame(animate);

        // Handle window resize
        const handleResize = () => {
            // Use refs and check for existence
            if (cameraRef.current && rendererRef.current) {
                cameraRef.current.aspect = width / height;
                cameraRef.current.updateProjectionMatrix();
                rendererRef.current.setSize(width, height);
            }
        };

        // Initial call to handle potential initial size mismatch
        handleResize(); 
        // Note: Resize listener might be better outside useEffect or handled differently if width/height props change frequently

        // Cleanup function
        return () => {
            // Cancel the animation frame
            if (requestRef.current) {
                cancelAnimationFrame(requestRef.current);
            }

            // Dispose controls
            if (controlsRef.current) {
                controlsRef.current.dispose();
                controlsRef.current = null;
            }

            // Dispose renderer and remove from DOM
            if (rendererRef.current) {
                rendererRef.current.dispose();
                if (currentMount && rendererRef.current.domElement) {
                    try {
                        currentMount.removeChild(rendererRef.current.domElement);
                    } catch (e) {
                        console.warn("Could not remove renderer DOM element during cleanup:", e);
                    }
                }
                rendererRef.current = null;
            }

            // Dispose scene resources
            if (sceneRef.current) {
                sceneRef.current.traverse((object) => {
                    if (object instanceof THREE.Mesh) {
                        if (object.geometry) {
                            object.geometry.dispose();
                        }
                        const material = object.material as THREE.Material | THREE.Material[];
                        if (Array.isArray(material)) {
                            material.forEach(mat => mat.dispose());
                        } else if (material) {
                            material.dispose();
                        }
                    }
                });
                sceneRef.current = null; // Clear scene ref
            }

            // Clear other refs
            cameraRef.current = null;
            towerRef.current = null;
        };
    }, [isDarkMode, width, height]); // Keep dependencies

    // Apply dark mode updates when the prop changes
    useEffect(() => {
        updateMaterials(isDarkMode);
        // Update lights based on dark mode as well
        if (sceneRef.current) {
            sceneRef.current.traverse((object) => {
                if (object instanceof THREE.AmbientLight) {
                    object.color.set(isDarkMode ? 0x223322 : 0x909090);
                    object.intensity = isDarkMode ? 0.4 : 0.8;
                } else if (object instanceof THREE.DirectionalLight) {
                    object.color.set(isDarkMode ? 0xaaffcc : 0xffffff);
                    object.intensity = isDarkMode ? 0.7 : 0.9;
                } else if (object instanceof THREE.PointLight && object.parent?.name === 'warning') {
                    // Assuming warning light material name implies it's the one with point light
                    object.color.set(isDarkMode ? 0xff7700 : 0xff3300);
                    object.intensity = isDarkMode ? 1.2 : 1; // Adjust intensity if needed
                }
            });
        }
    }, [isDarkMode]);

    return (
        <div ref={mountRef} style={{ width, height }} />
    );
}