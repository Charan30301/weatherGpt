"use client";

import { useEffect, useState } from "react";
import LocationSearch from "../../components/LocationSearch";
import RouteMap from "../../components/RouteMap";
import WeatherBackground from "../../components/WeatherBackground";
import useLiveLocation from "../../hooks/useLiveLocation";
type Location = {
  latitude: number;
  longitude: number;
  name?: string;
};

type WeatherDay = {
  date: string;
  weather_code: number | null;
  temperature_max: number | null;
  temperature_min: number | null;
  rain_probability: number;
  precipitation: number;
  wind_max: number | null;
};

type TravellerData = {
  current: {
    temperature_2m?: number;
    relative_humidity_2m?: number;
    apparent_temperature?: number;
    precipitation?: number;
    weather_code?: number;
    wind_speed_10m?: number;
    wind_direction_10m?: number;
    visibility?: number;
  };

  history: {
    days: number;
    weather: WeatherDay[];
    summary: {
      rain_days: number;
      hot_days: number;
      cold_days: number;
      thunderstorm_days: number;
      total_precipitation: number;
    };
  };

  forecast: {
    days: number;
    weather: WeatherDay[];
  };

  air_quality: {
    european_aqi: number | null;
    label: string;
    pm2_5: number | null;
  };

  pollen: {
    level: string;
    grass: number | null;
    olive: number | null;
  };

  suggestions: {
    category: string;
    icon: string;
    level: string;
    title: string;
    message: string;
  }[];
};

function weatherLabel(code?: number | null) {
  if (code === undefined || code === null) return "Unknown";

  if (code === 0) return "Clear sky";

  if ([1, 2, 3].includes(code)) {
    return "Partly cloudy";
  }

  if ([45, 48].includes(code)) {
    return "Fog";
  }

  if ([51, 53, 55, 56, 57].includes(code)) {
    return "Drizzle";
  }

  if ([61, 63, 65, 66, 67].includes(code)) {
    return "Rain";
  }

  if ([71, 73, 75, 77].includes(code)) {
    return "Snow";
  }

  if ([80, 81, 82].includes(code)) {
    return "Rain showers";
  }

  if ([85, 86].includes(code)) {
    return "Snow showers";
  }

  if ([95, 96, 99].includes(code)) {
    return "Thunderstorm";
  }

  return "Weather conditions";
}

function weatherIcon(code?: number | null) {
  if (code === undefined || code === null) return "🌡️";

  if (code === 0) return "☀️";

  if ([1, 2, 3].includes(code)) {
    return "⛅";
  }

  if ([45, 48].includes(code)) {
    return "🌫️";
  }

  if ([51, 53, 55, 56, 57].includes(code)) {
    return "🌦️";
  }

  if (
    [61, 63, 65, 66, 67, 80, 81, 82].includes(code)
  ) {
    return "🌧️";
  }

  if ([71, 73, 75, 77, 85, 86].includes(code)) {
    return "❄️";
  }

  if ([95, 96, 99].includes(code)) {
    return "⛈️";
  }

  return "🌤️";
}

function formatDate(date: string) {
  return new Date(`${date}T12:00:00`).toLocaleDateString(
    undefined,
    {
      weekday: "short",
      month: "short",
      day: "numeric",
    }
  );
}

export default function TravellerPage() {
const { location: liveLocation } =
  useLiveLocation(0);
  const [currentLocation, setCurrentLocation] =
    useState<Location | null>(null);

  const [destination, setDestination] =
    useState<Location | null>(null);

  const [weather, setWeather] =
    useState<TravellerData | null>(null);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");
/*
 * Continuously update Traveller Mode location.
 */
useEffect(() => {
  if (!liveLocation) return;

  setCurrentLocation({
    latitude: liveLocation.latitude,
    longitude: liveLocation.longitude,
  });

  console.log(
    "TRAVELLER LIVE LOCATION:",
    liveLocation.latitude,
    liveLocation.longitude
  );
}, [liveLocation]);


  /*
   * Load Traveller weather intelligence
   * for the selected destination.
   *
   * The weather calculations already exist
   * in the FastAPI /traveller endpoint.
   */
  useEffect(() => {
    if (!destination) {
      setWeather(null);
      return;
    }

    const loadWeather = async () => {
      try {
        setLoading(true);
        setError("");

        const params = new URLSearchParams({
          latitude: String(destination.latitude),
          longitude: String(destination.longitude),
        });

        const response = await fetch(
          `http://127.0.0.1:8000/traveller?${params.toString()}`
        );

        if (!response.ok) {
          throw new Error(
            `Backend returned ${response.status}`
          );
        }

        const data = await response.json();

        if (data.error) {
          throw new Error(data.error);
        }

        setWeather(data);
      } catch (err) {
        console.error(
          "Traveller weather error:",
          err
        );

        setError(
          "Unable to load destination weather."
        );

        setWeather(null);
      } finally {
        setLoading(false);
      }
    };

    loadWeather();
  }, [destination]);

return (
  <WeatherBackground
    weatherCode={weather?.current?.weather_code}
  >
    <main className="min-h-screen">
      <div className="mx-auto max-w-7xl">

        {/* HEADER */}

        <div className="mb-6">
          <p className="text-sm font-medium text-sky-400">
            ✈️ WEATHERGPT
          </p>

          <h1 className="mt-1 text-3xl font-bold md:text-4xl">
            Traveller Mode
          </h1>

          <p className="mt-2 max-w-2xl text-sm text-slate-400">
            Plan your journey using current weather,
            recent conditions, forecast risks, air
            quality and route information.
          </p>
        </div>

        {/* DESTINATION SEARCH */}

        <section className="mb-6 rounded-2xl border border-slate-800 bg-slate-900 p-4">

          <label className="mb-2 block text-sm font-medium text-slate-300">
            Where are you travelling?
          </label>

          <LocationSearch
            onLocationSelect={(location) => {
              const selected = {
                latitude: location.latitude,
                longitude: location.longitude,
                name:
                  location.name ||
                  "Destination",
              };

              setDestination(selected);

              localStorage.setItem(
                "weathergpt-latitude",
                String(location.latitude)
              );

              localStorage.setItem(
                "weathergpt-longitude",
                String(location.longitude)
              );

              localStorage.setItem(
                "weathergpt-location-name",
                selected.name || "Destination"
              );
            }}
          />

        </section>

        {/* ERROR */}

        {error && (
          <div className="mb-6 rounded-xl border border-red-900 bg-red-950/40 p-4 text-sm text-red-300">
            {error}
          </div>
        )}

        {/* ROUTE MAP */}

        {destination && (
          <section className="mb-6 overflow-hidden rounded-2xl border border-slate-800 bg-slate-900">

            <div className="border-b border-slate-800 p-4">

              <h2 className="text-lg font-semibold">
                🗺️ Route to{" "}
                {destination.name || "Destination"}
              </h2>

              <p className="mt-1 text-xs text-slate-400">
                {currentLocation
                  ? "Current GPS location → destination"
                  : "Waiting for current GPS location..."}
              </p>

            </div>

            <RouteMap
              currentLocation={currentLocation}
              destination={destination}
            />

          </section>
        )}

        {/* LOADING */}

        {loading && (
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-8 text-center text-slate-400">
            Loading destination weather
            intelligence...
          </div>
        )}

        {/* WEATHER DATA */}

        {weather && !loading && (
          <>

            {/* CURRENT CONDITIONS */}

            <section className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
                <p className="text-sm text-slate-400">Current temperature</p>
                <p className="mt-2 text-3xl font-bold">
                  {weather.current.temperature_2m ?? "--"}°C
                </p>
                <p className="mt-1 text-sm text-slate-400">
                  {weatherLabel(weather.current.weather_code)}
                </p>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
                <p className="text-sm text-slate-400">Humidity</p>
                <p className="mt-2 text-3xl font-bold">
                  {weather.current.relative_humidity_2m ?? "--"}%
                </p>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
                <p className="text-sm text-slate-400">Wind</p>
                <p className="mt-2 text-3xl font-bold">
                  {weather.current.wind_speed_10m ?? "--"}
                </p>
                <p className="text-sm text-slate-400">km/h</p>
              </div>
              </section>
              <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
                <p className="text-sm text-slate-400">AQI</p>
                <p className="mt-2 text-3xl font-bold">
                  {weather.air_quality.european_aqi ?? "--"}
                </p>
                <p className="text-sm text-slate-400">
                  {weather.air_quality.label}
                </p>
              </div>

            <section className="mb-6 rounded-2xl border border-slate-800 bg-slate-900 p-5">
              <h2 className="text-xl font-semibold">
                📊 Last 7 Days
              </h2>

              <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-5">
                <Stat
                  label="Rain days"
                  value={weather.history.summary.rain_days}
                />
                <Stat
                  label="Hot days"
                  value={weather.history.summary.hot_days}
                />
                <Stat
                  label="Cold days"
                  value={weather.history.summary.cold_days}
                />
                <Stat
                  label="Thunderstorms"
                  value={weather.history.summary.thunderstorm_days}
                />
                <Stat
                  label="Rainfall"
                  value={`${weather.history.summary.total_precipitation} mm`}
                />
              </div>

              <div className="mt-5 grid gap-3 md:grid-cols-2 lg:grid-cols-4">
                {weather.history.weather.map((day) => (
                  <WeatherDayCard key={day.date} day={day} />
                ))}
              </div>
            </section>

            <section className="mb-6 rounded-2xl border border-slate-800 bg-slate-900 p-5">
              <h2 className="text-xl font-semibold">
                🔮 Today + Next 7 Days
              </h2>

              <div className="mt-4 grid gap-3 md:grid-cols-2 lg:grid-cols-4">
                {weather.forecast.weather.map((day) => (
                  <WeatherDayCard key={day.date} day={day} />
                ))}
              </div>
            </section>

            <section className="mb-6 grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
                <h2 className="text-xl font-semibold">
                  🌿 Air & Pollen
                </h2>

                <div className="mt-4 space-y-3 text-sm">
                  <p>
                    <span className="text-slate-400">Air quality: </span>
                    {weather.air_quality.label}
                  </p>

                  <p>
                    <span className="text-slate-400">PM2.5: </span>
                    {weather.air_quality.pm2_5 ?? "--"}
                  </p>

                  <p>
                    <span className="text-slate-400">Pollen: </span>
                    {weather.pollen.level}
                  </p>

                  <p>
                    <span className="text-slate-400">Grass pollen: </span>
                    {weather.pollen.grass ?? "--"}
                  </p>

                  <p>
                    <span className="text-slate-400">Olive pollen: </span>
                    {weather.pollen.olive ?? "--"}
                  </p>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
                <h2 className="text-xl font-semibold">
                  🧠 Travel Suggestions
                </h2>

                <div className="mt-4 space-y-3">
                  {weather.suggestions.map((suggestion, index) => (
                    <div
                      key={`${suggestion.title}-${index}`}
                      className="rounded-xl border border-slate-800 bg-slate-950 p-4"
                    >
                      <div className="flex gap-3">
                        <span className="text-2xl">
                          {suggestion.icon}
                        </span>

                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="font-semibold">
                              {suggestion.title}
                            </h3>

                            <span className="rounded-full bg-slate-800 px-2 py-0.5 text-xs text-slate-300">
                              {suggestion.level}
                            </span>
                          </div>

                          <p className="mt-1 text-sm text-slate-400">
                            {suggestion.message}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </>
        )}
      </div>
    </main>
</WeatherBackground>
  );

}

function Stat({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="rounded-xl bg-slate-950 p-4">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="mt-1 text-xl font-bold">{value}</p>
    </div>
  );
}

function WeatherDayCard({
  day,
}: {
  day: WeatherDay;
}) {
  return (
    <div className="rounded-xl bg-slate-950 p-4">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-medium">
          {formatDate(day.date)}
        </p>

        <span className="text-2xl">
          {weatherIcon(day.weather_code)}
        </span>
      </div>

      <p className="mt-2 text-sm text-slate-400">
        {weatherLabel(day.weather_code)}
      </p>

      <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
        <div>
          <span className="text-slate-500">High</span>
          <p className="font-semibold">
            {day.temperature_max ?? "--"}°C
          </p>
        </div>

        <div>
          <span className="text-slate-500">Low</span>
          <p className="font-semibold">
            {day.temperature_min ?? "--"}°C
          </p>
        </div>

        <div>
          <span className="text-slate-500">Rain</span>
          <p className="font-semibold">
            {day.rain_probability ?? 0}%
          </p>
        </div>

        <div>
          <span className="text-slate-500">Wind</span>
          <p className="font-semibold">
            {day.wind_max ?? "--"} km/h
          </p>
        </div>
      </div>
    </div>
  );
}
