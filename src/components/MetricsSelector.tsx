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
    <div style={{ marginTop: "20px", marginBottom: "20px" }}>
      <h3>メトリクス選択</h3>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
        {availableMetrics.map((metric) => (
          <label key={metric} style={{ display: "flex", alignItems: "center" }}>
            <input
              type="checkbox"
              checked={selectedMetrics.includes(metric)}
              onChange={() => handleToggle(metric)}
              style={{ marginRight: "5px" }}
            />
            {metricLabels[metric] || metric}
          </label>
        ))}
      </div>
    </div>
  );
}
