import Papa from "papaparse";
import {
  WeatherJsonSchema,
  WeatherValueSchema,
  type WeatherJsonOutput,
  type WeatherValue,
} from "../schema/json";

export const transformAndValidateWeather = (csvString: string): WeatherJsonOutput => {
  const { data: rawRows } = Papa.parse<string[]>(csvString, {
    header: false,
    skipEmptyLines: false,
  });

  const fieldTranslation: Record<string, string> = {
    年月日: "date",
    "平均気温(℃)": "avg_temp",
    "最高気温(℃)": "max_temp",
    "最低気温(℃)": "min_temp",
    "天気概況(昼：06時～18時)": "weather_day",
    "天気概況(夜：18時～翌日06時)": "weather_night",
    "降水量の合計(mm)": "total_precipitation",
    "10分間降水量の最大(mm)": "max_10min_precipitation",
    "日照時間(時間)": "daylight_hours",
    "合計全天日射量(MJ/㎡)": "total_solar_radiation",
    "平均風速(m/s)": "avg_wind_speed",
  };

  // Row 0: skip (timestamp), Row 1: empty, Row 2: location
  // Row 3: headers, Row 4: empty, Row 5: subheaders, Row 6+: data
  const location = rawRows[2][1] || "Unknown";
  const headersEn = rawRows[3].map((h) => fieldTranslation[h] || h);
  const subHeadersEn = rawRows[5].map((s) => {
    if (s === "品質情報") return "quality";
    if (s === "均質番号") return "homogeneity_number";
    if (s === "現象なし情報") return "現象なし情報";
    return "content";
  });

  const bodyRows = rawRows.slice(6);
  const uniqueHeaders = Array.from(new Set(headersEn.filter((h) => h !== "")));

  const rawStructuredData = bodyRows.map((row) => {
    const entry: Record<string, WeatherValue> = {};

    uniqueHeaders.forEach((headerName) => {
      const fieldGroup: Partial<WeatherValue> = {};

      headersEn.forEach((h, index) => {
        if (h === headerName) {
          const subKey = subHeadersEn[index] as keyof WeatherValue;
          const val = row[index];
          const sanitizedVal = val === undefined || val === "" ? null : val;

          if (
            subKey === "content" ||
            subKey === "quality" ||
            subKey === "homogeneity_number" ||
            subKey === "現象なし情報"
          ) {
            fieldGroup[subKey] = sanitizedVal;
          }
        }
      });
      entry[headerName] = WeatherValueSchema.parse(fieldGroup);
    });
    return entry;
  });

  return WeatherJsonSchema.parse({
    location,
    data: rawStructuredData,
  });
};
