import { isMessageInstance } from "@sapphire/discord.js-utilities";
import { ApplyOptions } from "@sapphire/decorators";
import { Command } from "@sapphire/framework";
import {
  applyLocalizedBuilder,
  fetchLanguage,
  resolveKey,
} from "@sapphire/plugin-i18next";
import { ButtonStyle, Message, MessageFlags } from "discord.js";
import { getDatabsePing } from "libs/utils";
import { CustomContainer } from "libs/Custom/Container";
import { adminIds } from "config/Other";

@ApplyOptions<Command.Options>({
  name: "-status",
  cooldownDelay: 10000,
  fullCategory: ["General"],
  cooldownLimit: 1,
})
export class PingCommand extends Command {
  public override registerApplicationCommands(registry: Command.Registry) {
    registry.registerChatInputCommand((builder) =>
      applyLocalizedBuilder(builder, "commands/status:"),
    );
  }
  public override async chatInputRun(
    interaction: Command.ChatInputCommandInteraction,
  ) {
    await this.calculate(interaction);
  }

  public override async messageRun(message: Message) {
    await this.calculate(message);
  }
  async calculate(message: Command.ChatInputCommandInteraction | Message) {
    const Language = await fetchLanguage(message);
    const t = this.container.i18n.getT(Language);
    const text = t("commands/status:wait");
    let messageReply;
    if (isMessageInstance(message as Message)) {
      messageReply = await message.reply({
        content: text,
        flags: MessageFlags.SuppressNotifications,
      });
    } else {
      messageReply = await message.reply({
        content: text,
        flags: MessageFlags.SuppressNotifications,
      });
    }
    const dbPing = await getDatabsePing();
    const clientPing = this.container.client.ws.ping;
    const diff = messageReply.createdTimestamp - message.createdTimestamp;
    const cont = new CustomContainer(Language);
    cont.addTitle("status.emoji", true, "commands/status:title");
    cont.addSeperator();
    cont.addTextDisplayComponents((te) =>
      te.setContent(
        `### ${this.container.getEmoji("status.owner")} ${t("commands/status:titleOwners")}`,
      ),
    );
    adminIds.forEach((o) => {
      const user = this.container.client.users.cache.get(o);
      if (!user) return;
      cont.addSectionComponents((d) => {
        d.addTextDisplayComponents((d) =>
          d.setContent(`${this.container.getEmoji("dot")} ${user.username}`),
        );
        d.setButtonAccessory(
          (a) =>
            a
              .setLabel(t("commands/status:seeProfile"))
              .setStyle(ButtonStyle.Primary)
              .setCustomId(`profile:${user.id}`), //TODO CHECK USER
        );
        return d;
      });
    });
    cont.addSeperator();
    cont.addTextsWithTitle(
      true,
      "commands/status:resultBot",
      {
        uptime: process.uptime() * 1000,
        totalServer: this.container.client.guilds.cache.size,
        totalMembers: this.container.client.users.cache.filter((x) => !x.bot)
          .size,
        memoryUsage: process.memoryUsage().heapTotal,
      },
      { emoji: "status.bot", text: "commands/status:titleBot" },
      false,
    );
    cont.addSeperator();
    cont.addTextsWithTitle(
      true,
      "commands/status:resultLatency",
      { bot_ping: clientPing, message_ping: diff, db_ping: dbPing },
      { emoji: undefined, text: "commands/status:titleLatency" },
      false,
    );
    messageReply.edit({
      content: "",
      components: [cont],
      flags: MessageFlags.IsComponentsV2 | MessageFlags.SuppressNotifications,
    });
  }
}
