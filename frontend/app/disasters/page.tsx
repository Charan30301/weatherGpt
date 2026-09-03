"use client";

import { useEffect, useState } from "react";

import Link from "next/link";

import {
  ArrowLeft,
  AlertTriangle,
  MapPin,
  Activity,
  ShieldAlert,
  RefreshCw,
} from "lucide-react";


interface Earthquake {
  id: string;

  properties: {
    mag: number;
    place: string;
    time: number;
  };

  geometry: {
    coordinates: number[];
  };
}


export default function DisasterPage() {

  const [earthquakes, setEarthquakes] =
    useState<Earthquake[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [location, setLocation] =
    useState("Current Location");

  const [error, setError] =
    useState("");


  const fetchEarthquakes = (
    latitude: number,
    longitude: number
  ) => {

    setLoading(true);

    fetch(
      `http://127.0.0.1:8000/earthquakes?latitude=${latitude}&longitude=${longitude}`
    )

      .then((response) => response.json())

      .then((data) => {

        setEarthquakes(
          data.features || []
        );

      })

      .catch((error) => {

        console.error(error);

        setError(
          "Unable to load earthquake data."
        );

      })

      .finally(() => {

        setLoading(false);

      });

  };


  const getLocation = () => {

    if (!navigator.geolocation) {

      setError(
        "Geolocation is not supported."
      );

      setLoading(false);

      return;

    }


    navigator.geolocation.getCurrentPosition(

      (position) => {

        const latitude =
          position.coords.latitude;

        const longitude =
          position.coords.longitude;


        setLocation(
          `${latitude.toFixed(2)}, ${longitude.toFixed(2)}`
        );


        fetchEarthquakes(
          latitude,
          longitude
        );

      },


      () => {

        setError(
          "Location permission denied."
        );

        setLoading(false);

      }

    );

  };


  useEffect(() => {

    getLocation();

  }, []);


  const getRiskLevel = () => {

    if (earthquakes.length === 0) {
      return "LOW";
    }


    const highestMagnitude = Math.max(
      ...earthquakes.map(
        (earthquake) =>
          earthquake.properties.mag || 0
      )
    );


    if (highestMagnitude >= 7) {
      return "EXTREME";
    }

    if (highestMagnitude >= 5) {
      return "HIGH";
    }

    if (highestMagnitude >= 4) {
      return "MODERATE";
    }

    return "LOW";

  };


  const risk = getRiskLevel();


  return (

    <main className="app-background min-h-screen pb-10">

      {/* HEADER */}

      <header className="
        flex
        items-center
        justify-between
        p-5
      ">

        <Link
          href="/dashboard"
          className="
            p-3
            bg-slate-900
            border border-slate-700
            rounded-xl
          "
        >

          <ArrowLeft size={22} />

        </Link>


        <div className="text-center">

          <h1 className="font-bold text-lg">

            Disaster Center

          </h1>

          <p className="text-xs text-slate-400">

            Real-time Risk Monitoring

          </p>

        </div>


        <button
          onClick={getLocation}
          className="
            p-3
            bg-slate-900
            border border-slate-700
            rounded-xl
          "
        >

          <RefreshCw size={20} />

        </button>

      </header>


      {/* LOCATION */}

      <section className="px-5">

        <div className="
          flex
          items-center
          gap-2
          text-slate-400
          text-sm
        ">

          <MapPin size={16} />

          Monitoring: {location}

        </div>

      </section>


      {/* MAIN ALERT */}

      <section className="p-5">

        <div className="
          disaster-main-card
          rounded-3xl
          p-7
          relative
          overflow-hidden
        ">

          <div className="
            absolute
            -top-10
            -right-10
            text-[150px]
            opacity-10
          ">

            ⚠️

          </div>


          <div className="relative">

            <div className="
              flex
              items-center
              gap-3
            ">

              <ShieldAlert size={32} />

              <div>

                <p className="text-sm opacity-70">
                  CURRENT RISK LEVEL
                </p>

                <h2 className="text-4xl font-bold">
                  {risk}
                </h2>

              </div>

            </div>


            <p className="mt-5 text-sm opacity-80">

              WeatherGPT continuously monitors
              weather and disaster information
              for your selected location.

            </p>

          </div>

        </div>

      </section>


      {/* DISASTER TYPES */}

      <section className="px-5">

        <h2 className="text-xl font-bold mb-4">

          Disaster Monitoring

        </h2>


        <div className="grid grid-cols-2 gap-4">

          <DisasterCard
            icon="🌍"
            title="Earthquake"
            status={
              earthquakes.length > 0
                ? `${earthquakes.length} detected`
                : "No major activity"
            }
          />


          <DisasterCard
            icon="🌪️"
            title="Cyclone"
            status="Monitoring"
          />


          <DisasterCard
            icon="🌊"
            title="Tsunami"
            status="Monitoring"
          />


          <DisasterCard
            icon="🌧️"
            title="Flood"
            status="Monitoring"
          />


          <DisasterCard
            icon="🔥"
            title="Wildfire"
            status="Monitoring"
          />


          <DisasterCard
            icon="⛈️"
            title="Storm"
            status="Monitoring"
          />

        </div>

      </section>


      {/* EARTHQUAKE LIST */}

      <section className="p-5">

        <h2 className="text-xl font-bold mb-4">

          <Activity
            size={20}
            className="inline mr-2"
          />

          Recent Earthquakes

        </h2>


        {loading && (

          <div className="
            glass
            rounded-2xl
            p-8
            text-center
          ">

            <div className="
              text-4xl
              animate-pulse
            ">

              🌍

            </div>

            <p className="text-slate-400 mt-3">

              Checking earthquake activity...

            </p>

          </div>

        )}


        {error && (

          <div className="
            bg-red-500/10
            border border-red-500/30
            p-5
            rounded-2xl
          ">

            {error}

          </div>

        )}


        {!loading &&
          earthquakes.length === 0 &&
          !error && (

          <div className="
            glass
            rounded-2xl
            p-8
            text-center
          ">

            <div className="text-4xl">
              ✅
            </div>

            <p className="mt-3">

              No recent significant earthquakes
              detected in this monitoring area.

            </p>

          </div>

        )}


        <div className="space-y-3">

          {earthquakes.slice(0, 10).map(
            (earthquake) => (

              <div
                key={earthquake.id}
                className="
                  glass
                  rounded-2xl
                  p-5
                "
              >

                <div className="
                  flex
                  justify-between
                  gap-4
                ">

                  <div>

                    <p className="font-semibold">

                      {earthquake.properties.place}

                    </p>


                    <p className="
                      text-xs
                      text-slate-400
                      mt-2
                    ">

                      {new Date(
                        earthquake.properties.time
                      ).toLocaleString()}

                    </p>

                  </div>


                  <div className="
                    text-center
                    bg-red-500/10
                    border border-red-500/20
                    rounded-xl
                    px-4
                    py-2
                  ">

                    <p className="text-xs text-slate-400">

                      MAG

                    </p>

                    <p className="text-xl font-bold">

                      {earthquake.properties.mag}

                    </p>

                  </div>

                </div>

              </div>

            )
          )}

        </div>

      </section>


      {/* SAFETY INSTRUCTIONS */}

      <section className="px-5">

        <div className="
          bg-blue-500/10
          border border-blue-500/20
          rounded-3xl
          p-6
        ">

          <div className="
            flex
            items-center
            gap-3
          ">

            <AlertTriangle
              className="text-blue-400"
            />

            <h2 className="font-bold">

              Emergency Preparation

            </h2>

          </div>


          <ul className="
            mt-4
            space-y-3
            text-sm
            text-slate-300
          ">

            <li>
              • Keep emergency contacts available.
            </li>

            <li>
              • Know your nearest emergency shelter.
            </li>

            <li>
              • Keep water and essential supplies ready.
            </li>

            <li>
              • Follow official government alerts.
            </li>

          </ul>

        </div>

      </section>

    </main>

  );

}


function DisasterCard({

  icon,
  title,
  status,

}: {
  icon: string;
  title: string;
  status: string;
}) {

  return (

    <div className="
      glass
      rounded-2xl
      p-5
      min-h-[140px]
    ">

      <div className="text-3xl">

        {icon}

      </div>


      <h3 className="
        font-semibold
        mt-4
      ">

        {title}

      </h3>


      <p className="
        text-xs
        text-slate-400
        mt-2
      ">

        {status}

      </p>

    </div>

  );
}

