"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function Dashboard() {

  const [location, setLocation] = useState("Loading...");
  const [weather, setWeather] = useState<any>(null);


  useEffect(() => {

    if ("geolocation" in navigator) {

      navigator.geolocation.getCurrentPosition(

        async (position) => {

          const lat = position.coords.latitude;
          const lon = position.coords.longitude;

          setLocation(`${lat.toFixed(4)}, ${lon.toFixed(4)}`);

          try {

            const response = await fetch(
              `http://127.0.0.1:8000/weather?latitude=${lat}&longitude=${lon}`
            );

            const data = await response.json();

            setWeather(data);

          } catch (error) {

            console.error(error);

          }

        },

        () => {

          setLocation("Location permission denied");

        }

      );

    }

  }, []);


  return (

    <main className="app-background min-h-screen">

      {/* HEADER */}

      <header className="flex items-center justify-between p-5">

        <button className="text-2xl">
          ☰
        </button>


        <h1 className="text-xl font-bold">
          WeatherGPT
        </h1>


        <Link href="/settings">
          ⚙️
        </Link>

      </header>


      {/* SEARCH */}

      <div className="px-5">

        <input

          placeholder="🔍 Search city, country or place..."

          className="
            w-full
            p-4
            rounded-2xl
            bg-slate-800
            border
            border-slate-700
            outline-none
          "

        />

      </div>


      {/* GLOBE */}

      <section className="flex justify-center items-center h-[400px]">

        <div
          className="
            w-72
            h-72
            rounded-full
            bg-gradient-to-br
            from-blue-400
            via-blue-700
            to-slate-950
            shadow-2xl
            flex
            items-center
            justify-center
            text-7xl
          "
        >

          🌍

        </div>

      </section>


      {/* WEATHER CARD */}

      <section className="px-5">

        <div className="glass rounded-3xl p-6">

          <p className="text-gray-400">
            {location}
          </p>


          {weather?.current && (

            <>

              <h2 className="text-6xl font-bold mt-4">

                {weather.current.temperature_2m}°

              </h2>


              <p className="text-xl mt-2">

                Wind:
                {" "}
                {weather.current.wind_speed_10m}
                {" "}
                km/h

              </p>


              <p className="text-gray-400 mt-2">

                Humidity:
                {" "}
                {weather.current.relative_humidity_2m}%

              </p>

            </>

          )}

        </div>

      </section>


      {/* QUICK FEATURES */}

      <section className="grid grid-cols-2 gap-4 p-5">

        <Link
          href="/forecast"
          className="glass rounded-2xl p-5"
        >
          📅
          <h3 className="mt-2 font-bold">
            Forecast
          </h3>
        </Link>


        <Link
          href="/traveller"
          className="glass rounded-2xl p-5"
        >
          ✈️
          <h3 className="mt-2 font-bold">
            Traveller
          </h3>
        </Link>


        <Link
          href="/farmer"
          className="glass rounded-2xl p-5"
        >
          🌾
          <h3 className="mt-2 font-bold">
            Farmer
          </h3>
        </Link>


        <Link
          href="/disasters"
          className="glass rounded-2xl p-5"
        >
          🚨
          <h3 className="mt-2 font-bold">
            Disaster Alerts
          </h3>
        </Link>

      </section>


      {/* CHATBOT */}

      <Link
        href="/chat"
        className="
          fixed
          bottom-6
          right-6
          w-16
          h-16
          rounded-full
          bg-blue-600
          flex
          items-center
          justify-center
          text-3xl
          shadow-xl
        "
      >

        🤖

      </Link>

    </main>

  );

}
