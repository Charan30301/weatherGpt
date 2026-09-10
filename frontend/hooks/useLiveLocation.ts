"use client";

import { useEffect, useRef, useState } from "react";

export type LiveLocation = {
  latitude: number;
  longitude: number;
  accuracy: number;
};

export default function useLiveLocation(
  minimumDistanceMeters = 0
) {
  const [location, setLocation] =
    useState<LiveLocation | null>(null);

  const [error, setError] = useState("");

  const lastAcceptedLocation =
    useRef<LiveLocation | null>(null);

  const distanceInMeters = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ) => {
    const R = 6371000;

    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) ** 2;

    return (
      R *
      2 *
      Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    );
  };

  useEffect(() => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported.");
      return;
    }

    const watchId =
      navigator.geolocation.watchPosition(
        (position) => {
          const nextLocation = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
          };

          if (!lastAcceptedLocation.current) {
            lastAcceptedLocation.current =
              nextLocation;

            setLocation(nextLocation);

            localStorage.setItem(
              "weathergpt-coordinates",
              JSON.stringify({
                latitude: nextLocation.latitude,
                longitude: nextLocation.longitude,
              })
            );

            return;
          }

          const distance = distanceInMeters(
            lastAcceptedLocation.current.latitude,
            lastAcceptedLocation.current.longitude,
            nextLocation.latitude,
            nextLocation.longitude
          );

          console.log(
            "GPS distance:",
            Math.round(distance),
            "meters"
          );

          // Update only after approximately 1 km
if (distance >= minimumDistanceMeters) {
            lastAcceptedLocation.current =
              nextLocation;

            setLocation(nextLocation);

            localStorage.setItem(
              "weathergpt-coordinates",
              JSON.stringify({
                latitude: nextLocation.latitude,
                longitude: nextLocation.longitude,
              })
            );

            console.log(
              "LIVE LOCATION UPDATED:",
              nextLocation.latitude,
              nextLocation.longitude
            );
          }
        },
        (positionError) => {
          console.error(
            "Live location error:",
            positionError
          );

          setError(
            "Unable to update your live location."
          );
        },
        {
          enableHighAccuracy: true,
          maximumAge: 2000,
          timeout: 10000,
        }
      );

    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, []);

  return {
    location,
    error,
  };
}
