"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const languages = [
  { name: "English", code: "en", flag: "🇬🇧" },
  { name: "తెలుగు", code: "te", flag: "🇮🇳" },
  { name: "हिन्दी", code: "hi", flag: "🇮🇳" },
  { name: "தமிழ்", code: "ta", flag: "🇮🇳" },
  { name: "ಕನ್ನಡ", code: "kn", flag: "🇮🇳" },
  { name: "മലയാളം", code: "ml", flag: "🇮🇳" },
];

export default function Home() {

  const router = useRouter();

  const [selectedLanguage, setSelectedLanguage] = useState("");

  useEffect(() => {

    const savedLanguage = localStorage.getItem("weathergpt-language");

    if (savedLanguage) {
      router.push("/dashboard");
    }

  }, [router]);


  const selectLanguage = (language: string) => {

    localStorage.setItem(
      "weathergpt-language",
      language
    );

    setSelectedLanguage(language);

    setTimeout(() => {
      router.push("/dashboard");
    }, 500);

  };


  return (

    <main className="app-background min-h-screen flex items-center justify-center p-5">

      <div className="glass w-full max-w-md rounded-3xl p-8">

        <div className="text-center mb-8">

          <div className="text-6xl mb-4">
            🌍
          </div>

          <h1 className="text-4xl font-bold">
            WeatherGPT
          </h1>

          <p className="text-gray-400 mt-2">
            AI Weather & Disaster Intelligence
          </p>

        </div>


        <h2 className="text-xl font-semibold mb-5">
          Select your language
        </h2>


        <div className="grid grid-cols-2 gap-3">

          {languages.map((language) => (

            <button
              key={language.code}

              onClick={() =>
                selectLanguage(language.code)
              }

              className={`
                p-4 rounded-xl
                bg-slate-800
                hover:bg-blue-600
                transition
                text-left
                ${selectedLanguage === language.code
                  ? "bg-blue-600"
                  : ""
                }
              `}
            >

              <div className="text-2xl">
                {language.flag}
              </div>

              <div className="mt-2">
                {language.name}
              </div>

            </button>

          ))}

        </div>

      </div>

    </main>

  );

}
