"use client";

import { useEffect, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  useMap,
} from "react-leaflet";

import L from "leaflet";
import "leaflet/dist/leaflet.css";

type Location = {
  latitude: number;
  longitude: number;
};

type RouteMapProps = {
  currentLocation: Location | null;
  destination: Location | null;
};

type Step = {
  instruction: string;
  distance: number;
  type: string;
};

type RouteData = {
  coordinates: [number, number][];
  distance: number;
  duration: number;
  steps: Step[];
};

function MapUpdater({
  currentLocation,
  destination,
}: RouteMapProps) {
  const map = useMap();

  useEffect(() => {
    if (!currentLocation && !destination) return;

    const points: [number, number][] = [];

    if (currentLocation) {
      points.push([
        currentLocation.latitude,
        currentLocation.longitude,
      ]);
    }

    if (destination) {
      points.push([
        destination.latitude,
        destination.longitude,
      ]);
    }

    if (points.length === 1) {
      map.setView(points[0], 14);
    }

    if (points.length === 2) {
      const bounds = L.latLngBounds(points);

      map.fitBounds(bounds, {
        padding: [50, 50],
      });
    }
  }, [currentLocation, destination, map]);

  return null;
}

export default function RouteMap({
  currentLocation,
  destination,
}: RouteMapProps) {
  const [route, setRoute] =
    useState<RouteData | null>(null);

  const [error, setError] =
    useState("");

  const [currentStep, setCurrentStep] =
    useState(0);

  const [voiceEnabled, setVoiceEnabled] =
    useState(false);

  useEffect(() => {
    if (!currentLocation || !destination) {
      setRoute(null);
      setError("");
      return;
    }

    const getRoute = async () => {
      try {
        setError("");
        setRoute(null);
        setCurrentStep(0);

        const params = new URLSearchParams({
          start_latitude:
            String(currentLocation.latitude),

          start_longitude:
            String(currentLocation.longitude),

          end_latitude:
            String(destination.latitude),

          end_longitude:
            String(destination.longitude),
        });

        const response = await fetch(
          `http://127.0.0.1:8000/route?${params.toString()}`
        );

        if (!response.ok) {
          throw new Error(
            `Backend returned ${response.status}`
          );
        }

        const data = await response.json();

        if (data.error) {
          throw new Error(data.error);
        }

        if (
          !data.geometry?.coordinates?.length
        ) {
          throw new Error(
            "No route geometry returned"
          );
        }

        const coordinates =
          data.geometry.coordinates.map(
            (point: [number, number]) =>
              [
                point[1],
                point[0],
              ] as [number, number]
          );

        const steps: Step[] =
          data.steps || [];

        setRoute({
          coordinates,
          distance: data.distance,
          duration: data.duration,
          steps,
        });

      } catch (err) {
        console.error(
          "Routing error:",
          err
        );

        setError(
          "Unable to calculate route. Please try another destination."
        );
      }
    };

    getRoute();
  }, [currentLocation, destination]);

  /*
   * VOICE GUIDANCE
   */
  const speakStep = (
    step: Step,
    index: number
  ) => {
    if (!voiceEnabled) {
      return;
    }

    if (!("speechSynthesis" in window)) {
      return;
    }

    const distanceKm =
      step.distance / 1000;

    let distanceText = "";

    if (step.distance < 1000) {
      distanceText = `${Math.round(
        step.distance
      )} meters`;
    } else {
      distanceText = `${distanceKm.toFixed(
        1
      )} kilometers`;
    }

    const text =
      index === 0
        ? `Start navigation. In ${distanceText}, ${step.instruction}.`
        : `In ${distanceText}, ${step.instruction}.`;

    window.speechSynthesis.cancel();

    const speech =
      new SpeechSynthesisUtterance(text);

    speech.rate = 0.9;
    speech.pitch = 1;
    speech.volume = 1;

    window.speechSynthesis.speak(
      speech
    );
  };

  /*
   * START VOICE NAVIGATION
   */
  const startVoiceNavigation = () => {
    if (!route) {
      return;
    }

    if (!route.steps.length) {
      const speech =
        new SpeechSynthesisUtterance(
          "The route is ready. Follow the blue route on the map to reach the emergency shelter."
        );

      speech.rate = 0.9;
      speech.volume = 1;

      window.speechSynthesis.cancel();

      window.speechSynthesis.speak(
        speech
      );

      setVoiceEnabled(true);

      return;
    }

    setVoiceEnabled(true);
    setCurrentStep(0);

    const firstStep =
      route.steps[0];

    speakStep(firstStep, 0);
  };

  /*
   * STOP VOICE
   */
  const stopVoiceNavigation = () => {
    window.speechSynthesis.cancel();

    setVoiceEnabled(false);
  };

  /*
   * MANUAL NEXT TURN
   */
  const nextInstruction = () => {
    if (!route) {
      return;
    }

    if (
      currentStep >=
      route.steps.length - 1
    ) {
      const speech =
        new SpeechSynthesisUtterance(
          "You have reached the emergency shelter."
        );

      speech.rate = 0.9;

      window.speechSynthesis.cancel();

      window.speechSynthesis.speak(
        speech
      );

      return;
    }

    const next =
      currentStep + 1;

    setCurrentStep(next);

    speakStep(
      route.steps[next],
      next
    );
  };

  const center: [number, number] =
    currentLocation
      ? [
          currentLocation.latitude,
          currentLocation.longitude,
        ]
      : [17.6868, 83.2185];

  const currentIcon =
    L.divIcon({
      className:
        "current-location-marker",

      html: `
        <div style="
          width:22px;
          height:22px;
          background:#2563eb;
          border:4px solid white;
          border-radius:50%;
          box-shadow:0 2px 8px rgba(0,0,0,.4);
        "></div>
      `,

      iconSize: [22, 22],

      iconAnchor: [11, 11],
    });

  const destinationIcon =
    L.divIcon({
      className:
        "destination-marker",

      html: `
        <div style="
          width:22px;
          height:22px;
          background:#ef4444;
          border:4px solid white;
          border-radius:50%;
          box-shadow:0 2px 8px rgba(0,0,0,.4);
        "></div>
      `,

      iconSize: [22, 22],

      iconAnchor: [11, 11],
    });

  return (
    <section
      style={{
        width: "100%",
        marginTop: "20px",
      }}
    >
      {error && (
        <div
          style={{
            background: "#4a1724",
            border:
              "2px solid #dc2626",
            color: "#fecaca",
            padding: "16px",
            borderRadius: "18px",
            marginBottom: "12px",
            fontWeight: 600,
          }}
        >
          {error}
        </div>
      )}

      {route && (
        <div
          style={{
            marginBottom: "14px",
            borderRadius: "22px",
            overflow: "hidden",
            background:
              "linear-gradient(135deg, rgba(8,25,55,0.97), rgba(13,38,76,0.96))",
            border:
              "1px solid rgba(255,255,255,0.10)",
            boxShadow:
              "0 12px 35px rgba(0,0,0,0.18)",
          }}
        >
          {/* HEADER */}

          <div
            style={{
              padding: "18px 20px",
            }}
          >
            <div
              style={{
                color: "white",
                fontSize: "20px",
                fontWeight: 800,
              }}
            >
              🧭 Emergency Navigation
            </div>

            <div
              style={{
                color:
                  "rgba(255,255,255,0.55)",
                fontSize: "12px",
                marginTop: "4px",
              }}
            >
              Follow the blue route to the shelter
            </div>
          </div>

          {/* METRICS */}

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "1fr 1fr",
              gap: "10px",
              padding:
                "0 20px 18px",
            }}
          >
            <div
              style={{
                padding: "14px",
                borderRadius: "16px",
                background:
                  "rgba(255,255,255,0.055)",
              }}
            >
              <div
                style={{
                  color:
                    "rgba(255,255,255,0.48)",
                  fontSize: "11px",
                  marginBottom: "6px",
                }}
              >
                DISTANCE
              </div>

              <div
                style={{
                  color: "white",
                  fontSize: "23px",
                  fontWeight: 750,
                }}
              >
                {(
                  route.distance /
                  1000
                ).toFixed(1)}{" "}
                km
              </div>
            </div>

            <div
              style={{
                padding: "14px",
                borderRadius: "16px",
                background:
                  "rgba(255,255,255,0.055)",
              }}
            >
              <div
                style={{
                  color:
                    "rgba(255,255,255,0.48)",
                  fontSize: "11px",
                  marginBottom: "6px",
                }}
              >
                ETA
              </div>

              <div
                style={{
                  color: "white",
                  fontSize: "23px",
                  fontWeight: 750,
                }}
              >
                {Math.round(
                  route.duration / 60
                )}{" "}
                min
              </div>
            </div>
          </div>

          {/* VOICE CONTROL */}

          <div
            style={{
              padding:
                "14px 20px",
              borderTop:
                "1px solid rgba(255,255,255,0.08)",
            }}
          >
            {!voiceEnabled ? (
              <button
                onClick={
                  startVoiceNavigation
                }
                style={{
                  width: "100%",
                  padding: "15px",
                  borderRadius: "16px",
                  border: "none",
                  background:
                    "#2563eb",
                  color: "white",
                  fontSize: "16px",
                  fontWeight: 800,
                  cursor: "pointer",
                }}
              >
                🔊 START VOICE NAVIGATION
              </button>
            ) : (
              <div
                style={{
                  display: "flex",
                  gap: "10px",
                }}
              >
                <button
                  onClick={
                    stopVoiceNavigation
                  }
                  style={{
                    flex: 1,
                    padding: "14px",
                    borderRadius: "14px",
                    border:
                      "1px solid #ef4444",
                    background:
                      "rgba(239,68,68,0.15)",
                    color: "#fecaca",
                    fontWeight: 700,
                  }}
                >
                  🔇 Stop Voice
                </button>

                <button
                  onClick={
                    nextInstruction
                  }
                  style={{
                    flex: 1,
                    padding: "14px",
                    borderRadius: "14px",
                    border: "none",
                    background:
                      "#16a34a",
                    color: "white",
                    fontWeight: 700,
                  }}
                >
                  🔊 Next Turn
                </button>
              </div>
            )}
          </div>

          {/* CURRENT INSTRUCTION */}

          {route.steps.length > 0 && (
            <div
              style={{
                margin:
                  "0 20px 18px",
                padding: "15px",
                borderRadius: "16px",
                background:
                  "rgba(37,99,235,0.15)",
                border:
                  "1px solid rgba(96,165,250,0.25)",
              }}
            >
              <div
                style={{
                  color:
                    "rgba(255,255,255,0.5)",
                  fontSize: "11px",
                  marginBottom: "5px",
                }}
              >
                NEXT INSTRUCTION
              </div>

              <div
                style={{
                  color: "white",
                  fontSize: "15px",
                  fontWeight: 700,
                }}
              >
                {route.steps[
                  currentStep
                ]?.instruction ||
                  "Continue toward the shelter"}
              </div>

              <div
                style={{
                  color:
                    "#93c5fd",
                  fontSize: "12px",
                  marginTop: "5px",
                }}
              >
                {route.steps[
                  currentStep
                ]
                  ? route.steps[
                      currentStep
                    ].distance < 1000
                    ? `${Math.round(
                        route.steps[
                          currentStep
                        ].distance
                      )} meters`
                    : `${(
                        route.steps[
                          currentStep
                        ].distance /
                        1000
                      ).toFixed(
                        1
                      )} km`
                  : ""}
              </div>
            </div>
          )}
        </div>
      )}

      {/* MAP */}

      <div
        style={{
          width: "100%",
          height: "500px",
          borderRadius: "24px",
          overflow: "hidden",
          border:
            "1px solid rgba(255,255,255,0.12)",
          boxShadow:
            "0 18px 45px rgba(0,0,0,0.18)",
          position: "relative",
        }}
      >
        <MapContainer
          center={center}
          zoom={13}
          style={{
            width: "100%",
            height: "100%",
          }}
        >
          <TileLayer
            attribution='&copy; OpenStreetMap contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <MapUpdater
            currentLocation={
              currentLocation
            }
            destination={
              destination
            }
          />

          {currentLocation && (
            <Marker
              position={[
                currentLocation.latitude,
                currentLocation.longitude,
              ]}
              icon={currentIcon}
            >
              <Popup>
                Your current location
              </Popup>
            </Marker>
          )}

          {destination && (
            <Marker
              position={[
                destination.latitude,
                destination.longitude,
              ]}
              icon={
                destinationIcon
              }
            >
              <Popup>
                Emergency shelter
              </Popup>
            </Marker>
          )}

          {route && (
            <Polyline
              positions={
                route.coordinates
              }
              pathOptions={{
                weight: 6,
              }}
            />
          )}
        </MapContainer>
      </div>
    </section>
  );
}
