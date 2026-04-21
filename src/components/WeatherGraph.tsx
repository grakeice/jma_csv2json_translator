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
import type { WeatherValue } from "../schema/json";

interface WeatherGraphProps {
  data: Record<string, WeatherValue>[];
  selectedMetrics: string[];
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
  total_precipitation: "降水量",
  max_10min_precipitation: "10分間最大降水量",
  daylight_hours: "日照時間",
  total_solar_radiation: "全天日射量",
  avg_wind_speed: "平均風速",
};

const temperatureMetrics = ["avg_temp", "max_temp", "min_temp"];
const precipitationMetrics = ["total_precipitation", "max_10min_precipitation"];

export function WeatherGraph({ data, selectedMetrics }: WeatherGraphProps) {
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
      dataPoint[metric] = value !== null && value !== undefined ? value : null;
    });

    return dataPoint;
  });

  // 温度メトリクスと降水メトリクスを分離して表示
  const tempMetrics = selectedMetrics.filter((m) => temperatureMetrics.includes(m));
  const precipMetrics = selectedMetrics.filter((m) => precipitationMetrics.includes(m));
  const otherMetrics = selectedMetrics.filter(
    (m) => !temperatureMetrics.includes(m) && !precipitationMetrics.includes(m),
  );

  // 適切な横軸ラベル間隔を計算（最大12個のラベルを表示）
  const labelInterval = Math.max(1, Math.floor(transformedData.length / 12));

  return (
    <div className="space-y-12">
      {tempMetrics.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-4">気温推移</h3>
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
                <Tooltip
                  contentStyle={{
                    borderRadius: "8px",
                    border: "1px solid #e5e7eb",
                    boxShadow: "none",
                  }}
                />
                <Legend wrapperStyle={{ paddingTop: "20px" }} />
                {tempMetrics.map((metric, idx) => (
                  <Line
                    key={metric}
                    type="monotone"
                    dataKey={metric}
                    stroke={COLORS[idx % COLORS.length]}
                    strokeWidth={1}
                    name={metricLabels[metric] || metric}
                    dot={false}
                    activeDot={{ r: 6 }}
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
          <h3 className="text-lg font-semibold text-gray-800 mb-4">降水量</h3>
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
                  contentStyle={{
                    borderRadius: "8px",
                    border: "none",
                    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                  }}
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
          <h3 className="text-lg font-semibold text-gray-800 mb-4">その他のメトリクス</h3>
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
                <Tooltip
                  contentStyle={{
                    borderRadius: "8px",
                    border: "1px solid #e5e7eb",
                    boxShadow: "none",
                  }}
                />
                <Legend wrapperStyle={{ paddingTop: "20px" }} />
                {otherMetrics.map((metric, idx) => (
                  <Line
                    key={metric}
                    type="monotone"
                    dataKey={metric}
                    stroke={
                      COLORS[(tempMetrics.length + precipMetrics.length + idx) % COLORS.length]
                    }
                    strokeWidth={1}
                    name={metricLabels[metric] || metric}
                    dot={false}
                    activeDot={{ r: 6 }}
                  />
                ))}
                <Brush dataKey="dateStr" height={30} stroke="#cbd5e1" fill="#f8fafc" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}
