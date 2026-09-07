"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import WeatherBackground from "../../components/WeatherBackground";
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Droplets,
  Wind,
  CloudRain,
} from "lucide-react";


interface ForecastData {
  daily?: {
    time: string[];
    weather_code: number[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    precipitation_probability_max: number[];
    wind_speed_10m_max: number[];
  };
}


export default function ForecastPage() {

  const [forecast, setForecast] =
    useState<ForecastData | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [locationName, setLocationName] =
    useState("Your Location");


  const getWeatherIcon = (
    code: number
  ) => {

    if (code === 0) return "☀️";

    if (code === 1 || code === 2)
      return "🌤️";

    if (code === 3)
      return "☁️";

    if (
      code === 45 ||
      code === 48
    )
      return "🌫️";

    if (
      code >= 51 &&
      code <= 57
    )
      return "🌦️";

    if (
      code >= 61 &&
      code <= 67
    )
      return "🌧️";

    if (
      code >= 71 &&
      code <= 77
    )
      return "❄️";

    if (
      code >= 80 &&
      code <= 82
    )
      return "🌧️";

    if (
      code >= 95
    )
      return "⛈️";

    return "🌤️";

  };


  const getWeatherText = (
    code: number
  ) => {

    if (code === 0)
      return "Clear Sky";

    if (
      code === 1 ||
      code === 2
    )
      return "Partly Cloudy";

    if (code === 3)
      return "Cloudy";

    if (
      code === 45 ||
      code === 48
    )
      return "Foggy";

    if (
      code >= 51 &&
      code <= 57
    )
      return "Drizzle";

    if (
      code >= 61 &&
      code <= 67
    )
      return "Rain";

    if (
      code >= 71 &&
      code <= 77
    )
      return "Snow";

    if (
      code >= 80 &&
      code <= 82
    )
      return "Rain Showers";

    if (
      code >= 95
    )
      return "Thunderstorm";

    return "Unknown";

  };


  useEffect(() => {

    if (!navigator.geolocation) {

      setLoading(false);

      return;

    }


    navigator.geolocation.getCurrentPosition(

      async (position) => {

        const latitude =
          position.coords.latitude;

        const longitude =
          position.coords.longitude;


        try {

          const response =
            await fetch(

              `http://127.0.0.1:8000/forecast?latitude=${latitude}&longitude=${longitude}`

            );


          const data =
            await response.json();


          setForecast(data);


          setLocationName(
            "Current Location"
          );

        } catch (error) {

          console.error(
            "Forecast error:",
            error
          );

        } finally {

          setLoading(false);

        }

      },


      () => {

        setLoading(false);

      }

    );

  }, []);


return (
  <WeatherBackground
    weatherCode={forecast?.daily?.weather_code?.[0]}
  >
    <main className="min-h-screen pb-10">

      {/* HEADER */}

      <header
        className="
          flex
          items-center
          justify-between
          px-5
          py-5
        "
      >

        <Link
          href="/dashboard"
          className="
            p-3
            rounded-xl
            bg-slate-900
            border
            border-slate-700
          "
        >

          <ArrowLeft size={22} />

        </Link>


        <div className="text-center">

          <h1 className="font-bold text-lg">

            7-Day Forecast

          </h1>

          <p className="text-xs text-slate-400">

            Weather Intelligence

          </p>

        </div>


        <div
          className="
            p-3
            rounded-xl
            bg-blue-600/20
          "
        >

          <Calendar
            size={22}
            className="text-blue-400"
          />

        </div>

      </header>


      {/* LOCATION */}

      <section className="px-5">

        <div
          className="
            glass
            rounded-2xl
            p-4
            flex
            items-center
            gap-3
          "
        >

          <MapPin
            className="text-blue-400"
          />

          <div>

            <p className="text-xs text-slate-400">

              Forecast Location

            </p>

            <h2 className="font-semibold">

              {locationName}

            </h2>

          </div>

        </div>

      </section>


      {/* LOADING */}

      {loading && (

        <div className="text-center py-20">

          <div className="text-5xl animate-pulse">

            🌍

          </div>

          <p className="mt-4 text-slate-400">

            Loading 7-day forecast...

          </p>

        </div>

      )}


      {/* FORECAST CARDS */}

      {!loading &&
        forecast?.daily && (

          <section className="px-5 mt-6">

            <h2 className="text-xl font-bold mb-4">

              Weekly Forecast

            </h2>


            <div className="space-y-4">

              {forecast.daily.time.map(

                (date, index) => {

                  const weatherCode =
                    forecast.daily?.weather_code[index] ?? 0;

                  const maxTemp =
                    forecast.daily?.temperature_2m_max[index];

                  const minTemp =
                    forecast.daily?.temperature_2m_min[index];

                  const rain =
                    forecast.daily
                      ?.precipitation_probability_max[index];

                  const wind =
                    forecast.daily
                      ?.wind_speed_10m_max[index];


                  const formattedDate =
                    new Date(
                      date
                    ).toLocaleDateString(
                      undefined,
                      {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                      }
                    );


                  return (

                    <div
                      key={date}
                      className="
                        glass
                        rounded-3xl
                        p-5
                        hover:scale-[1.02]
                        transition
                      "
                    >


                      <div
                        className="
                          flex
                          items-center
                          justify-between
                        "
                      >


                        {/* DATE */}

                        <div>

                          <p className="font-bold text-lg">

                            {index === 0
                              ? "Today"
                              : formattedDate}

                          </p>

                          <p className="text-sm text-slate-400">

                            {getWeatherText(
                              weatherCode
                            )}

                          </p>

                        </div>


                        {/* ICON */}

                        <div className="text-5xl">

                          {getWeatherIcon(
                            weatherCode
                          )}

                        </div>


                        {/* TEMP */}

                        <div className="text-right">

                          <p className="text-xl font-bold">

                            {Math.round(
                              maxTemp ?? 0
                            )}°

                          </p>

                          <p className="text-slate-400">

                            {Math.round(
                              minTemp ?? 0
                            )}°

                          </p>

                        </div>

                      </div>


                      {/* DETAILS */}

                      <div
                        className="
                          grid
                          grid-cols-2
                          gap-3
                          mt-5
                        "
                      >


                        <div
                          className="
                            bg-slate-900/60
                            rounded-xl
                            p-3
                            flex
                            items-center
                            gap-2
                          "
                        >

                          <CloudRain
                            size={18}
                            className="text-blue-400"
                          />

                          <div>

                            <p className="text-xs text-slate-400">

                              Rain

                            </p>

                            <p className="font-bold">

                              {rain ?? 0}%

                            </p>

                          </div>

                        </div>


                        <div
                          className="
                            bg-slate-900/60
                            rounded-xl
                            p-3
                            flex
                            items-center
                            gap-2
                          "
                        >

                          <Wind
                            size={18}
                            className="text-cyan-400"
                          />

                          <div>

                            <p className="text-xs text-slate-400">

                              Wind

                            </p>

                            <p className="font-bold">

                              {wind ?? 0} km/h

                            </p>

                          </div>

                        </div>


                      </div>


                    </div>

                  );

                }

              )}

            </div>

          </section>

        )}


      {/* ERROR / NO DATA */}

      {!loading &&
        !forecast?.daily && (

          <div className="text-center py-20 px-5">

            <div className="text-5xl">

              ⚠️

            </div>

            <h2 className="mt-4 text-xl font-bold">

              Forecast unavailable

            </h2>

            <p className="text-slate-400 mt-2">

              Please check your internet connection
              and location permission.

            </p>

          </div>

        )}


    </main>
</WeatherBackground>
  );

}
