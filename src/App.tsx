import { useRef, useState } from "react";
import "./App.css";
import { transformAndValidateWeather } from "./lib/translator";
import type { WeatherJsonOutput } from "./schema/json";

function App() {
  const csvRef = useRef<HTMLInputElement>(null);
  const [result, setResult] = useState<WeatherJsonOutput | null>(null);
  const [error, setError] = useState("");

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
      } catch (err) {
        setError(err instanceof Error ? err.message : "エラーが発生しました");
        setResult(null);
      }
    };
    reader.onerror = () => {
      setError("ファイルの読み込みに失敗しました");
      setResult(null);
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

  return (
    <>
      <input type="file" name="csv" id="csv" ref={csvRef} accept=".csv" />
      <button onClick={handleClick}>読み込む</button>
      {error && <p style={{ color: "red" }}>{error}</p>}
      {result && (
        <>
          <button onClick={handleDownload} style={{ marginLeft: "8px" }}>
            ダウンロード
          </button>
          <pre>{JSON.stringify(result, null, 2)}</pre>
        </>
      )}
    </>
  );
}

export default App;
