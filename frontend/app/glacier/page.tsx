"use client";

import { useEffect, useState } from "react";

type Glacier = {
  id: string;
  name: string;
  country: string;
  latitude: number;
  longitude: number;
  type: string;
};

type Scene = {
  id: string;
  satellite: string;
  acquired_at: string;
  cloud_cover: number | null;
  ground_resolution_m: number | null;
  processing_level: string | null;
  thumbnail_url: string | null;
  true_color_url: string | null;
};

export default function GlacierPage() {
  const [glaciers, setGlaciers] = useState<Glacier[]>([]);
  const [selectedGlacier, setSelectedGlacier] =
    useState("gangotri");

  const [scenes, setScenes] = useState<Scene[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadGlaciers = async () => {
      try {
        const response = await fetch(
          "http://127.0.0.1:8000/glaciers"
        );

        if (!response.ok) {
          throw new Error(
            `Backend returned ${response.status}`
          );
        }

        const data = await response.json();

       setGlaciers(data.glaciers || data);
      } catch (err) {
        console.error(err);
        setError("Unable to load glaciers.");
      }
    };

    loadGlaciers();
  }, []);

  const loadSatelliteHistory = async () => {
    try {
      setLoading(true);
      setError("");
      setScenes([]);

      const response = await fetch(
        `http://127.0.0.1:8000/glacier/${selectedGlacier}/satellite-history` +
          `?start_date=2026-08-01` +
          `&end_date=2026-09-01`
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

      setScenes(data.scenes || []);
    } catch (err) {
      console.error(
        "Glacier satellite history error:",
        err
      );

      setError(
        "Unable to load glacier satellite history."
      );
    } finally {
      setLoading(false);
    }
  };

  const selected = glaciers.find(
    (glacier) => glacier.id === selectedGlacier
  );

  return (
    <main className="min-h-screen bg-slate-950 text-white p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-2">
          Glacier Monitoring
        </h1>

        <p className="text-slate-400 mb-8">
          Sentinel-2 satellite observation and
          historical glacier monitoring.
        </p>

        <div className="bg-slate-900 rounded-2xl p-6 mb-8">
          <label className="block mb-2 text-sm text-slate-400">
            Select Glacier
          </label>

          <select
            value={selectedGlacier}
            onChange={(event) =>
              setSelectedGlacier(event.target.value)
            }
            className="w-full md:w-96 bg-slate-800 border border-slate-700 rounded-lg p-3"
          >
            {glaciers.map((glacier) => (
              <option
                key={glacier.id}
                value={glacier.id}
              >
                {glacier.name}
              </option>
            ))}
          </select>

          {selected && (
            <div className="mt-4 text-slate-300">
              <p>
                <strong>Location:</strong>{" "}
                {selected.latitude},{" "}
                {selected.longitude}
              </p>

              <p>
                <strong>Type:</strong>{" "}
                {selected.type}
              </p>
            </div>
          )}

          <button
            onClick={loadSatelliteHistory}
            disabled={loading}
            className="mt-6 px-5 py-3 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-50"
          >
            {loading
              ? "Loading Satellite Data..."
              : "Load Satellite History"}
          </button>
        </div>

        {error && (
          <div className="bg-red-900/40 border border-red-700 rounded-xl p-4 mb-6">
            {error}
          </div>
        )}

        <div className="bg-slate-900 rounded-2xl p-6">
          <h2 className="text-2xl font-semibold mb-6">
            Sentinel-2 Observations
          </h2>

          {scenes.length === 0 && !loading && (
            <p className="text-slate-400">
              Click &quot;Load Satellite History&quot;
              to retrieve observations.
            </p>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {scenes.map((scene) => (
              <div
                key={scene.id}
                className="bg-slate-800 rounded-xl overflow-hidden border border-slate-700"
              >
                {scene.thumbnail_url && (
                  <img
                    src={scene.thumbnail_url}
                    alt={`Satellite observation ${scene.id}`}
                    className="w-full h-48 object-cover"
                  />
                )}

                <div className="p-4">
                  <h3 className="font-semibold mb-3">
                    {scene.satellite}
                  </h3>

                  <p className="text-sm text-slate-300">
                    Date:{" "}
                    {new Date(
                      scene.acquired_at
                    ).toLocaleDateString()}
                  </p>

                  <p className="text-sm text-slate-300">
                    Cloud cover:{" "}
                    {scene.cloud_cover ?? "N/A"}%
                  </p>

                  <p className="text-sm text-slate-300">
                    Resolution:{" "}
                    {scene.ground_resolution_m ?? "N/A"} m
                  </p>

                  <p className="text-sm text-slate-300">
                    Processing:{" "}
                    {scene.processing_level ?? "N/A"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
