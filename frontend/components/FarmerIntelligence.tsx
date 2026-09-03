"use client";

import { useEffect, useState } from "react";

interface FarmerProps {
  latitude: number;
  longitude: number;
}

interface FarmerData {
  current?: {
    temperature?: number;
    humidity?: number;
    rain?: number;
    wind?: number;
  };

  rain_probability?: number;

  advice?: {
    irrigation?: string;
    heat?: string;
    wind?: string;
  };

  error?: string;
}

export default function FarmerIntelligence({
  latitude,
  longitude,
}: FarmerProps) {
  const [data, setData] =
    useState<FarmerData | null>(null);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    if (
      latitude === 0 &&
      longitude === 0
    ) {
      return;
    }

    const loadFarmerData = async () => {
      setLoading(true);

      try {
        const response = await fetch(
          `http://localhost:8000/farmer?latitude=${latitude}&longitude=${longitude}`
        );

        const result = await response.json();

        setData(result);
      } catch (error) {
        console.error(
          "Farmer intelligence error:",
          error
        );
      } finally {
        setLoading(false);
      }
    };

    loadFarmerData();
  }, [latitude, longitude]);

  return (
    <section className="mt-8 p-5">
      <div className="rounded-3xl bg-slate-900/70 border border-slate-700 p-6">

        <h2 className="text-2xl font-bold text-white">
          🌾 Farmer Intelligence
        </h2>

        <p className="text-slate-400 mt-2">
          Weather-based farming guidance
        </p>

        {loading && (
          <p className="text-slate-400 mt-6">
            Loading farmer intelligence...
          </p>
        )}

        {!loading && data?.error && (
          <p className="text-red-400 mt-6">
            Unable to load farmer data.
          </p>
        )}

        {!loading && data && !data.error && (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">

              <div className="rounded-2xl bg-slate-800 p-4">
                <p className="text-slate-400 text-sm">
                  Temperature
                </p>

                <p className="text-white text-2xl font-bold mt-2">
                  {data.current?.temperature ?? "--"}°C
                </p>
              </div>

              <div className="rounded-2xl bg-slate-800 p-4">
                <p className="text-slate-400 text-sm">
                  Humidity
                </p>

                <p className="text-white text-2xl font-bold mt-2">
                  {data.current?.humidity ?? "--"}%
                </p>
              </div>

              <div className="rounded-2xl bg-slate-800 p-4">
                <p className="text-slate-400 text-sm">
                  Rain
                </p>

                <p className="text-white text-2xl font-bold mt-2">
                  {data.current?.rain ?? "--"} mm
                </p>
              </div>

              <div className="rounded-2xl bg-slate-800 p-4">
                <p className="text-slate-400 text-sm">
                  Rain Chance
                </p>

                <p className="text-white text-2xl font-bold mt-2">
                  {data.rain_probability ?? "--"}%
                </p>
              </div>

            </div>

            <div className="mt-6 space-y-4">

              <div className="rounded-2xl bg-slate-800 p-5">
                <p className="text-green-400 font-bold">
                  💧 Irrigation
                </p>

                <p className="text-slate-300 mt-2">
                  {data.advice?.irrigation}
                </p>
              </div>

              <div className="rounded-2xl bg-slate-800 p-5">
                <p className="text-orange-400 font-bold">
                  🌡️ Heat
                </p>

                <p className="text-slate-300 mt-2">
                  {data.advice?.heat}
                </p>
              </div>

              <div className="rounded-2xl bg-slate-800 p-5">
                <p className="text-blue-400 font-bold">
                  💨 Wind
                </p>

                <p className="text-slate-300 mt-2">
                  {data.advice?.wind}
                </p>
              </div>

            </div>
          </>
        )}

      </div>
    </section>
  );
}
