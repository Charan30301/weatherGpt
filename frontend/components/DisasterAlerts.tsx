"use client";

import { useEffect, useState } from "react";

interface DisasterProps {
  latitude: number;
  longitude: number;
  onEmergency?: (
    title: string,
    message: string,
    severity: "warning" | "danger"
  ) => void;
}

interface Alert {
  type: string;
  level: string;
  message: string;
}

interface DisasterData {
  alerts?: Alert[];
  error?: string;
}

export default function DisasterAlerts({
  latitude,
  longitude,
  onEmergency,
}: DisasterProps) {
  const [data, setData] =
    useState<DisasterData | null>(null);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    if (
      latitude === 0 &&
      longitude === 0
    ) {
      return;
    }

    const loadAlerts = async () => {
      setLoading(true);

      try {
        const response = await fetch(
          `http://localhost:8000/disasters?latitude=${latitude}&longitude=${longitude}`
        );

        const result: DisasterData =
          await response.json();

        setData(result);

        const alerts = result.alerts || [];
const seriousAlert = alerts.find((alert) => {
  const level = String(alert.level || "").toUpperCase();

  return (
    level === "HIGH" ||
    level === "EXTREME"
  );
});

if (seriousAlert && onEmergency) {
  onEmergency(
    seriousAlert.type || "Emergency Warning",
    seriousAlert.message || "Dangerous weather conditions detected.",
    "danger"
  );
}


      } catch (error) {
        console.error(
          "Disaster alert error:",
          error
        );
      } finally {
        setLoading(false);
      }
    };

    loadAlerts();
  }, [
    latitude,
    longitude,
    onEmergency,
  ]);

  return (
    <section className="mt-8 p-5">
      <div className="rounded-3xl bg-slate-900/70 border border-slate-700 p-6">

        <h2 className="text-2xl font-bold text-white">
          🚨 Disaster Alerts
        </h2>

        <p className="text-slate-400 mt-2">
          Weather-related risk monitoring
        </p>

        {loading && (
          <p className="text-slate-400 mt-6">
            Checking weather risks...
          </p>
        )}

        {!loading && data?.error && (
          <p className="text-red-400 mt-6">
            Unable to load disaster alerts.
          </p>
        )}

        {!loading &&
          data?.alerts && (
            <div className="mt-6 space-y-4">

              {data.alerts.map(
                (alert, index) => {

                  const high =
                    alert.level === "HIGH";

                  const moderate =
                    alert.level === "MODERATE";

                  return (
                    <div
                      key={index}
                      className={`rounded-2xl p-5 border ${
                        high
                          ? "border-red-500 bg-red-950/40"
                          : moderate
                          ? "border-yellow-500 bg-yellow-950/30"
                          : "border-green-500 bg-green-950/30"
                      }`}
                    >

                      <div className="flex items-center justify-between gap-4">

                        <h3 className="text-white font-bold">
                          {high && "🔴 "}
                          {moderate && "🟡 "}
                          {!high &&
                            !moderate &&
                            "🟢 "}

                          {alert.type}
                        </h3>

                        <span className="text-xs font-bold text-white">
                          {alert.level}
                        </span>

                      </div>

                      <p className="text-slate-300 mt-3">
                        {alert.message}
                      </p>

                    </div>
                  );
                }
              )}

            </div>
          )}

      </div>
    </section>
  );
}
