"use client";

import { useEffect, useState } from "react";

export default function ForecastPage() {

  const [forecast, setForecast] = useState<any[]>([]);


  useEffect(() => {

    navigator.geolocation.getCurrentPosition(

      async (position) => {

        const lat = position.coords.latitude;
        const lon = position.coords.longitude;


        const response = await fetch(

          `http://127.0.0.1:8000/weather?latitude=${lat}&longitude=${lon}`

        );


        const data = await response.json();


        if (data.daily) {

          const days = data.daily.time.map(
            (date: string, index: number) => ({

              date,

              max:
                data.daily.temperature_2m_max[index],

              min:
                data.daily.temperature_2m_min[index],

              rain:
                data.daily
                  .precipitation_probability_max[index]

            })
          );


          setForecast(days);

        }

      }

    );

  }, []);


  return (

    <main className="app-background min-h-screen p-5">

      <h1 className="text-3xl font-bold mb-6">

        📅 7 Day Forecast

      </h1>


      <div className="space-y-4">

        {forecast.map((day, index) => (

          <div

            key={index}

            className="
              glass
              p-5
              rounded-2xl
              flex
              justify-between
              items-center
            "

          >

            <div>

              <h2>
                {day.date}
              </h2>

              <p className="text-gray-400">
                Rain: {day.rain}%
              </p>

            </div>


            <div className="text-right">

              <div className="text-xl">
                {day.max}°
              </div>

              <div className="text-gray-400">
                {day.min}°
              </div>

            </div>

          </div>

        ))}

      </div>

    </main>

  );

}
