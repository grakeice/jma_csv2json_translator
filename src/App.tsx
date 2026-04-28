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
		<div className="min-h-screen bg-gradient-to-br from-gray-100 via-gray-50 to-gray-100 p-6 font-sans text-gray-700">
			<div className="mx-auto max-w-5xl space-y-10">
				<header className="mb-12 pt-8 text-center">
					<h1 className="text-4xl font-extrabold tracking-tight text-gray-800 sm:text-5xl">
						JMA CSV to JSON 変換
					</h1>
				</header>

				<div className="flex justify-center">
					<div className="w-full max-w-xl rounded-3xl bg-gray-100 p-8 shadow-lg shadow-gray-300/50 transition-all duration-300 hover:shadow-xl hover:shadow-gray-300/70">
						<h2 className="mb-6 text-center text-xs font-bold tracking-[0.2em] text-gray-500 uppercase">
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
									className="h-auto cursor-pointer rounded-2xl bg-gray-100 px-4 py-6 text-sm shadow-inner shadow-gray-300 transition-all focus:shadow-inner focus:shadow-gray-400"
								/>
							</div>
							<Button
								onClick={handleClick}
								className="h-auto w-full rounded-2xl px-8 py-6 text-xs font-bold tracking-wider uppercase transition-all sm:w-auto"
							>
								読み込む
							</Button>
						</div>
						{error && (
							<div className="mt-4 rounded-2xl bg-red-100/30 p-3 shadow-inner shadow-red-200/30">
								<p className="text-center text-xs font-medium text-red-600">{error}</p>
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
