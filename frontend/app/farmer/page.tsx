"use client";

import { useState } from "react";

export default function FarmerPage() {

  const [crop, setCrop] = useState("");
  const [result, setResult] = useState("");

  const analyze = () => {

    if (!crop) return;

    setResult(
      `Weather analysis for ${crop}: 
      Check rainfall, temperature and disaster risks before planting.`
    );

  };

  return (

    <main className="app-background min-h-screen p-5">

      <h1 className="text-3xl font-bold mb-6">
        🌾 Farmer Intelligence
      </h1>


      <div className="glass p-6 rounded-3xl">

        <label>
          Select Crop
        </label>


        <input

          value={crop}

          onChange={(e) =>
            setCrop(e.target.value)
          }

          placeholder="Rice, Wheat, Cotton..."

          className="
            w-full
            p-4
            mt-3
            rounded-xl
            bg-slate-800
          "

        />


        <button

          onClick={analyze}

          className="
            w-full
            mt-4
            p-4
            bg-green-600
            rounded-xl
          "

        >

          Analyze Weather

        </button>


        {result && (

          <div className="mt-5 p-4 bg-slate-800 rounded-xl">

            {result}

          </div>

        )}

      </div>

    </main>

  );

}
