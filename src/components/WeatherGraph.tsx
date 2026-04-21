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
  "#8884d8",
  "#82ca9d",
  "#ffc658",
  "#ff7c7c",
  "#8dd1e1",
  "#d084d0",
  "#82d982",
  "#ffa500",
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
    return <p>グラフを表示するメトリクスを選択してください</p>;
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
    <div style={{ marginTop: "30px" }}>
      {tempMetrics.length > 0 && (
        <div style={{ marginBottom: "40px" }}>
          <h3>気温推移</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={transformedData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="dateStr" interval={labelInterval} />
              <YAxis label={{ value: "気温 (℃)", angle: -90, position: "insideLeft" }} />
              <Tooltip />
              <Legend />
              {tempMetrics.map((metric, idx) => (
                <Line
                  key={metric}
                  type="monotone"
                  dataKey={metric}
                  stroke={COLORS[idx % COLORS.length]}
                  name={metricLabels[metric] || metric}
                  dot={false}
                />
              ))}
              <Brush dataKey="dateStr" height={30} stroke="#8884d8" fill="#f0f0f0" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {precipMetrics.length > 0 && (
        <div style={{ marginBottom: "40px" }}>
          <h3>降水量</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={transformedData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="dateStr" interval={labelInterval} />
              <YAxis label={{ value: "降水量 (mm)", angle: -90, position: "insideLeft" }} />
              <Tooltip />
              <Legend />
              {precipMetrics.map((metric, idx) => (
                <Bar
                  key={metric}
                  dataKey={metric}
                  fill={COLORS[tempMetrics.length + idx]}
                  name={metricLabels[metric] || metric}
                />
              ))}
              <Brush dataKey="dateStr" height={30} stroke="#82ca9d" fill="#f0f0f0" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {otherMetrics.length > 0 && (
        <div style={{ marginBottom: "40px" }}>
          <h3>その他のメトリクス</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={transformedData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="dateStr" interval={labelInterval} />
              <YAxis />
              <Tooltip />
              <Legend />
              {otherMetrics.map((metric, idx) => (
                <Line
                  key={metric}
                  type="monotone"
                  dataKey={metric}
                  stroke={COLORS[tempMetrics.length + precipMetrics.length + idx]}
                  name={metricLabels[metric] || metric}
                  dot={false}
                />
              ))}
              <Brush dataKey="dateStr" height={30} stroke="#ffc658" fill="#f0f0f0" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
