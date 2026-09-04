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

type RouteData = {
  coordinates: [number, number][];
  distance: number;
  duration: number;
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
  const [route, setRoute] = useState<RouteData | null>(null);
  const [error, setError] = useState("");

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

      const params = new URLSearchParams({
        start_latitude: String(currentLocation.latitude),
        start_longitude: String(currentLocation.longitude),
        end_latitude: String(destination.latitude),
        end_longitude: String(destination.longitude),
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

      if (!data.geometry?.coordinates?.length) {
        throw new Error("No route geometry returned");
      }

      const coordinates =
        data.geometry.coordinates.map(
          (point: [number, number]) => [
            point[1],
            point[0],
          ] as [number, number]
        );

      setRoute({
        coordinates,
        distance: data.distance,
        duration: data.duration,
      });
    } catch (err) {
      console.error("Routing error:", err);

      setError(
        "Unable to calculate route. Please try another destination."
      );
    }
  };

  getRoute();
}, [currentLocation, destination]);



  const center: [number, number] = currentLocation
    ? [
        currentLocation.latitude,
        currentLocation.longitude,
      ]
    : [17.6868, 83.2185];

  const currentIcon = L.divIcon({
    className: "current-location-marker",
    html: `
      <div style="
        width: 22px;
        height: 22px;
        background: #2563eb;
        border: 4px solid white;
        border-radius: 50%;
        box-shadow: 0 2px 8px rgba(0,0,0,.4);
      "></div>
    `,
    iconSize: [22, 22],
    iconAnchor: [11, 11],
  });

  const destinationIcon = L.divIcon({
    className: "destination-marker",
    html: `
      <div style="
        width: 22px;
        height: 22px;
        background: #ef4444;
        border: 4px solid white;
        border-radius: 50%;
        box-shadow: 0 2px 8px rgba(0,0,0,.4);
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
            border: "2px solid #dc2626",
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
      border: "1px solid rgba(255,255,255,0.10)",
      boxShadow:
        "0 12px 35px rgba(0,0,0,0.18)",
    }}
  >
    {/* HEADER */}
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "18px 20px 14px",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
        }}
      >
        <div
          style={{
            width: "42px",
            height: "42px",
            borderRadius: "14px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background:
              "rgba(37,99,235,0.18)",
            border:
              "1px solid rgba(96,165,250,0.25)",
            fontSize: "21px",
          }}
        >
          🧭
        </div>

        <div>
          <div
            style={{
              color: "white",
              fontSize: "18px",
              fontWeight: 700,
              letterSpacing: "-0.3px",
            }}
          >
            Your Route
          </div>

          <div
            style={{
              color: "rgba(255,255,255,0.55)",
              fontSize: "12px",
              marginTop: "3px",
            }}
          >
            Best available driving route
          </div>
        </div>
      </div>

      {/* BEST ROUTE BADGE */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "5px",
          padding: "7px 10px",
          borderRadius: "999px",
          background:
            "rgba(34,197,94,0.12)",
          border:
            "1px solid rgba(34,197,94,0.22)",
          color: "#86efac",
          fontSize: "11px",
          fontWeight: 700,
          whiteSpace: "nowrap",
        }}
      >
        <span>●</span>
        BEST ROUTE
      </div>
    </div>

    {/* ROUTE LINE */}
    <div
      style={{
        height: "1px",
        background:
          "rgba(255,255,255,0.08)",
        margin: "0 20px",
      }}
    />

    {/* METRICS */}
    <div
      style={{
        display: "grid",
        gridTemplateColumns:
          "1fr 1fr",
        gap: "10px",
        padding: "14px 20px 18px",
      }}
    >
      {/* DISTANCE */}
      <div
        style={{
          padding: "14px",
          borderRadius: "16px",
          background:
            "rgba(255,255,255,0.055)",
          border:
            "1px solid rgba(255,255,255,0.07)",
        }}
      >
        <div
          style={{
            color:
              "rgba(255,255,255,0.48)",
            fontSize: "11px",
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: "0.7px",
            marginBottom: "6px",
          }}
        >
          Distance
        </div>

        <div
          style={{
            color: "white",
            fontSize: "23px",
            fontWeight: 750,
            lineHeight: 1.1,
          }}
        >
          {(route.distance / 1000).toFixed(1)}
          <span
            style={{
              fontSize: "13px",
              fontWeight: 500,
              color:
                "rgba(255,255,255,0.55)",
              marginLeft: "4px",
            }}
          >
            km
          </span>
        </div>
      </div>

      {/* ETA */}
      <div
        style={{
          padding: "14px",
          borderRadius: "16px",
          background:
            "rgba(255,255,255,0.055)",
          border:
            "1px solid rgba(255,255,255,0.07)",
        }}
      >
        <div
          style={{
            color:
              "rgba(255,255,255,0.48)",
            fontSize: "11px",
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: "0.7px",
            marginBottom: "6px",
          }}
        >
          Estimated time
        </div>

        <div
          style={{
            color: "white",
            fontSize: "23px",
            fontWeight: 750,
            lineHeight: 1.1,
          }}
        >
          {Math.round(
            route.duration / 60
          )}
          <span
            style={{
              fontSize: "13px",
              fontWeight: 500,
              color:
                "rgba(255,255,255,0.55)",
              marginLeft: "4px",
            }}
          >
            min
          </span>
        </div>
      </div>
    </div>

    {/* FOOTER */}
    <div
      style={{
        padding: "11px 20px",
        background:
          "rgba(0,0,0,0.12)",
        display: "flex",
        alignItems: "center",
        gap: "8px",
        color:
          "rgba(255,255,255,0.5)",
        fontSize: "11px",
      }}
    >
      <span
        style={{
          width: "7px",
          height: "7px",
          borderRadius: "50%",
          background: "#60a5fa",
          display: "inline-block",
        }}
      />

      Route calculated from your current location
    </div>
  </div>
)}


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
            currentLocation={currentLocation}
            destination={destination}
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
              icon={destinationIcon}
            >
              <Popup>
                Destination
              </Popup>
            </Marker>
          )}

          {route && (
            <Polyline
              positions={route.coordinates}
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
