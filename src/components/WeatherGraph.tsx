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
      <div className="bg-white p-4 border border-gray-200 rounded-2xl text-xs min-w-[200px] animate-in fade-in zoom-in-95 duration-200">
        <p className="font-black text-gray-400 uppercase tracking-widest mb-3 border-b border-gray-50 pb-2 flex justify-between">
          <span>Date</span>
          <span className="text-gray-900">{label}</span>
        </p>
        <div className="space-y-2.5">
          {selectedTextMetrics.map((metric: string) => (
            <div key={metric} className="flex justify-between gap-6 items-center">
              <span className="text-gray-400 font-bold uppercase tracking-tight text-[10px]">
                {metricLabels[metric]}
              </span>
              <span className="font-bold text-gray-800 bg-gray-50 px-2 py-0.5 rounded-lg">
                {data[metric] || "-"}
              </span>
            </div>
          ))}
          {payload.map((entry, index) => (
            <div key={`item-${index}`} className="flex justify-between gap-6 items-center">
              <span
                className="font-bold uppercase tracking-tight text-[10px]"
                style={{ color: entry.color }}
              >
                {entry.name}
              </span>
              <span className="font-black text-gray-900">
                {entry.value}
                <span className="text-[10px] ml-0.5 font-bold text-gray-400">
                  {temperatureMetrics.includes(entry.dataKey) ? "℃" : ""}
                  {precipitationMetrics.includes(entry.dataKey) ? "mm" : ""}
                </span>
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

interface CustomTravellerProps {
  x: number;
  y: number;
  width: number;
  height: number;
}

const renderCustomTraveller = ({ x, y, width, height }: CustomTravellerProps) => {
  return (
    <rect
      x={x + width / 2 - 1.5}
      y={y}
      width={3}
      height={height}
      fill="#94a3b8"
      stroke="none"
      rx={1.5}
      className="hover:fill-blue-500 cursor-ew-resize transition-colors duration-200"
    />
  );
};

export function WeatherGraph({ data, selectedMetrics, strokeWidth }: WeatherGraphProps) {
  if (selectedMetrics.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 bg-gray-50/50 rounded-[2rem] border border-dashed border-gray-200">
        <p className="text-gray-400 font-bold text-xs uppercase tracking-widest italic">
          Please select metrics to visualize
        </p>
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
    <div className="space-y-10">
      {tempMetrics.length > 0 && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
          <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.3em] mb-2 flex items-center gap-4">
            <span className="w-8 h-px bg-gray-100" />
            気温推移
            <span className="flex-1 h-px bg-gray-100" />
          </h3>
          <div className="h-[400px] w-full focus:outline-none [&_*]:outline-none">
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={transformedData} margin={{ top: 0, right: 30, left: 0, bottom: 40 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis
                  dataKey="dateStr"
                  interval={labelInterval}
                  tick={{ fill: "#9ca3af", fontSize: 10, fontWeight: 700 }}
                  tickMargin={10}
                  axisLine={{ stroke: "#f3f4f6" }}
                />
                <YAxis
                  tick={{ fill: "#9ca3af", fontSize: 10, fontWeight: 700 }}
                  axisLine={{ stroke: "#f3f4f6" }}
                  tickMargin={10}
                />
                <Tooltip content={<CustomTooltip selectedTextMetrics={selectedTextMetrics} />} />
                <Legend
                  verticalAlign="top"
                  align="right"
                  height={24}
                  iconType="circle"
                  formatter={(value) => (
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">
                      {value}
                    </span>
                  )}
                />
                {tempMetrics.map((metric, idx) => (
                  <Line
                    key={metric}
                    type="monotone"
                    dataKey={metric}
                    stroke={COLORS[idx % COLORS.length]}
                    strokeWidth={strokeWidth}
                    name={metricLabels[metric] || metric}
                    dot={false}
                    activeDot={{ r: 4, strokeWidth: 0 }}
                  />
                ))}
                <Brush
                  dataKey="dateStr"
                  height={24}
                  stroke="#cbd5e1"
                  fill="#f8fafc"
                  travellerWidth={10}
                  traveller={renderCustomTraveller}
                  gap={50}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {precipMetrics.length > 0 && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
          <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.3em] mb-2 flex items-center gap-4 text-left">
            <span className="w-8 h-px bg-gray-100" />
            降水量
            <span className="flex-1 h-px bg-gray-100" />
          </h3>
          <div className="h-[400px] w-full focus:outline-none [&_*]:outline-none">
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={transformedData} margin={{ top: 0, right: 30, left: 0, bottom: 40 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis
                  dataKey="dateStr"
                  interval={labelInterval}
                  tick={{ fill: "#9ca3af", fontSize: 10, fontWeight: 700 }}
                  tickMargin={10}
                  axisLine={{ stroke: "#f3f4f6" }}
                />
                <YAxis
                  tick={{ fill: "#9ca3af", fontSize: 10, fontWeight: 700 }}
                  axisLine={{ stroke: "#f3f4f6" }}
                  tickMargin={10}
                />
                <Tooltip
                  cursor={{ fill: "#fafafa" }}
                  content={<CustomTooltip selectedTextMetrics={selectedTextMetrics} />}
                />
                <Legend
                  verticalAlign="top"
                  align="right"
                  height={24}
                  iconType="circle"
                  formatter={(value) => (
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">
                      {value}
                    </span>
                  )}
                />
                {precipMetrics.map((metric, idx) => (
                  <Bar
                    key={metric}
                    dataKey={metric}
                    fill={COLORS[(tempMetrics.length + idx) % COLORS.length]}
                    radius={[2, 2, 0, 0]}
                    name={metricLabels[metric] || metric}
                    maxBarSize={40}
                  />
                ))}
                <Brush
                  dataKey="dateStr"
                  height={24}
                  stroke="#cbd5e1"
                  fill="#f8fafc"
                  travellerWidth={10}
                  traveller={renderCustomTraveller}
                  gap={50}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {otherMetrics.length > 0 && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
          <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.3em] mb-2 flex items-center gap-4 text-left">
            <span className="w-8 h-px bg-gray-100" />
            その他のメトリクス
            <span className="flex-1 h-px bg-gray-100" />
          </h3>
          <div className="h-[400px] w-full focus:outline-none [&_*]:outline-none">
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={transformedData} margin={{ top: 0, right: 30, left: 0, bottom: 40 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis
                  dataKey="dateStr"
                  interval={labelInterval}
                  tick={{ fill: "#9ca3af", fontSize: 10, fontWeight: 700 }}
                  tickMargin={10}
                  axisLine={{ stroke: "#f3f4f6" }}
                />
                <YAxis
                  tick={{ fill: "#9ca3af", fontSize: 10, fontWeight: 700 }}
                  axisLine={{ stroke: "#f3f4f6" }}
                  tickMargin={10}
                />
                <Tooltip content={<CustomTooltip selectedTextMetrics={selectedTextMetrics} />} />
                <Legend
                  verticalAlign="top"
                  align="right"
                  height={24}
                  iconType="circle"
                  formatter={(value) => (
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">
                      {value}
                    </span>
                  )}
                />
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
                    activeDot={{ r: 4, strokeWidth: 0 }}
                  />
                ))}
                <Brush
                  dataKey="dateStr"
                  height={24}
                  stroke="#cbd5e1"
                  fill="#f8fafc"
                  travellerWidth={10}
                  traveller={renderCustomTraveller}
                  gap={50}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {selectedTextMetrics.length > 0 && (
        <div className="pt-12 border-t border-gray-50 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-400">
          <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.3em] mb-2 flex items-center gap-4">
            <span className="w-8 h-px bg-gray-100" />
            天気概況
            <span className="flex-1 h-px bg-gray-100" />
          </h3>
          <div className="overflow-hidden border border-gray-200 rounded-[2rem] bg-white">
            <div className="max-h-[500px] overflow-y-auto overflow-x-auto custom-scrollbar">
              <table className="min-w-full divide-y divide-gray-50">
                <thead className="bg-gray-50/50 sticky top-0 z-10 backdrop-blur-md">
                  <tr>
                    <th className="px-8 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                      日付
                    </th>
                    {selectedTextMetrics.map((metric) => (
                      <th
                        key={metric}
                        className="px-8 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]"
                      >
                        {metricLabels[metric]}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-50">
                  {transformedData.map((dataPoint, idx) => (
                    <tr key={idx} className="hover:bg-gray-50/50 transition-colors group">
                      <td className="px-8 py-5 whitespace-nowrap text-xs font-bold text-gray-400 group-hover:text-gray-900 transition-colors">
                        {dataPoint.dateStr}
                      </td>
                      {selectedTextMetrics.map((metric) => (
                        <td
                          key={metric}
                          className="px-8 py-5 whitespace-nowrap text-xs text-gray-600"
                        >
                          <span
                            className={cn(
                              "px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all",
                              dataPoint[metric]?.toString().includes("雨")
                                ? "bg-blue-50 text-blue-500 border border-blue-100/50"
                                : dataPoint[metric]?.toString().includes("晴")
                                  ? "bg-orange-50 text-orange-500 border border-orange-100/50"
                                  : dataPoint[metric]?.toString().includes("曇")
                                    ? "bg-gray-50 text-gray-500 border border-gray-100/50"
                                    : "bg-gray-50/50 text-gray-400 border border-transparent",
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
