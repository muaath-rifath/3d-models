'use client';

import React, { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';

type IoTGatewayProps = {
    isDarkMode?: boolean;
}

const BASE_SIZE = { x: 12, y: 2, z: 9 };
const TOP_SIZE = { x: 11, y: 1, z: 8 };
const VENT_SIZE = { x: 0.6, y: 1.1, z: 0.6 };
const LED_RADIUS = 0.2;
const LOGO_SIZE = { width: 3, height: 1 };
const POWER_PORT_RADIUS = 0.6;
const POWER_PORT_LENGTH = 0.5;
const ETHERNET_PORT_SIZE = { x: 1.5, y: 0.8, z: 0.5 };
const USB_PORT_SIZE = { x: 1.2, y: 0.5, z: 0.5 };

const useGatewayMaterials = (isDarkMode: boolean) => {
    return useMemo(() => ({
        baseMaterial: new THREE.MeshStandardMaterial({
            color: isDarkMode ? 0x1a2e20 : 0xffffff,
            roughness: 0.8,
            metalness: 0.2,
            name: 'base'
        }),
        topMaterial: new THREE.MeshStandardMaterial({
            color: isDarkMode ? 0x00aa88 : 0xf0f0f0,
            roughness: 0.5,
            metalness: 0.3,
            name: 'top'
        }),
        ventMaterial: new THREE.MeshStandardMaterial({
            color: isDarkMode ? 0x003322 : 0x000000,
            roughness: 1.0,
            metalness: 0,
            name: 'vent'
        }),
        powerLedMaterial: new THREE.MeshStandardMaterial({
            color: 0x00ff00,
            emissive: 0x00ff00,
            emissiveIntensity: isDarkMode ? 0.8 : 0.4,
            name: 'power_led'
        }),
        internetLedMaterial: new THREE.MeshStandardMaterial({
            color: 0x0077ff,
            emissive: 0x0077ff,
            emissiveIntensity: isDarkMode ? 0.8 : 0.4,
            name: 'internet_led'
        }),
        wifiLedMaterial: new THREE.MeshStandardMaterial({
            color: 0x00ffff,
            emissive: 0x00ffff,
            emissiveIntensity: isDarkMode ? 0.8 : 0.4,
            name: 'wifi_led'
        }),
        iotLedMaterial: new THREE.MeshStandardMaterial({
            color: 0xff77ff,
            emissive: 0xff77ff,
            emissiveIntensity: isDarkMode ? 0.8 : 0.4,
            name: 'iot_led'
        }),
        logoMaterial: new THREE.MeshStandardMaterial({
            color: isDarkMode ? 0x00ffaa : 0x009977,
            emissive: isDarkMode ? 0x00aa88 : 0x000000,
            emissiveIntensity: isDarkMode ? 0.3 : 0,
            name: 'logo'
        }),
        powerPortMaterial: new THREE.MeshStandardMaterial({
            color: 0x333333,
            roughness: 0.7,
            metalness: 0.3,
            name: 'power_port'
        }),
        ethernetPortMaterial: new THREE.MeshStandardMaterial({
            color: isDarkMode ? 0x444444 : 0x888888,
            roughness: 0.5,
            metalness: 0.5,
            name: 'ethernet_port'
        }),
        usbPortMaterial: new THREE.MeshStandardMaterial({
            color: isDarkMode ? 0x555555 : 0xaaaaaa,
            roughness: 0.4,
            metalness: 0.6,
            name: 'usb_port'
        }),
    }), [isDarkMode]);
};

export default function IoTGateway({ isDarkMode = false }: IoTGatewayProps) {
    const gatewayGroupRef = useRef<THREE.Group>(null);
    const materials = useGatewayMaterials(isDarkMode);

    const powerLedMatRef = useRef<THREE.MeshStandardMaterial>(null);
    const internetLedMatRef = useRef<THREE.MeshStandardMaterial>(null);
    const wifiLedMatRef = useRef<THREE.MeshStandardMaterial>(null);
    const iotLedMatRef = useRef<THREE.MeshStandardMaterial>(null);

    useFrame((state) => {
        const time = state.clock.elapsedTime;
        const baseIntensity = isDarkMode ? 0.8 : 0.4;
        const blinkIntensity = baseIntensity * (0.6 + Math.abs(Math.sin(time * 3)) * 0.4);
        const fastBlinkIntensity = baseIntensity * (0.6 + Math.abs(Math.sin(time * 6)) * 0.4);

        if (powerLedMatRef.current) powerLedMatRef.current.emissiveIntensity = baseIntensity;
        if (internetLedMatRef.current) internetLedMatRef.current.emissiveIntensity = blinkIntensity;
        if (wifiLedMatRef.current) wifiLedMatRef.current.emissiveIntensity = fastBlinkIntensity;
        if (iotLedMatRef.current) iotLedMatRef.current.emissiveIntensity = blinkIntensity;
    });

    const ventPositions = useMemo(() => {
        const positions: [number, number, number][] = [];
        for (let x = -4; x <= 4; x += 2) {
            for (let z = -2.5; z <= 2.5; z += 1.5) {
                positions.push([x, BASE_SIZE.y / 2 + TOP_SIZE.y / 2, z]);
            }
        }
        return positions;
    }, []);

    const portStartX = -4.5;
    const portSpacing = 2;
    const ethernetPortPositions = useMemo(() => Array.from({ length: 4 }, (_, i) => [
        portStartX + portSpacing * (i + 1),
        BASE_SIZE.y / 2,
        -BASE_SIZE.z / 2 - ETHERNET_PORT_SIZE.z / 2
    ] as const), []);

    const usbPortPosition = useMemo(() => [
        portStartX + portSpacing * 5 + USB_PORT_SIZE.x / 2,
        BASE_SIZE.y / 2,
        -BASE_SIZE.z / 2 - USB_PORT_SIZE.z / 2
    ] as const, []);

    return (
        <group ref={gatewayGroupRef} dispose={null}>
            <mesh material={materials.baseMaterial} position-y={BASE_SIZE.y / 2}>
                <boxGeometry args={[BASE_SIZE.x, BASE_SIZE.y, BASE_SIZE.z]} />
            </mesh>

            <mesh material={materials.topMaterial} position-y={BASE_SIZE.y + TOP_SIZE.y / 2}>
                <boxGeometry args={[TOP_SIZE.x, TOP_SIZE.y, TOP_SIZE.z]} />
            </mesh>

            {ventPositions.map((pos, index) => (
                <mesh key={`vent-${index}`} material={materials.ventMaterial} position={pos}>
                    <boxGeometry args={[VENT_SIZE.x, VENT_SIZE.y, VENT_SIZE.z]} />
                </mesh>
            ))}

            <mesh
                material={powerLedMatRef.current}
                position={[-5, BASE_SIZE.y / 2 + 0.5, BASE_SIZE.z / 2 + 0.01]}
                rotation-y={Math.PI / 2}
            >
                <circleGeometry args={[LED_RADIUS, 16]} />
            </mesh>

            <mesh
                material={internetLedMatRef.current}
                position={[-4, BASE_SIZE.y / 2 + 0.5, BASE_SIZE.z / 2 + 0.01]}
                rotation-y={Math.PI / 2}
            >
                <circleGeometry args={[LED_RADIUS, 16]} />
            </mesh>

            <mesh
                material={wifiLedMatRef.current}
                position={[-3, BASE_SIZE.y / 2 + 0.5, BASE_SIZE.z / 2 + 0.01]}
                rotation-y={Math.PI / 2}
            >
                <circleGeometry args={[LED_RADIUS, 16]} />
            </mesh>

            <mesh
                material={iotLedMatRef.current}
                position={[-2, BASE_SIZE.y / 2 + 0.5, BASE_SIZE.z / 2 + 0.01]}
                rotation-y={Math.PI / 2}
            >
                <circleGeometry args={[LED_RADIUS, 16]} />
            </mesh>

            <mesh
                material={materials.logoMaterial}
                position={[0, BASE_SIZE.y / 2 + 0.5, BASE_SIZE.z / 2 + 0.01]}
                rotation-y={Math.PI / 2}
            >
                <planeGeometry args={[LOGO_SIZE.width, LOGO_SIZE.height]} />
            </mesh>

            <mesh
                material={materials.powerPortMaterial}
                position={[portStartX, BASE_SIZE.y / 2, -BASE_SIZE.z / 2 - POWER_PORT_LENGTH / 2]}
                rotation-x={Math.PI / 2}
            >
                <cylinderGeometry args={[POWER_PORT_RADIUS, POWER_PORT_RADIUS, POWER_PORT_LENGTH, 16]} />
            </mesh>

            {ethernetPortPositions.map((pos, index) => (
                <mesh
                    key={`eth-${index}`}
                    material={materials.ethernetPortMaterial}
                    position={pos}
                >
                    <boxGeometry args={[ETHERNET_PORT_SIZE.x, ETHERNET_PORT_SIZE.y, ETHERNET_PORT_SIZE.z]} />
                </mesh>
            ))}

            <mesh
                material={materials.usbPortMaterial}
                position={usbPortPosition}
            >
                <boxGeometry args={[USB_PORT_SIZE.x, USB_PORT_SIZE.y, USB_PORT_SIZE.z]} />
            </mesh>

        </group>
    );
}