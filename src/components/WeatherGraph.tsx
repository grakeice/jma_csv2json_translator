import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Brush,
} from "recharts";
import { cn } from "../lib/utils";
import type { WeatherValue } from "../schema/json";

interface WeatherGraphProps {
  data: Record<string, WeatherValue>[];
  selectedMetrics: string[];
  strokeWidth: number;
}

const COLORS = [
  "#2563eb", // blue-600
  "#16a34a", // green-600
  "#d97706", // amber-600
  "#dc2626", // red-600
  "#0891b2", // cyan-600
  "#9333ea", // purple-600
  "#ea580c", // orange-600
  "#0d9488", // teal-600
];

const metricLabels: Record<string, string> = {
  avg_temp: "平均気温",
  max_temp: "最高気温",
  min_temp: "最低気温",
  weather_day: "昼の天気",
  weather_night: "夜の天気",
  total_precipitation: "降水量",
  max_10min_precipitation: "10分間最大降水量",
  daylight_hours: "日照時間",
  total_solar_radiation: "全天日射量",
  avg_wind_speed: "平均風速",
};

const temperatureMetrics = ["avg_temp", "max_temp", "min_temp"];
const precipitationMetrics = ["total_precipitation", "max_10min_precipitation"];
const textMetrics = ["weather_day", "weather_night"];

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number | string;
    color: string;
    dataKey: string;
    payload: Record<string, number | string | null>;
  }>;
  label?: string;
  selectedTextMetrics: string[];
}

const CustomTooltip = ({ active, payload, label, selectedTextMetrics }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg text-sm min-w-[180px]">
        <p className="font-bold text-gray-900 mb-2 border-b pb-1">{label}</p>
        <div className="space-y-1.5">
          {selectedTextMetrics.map((metric: string) => (
            <div key={metric} className="flex justify-between gap-4">
              <span className="text-gray-500">{metricLabels[metric]}</span>
              <span className="font-medium text-gray-900">{data[metric] || "-"}</span>
            </div>
          ))}
          {payload.map((entry, index) => (
            <div key={`item-${index}`} className="flex justify-between gap-4">
              <span style={{ color: entry.color }}>{entry.name}</span>
              <span className="font-medium text-gray-900">
                {entry.value}
                {temperatureMetrics.includes(entry.dataKey) ? "℃" : ""}
                {precipitationMetrics.includes(entry.dataKey) ? "mm" : ""}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

export function WeatherGraph({ data, selectedMetrics, strokeWidth }: WeatherGraphProps) {
  if (selectedMetrics.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 bg-gray-50 rounded-lg border border-dashed border-gray-300">
        <p className="text-gray-500">グラフを表示するメトリクスを選択してください</p>
      </div>
    );
  }

  // データを変換: nullチェックと数値化
  const transformedData = data.map((entry) => {
    const dateValue = entry.date?.content || "";
    const dataPoint: Record<string, number | string | null> = {
      dateStr: dateValue,
    };

    selectedMetrics.forEach((metric) => {
      const value = entry[metric]?.content;
      if (textMetrics.includes(metric)) {
        dataPoint[metric] = value !== undefined ? value : null;
      } else {
        // 数値データの場合は、数値としてパースを試みる（文字列でもRechartsは扱えるが明示的に）
        const numValue = value !== null && value !== "" ? Number(value) : null;
        dataPoint[metric] = !isNaN(numValue as number) ? numValue : null;
      }
    });

    return dataPoint;
  });

  // 温度メトリクスと降水メトリクスを分離して表示
  const tempMetrics = selectedMetrics.filter((m) => temperatureMetrics.includes(m));
  const precipMetrics = selectedMetrics.filter((m) => precipitationMetrics.includes(m));
  const selectedTextMetrics = selectedMetrics.filter((m) => textMetrics.includes(m));
  const otherMetrics = selectedMetrics.filter(
    (m) =>
      !temperatureMetrics.includes(m) &&
      !precipitationMetrics.includes(m) &&
      !textMetrics.includes(m),
  );

  // 適切な横軸ラベル間隔を計算（最大12個のラベルを表示）
  const labelInterval = Math.max(1, Math.floor(transformedData.length / 12));

  return (
    <div className="space-y-12">
      {tempMetrics.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <span className="w-1 h-6 bg-blue-600 rounded-full" />
            気温推移
          </h3>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height={350}>
              <LineChart data={transformedData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis
                  dataKey="dateStr"
                  interval={labelInterval}
                  tick={{ fill: "#6b7280", fontSize: 12 }}
                  tickMargin={10}
                />
                <YAxis
                  label={{
                    value: "気温 (℃)",
                    angle: -90,
                    position: "insideLeft",
                    fill: "#6b7280",
                    offset: -5,
                  }}
                  tick={{ fill: "#6b7280", fontSize: 12 }}
                />
                <Tooltip content={<CustomTooltip selectedTextMetrics={selectedTextMetrics} />} />
                <Legend wrapperStyle={{ paddingTop: "20px" }} />
                {tempMetrics.map((metric, idx) => (
                  <Line
                    key={metric}
                    type="monotone"
                    dataKey={metric}
                    stroke={COLORS[idx % COLORS.length]}
                    strokeWidth={strokeWidth}
                    name={metricLabels[metric] || metric}
                    dot={false}
                    activeDot={{ r: 6, strokeWidth: 0 }}
                  />
                ))}
                <Brush dataKey="dateStr" height={30} stroke="#cbd5e1" fill="#f8fafc" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {precipMetrics.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <span className="w-1 h-6 bg-blue-600 rounded-full" />
            降水量
          </h3>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={transformedData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis
                  dataKey="dateStr"
                  interval={labelInterval}
                  tick={{ fill: "#6b7280", fontSize: 12 }}
                  tickMargin={10}
                />
                <YAxis
                  label={{
                    value: "降水量 (mm)",
                    angle: -90,
                    position: "insideLeft",
                    fill: "#6b7280",
                    offset: -5,
                  }}
                  tick={{ fill: "#6b7280", fontSize: 12 }}
                />
                <Tooltip
                  cursor={{ fill: "#f3f4f6" }}
                  content={<CustomTooltip selectedTextMetrics={selectedTextMetrics} />}
                />
                <Legend wrapperStyle={{ paddingTop: "20px" }} />
                {precipMetrics.map((metric, idx) => (
                  <Bar
                    key={metric}
                    dataKey={metric}
                    fill={COLORS[(tempMetrics.length + idx) % COLORS.length]}
                    radius={[4, 4, 0, 0]}
                    name={metricLabels[metric] || metric}
                  />
                ))}
                <Brush dataKey="dateStr" height={30} stroke="#cbd5e1" fill="#f8fafc" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {otherMetrics.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <span className="w-1 h-6 bg-blue-600 rounded-full" />
            その他のメトリクス
          </h3>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height={350}>
              <LineChart data={transformedData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis
                  dataKey="dateStr"
                  interval={labelInterval}
                  tick={{ fill: "#6b7280", fontSize: 12 }}
                  tickMargin={10}
                />
                <YAxis tick={{ fill: "#6b7280", fontSize: 12 }} />
                <Tooltip content={<CustomTooltip selectedTextMetrics={selectedTextMetrics} />} />
                <Legend wrapperStyle={{ paddingTop: "20px" }} />
                {otherMetrics.map((metric, idx) => (
                  <Line
                    key={metric}
                    type="monotone"
                    dataKey={metric}
                    stroke={
                      COLORS[(tempMetrics.length + precipMetrics.length + idx) % COLORS.length]
                    }
                    strokeWidth={strokeWidth}
                    name={metricLabels[metric] || metric}
                    dot={false}
                    activeDot={{ r: 6, strokeWidth: 0 }}
                  />
                ))}
                <Brush dataKey="dateStr" height={30} stroke="#cbd5e1" fill="#f8fafc" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {selectedTextMetrics.length > 0 && (
        <div className="pt-6 border-t border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <span className="w-1 h-6 bg-blue-600 rounded-full" />
            天気概況
          </h3>
          <div className="overflow-hidden border border-gray-200 rounded-xl shadow-sm bg-white">
            <div className="max-h-[400px] overflow-y-auto overflow-x-auto custom-scrollbar">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50 sticky top-0 z-10">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider bg-gray-50">
                      日付
                    </th>
                    {selectedTextMetrics.map((metric) => (
                      <th
                        key={metric}
                        className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider bg-gray-50"
                      >
                        {metricLabels[metric]}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {transformedData.map((dataPoint, idx) => (
                    <tr key={idx} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {dataPoint.dateStr}
                      </td>
                      {selectedTextMetrics.map((metric) => (
                        <td
                          key={metric}
                          className="px-6 py-4 whitespace-nowrap text-sm text-gray-600"
                        >
                          <span
                            className={cn(
                              "px-2 py-1 rounded-md text-xs font-medium",
                              dataPoint[metric]?.toString().includes("雨")
                                ? "bg-blue-50 text-blue-700"
                                : dataPoint[metric]?.toString().includes("晴")
                                  ? "bg-orange-50 text-orange-700"
                                  : dataPoint[metric]?.toString().includes("曇")
                                    ? "bg-gray-100 text-gray-700"
                                    : "bg-gray-50 text-gray-600",
                            )}
                          >
                            {dataPoint[metric] || "-"}
                          </span>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
