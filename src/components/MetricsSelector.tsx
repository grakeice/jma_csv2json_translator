import { cn } from "../lib/utils";

interface MetricsSelectorProps {
  availableMetrics: string[];
  selectedMetrics: string[];
  onMetricsChange: (metrics: string[]) => void;
}

export function MetricsSelector({
  availableMetrics,
  selectedMetrics,
  onMetricsChange,
}: MetricsSelectorProps) {
  const handleToggle = (metric: string) => {
    if (selectedMetrics.includes(metric)) {
      onMetricsChange(selectedMetrics.filter((m) => m !== metric));
    } else {
      onMetricsChange([...selectedMetrics, metric]);
    }
  };

  const metricLabels: Record<string, string> = {
    date: "日付",
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

  return (
    <div className="my-6">
      <h3 className="text-lg font-medium mb-3">メトリクス選択</h3>
      <div className="flex flex-wrap gap-3">
        {availableMetrics.map((metric) => {
          const isSelected = selectedMetrics.includes(metric);
          return (
            <label
              key={metric}
              className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-md border cursor-pointer transition-colors text-sm",
                isSelected
                  ? "bg-blue-50 border-blue-200 text-blue-700"
                  : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50",
              )}
            >
              <input
                type="checkbox"
                className="hidden"
                checked={isSelected}
                onChange={() => handleToggle(metric)}
              />
              {metricLabels[metric] || metric}
            </label>
          );
        })}
      </div>
    </div>
  );
}
