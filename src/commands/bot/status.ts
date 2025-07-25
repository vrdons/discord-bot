import { isMessageInstance } from "@sapphire/discord.js-utilities";
import { ApplyOptions } from "@sapphire/decorators";
import { Args, Command } from "@sapphire/framework";
import { applyLocalizedBuilder, fetchLanguage } from "@sapphire/plugin-i18next";
import {
  ButtonStyle,
  ContainerBuilder,
  Message,
  MessageFlags,
} from "discord.js";
import { adminIds } from "config/Other";
import { ContainerFunctions } from "libs/Custom/Container";
import { getDatabsePing } from "libs/Utils/Database";
import { calculateCpuUsage } from "libs/Utils/System";
import { BaseContext, ChatInputContext, MessageContext } from "typing";

@ApplyOptions<Command.Options>({
  name: "-status",
  cooldownDelay: 10000,
  fullCategory: ["General"],
  cooldownLimit: 1,
  rulesDisabled: true,
})
export class PingCommand extends Command {
  public override registerApplicationCommands(registry: Command.Registry) {
    registry.registerChatInputCommand((builder) =>
      applyLocalizedBuilder(builder, "commands/status:"),
    );
  }
  public override async chatInputRun(
    interaction: Command.ChatInputCommandInteraction,
    context: ChatInputContext,
  ) {
    await this.calculate(interaction, context);
  }

  public override async messageRun(
    message: Message,
    _args: Args,
    context: MessageContext,
  ) {
    await this.calculate(message, context);
  }
  async calculate(
    message: Command.ChatInputCommandInteraction | Message,
    context: BaseContext,
  ) {
    const { t, language } = context;
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
    const cont = new ContainerBuilder();
    ContainerFunctions.addTitle(cont, {
      emoji: "status.emoji",
      displayName: { enabled: true, splitText: true },
      language,
      text: "commands/status:title",
    });
    cont.addSeparatorComponents();
    ContainerFunctions.addTitle(cont, {
      emoji: "status.owner",
      displayName: { enabled: false, splitText: false },
      language,
      text: "commands/status:titleOwners",
    });
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
    cont.addSeparatorComponents();
    ContainerFunctions.addTexts(cont, {
      language,
      text: "commands/status:resultBot",
      dot: true,
      title: {
        text: "commands/status:titleBot",
        emoji: "status.bot",
        displayName: { enabled: false, splitText: false },
      },
      translateOptions: {
        uptime: process.uptime() * 1000,
        totalServer: this.container.client.guilds.cache.size,
        totalMembers: this.container.client.users.cache.filter((x) => !x.bot)
          .size,
        memoryUsage: process.memoryUsage().heapTotal,
        cpuUsage: await calculateCpuUsage(),
      },
    });
    cont.addSeparatorComponents();
    ContainerFunctions.addTexts(cont, {
      language,
      text: "commands/status:resultLatency",
      dot: true,
      title: {
        text: "commands/status:titleLatency",
        emoji: undefined,
        displayName: { enabled: false, splitText: false },
      },
      translateOptions: {
        bot_ping: clientPing,
        message_ping: diff,
        db_ping: dbPing,
      },
    });
    cont.addSeparatorComponents();
    ContainerFunctions.addLinks(cont, {
      language,
      type: "smolstring",
    });
    messageReply.edit({
      content: "",
      components: [cont],
      flags: MessageFlags.IsComponentsV2 | MessageFlags.SuppressNotifications,
    });
  }
}
