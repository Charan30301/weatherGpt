"use client";

import { useEffect, useState } from "react";

type WarningAlertPermissionProps = {
  enabled?: boolean;
  onChange?: (enabled: boolean) => void;
};

export default function WarningAlertPermission({
  enabled = true,
  onChange,
}: WarningAlertPermissionProps) {
  const [active, setActive] = useState(enabled);

  useEffect(() => {
    const saved = localStorage.getItem(
      "weathergpt-warning-alerts"
    );

    if (saved !== null) {
      const value = saved === "true";

      setActive(value);
      onChange?.(value);
    }
  }, [onChange]);

  const toggle = () => {
    const value = !active;

    setActive(value);

    localStorage.setItem(
      "weathergpt-warning-alerts",
      String(value)
    );

    onChange?.(value);
  };

  return (
    <div className="mt-4">

      <button
        onClick={toggle}
        className={`px-4 py-2 rounded-xl text-white transition ${
          active
            ? "bg-green-600 hover:bg-green-500"
            : "bg-slate-700 hover:bg-slate-600"
        }`}
      >
        {active
          ? "Warning Alerts Enabled"
          : "Warning Alerts Disabled"}
      </button>

      {active && (
        <div className="grid grid-cols-2 gap-2 mt-4">

          {[
            "Heavy Rain",
            "Flood",
            "Cyclone",
            "Tsunami",
            "Wildfire",
            "Lightning",
            "Extreme Wind",
            "Satellite Alerts",
          ].map((warning) => (
            <div
              key={warning}
              className="rounded-lg bg-slate-800 px-3 py-2 text-xs text-slate-300"
            >
              ✓ {warning}
            </div>
          ))}

        </div>
      )}

    </div>
  );
}
