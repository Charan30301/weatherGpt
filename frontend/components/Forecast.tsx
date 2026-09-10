"use client";

import { useEffect, useState } from "react";

interface ForecastProps {
  latitude: number;
  longitude: number;
}

interface ForecastData {
  daily?: {
    time: string[];
    weather_code: number[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    precipitation_probability_max: number[];
    wind_speed_10m_max: number[];
  };

  error?: string;
}

function getWeatherIcon(code: number) {
  if (code === 0) return "☀️";
  if (code <= 3) return "🌤️";
  if (code <= 48) return "🌫️";
  if (code <= 67) return "🌧️";
  if (code <= 77) return "🌨️";
  if (code <= 82) return "🌦️";
  if (code <= 86) return "🌨️";
  if (code >= 95) return "⛈️";

  return "🌤️";
}

function getWeatherName(code: number) {
  if (code === 0) return "Clear Sky";
  if (code <= 3) return "Partly Cloudy";
  if (code <= 48) return "Fog";
  if (code <= 67) return "Rain";
  if (code <= 77) return "Snow";
  if (code <= 82) return "Rain Showers";
  if (code <= 86) return "Snow Showers";
  if (code >= 95) return "Thunderstorm";

  return "Weather";
}

export default function Forecast({
  latitude,
  longitude,
}: ForecastProps) {
  const [forecast, setForecast] =
    useState<ForecastData | null>(null);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    if (
      latitude === 0 &&
      longitude === 0
    ) {
      setLoading(false);
      return;
    }

    const loadForecast = async () => {
      setLoading(true);
      setForecast(null);

      try {
        const url =
          `http://localhost:8000/forecast` +
          `?latitude=${latitude}` +
          `&longitude=${longitude}`;

        console.log(
          "Forecast request:",
          url
        );

        const response = await fetch(url);

        const result =
          await response.json();

        console.log(
          "Forecast response:",
          result
        );

        if (!response.ok) {
          throw new Error(
            `HTTP ${response.status}`
          );
        }

        if (result.error) {
          setForecast({
            error: result.error
          });

          return;
        }

        if (!result.daily) {
          setForecast({
            error:
              "No forecast data returned for this location."
          });

          return;
        }

        setForecast(result);

      } catch (error) {
        console.error(
          "Forecast error:",
          error
        );

        setForecast({
          error:
            "Unable to connect to forecast service."
        });
      } finally {
        setLoading(false);
      }
    };

    loadForecast();

  }, [latitude, longitude]);

  if (loading) {
    return (
      <section className="mt-8 p-5">
        <div className="rounded-3xl bg-slate-900/70 border border-slate-700 p-6">

          <h2 className="text-2xl font-bold text-white">
            📅 7-Day Forecast
          </h2>

          <p className="text-slate-400 mt-4">
            Loading forecast...
          </p>

        </div>
      </section>
    );
  }

  if (forecast?.error) {
    return (
      <section className="mt-8 p-5">
        <div className="rounded-3xl bg-slate-900/70 border border-slate-700 p-6">

          <h2 className="text-2xl font-bold text-white">
            📅 7-Day Forecast
          </h2>

          <p className="text-red-400 mt-4">
            {forecast.error}
          </p>

          <p className="text-slate-500 text-sm mt-2">
            Location: {latitude.toFixed(4)},{" "}
            {longitude.toFixed(4)}
          </p>

        </div>
      </section>
    );
  }

  if (!forecast?.daily) {
    return null;
  }

  const daily = forecast.daily;

  return (
    <section className="mt-8 p-5">

      <div className="rounded-3xl bg-slate-900/70 border border-slate-700 p-6">

        <div className="mb-6">

          <h2 className="text-2xl font-bold text-white">
            📅 7-Day Forecast
          </h2>

          <p className="text-slate-400 mt-2">
            Weather forecast for your selected location
          </p>

        </div>

<div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory">
          {daily.time.map(
            (date, index) => {

              const day =
                new Date(
                  date + "T12:00:00"
                ).toLocaleDateString(
                  "en-US",
                  {
                    weekday: "short"
                  }
                );

              const maxTemp =
                daily.temperature_2m_max[
                  index
                ];

              const minTemp =
                daily.temperature_2m_min[
                  index
                ];

              const rain =
                daily.precipitation_probability_max[
                  index
                ];

              const wind =
                daily.wind_speed_10m_max[
                  index
                ];

              const code =
                daily.weather_code[index];

              return (
                <div
                  key={date}
                  className="
                    shrink-0
                    w-48
                    snap-start
                    rounded-3xl

                    bg-slate-800
                    border
                    border-slate-700
                    p-5
                    hover:border-blue-500
                    transition
                  "
                >

                  <div className="text-center">

                    <p className="text-white font-bold">
                      {index === 0
                        ? "Today"
                        : day}
                    </p>

                    <p className="text-5xl mt-4">
                      {getWeatherIcon(code)}
                    </p>

                    <p className="text-slate-300 mt-3 text-sm">
                      {getWeatherName(code)}
                    </p>

                    <div className="flex justify-center gap-3 mt-4">

                      <span className="text-white font-bold">
                        {Math.round(maxTemp)}°
                      </span>

                      <span className="text-slate-500">
                        {Math.round(minTemp)}°
                      </span>

                    </div>

                    <div className="mt-4 text-sm space-y-2 text-left">

                      <p className="text-blue-300">
                        🌧️ Rain: {rain}%
                      </p>

                      <p className="text-slate-300">
                        💨 Wind:{" "}
                        {Math.round(wind)} km/h
                      </p>

                    </div>

                  </div>

                </div>
              );
            }
          )}

        </div>

      </div>

    </section>
  );
}
