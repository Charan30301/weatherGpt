"use client";

import { useEffect, useState } from "react";

interface GlobeProps {
  locationName: string;
}

export default function Globe({
  locationName,
}: GlobeProps) {

  const [rotating, setRotating] = useState(false);


  useEffect(() => {

    if (locationName && locationName !== "Your Location") {

      setRotating(true);

      const timer = setTimeout(() => {
        setRotating(false);
      }, 2500);

      return () => clearTimeout(timer);

    }

  }, [locationName]);


  return (

    <div className="relative flex flex-col items-center justify-center">

      {/* Outer glow */}

      <div className="
        absolute
        w-80 h-80
        rounded-full
        bg-blue-500/20
        blur-3xl
      " />


      {/* Orbit */}

      <div className="
        absolute
        w-72 h-72
        border border-blue-400/20
        rounded-full
      " />


      {/* Globe */}

      <div
        className={`
          globe
          relative
          w-64 h-64
          md:w-80 md:h-80
          rounded-full
          overflow-hidden
          shadow-2xl
          ${rotating ? "globe-searching" : "globe-idle"}
        `}
      >

        {/* Globe texture effect */}

        <div className="absolute inset-0 globe-ocean" />

        <div className="absolute inset-0 globe-land land-one" />
        <div className="absolute inset-0 globe-land land-two" />
        <div className="absolute inset-0 globe-land land-three" />

        {/* Atmosphere */}

        <div className="
          absolute inset-0
          rounded-full
          border border-blue-300/40
          shadow-[inset_-20px_-20px_50px_rgba(0,0,0,0.8)]
        " />

        {/* Location marker */}

        {locationName && (

          <div className="
            absolute
            top-[45%]
            left-[52%]
            -translate-x-1/2
            -translate-y-1/2
          ">

            <div className="location-pulse" />

            <div className="
              absolute
              top-1/2 left-1/2
              -translate-x-1/2
              -translate-y-1/2
              w-3 h-3
              bg-red-500
              rounded-full
              shadow-lg
            " />

          </div>

        )}

      </div>


      {/* Location Label */}

      <div className="
        mt-6
        px-5 py-2
        rounded-full
        bg-slate-900/80
        backdrop-blur-xl
        border border-slate-700
      ">

        📍 {locationName}

      </div>

    </div>

  );
}
