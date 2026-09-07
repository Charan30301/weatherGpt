"use client";

import { Canvas, useLoader, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { useEffect, useMemo, useRef } from "react";

interface GlobeProps {
  locationName: string;
  latitude: number;
  longitude: number;
}


/* =====================================================
   CONVERT REAL LATITUDE/LONGITUDE TO 3D EARTH POSITION
===================================================== */
function latLonToVector3(
  latitude: number,
  longitude: number,
  radius: number
): [number, number, number] {

  const lat = THREE.MathUtils.degToRad(latitude);

  // Rotate longitude so India faces the camera
  const lon = THREE.MathUtils.degToRad(longitude - 90);

  const x =
    radius * Math.cos(lat) * Math.sin(lon);

  const y =
    radius * Math.sin(lat);

  const z =
    radius * Math.cos(lat) * Math.cos(lon);

  return [x, y, z];
}


/* =====================================================
  LOCATION MARKER
===================================================== */
function LocationMarker({
  latitude,
  longitude,
}: {
  latitude: number;
  longitude: number;
}) {

  const position = useMemo(
    () =>
      latLonToVector3(
        latitude,
        longitude,
        2.28
      ),
    [latitude, longitude]
  );

  return (
    <group position={position}>

      {/* Red glow */}
      <mesh>
        <sphereGeometry args={[0.18, 32, 32]} />

        <meshBasicMaterial
          color="#ef4444"
          transparent
          opacity={0.25}
          depthWrite={false}
        />
      </mesh>

      {/* Red location point */}
      <mesh>
        <sphereGeometry args={[0.085, 32, 32]} />

        <meshBasicMaterial
          color="#ff3b30"
        />
      </mesh>

    </group>
  );
}


/* =====================================================
   EARTH
===================================================== */
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

  const earthRef = useRef<THREE.Group>(null);

  useMemo(() => {
    earthTexture.colorSpace = THREE.SRGBColorSpace;
    earthTexture.anisotropy = 8;
    earthTexture.needsUpdate = true;
  }, [earthTexture]);

  useEffect(() => {
    if (!earthRef.current) return;

    /*
     * Default starting location = India.
     * After search/GPS, use the real coordinates.
     */
    const hasLocation =
      latitude !== 0 || longitude !== 0;

    const lat = hasLocation ? latitude : 20.5937;
    const lon = hasLocation ? longitude : 78.9629;

    /*
     * Rotate longitude so the selected location
     * faces the camera.
     *
     * Three.js camera looks toward +Z.
     */
    earthRef.current.rotation.set(
      0,
      THREE.MathUtils.degToRad(-lon),
      0
    );
  }, [latitude, longitude]);

  return (
    <group ref={earthRef}>

      {/* EARTH */}
      <mesh>
        <sphereGeometry
          args={[2.2, 128, 128]}
        />

        <meshStandardMaterial
          map={earthTexture}
          roughness={0.85}
          metalness={0}
        />
      </mesh>

      {/* ATMOSPHERE */}
      <mesh
        scale={[1.025, 1.025, 1.025]}
      >
        <sphereGeometry
          args={[2.2, 128, 128]}
        />

        <meshBasicMaterial
          color="#38bdf8"
          transparent
          opacity={0.12}
          side={THREE.BackSide}
        />
      </mesh>

      {/* ACTIVE LOCATION ONLY */}
      {(latitude !== 0 || longitude !== 0) && (
        <LocationMarker
          latitude={latitude}
          longitude={longitude}
        />
      )}

    </group>
  );
}





/* =====================================================
   CAMERA
===================================================== */

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


    /*
      IMPORTANT:

      Camera uses EXACT SAME conversion
      as the location marker.

      This guarantees that the marker is
      directly facing the camera.
    */

    const [x, y, z] =
      latLonToVector3(
        latitude,
        longitude,
        5.5
      );


    camera.position.set(
      x,
      y,
      z
    );


    controlsRef.current.target.set(
      0,
      0,
      0
    );


    controlsRef.current.update();


  }, [
    camera,
    latitude,
    longitude
  ]);


  return (

    <OrbitControls
      ref={controlsRef}
      enablePan={false}
      enableRotate={true}
      enableZoom={true}
      minDistance={2.7}
      maxDistance={9}
      zoomSpeed={1}
      rotateSpeed={0.6}
    />

  );
}


/* =====================================================
   SCENE
===================================================== */

function GlobeScene({
  latitude,
  longitude,
}: {
  latitude: number;
  longitude: number;
}) {

  return (

    <>

      {/* General lighting */}
      <ambientLight intensity={1.2} />


      {/* Sunlight */}
      <directionalLight
        position={[5, 5, 5]}
        intensity={2}
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


/* =====================================================
   MAIN GLOBE COMPONENT
===================================================== */

export default function Globe({
  locationName,
  latitude,
  longitude,
}: GlobeProps) {

  return (

    <div className="relative flex flex-col items-center justify-center">

      {/* Background glow */}
      <div
        className="
          absolute
          w-[420px]
          h-[420px]
          rounded-full
          bg-blue-500/10
          blur-3xl
        "
      />


      {/* GLOBE */}
      <div
        className="
          relative
          w-full
          max-w-[520px]
          h-[420px]
          md:h-[500px]
        "
      >

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


      {/* LOCATION NAME */}
      <div
        className="
          mt-3
          px-5
          py-2
          rounded-full
          bg-slate-900/90
          border
          border-slate-700
          text-white
        "
      >
        📍 {locationName}
      </div>


      {/* COORDINATES */}
      {(
        latitude !== 0 ||
        longitude !== 0
      ) && (

        <div className="mt-2 text-xs text-slate-400">

          {latitude.toFixed(4)}°,
          {" "}
          {longitude.toFixed(4)}°

        </div>

      )}

    </div>

  );
}
