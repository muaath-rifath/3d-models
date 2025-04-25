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

        // Renderer setup
        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(width, height);
        // Disable shadows
        renderer.shadowMap.enabled = false; 
        mountRef.current.appendChild(renderer.domElement);

        // Controls setup
        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;
        controls.minDistance = 10;
        controls.maxDistance = 50;

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
            requestAnimationFrame(animate);
            controls.update();
            renderer.render(scene, camera);
        };
        animate();

        // Handle window resize
        const handleResize = () => {
            camera.aspect = width / height;
            camera.updateProjectionMatrix();
            renderer.setSize(width, height);
        };

        window.addEventListener('resize', handleResize);

        // Cleanup function
        return () => {
            window.removeEventListener('resize', handleResize);
            if (mountRef.current) {
                mountRef.current.removeChild(renderer.domElement);
            }
            
            scene.traverse((object) => {
                if (object instanceof THREE.Mesh) {
                    if (object.geometry) {
                        object.geometry.dispose();
                    }
                    
                    if (Array.isArray(object.material)) {
                        object.material.forEach(material => material.dispose());
                    } else if (object.material) {
                        object.material.dispose();
                    }
                }
            });
        };
    }, [isDarkMode, width, height]);

    // Apply dark mode updates when the prop changes
    useEffect(() => {
        updateMaterials(isDarkMode);
    }, [isDarkMode]);

    return (
        <div ref={mountRef} style={{ width, height }} />
    );
}