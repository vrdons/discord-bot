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
    _context: ChatInputCommand.RunContext,
  ) {
    const language = await fetchLanguage(interaction);
    const t = this.container.i18n.getT(language);
    const str = interaction.options.getString(
      t("commands/help:Options.CommandName"),
    );
    return interaction.reply(
      await HelpMenuPayload(language, {
        arguments: str,
      }),
    );
  }

  public override async messageRun(
    message: Message,
    args: Args,
    context: MessageCommand.RunContext,
  ) {
    const language = await fetchLanguage(message);
    const str = await args.peekResult("string");
    return message.reply(
      await HelpMenuPayload(language, {
        arguments: str.isOk() ? str.unwrap() : null,
        prefix: context.commandPrefix,
      }),
    );
  }
}
