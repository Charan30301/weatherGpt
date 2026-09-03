"use client";

import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
} from "react-leaflet";

import { useEffect } from "react";


interface WeatherMapProps {
  latitude: number;
  longitude: number;
  locationName: string;
}


function MapController({
  latitude,
  longitude,
}: {
  latitude: number;
  longitude: number;
}) {

  const map = useMap();


  useEffect(() => {

    map.flyTo(
      [latitude, longitude],
      10,
      {
        duration: 2,
      }
    );

  }, [latitude, longitude, map]);


  return null;
}


export default function WeatherMap({

  latitude,
  longitude,
  locationName,

}: WeatherMapProps) {

  return (

    <div
      className="
        w-full
        h-[350px]
        rounded-3xl
        overflow-hidden
        border
        border-slate-700
      "
    >

      <MapContainer
        center={[latitude, longitude]}
        zoom={10}
        className="w-full h-full"
      >

        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />


        <MapController
          latitude={latitude}
          longitude={longitude}
        />


        <Marker
          position={[latitude, longitude]}
        >

          <Popup>

            <strong>
              {locationName}
            </strong>

          </Popup>

        </Marker>

      </MapContainer>

    </div>

  );
}

