import { ButtonStyle, ContainerBuilder } from "discord.js";
import { ButtonBuilder } from "@discordjs/builders";
import { container } from "@sapphire/framework";
import { formatAsArray } from "libs/utils";
import { TFunction, TOptions } from "i18next";
export class CustomContainer extends ContainerBuilder {
  private translate: TFunction<"translation", undefined>;
  constructor(private lang: string) {
    super();
    this.translate = container.i18n.getT(this.lang);

    this.setAccentColor([255, 255, 255]);
  }
  addTitle(
    emoji: string | undefined = "logo",
    split: boolean,
    args: string,
    options: TOptions = {},
  ) {
    this.addTextDisplayComponents((t) =>
      t.setContent(
        `### ${emoji ? container.getEmoji(emoji) : ""} ${container.client.user?.displayName}${split ? " | " : " "}${this.translate(args, options)}`,
      ),
    );
    return this;
  }
  addFooter(emoji: string | undefined, args: string, options: TOptions = {}) {
    this.addTextDisplayComponents((t) =>
      t.setContent(
        `-# ${emoji ? container.getEmoji(emoji) + " " : ""}${this.translate(args, options)}`,
      ),
    );
    return this;
  }
  addSeperator(divide: boolean = true) {
    this.addSeparatorComponents((s) => s.setDivider(divide));
    return this;
  }
  addTexts(
    dot: boolean,
    args: string,
    options: TOptions = {},
    multi?: boolean,
  ) {
    const array = formatAsArray(this.lang, args, options);
    const a2 = array.map(
      (x) => `${dot ? `${container.getEmoji("dot")} ` : ""}${x}`,
    );
    if (multi) {
      for (const a of a2) {
        this.addTextDisplayComponents((t) => t.setContent(`${a}`));
      }
    } else
      this.addTextDisplayComponents((t) => t.setContent(`${a2.join("\n")}`));
    return this;
  }

  addTextsWithTitle(
    dot: boolean,
    args: string,
    options: TOptions = {},
    title: { emoji: string | undefined; text: string },
    multi?: boolean,
  ) {
    const array = formatAsArray(this.lang, args, options);
    const a2 = [
      `### ${title.emoji ? container.getEmoji(title.emoji) : ""} ${this.translate(title.text, options)}`,
      ...array.map((x) => `${dot ? `${container.getEmoji("dot")} ` : ""}${x}`),
    ];
    if (multi) {
      for (const a of a2) {
        this.addTextDisplayComponents((t) => t.setContent(`${a}`));
      }
    } else
      this.addTextDisplayComponents((t) => t.setContent(`${a2.join("\n")}`));
    return this;
  }
  addText(dot: boolean, args: string, options: TOptions = {}) {
    this.addTextDisplayComponents((t) =>
      t.setContent(
        `${dot ? `${container.getEmoji("dot")} ` : ""}${this.translate(args, options)}`,
      ),
    );
    return this;
  }
  addString(str: string) {
    this.addTextDisplayComponents((t) => t.setContent(str));
    return this;
  }

  addStrings(dot: boolean, str: string[], multi?: boolean) {
    const a2 = str.map(
      (x) => `${dot ? `${container.getEmoji("dot")} ` : ""}${x}`,
    );
    if (multi) {
      for (const a of a2) {
        this.addTextDisplayComponents((t) => t.setContent(`${a}`));
      }
    } else
      this.addTextDisplayComponents((t) => t.setContent(`${a2.join("\n")}`));
    return this;
  }
  addLinks(type: "string" | "button" | "smolstring", addTitle = false) {
    if (addTitle)
      this.addTextDisplayComponents((t) =>
        t.setContent(
          `### ${container.getEmoji("links.emoji")} ${this.translate("defaults/container:links.title")}`,
        ),
      );
    if (type == "string") {
      this.addTextDisplayComponents((t) =>
        t.setContent(`${this.translate("defaults/container:links.string")}`),
      );
    } else if (type == "button") {
      this.addActionRowComponents((act) =>
        act.setComponents(
          new ButtonBuilder()
            .setStyle(ButtonStyle.Link)
            .setLabel(
              this.translate("defaults/container:links.buttons.website"),
            )
            .setURL(container.links.website),
          new ButtonBuilder()
            .setStyle(ButtonStyle.Link)
            .setLabel(
              this.translate("defaults/container:links.buttons.support"),
            )
            .setURL(container.links.support_server),
          new ButtonBuilder()
            .setStyle(ButtonStyle.Link)
            .setEmoji({ id: container.getEmojiId("links.vote") })
            .setLabel(this.translate("defaults/container:links.buttons.vote"))
            .setURL(container.links.topGGVote),
          new ButtonBuilder()
            .setStyle(ButtonStyle.Link)
            .setLabel(this.translate("defaults/container:links.buttons.invite"))
            .setURL(container.links.inviteLink),
        ),
      );
    } else {
      this.addTextDisplayComponents((t) =>
        t.setContent(`-# ${this.translate("defaults/container:links.string")}`),
      );
    }
    return this;
  }
}
