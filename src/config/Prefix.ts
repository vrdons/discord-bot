import { Message } from "discord.js";
import { Guild } from "models/Guild";
export const defaultPrefix = "!";
export async function fetchPrefix(message: Message) {
  if (!message.inGuild()) return defaultPrefix;
  else {
    const guild = await Guild.getGuildById(message.guildId);
    if (guild.prefix) return guild.prefix;
  }
  return defaultPrefix;
}
