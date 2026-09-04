"use client";

import PermissionInformation from "@/components/PermissionInformation";

export default function ConsentPage() {
  const handleAccept = () => {
    localStorage.setItem(
      "weathergpt-consent",
      "true"
    );

    window.location.href = "/permissions";
  };

  return (
    <PermissionInformation
      onAccept={handleAccept}
    />
  );
}
