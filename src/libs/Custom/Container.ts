import { ButtonStyle, ContainerBuilder } from "discord.js";
import { ButtonBuilder, SectionBuilder } from "@discordjs/builders";
import { container } from "@sapphire/framework";
import { TOptions } from "i18next";
import { formatAsArray } from "libs/Utils/Language";

type BuilderType = ContainerBuilder | SectionBuilder;

interface DisplayNameOptions {
  enabled: boolean;
  splitText: boolean;
}

interface TitleOptions {
  displayName: DisplayNameOptions;
  text: string;
  translateOptions?: TOptions;
  emoji?: string | null;
}

interface BaseOptions {
  language: string | undefined;
  text: string;
  translateOptions?: TOptions;
}

interface TitleBaseOptions extends BaseOptions {
  displayName: DisplayNameOptions;
  emoji?: string | null;
}

interface TextOptions extends BaseOptions {
  title?: TitleOptions;
  dot?: boolean;
  multi?: boolean;
}

interface FooterOptions extends BaseOptions {
  emoji?: string;
}

interface LinksOptions {
  language: string;
  type: "string" | "button" | "smolstring";
  addTitle?: boolean;
}

export class ContainerFunctions {
  static addTitle<T extends BuilderType>(builder: T, opt: TitleBaseOptions): T {
    const t = opt.language
      ? container.i18n.getT(opt.language)
      : (text: string, ..._args: any[]) => text;

    const emoji =
      opt.emoji !== null ? `${container.getEmoji(opt.emoji ?? "logo")} ` : "";
    const displayName = opt.displayName.enabled
      ? `${container.client.user?.displayName}${opt.displayName.splitText ? " | " : ""}`
      : "";

    builder.addTextDisplayComponents((build) =>
      build.setContent(
        `### ${emoji}${displayName}${t(opt.text, opt.translateOptions)}`,
      ),
    );

    return builder;
  }

  static addFooter<T extends BuilderType>(builder: T, opt: FooterOptions): T {
    const t = opt.language
      ? container.i18n.getT(opt.language)
      : (text: string, ..._args: any[]) => text;

    const emoji = opt.emoji ? `${container.getEmoji(opt.emoji)} ` : "";

    builder.addTextDisplayComponents((build) =>
      build.setContent(`-# ${emoji}${t(opt.text, opt.translateOptions)}`),
    );

    return builder;
  }

  static addText<T extends BuilderType>(builder: T, opt: TextOptions): T {
    const tr = opt.language
      ? container.i18n.getT(opt.language)
      : (text: string, ..._args: any[]) => text;

    let list: string[] = [];

    if (opt.title) {
      const emoji = opt.title.emoji
        ? `${container.getEmoji(opt.title.emoji)} `
        : "";
      const displayName = opt.title.displayName.enabled
        ? `${container.client.user?.displayName}${opt.title.displayName.splitText ? " | " : ""}`
        : "";

      list.push(
        `### ${emoji}${displayName}${tr(opt.title.text, opt.title.translateOptions)}`,
      );
    }

    list.push(tr(opt.text, opt.translateOptions));

    if (!opt.multi) {
      builder.addTextDisplayComponents((b) => b.setContent(list.join("\n")));
    } else {
      list.forEach((content) => {
        builder.addTextDisplayComponents((t) => t.setContent(content));
      });
    }

    return builder;
  }

  static addTexts<T extends BuilderType>(builder: T, opt: TextOptions): T {
    const t = opt.language
      ? (text: string, options?: TOptions) =>
          formatAsArray(opt.language as string, text, options ?? {})
      : (text: string, _options?: TOptions) => text.split(",");

    const tr = opt.language
      ? container.i18n.getT(opt.language)
      : (text: string, ..._args: any[]) => text;

    let list: string[] = [];

    if (opt.title) {
      const emoji = opt.title.emoji
        ? `${container.getEmoji(opt.title.emoji)} `
        : "";
      const displayName = opt.title.displayName.enabled
        ? `${container.client.user?.displayName}${opt.title.displayName.splitText ? " | " : ""}`
        : "";

      list.push(
        `### ${emoji}${displayName}${tr(opt.title.text, opt.title.translateOptions)}`,
      );
    }

    const array = t(opt.text, opt.translateOptions);
    const formattedArray = array.map(
      (x) => `${opt.dot ? `${container.getEmoji("dot")} ` : ""}${x}`,
    );

    list.push(...formattedArray);

    if (!opt.multi) {
      builder.addTextDisplayComponents((b) => b.setContent(list.join("\n")));
    } else {
      list.forEach((content) => {
        builder.addTextDisplayComponents((t) => t.setContent(content));
      });
    }

    return builder;
  }

  static addLinks<T extends BuilderType>(builder: T, opt: LinksOptions): T {
    const t = container.i18n.getT(opt.language);
    const str = opt.type === "smolstring" ? "-# " : "";

    if (opt.type === "button" && builder instanceof ContainerBuilder) {
      if (opt.addTitle) {
        builder.addTextDisplayComponents((c) =>
          c.setContent(
            `### ${container.getEmoji("links.emoji")} ${t("defaults/container:links.title")}`,
          ),
        );
      }

      builder.addActionRowComponents((act) =>
        act.setComponents(
          new ButtonBuilder()
            .setStyle(ButtonStyle.Link)
            .setLabel(t("defaults/container:links.buttons.website"))
            .setURL(container.links.website),
          new ButtonBuilder()
            .setStyle(ButtonStyle.Link)
            .setLabel(t("defaults/container:links.buttons.support"))
            .setURL(container.links.support_server),
          new ButtonBuilder()
            .setStyle(ButtonStyle.Link)
            .setEmoji({ id: container.getEmojiId("links.vote") })
            .setLabel(t("defaults/container:links.buttons.vote"))
            .setURL(container.links.topGGVote),
          new ButtonBuilder()
            .setStyle(ButtonStyle.Link)
            .setLabel(t("defaults/container:links.buttons.invite"))
            .setURL(container.links.inviteLink),
        ),
      );
    } else {
      const list: string[] = [];

      if (opt.addTitle) {
        list.push(
          `### ${container.getEmoji("links.emoji")} ${t("defaults/container:links.title")}`,
        );
      }

      list.push(`${str}${t("defaults/container:links.string")}`);

      builder.addTextDisplayComponents((c) => c.setContent(list.join("\n")));
    }

    return builder;
  }
}
