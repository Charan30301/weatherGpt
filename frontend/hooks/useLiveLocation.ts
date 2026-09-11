"use client";

import { useEffect, useState } from "react";
import { API_URL } from "@/lib/api";
interface LocationData {
  latitude: number;
  longitude: number;
}

const FALLBACK_LOCATION: LocationData = {
  latitude: 17.6868,
  longitude: 83.2185,
};

export default function useLiveLocation() {
  const [location, setLocation] =
    useState<LocationData | null>(null);

  const [error, setError] =
    useState<string | null>(null);

  useEffect(() => {
    if (!navigator.geolocation) {
      console.warn("Geolocation is not supported.");

      setLocation(FALLBACK_LOCATION);
      setError("Geolocation is not supported.");

      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const newLocation: LocationData = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };

        console.log("REAL GPS LOCATION:", newLocation);

        setLocation(newLocation);
        setError(null);
      },

      (positionError) => {
        console.warn(
          "Location unavailable:",
          positionError.code,
          positionError.message
        );

        // Fallback location if GPS is unavailable
        setLocation(FALLBACK_LOCATION);

        setError(positionError.message);
      },

      {
        enableHighAccuracy: true,
        maximumAge: 300000,
        timeout: 15000,
      }
    );
  }, []);

  return {
    location,
    error,
  };
}