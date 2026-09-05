"use client";

import { useEffect, useRef } from "react";

interface EmergencyAlertProps {
  open: boolean;
  title: string;
  message: string;
  severity?: "warning" | "danger";
  onShelters: () => void;
  onClose: () => void;
}

export default function EmergencyAlert({
  open,
  title,
  message,
  severity = "danger",
  onShelters,
  onClose,
}: EmergencyAlertProps) {
  const audioRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    if (!open) return;

    let stopped = false;

    const beep = async () => {
      try {
        const AudioContextClass =
          window.AudioContext ||
          (
            window as typeof window & {
              webkitAudioContext?: typeof AudioContext;
            }
          ).webkitAudioContext;

        if (!AudioContextClass) return;

        const ctx = new AudioContextClass();
        audioRef.current = ctx;

        if (ctx.state === "suspended") {
          await ctx.resume();
        }

        for (let i = 0; i < 3; i++) {
          if (stopped) break;

          const oscillator = ctx.createOscillator();
          const gain = ctx.createGain();

          oscillator.type = "square";
          oscillator.frequency.value = i % 2 === 0 ? 880 : 660;

          gain.gain.setValueAtTime(
            0.0001,
            ctx.currentTime
          );

          gain.gain.exponentialRampToValueAtTime(
            0.35,
            ctx.currentTime + 0.03
          );

          gain.gain.exponentialRampToValueAtTime(
            0.0001,
            ctx.currentTime + 0.35
          );

          oscillator.connect(gain);
          gain.connect(ctx.destination);

          oscillator.start();
          oscillator.stop(ctx.currentTime + 0.35);

          await new Promise((resolve) =>
            setTimeout(resolve, 450)
          );
        }
      } catch {
        // Browser may block audio until user interaction.
      }
    };

    beep();

    return () => {
      stopped = true;

      if (audioRef.current) {
        audioRef.current.close().catch(() => {});
        audioRef.current = null;
      }
    };
  }, [open]);

  if (!open) return null;

  const danger =
    severity === "danger";

  return (
    <div className="fixed inset-0 z-[9999] bg-black/95 backdrop-blur-xl flex items-center justify-center p-5">

      <div
        className={`w-full max-w-lg rounded-3xl border-2 p-6 md:p-8 text-center shadow-2xl ${
          danger
            ? "border-red-500 bg-red-950/90"
            : "border-yellow-500 bg-yellow-950/90"
        }`}
      >

        <div className="text-7xl mb-5 animate-pulse">
          {danger ? "🚨" : "⚠️"}
        </div>

        <div
          className={`inline-block px-4 py-2 rounded-full text-sm font-bold mb-4 ${
            danger
              ? "bg-red-600"
              : "bg-yellow-600"
          }`}
        >
          {danger
            ? "EMERGENCY ALERT"
            : "WEATHER WARNING"}
        </div>

        <h1 className="text-3xl md:text-4xl font-black text-white mb-4">
          {title}
        </h1>

        <p className="text-lg text-slate-200 leading-relaxed mb-8">
          {message}
        </p>

        <button
          onClick={onShelters}
          className="w-full rounded-2xl bg-white text-black py-4 px-5 text-lg font-black hover:bg-slate-200 transition"
        >
          📍 VIEW NEARBY SHELTERS
        </button>

        <button
          onClick={onClose}
          className="mt-4 text-slate-300 hover:text-white text-sm"
        >
          Dismiss warning
        </button>

      </div>
    </div>
  );
}
