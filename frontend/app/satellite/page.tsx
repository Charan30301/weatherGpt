"use client";

import { useState } from "react";

export default function SatellitePage() {
  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  const [imageUrl, setImageUrl] = useState("");
  const [error, setError] = useState("");

  const getSatelliteData = () => {
    setLoading(true);
    setError("");
    setImageUrl("");

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

        try {
          const url =
            `http://127.0.0.1:8000/satellite/image` +
            `?latitude=${latitude}` +
            `&longitude=${longitude}`;

          setImageUrl(url);
        } catch (err: any) {
          setError(
            err.message ||
              "Could not connect to the satellite service."
          );
        } finally {
          setLoading(false);
        }
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

        {/* LOCATION BUTTON */}

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
              />

            </div>

            <div className="p-5">

              <p className="text-slate-400 text-sm">
                This image shows the Earth surface around
                your selected location using Sentinel-2
                satellite data.
              </p>

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
