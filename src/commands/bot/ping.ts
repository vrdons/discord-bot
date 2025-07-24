import { isMessageInstance } from "@sapphire/discord.js-utilities";
import { ApplyOptions } from "@sapphire/decorators";
import { Command } from "@sapphire/framework";
import {
  applyLocalizedBuilder,
  fetchLanguage,
  resolveKey,
} from "@sapphire/plugin-i18next";
import { ContainerBuilder, Message, MessageFlags } from "discord.js";
import { ContainerFunctions } from "libs/Custom/Container";
import { getDatabsePing } from "libs/Utils/Database";
@ApplyOptions<Command.Options>({
  name: "-ping",
  cooldownDelay: 5000,
  fullCategory: ["General"],
  preconditions: [],
  cooldownLimit: 1,
})
export class PingCommand extends Command {
  public override registerApplicationCommands(registry: Command.Registry) {
    registry.registerChatInputCommand((builder) =>
      applyLocalizedBuilder(builder, "commands/ping:"),
    );
  }
  public override async chatInputRun(
    interaction: Command.ChatInputCommandInteraction,
  ) {
    await this.calculatePing(interaction);
  }

  public override async messageRun(message: Message) {
    await this.calculatePing(message);
  }
  async calculatePing(message: Command.ChatInputCommandInteraction | Message) {
    const Language = await fetchLanguage(message);
    const t = this.container.i18n.getT(Language);
    const text = t("commands/ping:wait");
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
      displayName: { enabled: true, splitText: true },
      language: Language,
      text: "commands/ping:title",
    });
    cont.addSeparatorComponents((s) => s);
    ContainerFunctions.addTexts(cont, {
      dot: true,
      multi: true,
      language: Language,
      text: "commands/ping:result",
      translateOptions: {
        bot_ping: clientPing,
        message_ping: diff,
        db_ping: dbPing,
      },
    });
    messageReply.edit({
      content: "",
      components: [cont],
      flags:
        MessageFlags.IsComponentsV2 |
        MessageFlags.Ephemeral |
        MessageFlags.SuppressNotifications,
    });
  }
}
