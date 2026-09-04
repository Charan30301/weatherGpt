"use client";

import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Bell,
  MapPin,
  ShieldAlert,
  FileText,
  RefreshCw,
} from "lucide-react";
import { useRouter } from "next/navigation";

type LocationData = {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: number;
};

export default function SettingsPage() {
  const router = useRouter();

  const [location, setLocation] =
    useState<LocationData | null>(null);

  const [notifications, setNotifications] =
    useState(false);

  const [warnings, setWarnings] =
    useState(true);

  useEffect(() => {
    const storedLocation =
      localStorage.getItem("weathergpt-location");

    if (storedLocation) {
      try {
        setLocation(JSON.parse(storedLocation));
      } catch {
        setLocation(null);
      }
    }

    setNotifications(
      localStorage.getItem("weathergpt-notifications") ===
        "true"
    );

    setWarnings(
      localStorage.getItem("weathergpt-warning-alerts") !==
        "false"
    );
  }, []);

  const updateLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const data = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: Date.now(),
        };

        setLocation(data);

        localStorage.setItem(
          "weathergpt-location",
          JSON.stringify(data)
        );
      },
      () => {
        alert("Location permission denied.");
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      }
    );
  };

  const updateNotifications = async () => {
    if (!("Notification" in window)) {
      alert("Notifications are not supported.");
      return;
    }

    const permission =
      await Notification.requestPermission();

    const enabled = permission === "granted";

    setNotifications(enabled);

    localStorage.setItem(
      "weathergpt-notifications",
      String(enabled)
    );
  };

  const toggleWarnings = () => {
    const value = !warnings;

    setWarnings(value);

    localStorage.setItem(
      "weathergpt-warning-alerts",
      String(value)
    );
  };

  return (
    <main className="app-background min-h-screen px-5 py-8">

      <div className="max-w-4xl mx-auto">

        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-slate-300 hover:text-white mb-6"
        >
          <ArrowLeft size={20} />
          Back
        </button>

        <h1 className="text-4xl font-bold text-white mb-2">
          Settings
        </h1>

        <p className="text-slate-400 mb-8">
          Manage WeatherGPT permissions and warning preferences.
        </p>

        <div className="space-y-5">

          {/* NOTIFICATIONS */}
          <section className="feature-card">

            <div className="flex gap-4">

              <Bell className="text-yellow-400" />

              <div className="flex-1">

                <h2 className="text-xl text-white font-bold">
                  Notifications & Permissions
                </h2>

                <p className="text-slate-400 mt-2">
                  Browser notification permission
                </p>

                <button
                  onClick={updateNotifications}
                  className={`mt-4 px-5 py-2 rounded-xl ${
                    notifications
                      ? "bg-green-600"
                      : "bg-slate-700"
                  }`}
                >
                  {notifications
                    ? "Notifications Allowed"
                    : "Enable Notifications"}
                </button>

              </div>

            </div>

          </section>

          {/* LOCATION */}
          <section className="feature-card">

            <div className="flex gap-4">

              <MapPin className="text-red-400" />

              <div className="flex-1">

                <h2 className="text-xl text-white font-bold">
                  Current Location Coordinates
                </h2>

                {location ? (
                  <div className="mt-4 space-y-2 text-slate-300">

                    <p>
                      Latitude:{" "}
                      <strong>
                        {location.latitude.toFixed(6)}
                      </strong>
                    </p>

                    <p>
                      Longitude:{" "}
                      <strong>
                        {location.longitude.toFixed(6)}
                      </strong>
                    </p>

                    <p>
                      Accuracy:{" "}
                      <strong>
                        {Math.round(location.accuracy)} m
                      </strong>
                    </p>

                    <p className="text-xs text-slate-500">
                      Updated:{" "}
                      {new Date(
                        location.timestamp
                      ).toLocaleString()}
                    </p>

                  </div>
                ) : (
                  <p className="text-slate-400 mt-3">
                    Location has not been provided.
                  </p>
                )}

                <button
                  onClick={updateLocation}
                  className="mt-5 px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 flex items-center gap-2"
                >
                  <RefreshCw size={17} />
                  Update Location
                </button>

              </div>

            </div>

          </section>

          {/* WARNING */}
          <section className="feature-card">

            <div className="flex gap-4">

              <ShieldAlert className="text-orange-400" />

              <div className="flex-1">

                <h2 className="text-xl text-white font-bold">
                  Warning Alert Signals
                </h2>

                <p className="text-slate-400 mt-2">
                  Control weather and disaster warning signals.
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5">

                  {[
                    "Heavy Rain",
                    "Flood",
                    "Cyclone",
                    "Tsunami",
                    "Wildfire",
                    "Lightning",
                    "Extreme Wind",
                    "Satellite Alerts",
                  ].map((alert) => (
                    <div
                      key={alert}
                      className="rounded-xl bg-slate-900 p-3 text-sm text-slate-300"
                    >
                      {alert}
                    </div>
                  ))}

                </div>

                <button
                  onClick={toggleWarnings}
                  className={`mt-5 px-5 py-2 rounded-xl ${
                    warnings
                      ? "bg-green-600"
                      : "bg-slate-700"
                  }`}
                >
                  {warnings
                    ? "Warning Alerts Enabled"
                    : "Warning Alerts Disabled"}
                </button>

              </div>

            </div>

          </section>

          {/* TERMS */}
          <section className="feature-card">

            <div className="flex gap-4">

              <FileText className="text-blue-400" />

              <div>

                <h2 className="text-xl text-white font-bold">
                  Terms & Conditions
                </h2>

                <p className="text-slate-400 mt-2">
                  Review WeatherGPT terms and permission information.
                </p>

                <button
                  onClick={() => router.push("/terms")}
                  className="mt-4 px-5 py-2 rounded-xl bg-slate-700 hover:bg-slate-600"
                >
                  View Terms & Conditions
                </button>

              </div>

            </div>

          </section>

        </div>

      </div>

    </main>
  );
}
