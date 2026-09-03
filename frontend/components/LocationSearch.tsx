"use client";

import { useState } from "react";
import { Search, MapPin, Loader2 } from "lucide-react";

interface LocationData {
  name: string;
  latitude: number;
  longitude: number;
  country?: string;
  admin1?: string;
}

interface LocationSearchProps {
  onLocationSelect: (location: LocationData) => void;
    placeholder?: string;
}

export default function LocationSearch({
  onLocationSelect,
  placeholder = "Search city, town, village, area...",
}: LocationSearchProps) {

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<LocationData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const searchLocation = async () => {

    const searchText = query.trim();

    if (!searchText) {
      setError("Please enter a location");
      return;
    }

    setLoading(true);
    setError("");
    setResults([]);

    try {

      const url =
        `https://geocoding-api.open-meteo.com/v1/search` +
        `?name=${encodeURIComponent(searchText)}` +
        `&count=10` +
        `&language=en` +
        `&format=json`;

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error("Location search failed");
      }

      const data = await response.json();

      if (!data.results || data.results.length === 0) {
        setError("Location not found");
        return;
      }

      setResults(data.results);

    } catch (err) {

      console.error("Location search error:", err);

      setError(
        "Unable to search location. Check your internet connection."
      );

    } finally {

      setLoading(false);

    }
  };


  const selectLocation = (location: LocationData) => {

    onLocationSelect(location);

    setQuery(
      `${location.name}${location.country ? ", " + location.country : ""}`
    );

    setResults([]);
    setError("");
  };


  const handleKeyDown = (
    event: React.KeyboardEvent<HTMLInputElement>
  ) => {

    if (event.key === "Enter") {
      searchLocation();
    }

  };


  return (

    <div className="relative w-full">

      {/* SEARCH BOX */}

      <div className="
        flex
        items-center
        gap-3
        p-3
        rounded-3xl
        bg-slate-950/70
        border
        border-slate-700
        shadow-xl
      ">

        <Search
          size={25}
          className="text-slate-400 ml-2"
        />

        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="
            flex-1
            bg-transparent
            outline-none
            text-white
            placeholder:text-slate-500
            text-base
            min-w-0
          "
        />

        <button
          onClick={searchLocation}
          disabled={loading}
          className="
            px-6
            py-4
            rounded-2xl
            bg-blue-600
            hover:bg-blue-500
            active:scale-95
            transition
            font-bold
            text-white
            disabled:opacity-50
          "
        >

          {loading ? (
            <Loader2
              size={22}
              className="animate-spin"
            />
          ) : (
            "Search"
          )}

        </button>

      </div>


      {/* ERROR */}

      {error && (

        <div className="
          mt-3
          p-3
          rounded-xl
          bg-red-500/10
          border
          border-red-500/30
          text-red-300
          text-sm
        ">

          {error}

        </div>

      )}


      {/* SEARCH RESULTS */}

      {results.length > 0 && (

        <div className="
          absolute
          top-full
          left-0
          right-0
          mt-2
          z-50
          rounded-2xl
          overflow-hidden
          bg-slate-950
          border
          border-slate-700
          shadow-2xl
        ">

          {results.map((location, index) => (

            <button
              key={`${location.latitude}-${location.longitude}-${index}`}
              onClick={() => selectLocation(location)}
              className="
                w-full
                flex
                items-center
                gap-3
                p-4
                text-left
                hover:bg-slate-800
                border-b
                border-slate-800
                transition
              "
            >

              <div className="
                w-10
                h-10
                rounded-full
                bg-blue-500/10
                flex
                items-center
                justify-center
                flex-shrink-0
              ">

                <MapPin
                  size={20}
                  className="text-blue-400"
                />

              </div>


              <div>

                <p className="font-semibold text-white">

                  {location.name}

                </p>

                <p className="
                  text-xs
                  text-slate-400
                  mt-1
                ">

                  {location.admin1
                    ? `${location.admin1}, `
                    : ""
                  }

                  {location.country || ""}

                </p>

              </div>

            </button>

          ))}

        </div>

      )}

    </div>

  );

}

