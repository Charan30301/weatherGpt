"use client";

import { useEffect, useState } from "react";
import { Bell, Check, MapPin, ShieldAlert, FileText } from "lucide-react";

type PermissionSetupProps = {
  language: string;
  onComplete: () => void;
};

export default function PermissionSetup({
  language,
  onComplete,
}: PermissionSetupProps) {
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [locationAllowed, setLocationAllowed] = useState(false);
  const [notificationsAllowed, setNotificationsAllowed] = useState(false);
  const [warningAlerts, setWarningAlerts] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const savedTerms =
      localStorage.getItem("weathergpt-terms-accepted") === "true";

    const savedWarnings =
      localStorage.getItem("weathergpt-warning-alerts") !== "false";

    setTermsAccepted(savedTerms);
    setWarningAlerts(savedWarnings);
  }, []);

  const requestLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by this browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords;

        localStorage.setItem(
          "weathergpt-location",
          JSON.stringify({
            latitude,
            longitude,
            accuracy,
            timestamp: Date.now(),
          })
        );

        setLocationAllowed(true);
      },
      () => {
        setLocationAllowed(false);
        alert(
          "Location permission was denied. You can enable it later from browser settings."
        );
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      }
    );
  };

  const requestNotifications = async () => {
    if (!("Notification" in window)) {
      alert("Notifications are not supported by this browser.");
      return;
    }

    const permission = await Notification.requestPermission();

    setNotificationsAllowed(permission === "granted");

    localStorage.setItem(
      "weathergpt-notifications",
      permission === "granted" ? "true" : "false"
    );
  };

  const acceptTerms = () => {
    setTermsAccepted(true);
    localStorage.setItem("weathergpt-terms-accepted", "true");
  };

  const toggleWarnings = () => {
    const newValue = !warningAlerts;

    setWarningAlerts(newValue);

    localStorage.setItem(
      "weathergpt-warning-alerts",
      String(newValue)
    );
  };

  const continueToWeatherGPT = () => {
    if (!termsAccepted) {
      alert("Please accept the Terms & Conditions first.");
      return;
    }

    setLoading(true);

    localStorage.setItem(
      "weathergpt-permissions-completed",
      "true"
    );

    localStorage.setItem(
      "weathergpt-warning-alerts",
      String(warningAlerts)
    );

    onComplete();
  };

  const languageName =
    language === "te"
      ? "తెలుగు"
      : language === "hi"
      ? "हिन्दी"
      : language === "ta"
      ? "தமிழ்"
      : language === "kn"
      ? "ಕನ್ನಡ"
      : language === "ml"
      ? "മലയാളം"
      : "English";

  return (
    <main className="app-background min-h-screen flex items-center justify-center px-5 py-10">
      <div className="w-full max-w-2xl rounded-[2rem] bg-slate-950/80 border border-slate-700 p-8 shadow-2xl">

        <div className="text-center mb-8">
          <div className="text-6xl mb-4">🌍</div>

          <h1 className="text-3xl font-bold text-white">
            WeatherGPT
          </h1>

          <p className="text-slate-400 mt-2">
            Permission & Privacy Setup
          </p>

          <p className="text-slate-500 text-sm mt-2">
            Language: {languageName}
          </p>
        </div>

        <div className="space-y-4">

          {/* TERMS */}
          <div className="rounded-2xl border border-slate-700 bg-slate-900/70 p-5">
            <div className="flex items-start gap-4">

              <FileText className="text-blue-400 mt-1" />

              <div className="flex-1">
                <h2 className="font-semibold text-white">
                  Terms & Conditions
                </h2>

                <p className="text-sm text-slate-400 mt-1">
                  Please review and accept the terms before using
                  WeatherGPT.
                </p>

                <div className="flex gap-3 mt-4">

                  <button
                    onClick={acceptTerms}
                    className={`px-4 py-2 rounded-xl ${
                      termsAccepted
                        ? "bg-green-600"
                        : "bg-blue-600 hover:bg-blue-500"
                    } text-white`}
                  >
                    {termsAccepted ? "Accepted" : "Accept"}
                  </button>

                  <button
                    onClick={() =>
                      window.open("/terms", "_blank")
                    }
                    className="px-4 py-2 rounded-xl bg-slate-800 text-white hover:bg-slate-700"
                  >
                    View Terms
                  </button>

                </div>
              </div>

              {termsAccepted && (
                <Check className="text-green-400" />
              )}

            </div>
          </div>

          {/* LOCATION */}
          <div className="rounded-2xl border border-slate-700 bg-slate-900/70 p-5">
            <div className="flex items-start gap-4">

              <MapPin className="text-red-400 mt-1" />

              <div className="flex-1">

                <h2 className="font-semibold text-white">
                  Current Location
                </h2>

                <p className="text-sm text-slate-400 mt-1">
                  WeatherGPT uses your device location to provide
                  local weather and warning information.
                </p>

                <button
                  onClick={requestLocation}
                  className={`mt-4 px-4 py-2 rounded-xl text-white ${
                    locationAllowed
                      ? "bg-green-600"
                      : "bg-blue-600 hover:bg-blue-500"
                  }`}
                >
                  {locationAllowed
                    ? "Location Allowed"
                    : "Allow Location"}
                </button>

              </div>

              {locationAllowed && (
                <Check className="text-green-400" />
              )}

            </div>
          </div>

          {/* NOTIFICATIONS */}
          <div className="rounded-2xl border border-slate-700 bg-slate-900/70 p-5">

            <div className="flex items-start gap-4">

              <Bell className="text-yellow-400 mt-1" />

              <div className="flex-1">

                <h2 className="font-semibold text-white">
                  Notifications
                </h2>

                <p className="text-sm text-slate-400 mt-1">
                  Receive important weather and disaster
                  notifications.
                </p>

                <button
                  onClick={requestNotifications}
                  className={`mt-4 px-4 py-2 rounded-xl text-white ${
                    notificationsAllowed
                      ? "bg-green-600"
                      : "bg-blue-600 hover:bg-blue-500"
                  }`}
                >
                  {notificationsAllowed
                    ? "Notifications Allowed"
                    : "Allow Notifications"}
                </button>

              </div>

              {notificationsAllowed && (
                <Check className="text-green-400" />
              )}

            </div>
          </div>

          {/* WARNING ALERTS */}
          <div className="rounded-2xl border border-slate-700 bg-slate-900/70 p-5">

            <div className="flex items-start gap-4">

              <ShieldAlert className="text-orange-400 mt-1" />

              <div className="flex-1">

                <h2 className="font-semibold text-white">
                  Warning Alert Signals
                </h2>

                <p className="text-sm text-slate-400 mt-1">
                  Enable warnings for severe weather,
                  floods, cyclones, wildfires and other hazards.
                </p>

                <button
                  onClick={toggleWarnings}
                  className={`mt-4 px-4 py-2 rounded-xl text-white ${
                    warningAlerts
                      ? "bg-green-600"
                      : "bg-slate-700"
                  }`}
                >
                  {warningAlerts
                    ? "Warning Alerts Enabled"
                    : "Warning Alerts Disabled"}
                </button>

              </div>

              {warningAlerts && (
                <Check className="text-green-400" />
              )}

            </div>
          </div>

        </div>

        <button
          disabled={!termsAccepted || loading}
          onClick={continueToWeatherGPT}
          className="w-full mt-8 py-4 rounded-2xl bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 disabled:text-slate-500 text-white font-bold transition"
        >
          {loading
            ? "Opening WeatherGPT..."
            : "Continue to WeatherGPT"}
        </button>

        <p className="text-xs text-slate-500 text-center mt-5">
          You can change these permissions later from Settings.
        </p>

      </div>
    </main>
  );
}
