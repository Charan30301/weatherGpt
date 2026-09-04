"use client";

import {
  Bell,
  CheckCircle,
  FileText,
  MapPin,
  ShieldAlert,
  Satellite,
} from "lucide-react";

type PermissionInformationProps = {
  onAccept: () => void;
};

export default function PermissionInformation({
  onAccept,
}: PermissionInformationProps) {
  return (
    <main className="min-h-screen flex items-center justify-center px-5 py-8 bg-slate-950">
      <div className="w-full max-w-3xl rounded-3xl border border-slate-700 bg-slate-900 p-6 md:p-8 shadow-2xl">

        {/* HEADER */}
        <div className="text-center mb-8">

          <div className="text-5xl mb-4">
            🌍
          </div>

          <h1 className="text-3xl md:text-4xl font-bold text-white">
            WeatherGPT
          </h1>

          <p className="text-slate-400 mt-2">
            Terms, Privacy & Permissions
          </p>

        </div>

        {/* IMPORTANT INFORMATION */}
        <div className="rounded-2xl border border-blue-500/30 bg-blue-500/10 p-5 mb-6">

          <div className="flex gap-3">

            <FileText className="text-blue-400 shrink-0" />

            <div>

              <h2 className="font-semibold text-white">
                Before you continue
              </h2>

              <p className="text-sm text-slate-300 mt-2 leading-6">
                WeatherGPT may request access to your location,
                notifications and warning-alert preferences.
                These permissions are used to provide
                location-based weather information and relevant
                environmental or disaster alerts.
              </p>

            </div>

          </div>

        </div>

        {/* LOCATION */}
        <div className="rounded-2xl bg-slate-800/70 p-5 mb-4">

          <div className="flex gap-4">

            <MapPin className="text-red-400 shrink-0" />

            <div>

              <h2 className="text-white font-semibold">
                Location Information
              </h2>

              <p className="text-sm text-slate-400 mt-2 leading-6">
                WeatherGPT may request your current latitude,
                longitude and location accuracy.
              </p>

              <p className="text-sm text-slate-400 mt-2 leading-6">
                Your location may be used to:
              </p>

              <ul className="mt-2 space-y-2 text-sm text-slate-300">

                <li>✓ Show weather for your current location</li>
                <li>✓ Provide location-specific forecasts</li>
                <li>✓ Determine nearby weather conditions</li>
                <li>✓ Evaluate relevant warning information</li>
                <li>✓ Display satellite/environmental information</li>

              </ul>

            </div>

          </div>

        </div>

        {/* GOOGLE */}
        <div className="rounded-2xl bg-slate-800/70 p-5 mb-4">

          <div className="flex gap-4">

            <Satellite className="text-blue-400 shrink-0" />

            <div>

              <h2 className="text-white font-semibold">
                Google Location Services
              </h2>

              <p className="text-sm text-slate-400 mt-2 leading-6">
                If WeatherGPT uses Google's Geolocation service,
                information required for that request may be sent
                to Google to estimate a geographic location.
              </p>

              <p className="text-sm text-slate-400 mt-2 leading-6">
                Google services are used only for the functionality
                enabled by the application. Google's own terms,
                privacy policies and API requirements also apply.
              </p>

            </div>

          </div>

        </div>

        {/* NOTIFICATIONS */}
        <div className="rounded-2xl bg-slate-800/70 p-5 mb-4">

          <div className="flex gap-4">

            <Bell className="text-yellow-400 shrink-0" />

            <div>

              <h2 className="text-white font-semibold">
                Notifications
              </h2>

              <p className="text-sm text-slate-400 mt-2 leading-6">
                Notification permission allows WeatherGPT to
                notify you about important weather and disaster
                information.
              </p>

              <p className="text-sm text-slate-300 mt-2">
                Examples include:
              </p>

              <ul className="mt-2 space-y-1 text-sm text-slate-300">
                <li>• Heavy rainfall</li>
                <li>• Flood conditions</li>
                <li>• Cyclone information</li>
                <li>• Lightning</li>
                <li>• Wildfire/fire information</li>
                <li>• Other severe weather signals</li>
              </ul>

            </div>

          </div>

        </div>

        {/* WARNING */}
        <div className="rounded-2xl bg-slate-800/70 p-5 mb-4">

          <div className="flex gap-4">

            <ShieldAlert className="text-orange-400 shrink-0" />

            <div>

              <h2 className="text-white font-semibold">
                Warning Alert Signals
              </h2>

              <p className="text-sm text-slate-400 mt-2 leading-6">
                WeatherGPT can use weather and satellite datasets
                to identify information that may be relevant to
                severe weather or environmental conditions.
              </p>

              <p className="text-sm text-slate-300 mt-2">
                Possible data sources include:
              </p>

              <ul className="mt-2 space-y-1 text-sm text-slate-300">
                <li>• Open-Meteo</li>
                <li>• NASA FIRMS</li>
                <li>• NASA GIBS</li>
                <li>• Sentinel-1</li>
                <li>• Sentinel-2</li>
                <li>• Sentinel Hub</li>
              </ul>

            </div>

          </div>

        </div>

        {/* DATA USE */}
        <div className="rounded-2xl border border-slate-700 bg-slate-950 p-5 mb-6">

          <h2 className="text-white font-semibold mb-3">
            How your information is used
          </h2>

          <div className="space-y-3 text-sm text-slate-400">

            <p>
              <strong className="text-slate-200">
                Location:
              </strong>{" "}
              Used to provide weather and environmental
              information relevant to your location.
            </p>

            <p>
              <strong className="text-slate-200">
                Coordinates:
              </strong>{" "}
              May be processed by WeatherGPT's backend and,
              where applicable, an authorized third-party
              location service.
            </p>

            <p>
              <strong className="text-slate-200">
                Notifications:
              </strong>{" "}
              Used to deliver alerts when you enable them.
            </p>

            <p>
              <strong className="text-slate-200">
                Settings:
              </strong>{" "}
              Your permission choices are stored so the
              application can remember your preferences.
            </p>

          </div>

        </div>

        {/* TERMS */}
        <div className="flex items-start gap-3 mb-6">

          <CheckCircle className="text-green-400 mt-1 shrink-0" />

          <p className="text-sm text-slate-400 leading-6">
            By continuing, you confirm that you have read the
            Terms & Conditions and understand why WeatherGPT
            requests these permissions. You can revoke browser
            permissions later through your browser or device
            settings.
          </p>

        </div>

        {/* BUTTONS */}
        <div className="flex flex-col sm:flex-row gap-3">

          <button
            onClick={() => {
              window.location.href = "/terms";
            }}
            className="flex-1 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white"
          >
            Read Terms & Conditions
          </button>

          <button
            onClick={onAccept}
            className="flex-1 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold"
          >
            Accept & Continue
          </button>

        </div>

        <p className="text-xs text-slate-500 text-center mt-5">
          Permission prompts are controlled by your browser.
        </p>

      </div>
    </main>
  );
}
