"use client";

export default function WeatherEffects({
  type
}: {
  type: string
}) {

  if (type === "rain") {

    return (

      <div className="fixed inset-0 pointer-events-none overflow-hidden">

        {Array.from({ length: 80 }).map((_, i) => (

          <div
            key={i}
            className="rain-drop"
            style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random()}s`
            }}
          />

        ))}

      </div>

    );

  }


  if (type === "tsunami") {

    return (
      <div className="tsunami pointer-events-none" />
    );

  }


  if (type === "earthquake") {

    return (
      <div className="earthquake fixed inset-0 pointer-events-none" />
    );

  }


  return null;

}
