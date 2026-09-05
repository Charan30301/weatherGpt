"use client";

import { Canvas, useLoader, useThree } from "@react-three/fiber";
import { OrbitControls, Stars } from "@react-three/drei";
import * as THREE from "three";
import { useEffect, useMemo, useRef } from "react";

interface GlobeProps {
  locationName: string;
  latitude: number;
  longitude: number;
}

function latLonToVector3(
  latitude: number,
  longitude: number,
  radius: number
): [number, number, number] {
  const lat = THREE.MathUtils.degToRad(latitude);
  const lon = THREE.MathUtils.degToRad(longitude);

  const x = radius * Math.cos(lat) * Math.sin(lon);
  const y = radius * Math.sin(lat);
  const z = radius * Math.cos(lat) * Math.cos(lon);

  return [x, y, z];
}

function LocationMarker({
  latitude,
  longitude,
}: {
  latitude: number;
  longitude: number;
}) {
  const position = useMemo(
    () => latLonToVector3(latitude, longitude, 2.28),
    [latitude, longitude]
  );

  return (
    <group position={position}>
      {/* Main pin */}
      <mesh>
        <sphereGeometry args={[0.09, 32, 32]} />
        <meshBasicMaterial color="#ef4444" />
      </mesh>

      {/* Pin glow */}
      <mesh>
        <sphereGeometry args={[0.18, 32, 32]} />
        <meshBasicMaterial
          color="#ef4444"
          transparent
          opacity={0.22}
        />
      </mesh>
    </group>
  );
}

function Earth({
  latitude,
  longitude,
}: {
  latitude: number;
  longitude: number;
}) {
  const earthTexture = useLoader(
    THREE.TextureLoader,
    "/textures/earth.png"
  );

  return (
    <group>
      {/* Earth */}
      <mesh>
        <sphereGeometry args={[2.2, 96, 96]} />

        <meshStandardMaterial
          map={earthTexture}
          roughness={0.9}
          metalness={0.02}
        />
      </mesh>

      {/* Atmosphere */}
      <mesh scale={[1.08, 1.08, 1.08]}>
        <sphereGeometry args={[2.2, 96, 96]} />

        <meshBasicMaterial
          color="#38bdf8"
          transparent
          opacity={0.12}
          side={THREE.BackSide}
        />
      </mesh>

      {/* ONE active location pin */}
      {latitude !== 0 || longitude !== 0 ? (
        <LocationMarker
          latitude={latitude}
          longitude={longitude}
        />
      ) : null}
    </group>
  );
}



function GlobeCamera({
  latitude,
  longitude,
}: {
  latitude: number;
  longitude: number;
}) {
  const { camera } = useThree();
  const controlsRef = useRef<any>(null);

  useEffect(() => {
    if (!controlsRef.current) return;

    const lat = THREE.MathUtils.degToRad(latitude);
    const lon = THREE.MathUtils.degToRad(longitude);

    const direction = new THREE.Vector3(
      Math.cos(lat) * Math.sin(lon),
      Math.sin(lat),
      Math.cos(lat) * Math.cos(lon)
    ).normalize();

    const distance = 5.5;

    camera.position.copy(
      direction.multiplyScalar(distance)
    );

    controlsRef.current.target.set(0, 0, 0);
    controlsRef.current.update();
  }, [camera, latitude, longitude]);

  return (
    <OrbitControls
      ref={controlsRef}
      enablePan={false}
      enableRotate={true}
      enableZoom={true}
      zoomSpeed={1.2}
      rotateSpeed={0.7}
      minDistance={2.7}
      maxDistance={10}
    />
  );
}

function GlobeScene({
  latitude,
  longitude,
}: {
  latitude: number;
  longitude: number;
}) {
  return (
    <>
      <ambientLight intensity={0.8} />

      <directionalLight
        position={[5, 3, 5]}
        intensity={2.2}
      />

      <Stars
        radius={50}
        depth={30}
        count={2500}
        factor={3}
        saturation={0}
        fade
        speed={0.2}
      />

      <Earth
        latitude={latitude}
        longitude={longitude}
      />

      <GlobeCamera
        latitude={latitude}
        longitude={longitude}
      />
    </>
  );
}

export default function Globe({
  locationName,
  latitude,
  longitude,
}: GlobeProps) {
  return (
    <div className="relative flex flex-col items-center justify-center">
      {/* Glow behind globe */}
      <div className="absolute w-[420px] h-[420px] rounded-full bg-blue-500/20 blur-3xl" />

      {/* Globe */}
      <div className="relative w-full max-w-[520px] h-[420px] md:h-[500px]">
        <Canvas
          camera={{
            position: [0, 0, 5.5],
            fov: 45,
            near: 0.1,
            far: 100,
          }}
          dpr={[1, 2]}
        >
          <GlobeScene
            latitude={latitude}
            longitude={longitude}
          />
        </Canvas>
      </div>

      {/* Active location */}
      <div className="mt-3 px-5 py-2 rounded-full bg-slate-900/80 backdrop-blur-xl border border-slate-700 text-white">
        📍 {locationName}
      </div>

      {/* Coordinates */}
      {(latitude !== 0 || longitude !== 0) && (
        <div className="mt-2 text-xs text-slate-400">
          {latitude.toFixed(4)}°, {longitude.toFixed(4)}°
        </div>
      )}
    </div>
  );
}
