"use client";

import { useState } from "react";
import { Search, Loader2 } from "lucide-react";

interface LocationResult {
  id?: number;
  name: string;
  latitude: number;
  longitude: number;
  country?: string;
  admin1?: string;
}

interface SearchBarProps {
  onLocationSelect: (location: LocationResult) => void;
}

export default function SearchBar({
  onLocationSelect,
}: SearchBarProps) {

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<LocationResult[]>([]);
  const [loading, setLoading] = useState(false);


  const searchLocation = async () => {

    if (!query.trim()) return;

    setLoading(true);

    try {

      const response = await fetch(
        `http://127.0.0.1:8000/search-location?query=${encodeURIComponent(query)}`
      );

      const data = await response.json();

      setResults(data.results || []);

    } catch (error) {

      console.error("Search error:", error);

    } finally {

      setLoading(false);

    }

  };


  const selectLocation = (location: LocationResult) => {

    setQuery(
      `${location.name}${location.country ? ", " + location.country : ""}`
    );

    setResults([]);

    onLocationSelect(location);

  };


  return (

    <div className="relative w-full">

      <div className="
        flex items-center
        bg-slate-900/80
        backdrop-blur-xl
        border border-slate-700
        rounded-2xl
        overflow-hidden
      ">

        <input
          value={query}

          onChange={(e) => setQuery(e.target.value)}

          onKeyDown={(e) => {
            if (e.key === "Enter") {
              searchLocation();
            }
          }}

          placeholder="Search city, country or place..."

          className="
            flex-1
            bg-transparent
            p-4
            outline-none
            text-white
          "
        />

        <button
          onClick={searchLocation}
          className="
            bg-blue-600
            p-4
            m-1
            rounded-xl
            hover:bg-blue-500
            transition
          "
        >

          {loading ? (
            <Loader2 className="animate-spin" size={20} />
          ) : (
            <Search size={20} />
          )}

        </button>

      </div>


      {/* Search Results */}

      {results.length > 0 && (

        <div className="
          absolute top-full mt-2
          w-full
          bg-slate-950
          border border-slate-700
          rounded-2xl
          overflow-hidden
          shadow-2xl
          z-30
        ">

          {results.map((location, index) => (

            <button
              key={`${location.name}-${index}`}

              onClick={() => selectLocation(location)}

              className="
                block w-full text-left
                p-4
                hover:bg-slate-800
                border-b border-slate-800
                last:border-none
              "
            >

              <p className="font-medium">
                📍 {location.name}
              </p>

              <p className="text-sm text-slate-400 mt-1">

                {location.admin1 && `${location.admin1}, `}
                {location.country}

              </p>

            </button>

          ))}

        </div>

      )}

    </div>

  );
}
