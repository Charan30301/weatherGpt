"use client";

import { useState } from "react";
import {
  Bell,
  Check,
  FileText,
  MapPin,
  ShieldAlert,
} from "lucide-react";
import LocationPermission from "./LocationPermission";
import NotificationPermission from "./NotificationPermission";
import WarningAlertPermission from "./WarningAlertPermission";

type PermissionSetupProps = {
  onComplete: () => void;
};

export default function PermissionSetup({
  onComplete,
}: PermissionSetupProps) {
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [locationAllowed, setLocationAllowed] = useState(false);
  const [notificationsAllowed, setNotificationsAllowed] =
    useState(false);
  const [warningsEnabled, setWarningsEnabled] = useState(true);

  const continueToApp = () => {
    if (!termsAccepted) {
      alert("Please accept the Terms & Conditions first.");
      return;
    }

    localStorage.setItem(
      "weathergpt-permissions-completed",
      "true"
    );

    onComplete();
  };

  return (
    <main className="min-h-screen flex items-center justify-center px-5 py-8">
      <div className="w-full max-w-2xl rounded-3xl border border-slate-700 bg-slate-950/90 p-6 md:p-8 shadow-2xl">

        <div className="text-center mb-8">
          <div className="text-5xl mb-3">🌍</div>

          <h1 className="text-3xl font-bold text-white">
            WeatherGPT
          </h1>

          <p className="text-slate-400 mt-2">
            Permissions & Privacy
          </p>
        </div>

        {/* TERMS */}
        <section className="rounded-2xl border border-slate-700 bg-slate-900 p-5 mb-4">
          <div className="flex gap-4">

            <FileText className="text-blue-400 shrink-0" />

            <div className="flex-1">
              <h2 className="text-white font-semibold">
                Terms & Conditions
              </h2>

              <p className="text-sm text-slate-400 mt-1">
                Review and accept the terms before using
                WeatherGPT.
              </p>

              <div className="flex gap-3 mt-4 flex-wrap">

                <button
                  onClick={() => {
                    setTermsAccepted(true);
                    localStorage.setItem(
                      "weathergpt-terms-accepted",
                      "true"
                    );
                  }}
                  className={`px-4 py-2 rounded-xl text-white ${
                    termsAccepted
                      ? "bg-green-600"
                      : "bg-blue-600 hover:bg-blue-500"
                  }`}
                >
                  {termsAccepted ? "Accepted" : "Accept"}
                </button>

                <button
                  onClick={() =>
                    window.open("/terms", "_blank")
                  }
                  className="px-4 py-2 rounded-xl bg-slate-800 text-white"
                >
                  View Terms
                </button>

              </div>
            </div>

            {termsAccepted && (
              <Check className="text-green-400 shrink-0" />
            )}

          </div>
        </section>

        {/* LOCATION */}
        <section className="rounded-2xl border border-slate-700 bg-slate-900 p-5 mb-4">
          <div className="flex gap-4">

            <MapPin className="text-red-400 shrink-0" />

            <div className="flex-1">
              <h2 className="text-white font-semibold">
                Current Location
              </h2>

              <p className="text-sm text-slate-400 mt-1">
                Allow WeatherGPT to access your current
                coordinates for local weather.
              </p>

              <LocationPermission
                onPermissionChange={setLocationAllowed}
              />
            </div>

            {locationAllowed && (
              <Check className="text-green-400 shrink-0" />
            )}

          </div>
        </section>

        {/* NOTIFICATIONS */}
        <section className="rounded-2xl border border-slate-700 bg-slate-900 p-5 mb-4">
          <div className="flex gap-4">

            <Bell className="text-yellow-400 shrink-0" />

            <div className="flex-1">
              <h2 className="text-white font-semibold">
                Notifications
              </h2>

              <p className="text-sm text-slate-400 mt-1">
                Receive important weather and disaster
                notifications.
              </p>

              <NotificationPermission
                onPermissionChange={
                  setNotificationsAllowed
                }
              />
            </div>

            {notificationsAllowed && (
              <Check className="text-green-400 shrink-0" />
            )}

          </div>
        </section>

        {/* WARNING ALERTS */}
        <section className="rounded-2xl border border-slate-700 bg-slate-900 p-5 mb-6">
          <div className="flex gap-4">

            <ShieldAlert className="text-orange-400 shrink-0" />

            <div className="flex-1">
              <h2 className="text-white font-semibold">
                Warning Alert Signals
              </h2>

              <p className="text-sm text-slate-400 mt-1">
                Enable severe weather, flood, cyclone,
                wildfire and other warning signals.
              </p>

              <WarningAlertPermission
                enabled={warningsEnabled}
                onChange={setWarningsEnabled}
              />
            </div>

          </div>
        </section>

        <button
          onClick={continueToApp}
          disabled={!termsAccepted}
          className="w-full rounded-2xl py-4 font-bold text-white bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 disabled:text-slate-500 transition"
        >
          Continue to WeatherGPT
        </button>

        <p className="text-xs text-center text-slate-500 mt-4">
          You can change these settings later.
        </p>

      </div>
    </main>
  );
                }
