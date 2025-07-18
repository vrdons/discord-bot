import {
  Interaction,
  InteractionResponse,
  Locale,
  Message,
  MessageContextMenuCommandInteraction,
  User,
  UserContextMenuCommandInteraction,
} from "discord.js";
import { container } from "@sapphire/framework";
import ms from "ms";
import { defaultLng } from "config/LanguageConfig";

export function deleteMessage(
  message: Message | InteractionResponse,
  time: number = ms("10s"),
): NodeJS.Timeout {
  return setTimeout(() => {
    try {
      message.delete().catch(() => {});
    } catch (error) {}
  }, time);
}

/**
 * d => 03/05/2023
 
 * D => March 5, 2023

 * t => 2:22 PM

 * T => 2:22:00 PM

 * f => March 5, 2023 2:22 PM

 * F => Sunday, March 5, 2023 2:22 PM

 * R => A minute ago
 */
export type TIMESTAMP_TYPE = "d" | "D" | "t" | "T" | "f" | "F" | "R";
export function formatTimestamp(timestamp: number, type: TIMESTAMP_TYPE) {
  return `<t:${Math.floor(timestamp / 1000)}${type ? `:${type}` : ""}>`;
}
export async function fetchLocale(
  interaction: Interaction | Message | User,
): Promise<Locale> {
  return ((await container.i18n.fetchLanguage({
    user: getUser(interaction),
    guild: "guild" in interaction ? interaction?.guild : null,
    channel: "channel" in interaction ? interaction?.channel : null,
  })) ?? defaultLng) as Locale;
}
export function getUser(interaction: Interaction | Message | User): User {
  if (interaction instanceof User) return interaction;
  return (
    (interaction as Message)?.author ??
    (interaction as Interaction).user ??
    (interaction as UserContextMenuCommandInteraction).targetUser ??
    (interaction as MessageContextMenuCommandInteraction).targetMessage.author
  );
}

export function getClientAvatar(interaction: Interaction | Message): string {
  return (
    interaction.client.user.avatarURL() ??
    interaction.client.user.displayAvatarURL()
  );
}
export function getUserAvatar(
  interaction: Interaction | Message | User,
): string {
  const user = getUser(interaction);
  return user.avatarURL() ?? user.displayAvatarURL();
}
