import { useState } from "react";
import { MetricsSelector } from "./MetricsSelector";
import { WeatherGraph } from "./WeatherGraph";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { JsonHighlighter } from "./JsonHighlighter";
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
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center bg-white p-4 rounded-xl border border-gray-200">
        <div>
          <p className="text-sm text-gray-500">地域</p>
          <p className="text-lg font-semibold">{result.location}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">データ件数</p>
          <p className="text-lg font-semibold">{result.data.length}件</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto mt-4 sm:mt-0">
          <Button
            variant="outline"
            onClick={() => setShowJson(!showJson)}
            className="flex-1 sm:flex-none"
          >
            {showJson ? "グラフを表示" : "JSONを表示"}
          </Button>
          <Button onClick={onDownload} className="flex-1 sm:flex-none">
            JSONをダウンロード
          </Button>
        </div>
      </div>

      {showJson ? (
        <Card>
          <CardHeader>
            <CardTitle>JSON データ</CardTitle>
          </CardHeader>
          <CardContent>
            <JsonHighlighter data={result} />
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="pt-6">
            <MetricsSelector
              availableMetrics={getAvailableMetrics()}
              selectedMetrics={selectedMetrics}
              onMetricsChange={setSelectedMetrics}
            />
            <div className="mt-8 border-t border-gray-100 pt-6">
              <WeatherGraph data={result.data} selectedMetrics={selectedMetrics} />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
