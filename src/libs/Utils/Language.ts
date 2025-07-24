import { container } from "@sapphire/framework";
import { Locale } from "discord.js";
import { TOptions } from "i18next";

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
