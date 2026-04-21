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
			<div className="flex flex-col items-start justify-between gap-6 rounded-[2rem] border border-gray-200 bg-white p-6 sm:flex-row sm:items-center">
				<div className="flex flex-wrap items-center gap-8 px-4">
					<div className="space-y-1">
						<p className="text-[10px] font-bold tracking-widest text-gray-400 uppercase">地域</p>
						<p className="text-xl font-bold text-gray-800">{result.location}</p>
					</div>
					<div className="hidden h-8 w-px bg-gray-200 sm:block" />
					<div className="space-y-1">
						<p className="text-[10px] font-bold tracking-widest text-gray-400 uppercase">
							データ期間
						</p>
						<p className="text-xl font-bold text-gray-800">{result.data.length} 日間</p>
					</div>
				</div>
				<div className="flex w-full gap-3 sm:w-auto">
					<Button
						variant="outline"
						onClick={() => setShowJson(!showJson)}
						className="h-12 flex-1 rounded-xl border-gray-200 px-6 text-xs font-bold tracking-wider text-gray-500 uppercase shadow-sm transition-all hover:bg-white sm:flex-none"
					>
						{showJson ? "グラフを見る" : "JSONを表示"}
					</Button>
					<Button
						onClick={onDownload}
						className="h-12 flex-1 rounded-xl bg-blue-500 px-6 text-xs font-bold tracking-wider text-white uppercase shadow-md shadow-blue-100 transition-all hover:bg-blue-600 active:scale-95 sm:flex-none"
					>
						ダウンロード
					</Button>
				</div>
			</div>

			<div className={cn(!showJson && "hidden")}>
				<div className="overflow-hidden rounded-[2rem] border border-gray-200 bg-white transition-all">
					<div className="flex items-center justify-between border-b border-gray-100 bg-gray-50/50 px-8 py-5">
						<h3 className="text-[10px] font-black tracking-[0.2em] text-gray-400 uppercase">
							JSON Output
						</h3>
					</div>
					<div className="p-4 pt-0 sm:p-8 sm:pt-0">
						<div className="overflow-hidden rounded-2xl border border-gray-800">
							<Suspense
								fallback={
									<div className="flex h-[600px] animate-pulse items-center justify-center bg-[#0d1117] font-mono text-xs tracking-widest text-sky-400 italic">
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
					<div className="rounded-[2.5rem] border border-gray-200 bg-white p-8 transition-all">
						<MetricsSelector
							availableMetrics={getAvailableMetrics()}
							selectedMetrics={selectedMetrics}
							onMetricsChange={setSelectedMetrics}
							strokeWidth={strokeWidth}
							onStrokeWidthChange={setStrokeWidth}
						/>
						<div className="mt-6 border-t border-gray-50 pt-6">
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
