import { InternationalizationOptions } from "@sapphire/plugin-i18next";
import { Locale } from "discord.js";
import { Guild } from "../models/Guild";
import { User } from "../models/User";

export const supportedLngs = ["tr"] as Locale[];
export const defaultLng = "tr" as Locale;

export const LanguageConfig: InternationalizationOptions = {
  fetchLanguage: async (context) => {
    if (context.user?.id) {
      const user = await User.getUserById(context.user.id);
      if (user.locale && supportedLngs.includes(user.locale))
        return user.locale;
    }
    if (context.guild?.id) {
      const guild = await Guild.getGuildById(context.guild.id);
      if (guild.locale && supportedLngs.includes(guild.locale))
        return guild.locale;
      if (
        context.guild.features.includes("COMMUNITY") &&
        supportedLngs.includes(context.guild.preferredLocale)
      )
        return context.guild.preferredLocale;
    }
    return defaultLng;
  },

  defaultName: defaultLng,
  i18next: {
    supportedLngs: supportedLngs,
    fallbackLng: defaultLng,
    preload: supportedLngs,
    returnNull: false,
    saveMissing: false,
    missingKeyHandler: false,
    interpolation: {
      escapeValue: false,
      skipOnVariables: false,
    },
    postProcess: ["emojiProcessor"],
  },
  hmr: {
    enabled: true,
  },
};
