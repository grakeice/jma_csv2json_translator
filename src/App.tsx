import { useRef, useState } from "react";
import "./App.css";
import { transformAndValidateWeather } from "./lib/translator";
import { MetricsSelector } from "./components/MetricsSelector";
import { WeatherGraph } from "./components/WeatherGraph";
import type { WeatherJsonOutput } from "./schema/json";

function App() {
  const csvRef = useRef<HTMLInputElement>(null);
  const [result, setResult] = useState<WeatherJsonOutput | null>(null);
  const [error, setError] = useState("");
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>([]);
  const [showJson, setShowJson] = useState(true);

  const handleClick = () => {
    const file = csvRef.current?.files?.[0];
    if (!file) {
      setError("ファイルを選択してください");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const csvString = e.target?.result as string;
        const jsonData = transformAndValidateWeather(csvString);
        setResult(jsonData);
        setError("");
        setSelectedMetrics([]); // リセット
      } catch (err) {
        setError(err instanceof Error ? err.message : "エラーが発生しました");
        setResult(null);
        setSelectedMetrics([]);
      }
    };
    reader.onerror = () => {
      setError("ファイルの読み込みに失敗しました");
      setResult(null);
      setSelectedMetrics([]);
    };
    reader.readAsText(file, "Shift_JIS");
  };

  const handleDownload = () => {
    if (!result) return;

    const jsonString = JSON.stringify(result, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `weather_${result.location}_${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const getAvailableMetrics = () => {
    if (!result || result.data.length === 0) return [];
    const metricsSet = new Set<string>();
    Object.keys(result.data[0]).forEach((key) => {
      if (key !== "date") {
        metricsSet.add(key);
      }
    });
    return Array.from(metricsSet);
  };

  return (
    <>
      <div style={{ padding: "20px" }}>
        <h1>JMA CSV to JSON 変換ツール</h1>
        <div style={{ marginBottom: "20px" }}>
          <input
            type="file"
            name="csv"
            id="csv"
            ref={csvRef}
            accept=".csv"
            style={{ marginRight: "10px" }}
          />
          <button onClick={handleClick}>読み込む</button>
        </div>

        {error && <p style={{ color: "red", fontWeight: "bold" }}>{error}</p>}

        {result && (
          <>
            <div style={{ marginBottom: "20px" }}>
              <p>
                <strong>地域:</strong> {result.location}
              </p>
              <p>
                <strong>データ件数:</strong> {result.data.length}
              </p>
            </div>

            <div style={{ marginBottom: "20px" }}>
              <button onClick={handleDownload} style={{ marginRight: "10px", padding: "8px 16px" }}>
                JSONをダウンロード
              </button>
              <button onClick={() => setShowJson(!showJson)} style={{ padding: "8px 16px" }}>
                {showJson ? "グラフを表示" : "JSONを表示"}
              </button>
            </div>

            {showJson ? (
              <div>
                <h2>JSON データ</h2>
                <pre
                  style={{
                    backgroundColor: "#f5f5f5",
                    padding: "10px",
                    borderRadius: "4px",
                    maxHeight: "400px",
                    overflowY: "auto",
                  }}
                >
                  {JSON.stringify(result, null, 2)}
                </pre>
              </div>
            ) : (
              <div>
                <MetricsSelector
                  availableMetrics={getAvailableMetrics()}
                  selectedMetrics={selectedMetrics}
                  onMetricsChange={setSelectedMetrics}
                />
                <WeatherGraph data={result.data} selectedMetrics={selectedMetrics} />
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}

export default App;
