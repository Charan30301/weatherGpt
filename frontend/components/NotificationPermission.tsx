"use client";

import { useState } from "react";

type NotificationPermissionProps = {
  onPermissionChange?: (allowed: boolean) => void;
};

export default function NotificationPermission({
  onPermissionChange,
}: NotificationPermissionProps) {
  const [allowed, setAllowed] = useState(false);
  const [loading, setLoading] = useState(false);

  const requestNotificationPermission = async () => {
    if (!("Notification" in window)) {
      alert(
        "Notifications are not supported by this browser."
      );
      return;
    }

    setLoading(true);

    try {
      const permission =
        await Notification.requestPermission();

      const enabled = permission === "granted";

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
    }

    setLoading(false);
  };

  return (
    <div className="mt-4">

      <button
        onClick={requestNotificationPermission}
        disabled={loading}
        className={`px-4 py-2 rounded-xl text-white ${
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
        <p className="text-xs text-green-400 mt-2">
          Weather notifications enabled.
        </p>
      )}

    </div>
  );
}
