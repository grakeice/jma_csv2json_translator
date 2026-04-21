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
		<div className="min-h-screen bg-gray-50 p-6 font-sans text-gray-900">
			<div className="mx-auto max-w-5xl space-y-10">
				<header className="mb-12 pt-8 text-center">
					<h1 className="text-4xl font-extrabold tracking-tight text-gray-900 text-gray-900 sm:text-5xl">
						JMA CSV to JSON 変換ツール
					</h1>
					<p className="mx-auto mt-4 max-w-2xl text-lg leading-relaxed text-gray-500">
						気象庁の過去の気象データ(CSV)をJSONに変換し、グラフで可視化します。
					</p>
				</header>

				<div className="flex justify-center">
					<div className="w-full max-w-xl rounded-[2rem] border border-gray-200 bg-white p-8 transition-all hover:bg-gray-50/30">
						<h2 className="mb-6 text-center text-xs font-bold tracking-[0.2em] text-gray-400 uppercase">
							データの読み込み
						</h2>
						<div className="flex flex-col items-center gap-3 sm:flex-row">
							<div className="w-full flex-1">
								<Input
									type="file"
									name="csv"
									id="csv"
									ref={csvRef}
									accept=".csv"
									className="h-auto cursor-pointer rounded-xl border-gray-200 bg-gray-50 px-4 py-6 text-sm transition-all focus:ring-blue-100"
								/>
							</div>
							<Button
								onClick={handleClick}
								className="h-auto w-full rounded-xl bg-blue-600 px-8 py-6 text-xs font-bold tracking-wider text-white uppercase shadow-lg shadow-blue-100 transition-all hover:bg-blue-700 active:scale-95 sm:w-auto"
							>
								解析を開始
							</Button>
						</div>
						{error && (
							<div className="mt-4 rounded-xl border border-red-100 bg-red-50 p-3">
								<p className="text-center text-xs font-medium text-red-500">{error}</p>
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
