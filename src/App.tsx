import { useRef, useState } from "react";
import "./App.css";
import { transformAndValidateWeather } from "./lib/translator";
import type { WeatherJsonOutput } from "./schema/json";
import { Button } from "./components/ui/button";
import { Input } from "./components/ui/input";
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
      <div className="max-w-5xl mx-auto space-y-10">
        <header className="mb-12 text-center pt-8">
          <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl text-gray-900">
            JMA CSV to JSON 変換ツール
          </h1>
          <p className="text-gray-500 mt-4 text-lg max-w-2xl mx-auto leading-relaxed">
            気象庁の過去の気象データ(CSV)をJSONに変換し、グラフで可視化します。
          </p>
        </header>

        <div className="flex justify-center">
          <div className="w-full max-w-xl bg-white p-8 rounded-[2rem] border border-gray-200 transition-all hover:bg-gray-50/30">
            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-[0.2em] mb-6 text-center">
              データの読み込み
            </h2>
            <div className="flex flex-col sm:flex-row gap-3 items-center">
              <div className="flex-1 w-full">
                <Input
                  type="file"
                  name="csv"
                  id="csv"
                  ref={csvRef}
                  accept=".csv"
                  className="cursor-pointer bg-gray-50 border-gray-200 rounded-xl py-6 px-4 h-auto text-sm focus:ring-blue-100 transition-all"
                />
              </div>
              <Button
                onClick={handleClick}
                className="w-full sm:w-auto px-8 py-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white transition-all shadow-lg shadow-blue-100 active:scale-95 h-auto font-bold uppercase tracking-wider text-xs"
              >
                解析を開始
              </Button>
            </div>
            {error && (
              <div className="mt-4 p-3 bg-red-50 rounded-xl border border-red-100">
                <p className="text-red-500 font-medium text-xs text-center">{error}</p>
              </div>
            )}
          </div>
        </div>

        {result && <WeatherResultView result={result} onDownload={handleDownload} />}
      </div>
    </div>
  );
}

export default App;
