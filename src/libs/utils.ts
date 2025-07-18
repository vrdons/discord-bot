import { container } from "@sapphire/framework";
import { Locale } from "discord.js";
import { TOptions } from "i18next";

export function ensureArray<T>(val: T | T[]): T[] {
  return Array.isArray(val) ? val : [val];
}

export async function getDatabsePing(): Promise<number> {
  try {
    const readStart = Date.now();
    await container.database.query("SELECT 1");
    const readDuration = Date.now() - readStart;

    const writeStart = Date.now();
    await container.database.query(
      "CREATE TEMP TABLE temp_ping(id DECIMAL(20,0));",
    );
    await container.database.query(
      "INSERT INTO temp_ping(id) VALUES (99999999999999999999);",
    );
    await container.database.query("DELETE FROM temp_ping;");
    await container.database.query("DROP TABLE temp_ping;");
    const writeDuration = Date.now() - writeStart;

    const averageDuration = (readDuration + writeDuration) / 2;
    return Math.ceil(averageDuration);
  } catch (error) {
    console.error("Veritabanı ping hatası:", error);
    return -1;
  }
}
export function formatAsArray(
  lang: Locale | string,
  args: string,
  options: TOptions,
): string[] {
  const i18n = container.i18n.getT(lang);

  const result = i18n(args, {
    ...options,
    returnObjects: true,
  }) as string | string[] | Record<string, string>;

  if (Array.isArray(result)) return result;
  if (typeof result === "object") return Object.values(result);
  return [result];
}
export function flattenJSON(
  obj: Record<string, any>,
  prefix = "",
): Record<string, any> {
  let result: Record<string, any> = {};
  for (const key in obj) {
    if (typeof obj[key] === "object" && obj[key] !== null) {
      Object.assign(result, flattenJSON(obj[key], prefix + key + "."));
    } else {
      result[prefix + key] = obj[key];
    }
  }
  return result;
}
