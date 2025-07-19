import { isMessageInstance } from "@sapphire/discord.js-utilities";
import { ApplyOptions } from "@sapphire/decorators";
import { Command } from "@sapphire/framework";
import {
  applyLocalizedBuilder,
  fetchLanguage,
  resolveKey,
} from "@sapphire/plugin-i18next";
import { Message, MessageFlags } from "discord.js";
import { getDatabsePing } from "libs/utils";
import { CustomContainer } from "libs/Custom/Container";

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
    const cont = new CustomContainer(Language);
    cont.addTitle(undefined, true, "commands/ping:title");
    cont.addSeperator();
    cont.addTexts(
      true,
      "commands/ping:result",
      { bot_ping: clientPing, message_ping: diff, db_ping: dbPing },
      true,
    );
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
