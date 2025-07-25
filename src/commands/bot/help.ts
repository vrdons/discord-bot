import { ApplyOptions } from "@sapphire/decorators";
import {
  Args,
  ChatInputCommand,
  Command,
  MessageCommand,
} from "@sapphire/framework";
import { applyLocalizedBuilder, fetchLanguage } from "@sapphire/plugin-i18next";
import { Message } from "discord.js";
import { HelpMenuPayload } from "libs/MessagePayloads/Help";
import { ChatInputContext, MessageContext } from "typing";

@ApplyOptions<Command.Options>({
  name: "-help",
  cooldownDelay: 3000,
  fullCategory: ["General"],
  preconditions: [],
  rulesDisabled: true,
  cooldownLimit: 1,
})
export class HelpCommand extends Command {
  public override registerApplicationCommands(registry: Command.Registry) {
    registry.registerChatInputCommand((builder) =>
      applyLocalizedBuilder(builder, "commands/help:").addStringOption((opt) =>
        applyLocalizedBuilder(opt, "commands/help:Options.Command"),
      ),
    );
  }
  public override async chatInputRun(
    interaction: Command.ChatInputCommandInteraction,
    context: ChatInputContext,
  ) {
    const str = interaction.options.getString(
      context.t("commands/help:Options.CommandName"),
    );
    return interaction.reply(
      await HelpMenuPayload(
        context.language,
        {
          arguments: str,
        },
        interaction.user.id,
      ),
    );
  }

  public override async messageRun(
    message: Message,
    args: Args,
    context: MessageContext,
  ) {
    const str = await args.peekResult("string");
    return message.reply(
      await HelpMenuPayload(
        context.language,
        {
          arguments: str.isOk() ? str.unwrap() : null,
          prefix: context.commandPrefix,
        },
        message.author.id,
      ),
    );
  }
}
