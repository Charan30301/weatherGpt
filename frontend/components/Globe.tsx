"use client";

import {
  Canvas,
  useLoader,
  useThree,
} from "@react-three/fiber";

import {
  OrbitControls,
} from "@react-three/drei";

import * as THREE from "three";

import {
  useEffect,
  useMemo,
  useRef,
} from "react";


interface GlobeProps {
  locationName: string;
  latitude: number;
  longitude: number;

  onLocationSelect?: (
    latitude: number,
    longitude: number
  ) => void;
}


/* =====================================================
   EARTH SETTINGS
===================================================== */

const EARTH_RADIUS = 2.2;


/* =====================================================
   LATITUDE / LONGITUDE → 3D POSITION
===================================================== */
 function latLonToVector3(
  latitude: number,
  longitude: number,
  radius: number
): THREE.Vector3 {

  const lat =
    THREE.MathUtils.degToRad(latitude);

  const lon =
    THREE.MathUtils.degToRad(longitude);

  /*
   * Earth texture correction.
   *
   * Three.js sphere texture longitude orientation
   * needs the longitude reversed for this texture.
   */

  const x =
    radius *
    Math.cos(lat) *
    Math.sin(-lon);

  const y =
    radius *
    Math.sin(lat);

  const z =
    radius *
    Math.cos(lat) *
    Math.cos(lon);

  return new THREE.Vector3(
    x,
    y,
    z
  );
}


/* =====================================================
   3D POSITION → LATITUDE / LONGITUDE
===================================================== */

function vector3ToLatLon(
  point: THREE.Vector3
) {

  const radius =
    point.length();


  const latitude =
    THREE.MathUtils.radToDeg(
      Math.asin(point.y / radius)
    );


  const longitude =
    THREE.MathUtils.radToDeg(
      Math.atan2(
        point.x,
        point.z
      )
    );


  return {
    latitude,
    longitude,
  };
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

  const position =
    useMemo(
      () =>
        latLonToVector3(
          latitude,
          longitude,
          EARTH_RADIUS + 0.07
        ),
      [
        latitude,
        longitude,
      ]
    );


  return (

    <group position={position}>

      {/* Outer glow */}

      <mesh>

        <sphereGeometry
          args={[
            0.16,
            32,
            32,
          ]}
        />

        <meshBasicMaterial
          color="#ef4444"
          transparent
          opacity={0.25}
          depthWrite={false}
        />

      </mesh>


      {/* Main marker */}

      <mesh>

        <sphereGeometry
          args={[
            0.075,
            32,
            32,
          ]}
        />

        <meshBasicMaterial
          color="#ff3030"
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
  onLocationSelect,
}: {
  latitude: number;
  longitude: number;

  onLocationSelect?: (
    latitude: number,
    longitude: number
  ) => void;
}) {

  const texture =
    useLoader(
      THREE.TextureLoader,
      "/textures/earth.png"
    );


  const earthRef =
    useRef<THREE.Mesh>(null);


  const raycaster =
    useMemo(
      () => new THREE.Raycaster(),
      []
    );


  const mouse =
    useMemo(
      () => new THREE.Vector2(),
      []
    );


  useEffect(() => {

    texture.colorSpace =
      THREE.SRGBColorSpace;

    texture.anisotropy = 8;

    texture.needsUpdate = true;

  }, [texture]);


  /*
   * CLICK EARTH
   */

  const handlePointerDown = (
    event: any
  ) => {

    /*
     * Only react to clicks on the Earth.
     */

    event.stopPropagation();


    const mesh =
      earthRef.current;

    if (!mesh) return;


    /*
     * Get mouse position
     * in normalized device coordinates.
     */

    mouse.x =
      (event.clientX /
        event.target.clientWidth) *
        2 -
      1;

    mouse.y =
      -(event.clientY /
        event.target.clientHeight) *
        2 +
      1;


    /*
     * Raycast from camera.
     */

    const camera =
      event.camera;


    raycaster.setFromCamera(
      mouse,
      camera
    );


    const intersections =
      raycaster.intersectObject(
        mesh
      );


    if (
      intersections.length === 0
    ) {
      return;
    }


    const point =
      intersections[0].point;


    /*
     * Convert world position
     * into latitude / longitude.
     */

    const localPoint =
      mesh.worldToLocal(
        point.clone()
      );


    const {
      latitude,
      longitude,
    } =
      vector3ToLatLon(
        localPoint
      );


    console.log(
      "GLOBE CLICK:",
      latitude,
      longitude
    );


    if (
      onLocationSelect
    ) {

      onLocationSelect(
        latitude,
        longitude
      );

    }

  };


  return (

    <group>

      {/* EARTH */}

      <mesh
        ref={earthRef}
        onPointerDown={
          handlePointerDown
        }
      >

        <sphereGeometry
          args={[
            EARTH_RADIUS,
            128,
            128,
          ]}
        />

        <meshStandardMaterial
          map={texture}
          roughness={0.85}
          metalness={0}
        />

      </mesh>


      {/* ATMOSPHERE */}

      <mesh
        scale={[
          1.025,
          1.025,
          1.025,
        ]}
      >

        <sphereGeometry
          args={[
            EARTH_RADIUS,
            128,
            128,
          ]}
        />

        <meshBasicMaterial
          color="#38bdf8"
          transparent
          opacity={0.12}
          side={THREE.BackSide}
        />

      </mesh>


      {/* SELECTED LOCATION */}

      {(
        latitude !== 0 ||
        longitude !== 0
      ) && (

        <LocationMarker
          latitude={
            latitude
          }
          longitude={
            longitude
          }
        />

      )}

    </group>

  );
}


/* =====================================================
   CAMERA + CONTROLS
===================================================== */

function GlobeCamera({
  latitude,
  longitude,
}: {
  latitude: number;
  longitude: number;
}) {

  const {
    camera,
  } =
    useThree();


  const controlsRef =
    useRef<any>(null);


  /*
   * Move camera when location changes.
   */

  useEffect(() => {

    if (
      !controlsRef.current
    ) {
      return;
    }


    /*
     * Don't move camera
     * when coordinates are not ready.
     */

    if (
      latitude === 0 &&
      longitude === 0
    ) {
      return;
    }


    const target =
      latLonToVector3(
        latitude,
        longitude,
        5.5
      );


    /*
     * Smooth camera movement.
     */

    const start =
      camera.position.clone();


    const end =
      target.clone();


    const startTime =
      performance.now();


    const duration =
      900;


    let animationFrame:
      number;


    const animate = (
      currentTime: number
    ) => {

      const elapsed =
        currentTime -
        startTime;


      const progress =
        Math.min(
          elapsed / duration,
          1
        );


      /*
       * Smooth easing.
       */

      const eased =
        1 -
        Math.pow(
          1 - progress,
          3
        );


      camera.position.lerpVectors(
        start,
        end,
        eased
      );


      camera.lookAt(
        0,
        0,
        0
      );


      controlsRef.current?.update();


      if (
        progress < 1
      ) {

        animationFrame =
          requestAnimationFrame(
            animate
          );

      }

    };


    animationFrame =
      requestAnimationFrame(
        animate
      );


    return () => {

      cancelAnimationFrame(
        animationFrame
      );

    };

  }, [
    latitude,
    longitude,
    camera,
  ]);


  return (

    <OrbitControls
      ref={controlsRef}

      enablePan={false}

      enableRotate={true}

      enableZoom={true}

      minDistance={2.7}

      maxDistance={9}

      rotateSpeed={0.65}

      zoomSpeed={1}

      enableDamping={true}

      dampingFactor={0.08}

    />

  );
}


/* =====================================================
   SCENE
===================================================== */

function GlobeScene({
  latitude,
  longitude,
  onLocationSelect,
}: {
  latitude: number;
  longitude: number;

  onLocationSelect?: (
    latitude: number,
    longitude: number
  ) => void;
}) {

  return (

    <>

      <ambientLight
        intensity={1.2}
      />


      <directionalLight
        position={[
          5,
          5,
          5,
        ]}
        intensity={2}
      />


      <Earth
        latitude={
          latitude
        }
        longitude={
          longitude
        }
        onLocationSelect={
          onLocationSelect
        }
      />


      <GlobeCamera
        latitude={
          latitude
        }
        longitude={
          longitude
        }
      />

    </>

  );
}


/* =====================================================
   MAIN GLOBE
===================================================== */

export default function Globe({
  locationName,
  latitude,
  longitude,
  onLocationSelect,
}: GlobeProps) {

  return (

    <div
      className="
        relative
        flex
        flex-col
        items-center
        justify-center
      "
    >

      {/* Glow */}

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


      {/* Globe */}

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
            position: [
              0,
              0,
              5.5,
            ],

            fov: 45,

            near: 0.1,

            far: 100,
          }}

          dpr={[
            1,
            2,
          ]}
        >

          <GlobeScene
            latitude={
              latitude
            }
            longitude={
              longitude
            }

            onLocationSelect={
              onLocationSelect
            }
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

        <div
          className="
            mt-2
            text-xs
            text-slate-400
          "
        >

          {latitude.toFixed(4)}
          {"°, "}

          {longitude.toFixed(4)}
          {"°"}

        </div>

      )}

    </div>

  );
}