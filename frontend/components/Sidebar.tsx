"use client";

import Link from "next/link";
import { X } from "lucide-react";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({
  isOpen,
  onClose,
}: SidebarProps) {

  const features = [
    { name: "Home", icon: "🌍", href: "/dashboard" },
    { name: "7 Day Forecast", icon: "📅", href: "/forecast" },
    { name: "Traveller Mode", icon: "✈️", href: "/traveller" },
    { name: "Farmer Mode", icon: "🌾", href: "/farmer" },
    { name: "Disaster Center", icon: "🚨", href: "/disasters" },
    { name: "Satellite Monitor", icon: "🛰️", href: "/satellite" },
    { name: "AI Assistant", icon: "🤖", href: "/chat" },
    { name: "Settings", icon: "⚙️", href: "/settings" },
  ];

  return (
    <>
      {/* Overlay */}

      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/60 z-40"
        />
      )}

      {/* Sidebar */}

      <aside
        className={`
          fixed top-0 left-0 h-screen w-[280px]
          bg-slate-950 border-r border-slate-800
          z-50 p-5
          transition-transform duration-300
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >

        {/* Header */}

        <div className="flex items-center justify-between mb-8">

          <div>

            <h1 className="text-2xl font-bold">
              🌍 WeatherGPT
            </h1>

            <p className="text-xs text-slate-400">
              AI Weather Intelligence
            </p>

          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-slate-800"
          >
            <X size={22} />
          </button>

        </div>


        {/* Navigation */}

        <nav className="space-y-2">

          {features.map((feature) => (

            <Link
              key={feature.href}
              href={feature.href}
              onClick={onClose}
              className="
                flex items-center gap-4
                p-4 rounded-xl
                hover:bg-blue-600/20
                hover:border-blue-500/30
                border border-transparent
                transition
              "
            >

              <span className="text-xl">
                {feature.icon}
              </span>

              <span>
                {feature.name}
              </span>

            </Link>

          ))}

        </nav>


        {/* Bottom */}

        <div className="absolute bottom-6 left-5 right-5">

          <div className="
            bg-blue-600/10
            border border-blue-500/20
            rounded-xl
            p-4
          ">

            <p className="text-sm font-semibold">
              WeatherGPT AI
            </p>

            <p className="text-xs text-slate-400 mt-1">
              Stay informed. Stay safe.
            </p>

          </div>

        </div>

      </aside>
    </>
  );
}

