"use client";

import { useEffect, useState } from "react";

type GlacierAlert = {
  time: string;
  glacier_id: string;
  glacier_name: string;
  priority: string;
  type: string;
  temperature: number;
  temperature_change: number;
  severity: "WARNING" | "HIGH";
  distance_km: number;
};

type GlacierAlertsProps = {
  latitude: number;
  longitude: number;
};

export default function GlacierAlerts({
  latitude,
  longitude,
}: GlacierAlertsProps) {
  const [alerts, setAlerts] = useState<GlacierAlert[]>([]);

  useEffect(() => {
    if (!latitude || !longitude) return;

    const loadAlerts = async () => {
      try {
        const response = await fetch(
          `http://127.0.0.1:8000/glacier/alerts?latitude=${latitude}&longitude=${longitude}`
        );

        if (!response.ok) {
          throw new Error(
            `Glacier alert service returned ${response.status}`
          );
        }

        const data = await response.json();

        setAlerts(data.alerts || []);
      } catch (error) {
        console.error(
          "Glacier alert error:",
          error
        );

        setAlerts([]);
      }
    };

    loadAlerts();
  }, [latitude, longitude]);

  if (alerts.length === 0) {
    return null;
  }

  return (
    <div className="fixed top-24 left-1/2 z-[9999] w-[92%] max-w-xl -translate-x-1/2 space-y-3">
      {alerts.map((alert) => (
        <div
          key={`${alert.glacier_id}-${alert.time}`}
          className="rounded-2xl border border-orange-400 bg-orange-950/95 p-5 text-white shadow-2xl backdrop-blur"
        >
          <div className="mb-2 flex items-center gap-2">
            <span className="text-2xl">🧊</span>

            <div>
              <h2 className="font-bold">
                GLACIER WARNING
              </h2>

              <p className="text-sm text-orange-200">
                {alert.glacier_name}
              </p>
            </div>
          </div>

          <p className="text-sm">
            Temperature change detected near the
            monitored glacier.
          </p>

          <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
            <div className="rounded-lg bg-black/30 p-2">
              Temperature
              <br />
              <strong>
                {alert.temperature}°C
              </strong>
            </div>

            <div className="rounded-lg bg-black/30 p-2">
              Change
              <br />
              <strong>
                {alert.temperature_change > 0
                  ? "+"
                  : ""}
                {alert.temperature_change.toFixed(1)}
                °C
              </strong>
            </div>
          </div>

          <p className="mt-3 text-xs text-orange-200">
            Distance: {alert.distance_km} km
          </p>
        </div>
      ))}
    </div>
  );
}
