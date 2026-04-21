import { cn } from "../lib/utils";

interface MetricsSelectorProps {
	availableMetrics: string[];
	selectedMetrics: string[];
	onMetricsChange: (metrics: string[]) => void;
	strokeWidth: number;
	onStrokeWidthChange: (width: number) => void;
}

export function MetricsSelector({
	availableMetrics,
	selectedMetrics,
	onMetricsChange,
	strokeWidth,
	onStrokeWidthChange,
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
		<div className="space-y-6">
			<div>
				<div className="mb-4 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
					<h3 className="text-xs font-bold tracking-widest text-gray-400 uppercase">
						表示メトリクス
					</h3>

					<div className="flex w-fit items-center gap-3 rounded-full border border-gray-100 bg-gray-50 px-3 py-1.5">
						<span className="text-[10px] font-bold tracking-tight text-gray-400 uppercase">
							線の太さ
						</span>
						<input
							type="range"
							min="1"
							max="6"
							step="0.5"
							value={strokeWidth}
							onChange={(e) => onStrokeWidthChange(parseFloat(e.target.value))}
							className="h-1 w-24 cursor-pointer appearance-none rounded-lg bg-gray-200 accent-gray-400 transition-colors hover:accent-blue-500"
						/>
						<span className="min-w-[24px] font-mono text-[10px] text-gray-400">
							{strokeWidth.toFixed(1)}
						</span>
					</div>
				</div>

				<div className="flex flex-wrap gap-2">
					{availableMetrics.map((metric) => {
						const isSelected = selectedMetrics.includes(metric);
						return (
							<label
								key={metric}
								className={cn(
									"flex items-center gap-2 px-3 py-1.5 rounded-full border cursor-pointer transition-all text-xs font-medium",
									isSelected
										? "bg-blue-50 border-blue-200 text-blue-600 shadow-sm"
										: "bg-white border-gray-200 text-gray-500 hover:border-gray-300 hover:bg-gray-50",
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
		</div>
	);
}
