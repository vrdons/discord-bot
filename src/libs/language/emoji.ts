import { readFileSync, watchFile } from "fs";
import { join } from "path";
import { container } from "@sapphire/framework";
import { parse } from "jsonc-parser";
import type { PostProcessorModule } from "i18next";
import { parseEmoji } from "discord.js";
import { flattenJSON } from "libs/Utils/Other";

declare module "@sapphire/pieces" {
  interface Container {
    getEmoji: (...args: string[]) => string | undefined;
    getEmojiId: (...args: string[]) => string | undefined;
    getEmojiURL: (...args: string[]) => string | undefined;
  }
}

let emojis: Record<string, string> = {};
const emojiPath = join(process.cwd(), "src", "languages", "emojis.jsonc");

const loadEmojis = () => {
  const parsed = parse(readFileSync(emojiPath, "utf-8"));
  emojis = flattenJSON(parsed) as Record<string, string>;
};

loadEmojis();

container.getEmoji = (...args: string[]): string | undefined => {
  const key = args.join(".");
  return emojis[key] || undefined;
};

container.getEmojiId = (...args: string[]): string | undefined => {
  const emoji = container.getEmoji(...args);
  return emoji ? parseEmoji(emoji)?.id : undefined;
};

container.getEmojiURL = (...args: string[]): string | undefined => {
  const emojiId = container.getEmojiId(...args);
  return emojiId
    ? container.client.emojis.cache.get(emojiId)?.imageURL()
    : undefined;
};

watchFile(emojiPath, { interval: 1000 }, () => {
  loadEmojis();
  container.logger.info("[HMR-Plugin]: Emojis reloaded");
});

export const emojiProcessor: PostProcessorModule = {
  type: "postProcessor",
  name: "emojiProcessor",
  process: (value: string) => {
    return value.replace(
      /\[\[([\w.]+)\]\]/g,
      (match, key) => container.getEmoji(key) || match,
    );
  },
};
