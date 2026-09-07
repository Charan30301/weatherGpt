"use client";

import { ReactNode } from "react";

interface WeatherBackgroundProps {
  children: ReactNode;
  weatherCode?: number;
  emergencyType?: string | null;
}

export default function WeatherBackground({
  children,
  weatherCode,
  emergencyType,
}: WeatherBackgroundProps) {
  // Default background
  let backgroundImage = "/backgrounds/newclear.jpg";

  // =========================
  // EMERGENCY BACKGROUNDS
  // =========================
  if (emergencyType) {
    switch (emergencyType.toLowerCase()) {
      case "cyclone":
        backgroundImage = "/backgrounds/cyclone.jpg";
        break;

      case "earthquake":
        backgroundImage = "/backgrounds/earthquake.jpg";
        break;

      case "flood":
        backgroundImage = "/backgrounds/flood.jpg";
        break;

      case "tornado":
        backgroundImage = "/backgrounds/tornado.jpg";
        break;

      case "tsunami":
        backgroundImage = "/backgrounds/tsunami.jpg";
        break;

      case "volcano":
        backgroundImage = "/backgrounds/volcano.jpg";
        break;

      case "glacier":
        backgroundImage = "/backgrounds/glacier.jpg";
        break;

      default:
        backgroundImage = "/backgrounds/cloudy.jpg";
    }
  }

  // =========================
  // NORMAL WEATHER BACKGROUNDS
  // =========================
  else if (weatherCode !== undefined) {
    switch (weatherCode) {
      // Clear Sky
      case 0:
      case 1:
        backgroundImage = "/backgrounds/newclear.jpg";
        break;

      // Partly Cloudy / Cloudy
      case 2:
      case 3:
        backgroundImage = "/backgrounds/cloudy.jpg";
        break;

      // Fog
      case 45:
      case 48:
        backgroundImage = "/backgrounds/cloudy.jpg";
        break;

      default:
        // Drizzle, Rain, Snow, Showers, Thunderstorms
        if (weatherCode >= 51 && weatherCode <= 99) {
          backgroundImage = "/backgrounds/cloudy.jpg";
        }
    }
  }

  return (
    <div className="relative min-h-screen w-full">
      
      {/* FULL SCREEN WEATHER BACKGROUND */}
      <div
        className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url(${backgroundImage})`,
        }}
      />

      {/* DARK OVERLAY FOR READABILITY */}
      <div className="fixed inset-0 z-[1] bg-black/25" />

      {/* ENTIRE APP CONTENT */}
      <div className="relative z-10 min-h-screen">
        {children}
      </div>

    </div>
  );
}
