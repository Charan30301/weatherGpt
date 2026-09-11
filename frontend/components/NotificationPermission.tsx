"use client";
import { API_URL } from "@/lib/api"; 
import { useState } from "react";
import { Capacitor } from "@capacitor/core";
import { LocalNotifications } from "@capacitor/local-notifications";

type NotificationPermissionProps = {
  onPermissionChange?: (allowed: boolean) => void;
};

export default function NotificationPermission({
  onPermissionChange,
}: NotificationPermissionProps) {
  const [allowed, setAllowed] = useState(false);
  const [loading, setLoading] = useState(false);

  const requestNotificationPermission = async () => {
    setLoading(true);

    try {
      let enabled = false;

      // Android / iOS Capacitor app
      if (Capacitor.isNativePlatform()) {
        const permission =
          await LocalNotifications.requestPermissions();

        enabled = permission.display === "granted";
      } else {
        // Normal browser fallback
        if (!("Notification" in window)) {
          alert("Notifications are not supported in this browser.");
          setLoading(false);
          return;
        }

        const permission =
          await Notification.requestPermission();

        enabled = permission === "granted";
      }

      setAllowed(enabled);

      localStorage.setItem(
        "weathergpt-notifications",
        String(enabled)
      );

      onPermissionChange?.(enabled);
    } catch (error) {
      console.error(
        "Notification permission error:",
        error
      );

      setAllowed(false);
      onPermissionChange?.(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-4">
      <button
        onClick={requestNotificationPermission}
        disabled={loading}
        className={`rounded-xl px-4 py-2 text-white ${
          allowed
            ? "bg-green-600"
            : "bg-blue-600 hover:bg-blue-500"
        } disabled:opacity-50`}
      >
        {loading
          ? "Requesting..."
          : allowed
          ? "Notifications Allowed"
          : "Allow Notifications"}
      </button>

      {allowed && (
        <p className="mt-2 text-xs text-green-400">
          Weather notifications enabled.
        </p>
      )}
    </div>
  );
}

