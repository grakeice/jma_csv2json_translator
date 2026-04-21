import { useState, Suspense } from "react";
import { MetricsSelector } from "./MetricsSelector";
import { WeatherGraph } from "./WeatherGraph";
import { Button } from "./ui/button";
import { JsonHighlighter } from "./JsonHighlighter";
import { cn } from "../lib/utils";
import type { WeatherJsonOutput } from "../schema/json";

interface WeatherResultViewProps {
  result: WeatherJsonOutput;
  onDownload: () => void;
}

export function WeatherResultView({ result, onDownload }: WeatherResultViewProps) {
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>([
    "avg_temp",
    "max_temp",
    "min_temp",
  ]);
  const [strokeWidth, setStrokeWidth] = useState(1);
  const [showJson, setShowJson] = useState(false);

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
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
      <div className="flex flex-col sm:flex-row gap-6 justify-between items-start sm:items-center bg-white p-6 rounded-[2rem] border border-gray-200">
        <div className="flex flex-wrap gap-8 items-center px-4">
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">地域</p>
            <p className="text-xl font-bold text-gray-800">{result.location}</p>
          </div>
          <div className="w-px h-8 bg-gray-200 hidden sm:block" />
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              データ期間
            </p>
            <p className="text-xl font-bold text-gray-800">{result.data.length} 日間</p>
          </div>
        </div>
        <div className="flex gap-3 w-full sm:w-auto">
          <Button
            variant="outline"
            onClick={() => setShowJson(!showJson)}
            className="flex-1 sm:flex-none border-gray-200 text-gray-500 hover:bg-white rounded-xl px-6 h-12 text-xs font-bold uppercase tracking-wider transition-all shadow-sm"
          >
            {showJson ? "グラフを見る" : "JSONを表示"}
          </Button>
          <Button
            onClick={onDownload}
            className="flex-1 sm:flex-none bg-blue-500 hover:bg-blue-600 text-white rounded-xl px-6 h-12 text-xs font-bold uppercase tracking-wider transition-all shadow-md shadow-blue-100 active:scale-95"
          >
            ダウンロード
          </Button>
        </div>
      </div>

      <div className={cn(!showJson && "hidden")}>
        <div className="overflow-hidden rounded-[2rem] border border-gray-200 bg-white transition-all">
          <div className="px-8 py-5 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
              JSON Output
            </h3>
          </div>
          <div className="p-4 sm:p-8 pt-0 sm:pt-0">
            <div className="rounded-2xl overflow-hidden border border-gray-800">
              <Suspense
                fallback={
                  <div className="h-[600px] flex items-center justify-center bg-[#0d1117] text-sky-400 animate-pulse font-mono text-xs italic tracking-widest">
                    Compiling Syntax Highlighter...
                  </div>
                }
              >
                <JsonHighlighter data={result} />
              </Suspense>
            </div>
          </div>
        </div>
      </div>

      <div className={cn(showJson && "hidden")}>
        <div className="space-y-10">
          <div className="bg-white p-8 rounded-[2.5rem] border border-gray-200 transition-all">
            <MetricsSelector
              availableMetrics={getAvailableMetrics()}
              selectedMetrics={selectedMetrics}
              onMetricsChange={setSelectedMetrics}
              strokeWidth={strokeWidth}
              onStrokeWidthChange={setStrokeWidth}
            />
            <div className="mt-6 pt-6 border-t border-gray-50">
              <WeatherGraph
                data={result.data}
                selectedMetrics={selectedMetrics}
                strokeWidth={strokeWidth}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
