"use client";

import { useState } from "react";
import dynamic from "next/dynamic";

const RouteMap = dynamic(
  () => import("../../components/RouteMap"),
  {
    ssr: false,
  }
);
type Location = {
  latitude: number;
  longitude: number;
};

type SafePlace = {
  name: string;
  type: string;
  latitude: number;
  longitude: number;
  distance_km: number;
};

export default function SatellitePage() {
  const [loading, setLoading] = useState(false);
  const [safePlaceLoading, setSafePlaceLoading] = useState(false);
const [showRoute, setShowRoute] = useState(false);
  const [location, setLocation] = useState<Location | null>(null);
  const [imageUrl, setImageUrl] = useState("");
  const [error, setError] = useState("");

  const [emergencyType, setEmergencyType] = useState("flood");
  const [safePlace, setSafePlace] = useState<SafePlace | null>(null);
  const [otherPlaces, setOtherPlaces] = useState<SafePlace[]>([]);

  const getSatelliteData = () => {
    setLoading(true);
    setError("");
    setImageUrl("");
    setSafePlace(null);
    setOtherPlaces([]);

    if (!navigator.geolocation) {
      setError("Geolocation is not supported by this browser.");
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;

        setLocation({
          latitude,
          longitude,
        });

const response = await fetch(
  `http://127.0.0.1:8000/satellite/search` +
    `?latitude=${latitude}` +
    `&longitude=${longitude}` +
    `&start_date=2026-08-01` +
    `&end_date=2026-09-01` +
    `&collection=sentinel-2-l2a`
);

if (!response.ok) {
  throw new Error(
    `Satellite service returned ${response.status}`
  );
}

const data = await response.json();

if (data.error) {
  throw new Error(data.error);
}

const bestScene = data.scenes?.[0];

if (!bestScene) {
  throw new Error(
    "No Sentinel-2 satellite imagery found."
  );
}

setImageUrl(
  bestScene.thumbnail_url || ""
);

console.log(
  "BEST SATELLITE SCENE:",
  bestScene
);

setLoading(false);
      },
      (error) => {
        setError(
          error.message ||
            "Unable to get your current location."
        );

        setLoading(false);
      }
    );
  };

  const findSafePlace = () => {
    if (!location) {
      setError("Please check your location first.");
      return;
    }

    setSafePlaceLoading(true);
    setError("");

    const url =
      `http://127.0.0.1:8000/emergency/safe-place` +
      `?latitude=${location.latitude}` +
      `&longitude=${location.longitude}` +
      `&emergency_type=${emergencyType}`;

    fetch(url)
      .then(async (response) => {
        if (!response.ok) {
          throw new Error("Safe-place service failed.");
        }

        return response.json();
      })
      .then((data) => {
        if (data.status !== "ok") {
          throw new Error(
            data.message || "Unable to find a safe place."
          );
        }

        setSafePlace(data.recommended_safe_place);
        setOtherPlaces(data.other_safe_places || []);
      })
      .catch((err) => {
        setError(
          err.message ||
            "Could not find a nearby safe place."
        );
      })
      .finally(() => {
        setSafePlaceLoading(false);
      });
  };

  return (
    <main className="min-h-screen bg-slate-950 text-white px-4 py-8">

      <div className="max-w-5xl mx-auto">

        {/* HEADER */}

        <div className="mb-8">

          <div className="flex items-center gap-3">

            <div className="text-4xl">
              🛰️
            </div>

            <div>
              <h1 className="text-3xl md:text-4xl font-bold">
                Satellite Monitor
              </h1>

              <p className="text-slate-400 mt-1">
                Sentinel-2 Earth observation
              </p>
            </div>

          </div>

        </div>

        {/* SATELLITE OBSERVATION */}

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 mb-6">

          <h2 className="text-xl font-semibold mb-2">
            📍 Satellite Observation
          </h2>

          <p className="text-slate-400 mb-5">
            Get a Sentinel-2 satellite image of your
            current location.
          </p>

          <button
            onClick={getSatelliteData}
            disabled={loading}
            className="
              w-full sm:w-auto
              px-6 py-3
              rounded-xl
              bg-blue-600
              hover:bg-blue-700
              disabled:bg-slate-700
              transition
              font-semibold
            "
          >
            {loading
              ? "🛰️ Getting satellite image..."
              : "📍 Check My Location"}
          </button>

        </div>

        {/* EMERGENCY SECTION */}

         {location && (
  <>
    {/* TEST EMERGENCY ALERT */}

    <div className="
      bg-orange-950
      border border-orange-700
      rounded-2xl
      p-6
      mb-6
    ">

      <div className="flex items-center gap-3 mb-4">

        <div className="text-3xl">
          🧪
        </div>

        <div>
          <h2 className="text-xl font-bold">
            Test Emergency Alert
          </h2>

          <p className="text-orange-300 text-sm">
            For demonstration and testing only
          </p>
        </div>

      </div>

      <button
        onClick={() => {
          setEmergencyType("flood");
          findSafePlace();
        }}
        disabled={safePlaceLoading}
        className="
          w-full
          px-6 py-3
          rounded-xl
          bg-orange-600
          hover:bg-orange-700
          disabled:bg-slate-700
          transition
          font-semibold
        "
      >
        {safePlaceLoading
          ? "🚨 Simulating emergency..."
          : "🧪 Simulate Flood Alert"}
      </button>

    </div>

    <div className="
            bg-red-950
            border border-red-800
            rounded-2xl
            p-6
            mb-6
          ">

            <div className="flex items-center gap-3 mb-3">

              <div className="text-3xl">
                🚨
              </div>

              <div>
                <h2 className="text-2xl font-bold">
                  Emergency Safe Place
                </h2>

                <p className="text-red-300">
                  Find the nearest available safe location
                </p>
              </div>

            </div>

            <label className="block text-sm text-red-200 mb-2">
              Emergency Type
            </label>

            <select
              value={emergencyType}
              onChange={(e) =>
                setEmergencyType(e.target.value)
              }
              className="
                w-full
                bg-slate-900
                border border-red-800
                rounded-xl
                px-4 py-3
                mb-4
                text-white
              "
            >
              <option value="flood">
                🌊 Flood
              </option>

              <option value="cyclone">
                🌀 Cyclone
              </option>

              <option value="landslide">
                ⛰️ Landslide
              </option>

              <option value="storm">
                ⛈️ Severe Storm
              </option>

              <option value="general">
                ⚠️ General Emergency
              </option>
            </select>

            <button
              onClick={findSafePlace}
              disabled={safePlaceLoading}
              className="
                w-full
                px-6 py-3
                rounded-xl
                bg-red-600
                hover:bg-red-700
                disabled:bg-slate-700
                transition
                font-semibold
              "
            >
              {safePlaceLoading
                ? "🛡️ Finding safe place..."
                : "🛡️ Find Nearest Safe Place"}
            </button>

          </div>
</>
        )}

        {/* ERROR */}

        {error && (
          <div className="
            mb-6
            p-5
            rounded-2xl
            bg-red-950
            border border-red-800
            text-red-300
          ">
            <strong>⚠️ Error:</strong> {error}
          </div>
        )}

        {/* SATELLITE IMAGE */}

        {imageUrl && (
          <div className="
            bg-slate-900
            border border-slate-800
            rounded-2xl
            overflow-hidden
            mb-6
          ">

            <div className="p-5">

              <div className="flex items-center justify-between">

                <div>

                  <h2 className="text-2xl font-semibold">
                    🛰️ Satellite View
                  </h2>

                  <p className="text-slate-400 mt-1">
                    Sentinel-2 True Color
                  </p>

                </div>

                <div className="
                  px-3 py-1
                  rounded-full
                  bg-green-950
                  border border-green-800
                  text-green-400
                  text-sm
                ">
                  ● Connected
                </div>

              </div>

            </div>

            <div className="bg-black flex justify-center">

              <img
                src={imageUrl}
                alt="Sentinel-2 satellite view"
                className="
                  w-full
                  max-w-[512px]
                  h-auto
                  object-contain
                "
                onError={() =>
                  setError(
                    "Unable to load the satellite image."
                  )
                }
              />

            </div>

            <div className="p-5">

              <p className="text-slate-400 text-sm">
                Sentinel-2 satellite imagery around
                your current location.
              </p>

            </div>

          </div>
        )}

        {/* RECOMMENDED SAFE PLACE */}

        {safePlace && (
          <div className="
            bg-slate-900
            border border-green-800
            rounded-2xl
            p-6
            mb-6
          ">

            <div className="flex items-center gap-3 mb-5">

              <div className="text-3xl">
                🛡️
              </div>

              <div>
                <h2 className="text-2xl font-bold">
                  Recommended Safe Place
                </h2>

                <p className="text-green-400">
                  Nearest available location
                </p>
              </div>

            </div>

            <div className="bg-slate-800 rounded-xl p-5">

              <h3 className="text-xl font-semibold">
                📍 {safePlace.name}
              </h3>

              <p className="text-slate-400 mt-1">
                {safePlace.type}
              </p>

              <div className="
                grid
                grid-cols-1
                sm:grid-cols-2
                gap-4
                mt-5
              ">

                <div>
                  <p className="text-slate-400 text-sm">
                    Distance
                  </p>

                  <p className="text-lg font-semibold mt-1">
                    {safePlace.distance_km} km
                  </p>
                </div>

                <div>
                  <p className="text-slate-400 text-sm">
                    Location
                  </p>

                  <p className="text-lg font-semibold mt-1">
                    {safePlace.latitude.toFixed(5)},
                    {" "}
                    {safePlace.longitude.toFixed(5)}
                  </p>
                </div>

              </div>

<button
  onClick={() => setShowRoute(true)}
  className="
    w-full
    mt-5
    px-6 py-3
    rounded-xl
    bg-green-600
    hover:bg-green-700
    transition
    font-semibold
  "
>
  🗺️ View Route
</button>
{showRoute && location && safePlace && (
  <RouteMap
    currentLocation={location}
    destination={{
      latitude: safePlace.latitude,
      longitude: safePlace.longitude,
    }}
  />
)}

            </div>

          </div>
        )}

        {/* OTHER SAFE PLACES */}

        {otherPlaces.length > 0 && (
          <div className="
            bg-slate-900
            border border-slate-800
            rounded-2xl
            p-6
            mb-6
          ">

            <h2 className="text-xl font-semibold mb-5">
              🏥 Other Nearby Places
            </h2>

            <div className="space-y-3">

              {otherPlaces.map((place) => (
                <div
                  key={place.name}
                  className="
                    bg-slate-800
                    rounded-xl
                    p-4
                    flex
                    items-center
                    justify-between
                    gap-4
                  "
                >

                  <div>
                    <p className="font-semibold">
                      📍 {place.name}
                    </p>

                    <p className="text-sm text-slate-400">
                      {place.type}
                    </p>
                  </div>

                  <div className="text-right">

                    <p className="font-semibold">
                      {place.distance_km} km
                    </p>

<button
  onClick={() => {
    setSafePlace(place);
    setShowRoute(true);
  }}
  className="text-blue-400 text-sm font-semibold"
>
  Route →
</button>

                  </div>

                </div>
              ))}

            </div>

          </div>
        )}

        {/* LOCATION INFORMATION */}

        {location && (
          <div className="
            bg-slate-900
            border border-slate-800
            rounded-2xl
            p-6
            mb-6
          ">

            <h2 className="text-xl font-semibold mb-5">
              📍 Your Location
            </h2>

            <div className="
              grid
              grid-cols-1
              sm:grid-cols-2
              gap-4
            ">

              <div className="bg-slate-800 rounded-xl p-5">

                <p className="text-slate-400">
                  Latitude
                </p>

                <p className="text-xl font-semibold mt-2">
                  {location.latitude.toFixed(6)}
                </p>

              </div>

              <div className="bg-slate-800 rounded-xl p-5">

                <p className="text-slate-400">
                  Longitude
                </p>

                <p className="text-xl font-semibold mt-2">
                  {location.longitude.toFixed(6)}
                </p>

              </div>

            </div>

          </div>
        )}

        {/* SOURCE */}

        {imageUrl && (
          <div className="
            bg-slate-900
            border border-slate-800
            rounded-2xl
            p-6
          ">

            <h2 className="text-xl font-semibold mb-4">
              🛰️ Data Information
            </h2>

            <div className="space-y-3 text-slate-300">

              <div className="flex justify-between">
                <span className="text-slate-400">
                  Satellite
                </span>

                <span>
                  Sentinel-2
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-400">
                  Provider
                </span>

                <span>
                  Copernicus
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-400">
                  Image
                </span>

                <span>
                  True Color
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-400">
                  Resolution
                </span>

                <span>
                  512 × 512
                </span>
              </div>

            </div>

          </div>
        )}

      </div>

    </main>
  );
}
