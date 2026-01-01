import React, { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { useAuth } from "../../context/AuthContext";
import { fetchHourlyPresence } from "../../../services/api";
import ExportButton from "../common/ExportButton";
import { exportHourlyPresenceAsCSV, exportHourlyPresenceAsJSON } from "../../../utils/exportUtils";

function formatDuration(seconds: number) {
  const hrs = Math.floor(seconds / 3600);
  const min = Math.floor((seconds % 3600) / 60);
  if (hrs > 0) return `${hrs} hr${hrs > 1 ? "s" : ""}${min > 0 ? ` ${min} min` : ""}`;
  return `${min} min`;
}

const DURATIONS = [
  { label: "Today", value: 1 },
  { label: "Last 7 Days", value: 7 },
  { label: "Last 30 Days", value: 30 },
];

const HourlyPresenceAnalytics: React.FC = () => {
  const { user } = useAuth();
  const [data, setData] = useState<any>(null);
  const [days, setDays] = useState(7);

  useEffect(() => {
    if (!user) return;
    setData(null);
    fetchHourlyPresence(user.token, days).then(setData);
  }, [user, days]);

  if (!data) {
    return <div className="text-gray-400 text-sm">Loading hourly presence...</div>;
  }

  const chartData = data.hours.map((h: any) => ({
    hour: `${h.hour}:00`,
    minutes: Math.round(h.seconds / 60),
    seconds: h.seconds,
  }));

  const peak = data.hours.reduce((max: any, h: any) => (h.seconds > max.seconds ? h : max), data.hours[0]);

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <div className="font-semibold text-gray-700">Hourly Activity</div>
        <div className="flex items-center space-x-2">
          <select
            className="border rounded px-2 py-1 text-sm bg-white"
            value={days}
            onChange={e => setDays(Number(e.target.value))}
          >
            {DURATIONS.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          <ExportButton
            onExportCSV={() => exportHourlyPresenceAsCSV(data)}
            onExportJSON={() => exportHourlyPresenceAsJSON(data)}
            label="Export"
            variant="secondary"
            size="sm"
          />
        </div>
      </div>
      <div className="mb-4 p-4 bg-blue-50 rounded-lg flex flex-col items-center">
        <div className="text-sm text-gray-500">
          Hourly Online Trend ({data.startDate} to {data.endDate})
        </div>
        <div className="text-2xl font-bold text-blue-700 mt-1">
          {formatDuration(data.totalSeconds)}
        </div>
        <div className="text-xs text-gray-500">Total online in {data.days} days</div>
        <div className="mt-2 text-sm text-green-700">
          Peak hour: <span className="font-semibold">{peak.hour}:00–{peak.hour + 1}:00</span> ({formatDuration(peak.seconds)})
        </div>
      </div>
      <ResponsiveContainer width="100%" height={180}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="hour" />
          <YAxis label={{ value: "Minutes", angle: -90, position: "insideLeft" }} />
          <Tooltip formatter={v => `${v} min`} />
          <Line type="monotone" dataKey="minutes" stroke="#3182ce" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
      <div className="text-xs text-gray-500 mt-1">
        Shows your total online time for each hour of the day, summed over the last {data.days} days.
      </div>
    </div>
  );
};

export default HourlyPresenceAnalytics;