import { useRef, useState } from "react";
import "./App.css";
import { transformAndValidateWeather } from "./lib/translator";
import type { WeatherJsonOutput } from "./schema/json";
import { Button } from "./components/ui/button";
import { Input } from "./components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "./components/ui/card";
import { WeatherResultView } from "./components/WeatherResultView";

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
    <div className="min-h-screen bg-gray-50 text-gray-900 p-6 font-sans">
      <div className="max-w-5xl mx-auto space-y-6">
        <header className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            JMA CSV to JSON 変換ツール
          </h1>
          <p className="text-gray-500 mt-2">
            気象庁の過去の気象データ(CSV)をJSONに変換し、グラフで可視化します。
          </p>
        </header>

        <Card>
          <CardHeader>
            <CardTitle>データの読み込み</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
              <div className="flex-1 w-full max-w-sm">
                <Input
                  type="file"
                  name="csv"
                  id="csv"
                  ref={csvRef}
                  accept=".csv"
                  className="cursor-pointer"
                />
              </div>
              <Button onClick={handleClick}>変換する</Button>
            </div>
            {error && <p className="text-red-500 font-medium mt-4 text-sm">{error}</p>}
          </CardContent>
        </Card>

        {result && <WeatherResultView result={result} onDownload={handleDownload} />}
      </div>
    </div>
  );
}

export default App;
