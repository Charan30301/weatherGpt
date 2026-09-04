"use client";

import { Canvas, useLoader, useThree } from "@react-three/fiber";
import { OrbitControls, Stars } from "@react-three/drei";
import * as THREE from "three";
import {
  useEffect,
  useMemo,
  useRef,
} from "react";
interface GlobeLocation {
  latitude: number;
  longitude: number;
}

interface GlobeProps {
  locationName: string;
  currentLocation?: GlobeLocation | null;
  searchedLocation?: GlobeLocation | null;
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
  location,
  color,
}: {
  location: GlobeLocation;
  color: string;
}) {
  const position = useMemo(
    () => latLonToVector3(location.latitude, location.longitude, 2.28),
    [location.latitude, location.longitude]
  );

  return (
    <group position={position}>
      {/* Main location dot */}
      <mesh>
        <sphereGeometry args={[0.075, 24, 24]} />
        <meshBasicMaterial color={color} />
      </mesh>

      {/* Outer glow */}
      <mesh>
        <sphereGeometry args={[0.15, 24, 24]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.25}
        />
      </mesh>
    </group>
  );
}

function LocationLine({
  start,
  end,
}: {
  start: GlobeLocation;
  end: GlobeLocation;
}) {
  const geometry = useMemo(() => {
    const startPoint = new THREE.Vector3(
      ...latLonToVector3(
        start.latitude,
        start.longitude,
        2.29
      )
    );

    const endPoint = new THREE.Vector3(
      ...latLonToVector3(
        end.latitude,
        end.longitude,
        2.29
      )
    );

    const middle = startPoint
      .clone()
      .add(endPoint)
      .normalize()
      .multiplyScalar(2.45);

    const curve = new THREE.QuadraticBezierCurve3(
      startPoint,
      middle,
      endPoint
    );

    return new THREE.BufferGeometry().setFromPoints(
      curve.getPoints(40)
    );
  }, [
    start.latitude,
    start.longitude,
    end.latitude,
    end.longitude,
  ]);

  return (
    <primitive
      object={
        new THREE.Line(
          geometry,
          new THREE.LineBasicMaterial({
            color: "#f59e0b",
            transparent: true,
            opacity: 0.9,
          })
        )
      }
    />
  );
}
function Earth({
  currentLocation,
  searchedLocation,
}: {
  currentLocation?: GlobeLocation | null;
  searchedLocation?: GlobeLocation | null;
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

      {/* Current GPS location */}
      {currentLocation && (
        <LocationMarker
          location={currentLocation}
          color="#3b82f6"
        />
      )}

      {/* Searched location */}
      {searchedLocation && (
        <LocationMarker
          location={searchedLocation}
          color="#ef4444"
        />
      )}

      {/* Route between locations */}
      {currentLocation && searchedLocation && (
        <LocationLine
          start={currentLocation}
          end={searchedLocation}
        />
      )}
    </group>
  );
}

function GlobeCamera({
  currentLocation,
  searchedLocation,
}: {
  currentLocation?: GlobeLocation | null;
  searchedLocation?: GlobeLocation | null;
}) {
  const { camera } = useThree();
  const controlsRef = useRef<any>(null);

  useEffect(() => {
    if (!controlsRef.current) return;

    /*
     * Keep the globe at a comfortable initial zoom.
     * If both locations exist, show the whole globe so
     * both markers are visible.
     */
    if (currentLocation && searchedLocation) {
      camera.position.set(0, 0, 5.8);
      controlsRef.current.target.set(0, 0, 0);
      controlsRef.current.update();
      return;
    }

    camera.position.set(0, 0, 5.5);
    controlsRef.current.target.set(0, 0, 0);
    controlsRef.current.update();
  }, [
    camera,
    currentLocation,
    searchedLocation,
  ]);

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
      target={[0, 0, 0]}
    />
  );
}

function GlobeScene({
  currentLocation,
  searchedLocation,
}: {
  currentLocation?: GlobeLocation | null;
  searchedLocation?: GlobeLocation | null;
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
        currentLocation={currentLocation}
        searchedLocation={searchedLocation}
      />

      <GlobeCamera
        currentLocation={currentLocation}
        searchedLocation={searchedLocation}
      />
    </>
  );
}

export default function Globe({
  locationName,
  currentLocation,
  searchedLocation,
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
            currentLocation={currentLocation}
            searchedLocation={searchedLocation}
          />
        </Canvas>
      </div>

      {/* Location name */}
      <div className="mt-3 px-5 py-2 rounded-full bg-slate-900/80 backdrop-blur-xl border border-slate-700 text-white">
        📍 {locationName}
      </div>

      {/* Location legend */}
      <div className="mt-3 flex items-center gap-5 text-sm text-slate-300">
        {currentLocation && (
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-blue-500" />
            <span>Current location</span>
          </div>
        )}

        {searchedLocation && (
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-red-500" />
            <span>Searched location</span>
          </div>
        )}
      </div>
    </div>
  );
}
