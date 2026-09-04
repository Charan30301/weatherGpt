"use client";

import { useState } from "react";

type LocationPermissionProps = {
  onPermissionChange?: (allowed: boolean) => void;
};

export default function LocationPermission({
  onPermissionChange,
}: LocationPermissionProps) {
  const [loading, setLoading] = useState(false);
  const [allowed, setAllowed] = useState(false);

  const requestLocation = () => {
    if (!navigator.geolocation) {
      alert(
        "Geolocation is not supported by this browser."
      );
      return;
    }

    setLoading(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: Date.now(),
        };

        localStorage.setItem(
          "weathergpt-location",
          JSON.stringify(location)
        );

        setAllowed(true);
        setLoading(false);

        onPermissionChange?.(true);
      },
      (error) => {
        console.error("Location error:", error);

        setAllowed(false);
        setLoading(false);

        onPermissionChange?.(false);

        if (error.code === 1) {
          alert(
            "Location permission was denied. You can enable it later from browser settings."
          );
        } else {
          alert(
            "Unable to determine your current location."
          );
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      }
    );
  };

  return (
    <div className="mt-4">

      <button
        onClick={requestLocation}
        disabled={loading}
        className={`px-4 py-2 rounded-xl text-white ${
          allowed
            ? "bg-green-600"
            : "bg-blue-600 hover:bg-blue-500"
        } disabled:opacity-50`}
      >
        {loading
          ? "Getting Location..."
          : allowed
          ? "Location Allowed"
          : "Allow Location"}
      </button>

      {allowed && (
        <p className="text-xs text-green-400 mt-2">
          Current coordinates saved.
        </p>
      )}

    </div>
  );
}
