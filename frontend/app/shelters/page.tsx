"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const RouteMap = dynamic(
  () => import("../../components/RouteMap"),
  {
    ssr: false,
    loading: () => (
      <div className="h-[500px] rounded-3xl bg-slate-900 border border-slate-700 flex items-center justify-center text-slate-400">
        Loading emergency map...
      </div>
    ),
  }
);

interface Shelter {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  type: string;
  distance?: number;
}

export default function SheltersPage() {
  const [location, setLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  const [shelters, setShelters] =
    useState<Shelter[]>([]);

  const [selected, setSelected] =
    useState<Shelter | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    const savedCoordinates =
      localStorage.getItem(
        "weathergpt-coordinates"
      );

    if (savedCoordinates) {
      try {
        const parsed = JSON.parse(
          savedCoordinates
        );

        if (
          typeof parsed.latitude === "number" &&
          typeof parsed.longitude === "number" &&
          parsed.latitude !== 0 &&
          parsed.longitude !== 0
        ) {
          setLocation({
            latitude: parsed.latitude,
            longitude: parsed.longitude,
          });

          findShelters(
            parsed.latitude,
            parsed.longitude
          );

          return;
        }
      } catch {
        console.log(
          "Could not read saved coordinates."
        );
      }
    }

    if (!navigator.geolocation) {
      setError(
        "Geolocation is not supported by this browser."
      );
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const latitude =
          position.coords.latitude;

        const longitude =
          position.coords.longitude;

        const currentLocation = {
          latitude,
          longitude,
        };

        setLocation(currentLocation);

        localStorage.setItem(
          "weathergpt-coordinates",
          JSON.stringify(currentLocation)
        );

        await findShelters(
          latitude,
          longitude
        );
      },
      (error) => {
        console.error(
          "GPS error:",
          error
        );

        setError(
          "Unable to get your location. Please enable GPS/location permission and try again."
        );

        setLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 30000,
      }
    );
  }, []);





  const calculateDistance = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ) => {
    const earthRadius = 6371;

    const dLat =
      ((lat2 - lat1) * Math.PI) / 180;

    const dLon =
      ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(
        (lat1 * Math.PI) / 180
      ) *
        Math.cos(
          (lat2 * Math.PI) / 180
        ) *
        Math.sin(dLon / 2) ** 2;

    return (
      earthRadius *
      2 *
      Math.atan2(
        Math.sqrt(a),
        Math.sqrt(1 - a)
      )
    );
  };

  const findShelters = async (
    latitude: number,
    longitude: number
  ) => {
    try {
      setError("");

      const radius = 10000;

      const response = await fetch(
  `http://127.0.0.1:8000/shelters?latitude=${latitude}&longitude=${longitude}&radius=${radius}`
);

if (!response.ok) {
  throw new Error(
    "Shelter service unavailable"
  );
}



      const result =
        await response.json();

      const found: Shelter[] =
        result.elements
          .map((item: any) => {
            const lat =
              item.lat ??
              item.center?.lat;

            const lon =
              item.lon ??
              item.center?.lon;

            if (
              lat === undefined ||
              lon === undefined
            ) {
              return null;
            }

            return {
              id: `${item.type}-${item.id}`,
              name:
                item.tags?.name ||
                item.tags?.["name:en"] ||
                "Emergency Shelter",
              latitude: lat,
              longitude: lon,
              type:
                item.tags?.amenity ||
                item.tags?.emergency ||
                "emergency",
              distance:
                calculateDistance(
                  latitude,
                  longitude,
                  lat,
                  lon
                ),
            };
          })
          .filter(Boolean)
          .sort(
            (a: Shelter, b: Shelter) =>
              (a.distance || 0) -
              (b.distance || 0)
          );

      setShelters(found);
    } catch (err) {
      console.error(
        "Shelter search error:",
        err
      );

      setError(
        "Unable to find nearby emergency locations."
      );
    } finally {
      setLoading(false);
    }
  };

const getRoute = (shelter: Shelter) => {
  setSelected(shelter);
  setError("");
};
  return (
    <main className="min-h-screen bg-slate-950 text-white p-5 md:p-8">

      <div className="max-w-5xl mx-auto">

        <button
          onClick={() =>
            window.history.back()
          }
          className="mb-6 text-slate-300 hover:text-white"
        >
          ← Back
        </button>

        <div className="mb-8">

          <div className="text-5xl mb-3">
            🚨
          </div>

          <h1 className="text-3xl md:text-4xl font-black">
            Nearby Emergency Shelters
          </h1>

          <p className="text-slate-400 mt-2">
            Emergency locations near your current
            position.
          </p>

        </div>

        {loading && (
          <div className="rounded-2xl bg-slate-900 border border-slate-700 p-6">
            🔎 Searching nearby emergency locations...
          </div>
        )}

        {error && (
          <div className="rounded-2xl bg-red-950/50 border border-red-500 p-5 mb-6">
            {error}
          </div>
        )}

        {!loading &&
          shelters.length === 0 &&
          !error && (
            <div className="rounded-2xl bg-slate-900 border border-yellow-500 p-6">
              No mapped emergency locations were
              found within 10 km.
            </div>
          )}

        {!loading &&
          shelters.length > 0 && (
            <div className="space-y-4">

              {shelters.map((shelter) => (
                <button
                  key={shelter.id}
onClick={() => {
  setSelected(shelter);
}}
                  className={`w-full text-left rounded-2xl border p-5 transition ${
                    selected?.id ===
                    shelter.id
                      ? "border-blue-500 bg-blue-950/40"
                      : "border-slate-700 bg-slate-900 hover:border-slate-500"
                  }`}
                >

                  <div className="flex justify-between gap-4">

                    <div>
                      <h2 className="font-bold text-lg">
                        📍 {shelter.name}
                      </h2>

                      <p className="text-slate-400 mt-1">
                        {shelter.type}
                      </p>
                    </div>

                    <div className="text-right">
                      <div className="font-bold">
                        {shelter.distance?.toFixed(
                          1
                        )} km
                      </div>

                      <div className="text-xs text-slate-400">
                        {selected?.id ===
                        shelter.id
                          ? "Selected"
                          : "Select destination"}
                      </div>
                    </div>

                  </div>

                </button>
              ))}

            </div>
          )}

        {location && selected && (
          <section className="mt-8">

            <div className="mb-4">
              <h2 className="text-2xl font-black">
                🧭 Route to {selected.name}
              </h2>

              <p className="text-slate-400 mt-1">
                Blue marker = your location
                · Red marker = emergency destination
              </p>
            </div>

            <RouteMap
              currentLocation={location}
              destination={{
                latitude:
                  selected.latitude,
                longitude:
                  selected.longitude,
              }}
            />


            <p className="text-xs text-slate-500 mt-4 text-center">
              Navigation is provided as assistance.
              Follow official evacuation instructions,
              emergency personnel, and road signs.
            </p>

          </section>
        )}

      </div>

    </main>
  );
}
