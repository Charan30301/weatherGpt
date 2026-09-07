"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import PermissionSetup from "@/components/PermissionSetup";


const languages = [
  {
    code: "en",
    name: "English",
    flag: "🇬🇧",
  },
  {
    code: "te",
    name: "తెలుగు",
    flag: "🇮🇳",
  },
  {
    code: "hi",
    name: "हिन्दी",
    flag: "🇮🇳",
  },
  {
    code: "ta",
    name: "தமிழ்",
    flag: "🇮🇳",
  },
  {
    code: "kn",
    name: "ಕನ್ನಡ",
    flag: "🇮🇳",
  },
  {
    code: "ml",
    name: "മലയാളം",
    flag: "🇮🇳",
  },
];

export default function LanguagePage() {
  const router = useRouter();

const [showPermissions, setShowPermissions] = useState(false);


  const selectLanguage = (code: string) => {
  // Save selected language
  localStorage.setItem("weathergpt-language", code);

  // Show Terms & Permissions before opening the dashboard
  setShowPermissions(true);
};
if (showPermissions) {
  return (
    <PermissionSetup
      onComplete={() => {
        const code =
          localStorage.getItem("weathergpt-language") || "en";

        router.push(`/dashboard?lang=${code}`);
      }}
    />
  );
}

  return (
<main className="app-background min-h-screen flex items-center justify-center px-5 py-10">
<div className="w-full max-w-2xl rounded-[2rem] bg-slate-950/70 border border-slate-700 p-8 shadow-2xl">
        {/* LOGO */}
        <div className="text-center mb-10">

          <div className="text-7xl mb-5">
            🌍
          </div>

          <h1 className="text-4xl font-bold text-white">
            WeatherGPT
          </h1>

          <p className="text-slate-400 mt-4 text-lg">
            AI Weather & Disaster Intelligence
          </p>

        </div>

        {/* TITLE */}
        <h2 className="text-2xl font-bold text-white mb-6">
          Select your language
        </h2>

        {/* LANGUAGES */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

          {languages.map((language) => (
            <button
              key={language.code}
              onClick={() =>
                selectLanguage(language.code)
              }
              className="
                text-left
                p-7
                rounded-3xl
                bg-slate-800
                border
                border-slate-700
                hover:bg-slate-700
                hover:border-blue-500
                active:scale-95
                transition
              "
            >

              <div className="text-5xl mb-5">
                {language.flag}
              </div>

              <div className="text-xl font-bold text-white">
                {language.name}
              </div>

            </button>
          ))}

        </div>

      </div>
    </main>
  );
}
