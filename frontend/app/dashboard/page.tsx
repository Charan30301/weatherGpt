"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import Link from "next/link";

import Forecast from "../../components/Forecast";
import WeatherBackground from "../../components/WeatherBackground";
import FarmerIntelligence from "../../components/FarmerIntelligence";
import EmergencyAlert from "@/components/EmergencyAlert";
import DisasterAlerts from "../../components/DisasterAlerts";
import {
  Menu,
  Settings,
  Navigation,
  MapPin,
  Wind,
  Droplets,
  Eye,
} from "lucide-react";

import Sidebar from "../../components/Sidebar";
import LocationSearch from "../../components/LocationSearch";
import Globe from "../../components/Globe";


const WeatherMap = dynamic(
  () => import("../../components/WeatherMap"),
  {
    ssr: false,
  }
);


interface LocationData {
  name: string;
  latitude: number;
  longitude: number;
  country?: string;
  admin1?: string;
}


const translations = {
  en: {
    title: "WeatherGPT",
    subtitle: "AI Weather Intelligence",
    search: "Search city, town, village, area...",
    currentLocation: "Use Current Location",
    locationMap: "LocationMap",
    currentWeather: "Current Weather",
    humidity: "Humidity",
    wind: "Wind",
    visibility: "Visibility",
    quickFeatures: "Quick Features",
    forecast: "7-Day Forecast",
    farmer: "Farmer Intelligence",
    disasters: "Disaster Alerts",
    traveller: "Travel Intelligence",
    chat: "Ask WeatherGPT",
  },

  te: {
    title: "వెదర్GPT",
    subtitle: "AI వాతావరణ సమాచారం",
    search: "నగరం, పట్టణం, గ్రామం లేదా ప్రాంతం వెతకండి...",
    currentLocation: "ప్రస్తుత స్థానాన్ని ఉపయోగించండి",
    locationMap: "స్థాన మ్యాప్",
    currentWeather: "ప్రస్తుత వాతావరణం",
    humidity: "తేమ",
    wind: "గాలి",
    visibility: "దృశ్యమానత",
    quickFeatures: "త్వరిత ఫీచర్లు",
    forecast: "7 రోజుల వాతావరణ సూచన",
    farmer: "రైతు సమాచారం",
    disasters: "విపత్తు హెచ్చరికలు",
    traveller: "ప్రయాణ సమాచారం",
    chat: "WeatherGPT ని అడగండి",
  },

  hi: {
    title: "WeatherGPT",
    subtitle: "AI मौसम जानकारी",
    search: "शहर, कस्बा, गांव या क्षेत्र खोजें...",
    currentLocation: "वर्तमान स्थान का उपयोग करें",
    locationMap: "स्थान मानचित्र",
    currentWeather: "वर्तमान मौसम",
    humidity: "नमी",
    wind: "हवा",
    visibility: "दृश्यता",
    quickFeatures: "त्वरित सुविधाएं",
    forecast: "7 दिन का पूर्वानुमान",
    farmer: "किसान जानकारी",
    disasters: "आपदा चेतावनी",
    traveller: "यात्रा जानकारी",
    chat: "WeatherGPT से पूछें",
  },

  ta: {
    title: "WeatherGPT",
    subtitle: "AI வானிலை தகவல்",
    search: "நகரம், ஊர், கிராமம் அல்லது பகுதியை தேடுங்கள்...",
    currentLocation: "தற்போதைய இருப்பிடத்தைப் பயன்படுத்தவும்",
    locationMap: "இருப்பிட வரைபடம்",
    currentWeather: "தற்போதைய வானிலை",
    humidity: "ஈரப்பதம்",
    wind: "காற்று",
    visibility: "தெரிவுநிலை",
    quickFeatures: "விரைவு அம்சங்கள்",
    forecast: "7 நாள் வானிலை முன்னறிவிப்பு",
    farmer: "விவசாய தகவல்",
    disasters: "பேரிடர் எச்சரிக்கைகள்",
    traveller: "பயண தகவல்",
    chat: "WeatherGPT-யிடம் கேளுங்கள்",
  },

  kn: {
    title: "WeatherGPT",
    subtitle: "AI ಹವಾಮಾನ ಮಾಹಿತಿ",
    search: "ನಗರ, ಪಟ್ಟಣ, ಗ್ರಾಮ ಅಥವಾ ಪ್ರದೇಶವನ್ನು ಹುಡುಕಿ...",
    currentLocation: "ಪ್ರಸ್ತುತ ಸ್ಥಳವನ್ನು ಬಳಸಿ",
    locationMap: "ಸ್ಥಳ ನಕ್ಷೆ",
    currentWeather: "ಪ್ರಸ್ತುತ ಹವಾಮಾನ",
    humidity: "ತೇವಾಂಶ",
    wind: "ಗಾಳಿ",
    visibility: "ಗೋಚರತೆ",
    quickFeatures: "ತ್ವರಿತ ವೈಶಿಷ್ಟ್ಯಗಳು",
    forecast: "7 ದಿನಗಳ ಹವಾಮಾನ ಮುನ್ಸೂಚನೆ",
    farmer: "ರೈತ ಮಾಹಿತಿ",
    disasters: "ವಿಪತ್ತು ಎಚ್ಚರಿಕೆಗಳು",
    traveller: "ಪ್ರಯಾಣ ಮಾಹಿತಿ",
    chat: "WeatherGPT ಅನ್ನು ಕೇಳಿ",
  },

  ml: {
    title: "WeatherGPT",
    subtitle: "AI കാലാവസ്ഥാ വിവരങ്ങൾ",
    search: "നഗരം, പട്ടണം, ഗ്രാമം അല്ലെങ്കിൽ പ്രദേശം തിരയുക...",
    currentLocation: "നിലവിലെ സ്ഥാനം ഉപയോഗിക്കുക",
    locationMap: "സ്ഥാന മാപ്പ്",
    currentWeather: "നിലവിലെ കാലാവസ്ഥ",
    humidity: "ഈർപ്പം",
    wind: "കാറ്റ്",
    visibility: "ദൃശ്യപരത",
    quickFeatures: "ദ്രുത ഫീച്ചറുകൾ",
    forecast: "7 ദിവസത്തെ കാലാവസ്ഥാ പ്രവചനം",
    farmer: "കർഷക വിവരങ്ങൾ",
    disasters: "ദുരന്ത മുന്നറിയിപ്പുകൾ",
    traveller: "യാത്രാ വിവരങ്ങൾ",
    chat: "WeatherGPT-യോട് ചോദിക്കുക",
  },
};

type LanguageCode = keyof typeof translations;
function getWeatherIcon(code?: number | null) {
  if (code === undefined || code === null) return "🌡️";

  if (code === 0) return "☀️";
  if ([1, 2, 3].includes(code)) return "⛅";
  if ([45, 48].includes(code)) return "🌫️";
  if ([51, 53, 55, 56, 57].includes(code)) return "🌦️";
  if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return "🌧️";
  if ([71, 73, 75, 77, 85, 86].includes(code)) return "❄️";
  if ([95, 96, 99].includes(code)) return "⛈️";

  return "🌤️";
}
export default function Dashboard() {
const searchParams = useSearchParams();

const [language, setLanguage] = useState("en");

useEffect(() => {
  const urlLanguage = searchParams.get("lang");
  const savedLanguage = localStorage.getItem(
    "weathergpt-language"
  );

  const selectedLanguage =
    urlLanguage || savedLanguage || "en";

  setLanguage(selectedLanguage);

  localStorage.setItem(
    "weathergpt-language",
    selectedLanguage
  );
}, [searchParams]);

const t =
  translations[language as LanguageCode] ||
  translations.en;
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [locationName, setLocationName] =
    useState("Your Location");

  const [coordinates, setCoordinates] =
    useState({
      latitude: 0,
      longitude: 0,
    });

  const [weather, setWeather] =
    useState<any>(null);

  const [loading, setLoading] =
    useState(true);
const [emergencyAlert, setEmergencyAlert] = useState<{
title: string;
message: string;
severity: "warning" | "danger";
} | null>(null);
const [emergencyType, setEmergencyType] =
  useState("");

  // FETCH WEATHER

  const fetchWeather = async (
    latitude: number,
    longitude: number
  ) => {

    setLoading(true);

    try {

      const response = await fetch(
        `http://localhost:8000/weather?latitude=${latitude}&longitude=${longitude}`
      );

      const data = await response.json();

      setWeather(data);

    } catch (error) {

      console.error("Weather error:", error);

    } finally {

      setLoading(false);

    }

  };


  // GET CURRENT LOCATION

  const getCurrentLocation = () => {

    if (!navigator.geolocation) {

      alert("Geolocation is not supported.");

      setLoading(false);

      return;

    }


    setLoading(true);


    navigator.geolocation.getCurrentPosition(

      (position) => {

        const latitude =
          position.coords.latitude;

        const longitude =
          position.coords.longitude;
console.log(
  "GPS coordinates:",
  latitude,
  longitude
);

        setCoordinates({
          latitude,
          longitude,
        });
        localStorage.setItem(
  "weathergpt-coordinates",
  JSON.stringify({
    latitude,
    longitude,
  })
);

        setLocationName("Current Location");


        fetchWeather(
          latitude,
          longitude
        );

      },


      () => {

        alert(
          "Location permission denied. Please enable location access."
        );

        setLoading(false);

      }

    );

  };


  // LOCATION SEARCH SELECT

  const handleLocationSelect = (
    location: LocationData
  ) => {

    const fullLocationName =
      `${location.name}${
        location.country
          ? ", " + location.country
          : ""
      }`;


    setLocationName(
      fullLocationName
    );


    setCoordinates({
      latitude: location.latitude,
      longitude: location.longitude,
    });


    fetchWeather(
      location.latitude,
      location.longitude
    );

  };


  // AUTO LOAD LOCATION

  useEffect(() => {

    getCurrentLocation();

  }, []);


  // WEATHER VALUES

  const temperature =
    weather?.current?.temperature_2m;

  const humidity =
    weather?.current?.relative_humidity_2m;

  const wind =
    weather?.current?.wind_speed_10m;
const detectEmergencyType = (
    title: string,
    message: string
  ) => {

    const text =
      `${title} ${message}`.toLowerCase();

    if (
      text.includes("flood") ||
      text.includes("flooding")
    ) {
      return "flood";
    }

    if (
      text.includes("cyclone") ||
      text.includes("hurricane")
    ) {
      return "cyclone";
    }

    if (text.includes("tsunami")) {
      return "tsunami";
    }

    if (
      text.includes("earthquake") ||
      text.includes("seismic")
    ) {
      return "earthquake";
    }

    if (text.includes("tornado")) {
      return "tornado";
    }

    if (
      text.includes("volcano") ||
      text.includes("volcanic")
    ) {
      return "volcano";
    }

    if (
      text.includes("glacier") ||
      text.includes("ice avalanche")
    ) {
      return "glacier";
    }

    return "";
  };

return (
<WeatherBackground
  weatherCode={weather?.current?.weather_code}
  emergencyType={emergencyType}
>
<main className="min-h-screen pb-28 text-white">
      {/* SIDEBAR */}

      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />


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

        <button
          onClick={() => setSidebarOpen(true)}
          className="
            p-3
            rounded-xl
bg-slate-950/25 backdrop-blur-sm
            border
            border-slate-700
          "
        >

          <Menu size={22} />

        </button>


        <div className="text-center">

<h1 className="font-bold text-lg">
  {t.title}
</h1>

<p className="text-xs text-slate-400">
  {t.subtitle}
</p>
        </div>


        <Link
          href="/settings"
          className="
            p-3
            rounded-xl
bg-slate-950/25 backdrop-blur-sm
            border
            border-slate-700
          "
        >

          <Settings size={21} />

        </Link>

      </header>


      {/* LOCATION SEARCH */}

      <section className="px-5 mt-2">

        <LocationSearch
          onLocationSelect={handleLocationSelect}
          placeholder={t.search}        
/>

      </section>


      {/* CURRENT LOCATION */}

      <section
        className="
          px-5
          mt-4
          flex
          justify-center
        "
      >

        <button
          onClick={getCurrentLocation}
          className="
            flex
            items-center
            gap-2
            px-5
            py-3
            rounded-full
            bg-blue-600/15
            border
            border-blue-500/30
            text-blue-300
          "
        >

          <Navigation size={17} />

{t.currentLocation}
        </button>

      </section>

{/* GLOBE */}

<section
  className="
    min-h-[390px]
    flex
    items-center
    justify-center
    px-5
  "
>
<Globe
  locationName={locationName}
  latitude={coordinates.latitude}
  longitude={coordinates.longitude}
/>



</section>

{/* INTERACTIVE MAP */}
      {coordinates.latitude !== 0 &&
        coordinates.longitude !== 0 && (

          <section className="px-5 mb-6">

<h2 className="text-lg font-bold mb-3">
  {t.locationMap}
</h2>
            <WeatherMap
              latitude={coordinates.latitude}
              longitude={coordinates.longitude}
              locationName={locationName}
            />

          </section>

        )}


      {/* WEATHER CARD */}

      <section className="px-5">

        <div
          className="
            glass
            rounded-3xl
            p-6
            relative
            overflow-hidden
          "
        >

          {/* BACKGROUND GLOW */}

          <div
            className="
              absolute
              -top-20
              -right-20
              w-40
              h-40
              bg-blue-500/20
              rounded-full
              blur-3xl
            "
          />


          <div className="relative">


            {/* LOCATION */}

            <div
              className="
                flex
                items-center
                gap-2
                text-slate-400
              "
            >

              <MapPin size={18} />

              {locationName}

            </div>


            {loading ? (

              <div className="py-10 text-center">

                <div className="text-4xl animate-pulse">
                  🌍
                </div>

                <p className="mt-3 text-slate-400">
                  Loading weather...
                </p>

              </div>

            ) : (

              <>


                {/* TEMPERATURE */}

                <div
                  className="
                    flex
                    items-end
                    justify-between
                    mt-5
                  "
                >

                  <div>

                    <div
                      className="
                        text-7xl
                        font-bold
                      "
                    >

                      {temperature ?? "--"}°

                    </div>


                    <p
                      className="
                        text-slate-400
                        mt-2
                      "
                    >

                      Real-time weather data

                    </p>

                  </div>

<div className="text-6xl">
  {getWeatherIcon(weather?.current?.weather_code)}
</div>

                </div>


                {/* WEATHER STATS */}

                <div
                  className="
                    grid
                    grid-cols-3
                    gap-3
                    mt-7
                  "
                >


                  {/* HUMIDITY */}

                  <div
                    className="
bg-slate-950/20 backdrop-blur-sm
                      rounded-2xl
                      p-3
                    "
                  >

                    <Droplets
                      size={18}
                      className="text-blue-400"
                    />

                    <p
                      className="
                        text-xs
                        text-slate-400
                        mt-2
                      "
                    >
                      Humidity
                    </p>

                    <p className="font-bold">

                      {humidity ?? "--"}%

                    </p>

                  </div>


                  {/* WIND */}

                  <div
                    className="
bg-slate-950/20 backdrop-blur-sm
                      rounded-2xl
                      p-3
                    "
                  >

                    <Wind
                      size={18}
                      className="text-cyan-400"
                    />

                    <p
                      className="
                        text-xs
                        text-slate-400
                        mt-2
                      "
                    >
                      Wind
                    </p>

                    <p className="font-bold">

                      {wind ?? "--"}

                    </p>

                  </div>


                  {/* LATITUDE */}

                  <div
                    className="
bg-slate-950/20 backdrop-blur-sm
                      rounded-2xl
                      p-3
                    "
                  >

                    <Eye
                      size={18}
                      className="text-purple-400"
                    />

                    <p
                      className="
                        text-xs
                        text-slate-400
                        mt-2
                      "
                    >
                      Lat
                    </p>

                    <p className="font-bold text-xs">

                      {coordinates.latitude
                        ? coordinates.latitude.toFixed(2)
                        : "--"}

                    </p>

                  </div>

                </div>

              </>

            )}

          </div>

        </div>

      </section>

<Forecast
  key={`${coordinates.latitude}-${coordinates.longitude}`}
  latitude={coordinates.latitude}
  longitude={coordinates.longitude}
/>

<FarmerIntelligence
  latitude={coordinates.latitude}
  longitude={coordinates.longitude}
/>

<DisasterAlerts
  latitude={coordinates.latitude}
  longitude={coordinates.longitude}
  onEmergency={(title, message, severity) => {

    setEmergencyAlert({
      title,
      message,
      severity,
    });

    const detectedType =
      detectEmergencyType(
        title,
        message
      );

    setEmergencyType(
      detectedType
    );
  }}
/>


      {/* QUICK FEATURES */}

      <section
        className="
          grid
          grid-cols-2
          gap-4
          p-5
        "
      >


        <Link
          href="/forecast"
          className="feature-card"
        >

          <span className="text-3xl">
            📅
          </span>

          <h3>
            7 Day Forecast
          </h3>

          <p>
            Weekly weather
          </p>

        </Link>


        <Link
          href="/traveller"
          className="feature-card"
        >

          <span className="text-3xl">
            ✈️
          </span>

          <h3>
            Traveller
          </h3>

          <p>
            Travel weather
          </p>

        </Link>


        <Link
          href="/farmer"
          className="feature-card"
        >

          <span className="text-3xl">
            🌾
          </span>

          <h3>
            Farmer
          </h3>

          <p>
            Crop intelligence
          </p>

        </Link>


        <Link
          href="/disasters"
          className="feature-card"
        >

          <span className="text-3xl">
            🚨
          </span>

          <h3>
            Disaster Center
          </h3>

          <p>
            Risk monitoring
          </p>

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
          shadow-[0_0_35px_rgba(37,99,235,0.6)]
          z-30
          hover:scale-110
          transition
        "
      >

        🤖

      </Link>
{/* EMERGENCY ALERT */}

      <EmergencyAlert
        open={emergencyAlert !== null}
        title={emergencyAlert?.title || ""}
        message={emergencyAlert?.message || ""}
        severity={emergencyAlert?.severity || "danger"}
        onShelters={() => {
          window.location.href = "/shelters";
        }}
        onClose={() => {
          setEmergencyAlert(null);
        }}
      />
        </main>
  </WeatherBackground>
);
}
