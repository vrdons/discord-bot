import { isMessageInstance } from "@sapphire/discord.js-utilities";
import { ApplyOptions } from "@sapphire/decorators";
import {
  Args,
  ChatInputCommand,
  Command,
  MessageCommand,
} from "@sapphire/framework";
import {
  applyLocalizedBuilder,
  fetchLanguage,
  resolveKey,
} from "@sapphire/plugin-i18next";
import { ContainerBuilder, Message, MessageFlags } from "discord.js";
import { ContainerFunctions } from "libs/Custom/Container";
import { getDatabsePing } from "libs/Utils/Database";
import { BaseContext, ChatInputContext, MessageContext } from "typing";
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
    context: ChatInputContext,
  ) {
    await this.calculatePing(interaction, context);
  }

  public override async messageRun(
    message: Message,
    _args: Args,
    context: MessageContext,
  ) {
    await this.calculatePing(message, context);
  }
  async calculatePing(
    message: Command.ChatInputCommandInteraction | Message,
    context: BaseContext,
  ) {
    const { t, language } = context;
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
      language,
      text: "commands/ping:title",
    });
    cont.addSeparatorComponents((s) => s);
    ContainerFunctions.addTexts(cont, {
      dot: true,
      multi: true,
      language,
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
