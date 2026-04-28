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
		<div className="animate-in fade-in slide-in-from-bottom-8 space-y-10 duration-700">
			<div className="flex flex-col items-start justify-between gap-6 rounded-3xl bg-gray-100 p-6 shadow-lg shadow-gray-300/50 transition-all duration-300 sm:flex-row sm:items-center">
				<div className="flex flex-wrap items-center gap-8 px-4">
					<div className="space-y-1">
						<p className="text-[10px] font-bold tracking-widest text-gray-500 uppercase">地域</p>
						<p className="text-xl font-bold text-gray-800">{result.location}</p>
					</div>
					<div className="hidden h-8 w-px bg-gray-300/40 sm:block" />
					<div className="space-y-1">
						<p className="text-[10px] font-bold tracking-widest text-gray-500 uppercase">
							データ期間
						</p>
						<p className="text-xl font-bold text-gray-800">{result.data.length} 日間</p>
					</div>
				</div>
				<div className="flex w-full gap-3 sm:w-auto">
					<Button
						variant="outline"
						onClick={() => setShowJson(!showJson)}
						className="h-12 flex-1 rounded-2xl px-6 text-xs font-bold tracking-wider text-gray-600 uppercase transition-all sm:flex-none"
					>
						{showJson ? "グラフを見る" : "JSONを表示"}
					</Button>
					<Button
						onClick={onDownload}
						className="h-12 flex-1 rounded-2xl bg-amber-100 px-6 text-xs font-bold tracking-wider text-amber-700 uppercase shadow-lg shadow-gray-300/40 transition-all hover:shadow-lg hover:shadow-gray-300/50 active:shadow-inner active:shadow-gray-300 sm:flex-none"
					>
						ダウンロード
					</Button>
				</div>
			</div>

			<div className={cn(!showJson && "hidden")}>
				<div className="overflow-hidden rounded-3xl bg-gray-100 shadow-lg shadow-gray-300/50 transition-all">
					<div className="flex items-center justify-between border-b border-gray-200/30 bg-gray-100 px-8 py-5">
						<h3 className="text-[10px] font-black tracking-[0.2em] text-gray-500 uppercase">
							JSON Output
						</h3>
					</div>
					<div className="p-4 pt-0 sm:p-8 sm:pt-0">
						<div className="overflow-hidden rounded-2xl">
							<Suspense
								fallback={
									<div className="flex h-[600px] animate-pulse items-center justify-center bg-gray-200 font-mono text-xs tracking-widest text-gray-600 italic shadow-inner shadow-gray-300">
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
					<div className="rounded-3xl bg-gray-100 p-8 shadow-lg shadow-gray-300/50 transition-all">
						<MetricsSelector
							availableMetrics={getAvailableMetrics()}
							selectedMetrics={selectedMetrics}
							onMetricsChange={setSelectedMetrics}
							strokeWidth={strokeWidth}
							onStrokeWidthChange={setStrokeWidth}
						/>
						<div className="mt-6 border-t border-gray-200/30 pt-6">
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
