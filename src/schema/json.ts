import { z } from "zod";

// 各項目（avg_tempなど）の中身のスキーマ
export const WeatherValueSchema = z.object({
	content: z.string().nullable(),
	quality: z.string().nullable().optional(),
	homogeneity_number: z.string().nullable().optional(),
	現象なし情報: z.string().nullable().optional(),
});

// 最終的なデータ構造のスキーマ
export const WeatherJsonSchema = z.object({
	location: z.string(),
	data: z.array(z.record(z.string(), WeatherValueSchema)),
});

// スキーマからTypeScriptの型を抽出 (anyを排除)
export type WeatherJsonOutput = z.infer<typeof WeatherJsonSchema>;
export type WeatherValue = z.infer<typeof WeatherValueSchema>;
