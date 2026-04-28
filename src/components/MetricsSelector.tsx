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
					<h3 className="text-xs font-bold tracking-widest text-gray-500 uppercase">
						表示メトリクス
					</h3>

					<div className="flex w-fit items-center gap-3 rounded-2xl bg-gray-100 px-3 py-1.5 shadow-inner shadow-gray-200">
						<span className="text-[10px] font-bold tracking-tight text-gray-500 uppercase">
							線の太さ
						</span>
						<input
							type="range"
							min="1"
							max="6"
							step="0.5"
							value={strokeWidth}
							onChange={(e) => onStrokeWidthChange(parseFloat(e.target.value))}
							className="h-1 w-24 cursor-pointer appearance-none rounded-lg bg-gray-200 accent-gray-600 transition-colors hover:accent-gray-700"
						/>
						<span className="min-w-[24px] font-mono text-[10px] text-gray-500">
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
								style={
									!isSelected
										? {
												boxShadow:
													"inset 0 1px 0 rgba(255, 255, 255, 0.8), 0 2px 4px rgba(150, 150, 150, 0.3)",
											}
										: {}
								}
								className={cn(
									"flex items-center gap-2 px-3 py-1.5 rounded-2xl cursor-pointer transition-all text-xs font-medium",
									isSelected
										? "bg-blue-50 text-blue-700 shadow-inner shadow-gray-300"
										: "bg-gray-100 text-gray-600",
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
