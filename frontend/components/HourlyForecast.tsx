"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

type HourlyData = {
  time: string;
  temperature: number;
};

interface HourlyForecastProps {
  data: HourlyData[];
}

export default function HourlyForecast({
  data,
}: HourlyForecastProps) {
  if (!data || data.length === 0) {
    return (
      <div className="rounded-2xl bg-slate-900/70 backdrop-blur-md p-5 text-white">
        <h2 className="text-xl font-semibold mb-2">
          Hourly Forecast
        </h2>

        <p className="text-slate-400">
          Hourly forecast data is not available.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full rounded-2xl bg-slate-900/70 backdrop-blur-md p-5 text-white">
      <div className="mb-5">
        <h2 className="text-xl font-semibold">
          Hour-by-Hour Forecast
        </h2>

        <p className="text-sm text-slate-400 mt-1">
          Temperature forecast for the next 24 hours
        </p>
      </div>

      <div className="w-full h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{
              top: 10,
              right: 15,
              left: 0,
              bottom: 5,
            }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              opacity={0.2}
            />

            <XAxis
              dataKey="time"
              tick={{ fill: "#cbd5e1", fontSize: 12 }}
              tickLine={false}
              axisLine={false}
            />

            <YAxis
              tick={{ fill: "#cbd5e1", fontSize: 12 }}
              tickLine={false}
              axisLine={false}
              unit="°"
            />

            <Tooltip
              contentStyle={{
                backgroundColor: "#0f172a",
                border: "1px solid #334155",
                borderRadius: "10px",
                color: "#fff",
              }}
              formatter={(value) => [
                `${value}°C`,
                "Temperature",
              ]}
            />

            <Line
              type="monotone"
              dataKey="temperature"
              stroke="#38bdf8"
              strokeWidth={3}
              dot={{
                r: 4,
              }}
              activeDot={{
                r: 7,
              }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}