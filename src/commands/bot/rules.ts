import { ApplyOptions } from "@sapphire/decorators";
import { Args, Command } from "@sapphire/framework";
import { applyLocalizedBuilder } from "@sapphire/plugin-i18next";
import { Message } from "discord.js";
import { User } from "models/User";
import { RulesPayload } from "libs/MessagePayloads/Rules";
import { ChatInputContext, MessageContext } from "typing";

@ApplyOptions<Command.Options>({
  name: "-rules",
  cooldownDelay: 5000,
  fullCategory: ["General", "Recommended"],
  cooldownLimit: 1,
})
export class PingCommand extends Command {
  public override registerApplicationCommands(registry: Command.Registry) {
    registry.registerChatInputCommand((builder) =>
      applyLocalizedBuilder(builder, "commands/rules:"),
    );
  }
  public override async chatInputRun(
    interaction: Command.ChatInputCommandInteraction,
    context: ChatInputContext,
  ) {
    await interaction.reply(
      RulesPayload(context.language, await User.totalAccepted, true),
    );
  }

  public override async messageRun(
    message: Message,
    _args: Args,
    context: MessageContext,
  ) {
    await message.reply(
      RulesPayload(context.language, await User.totalAccepted, true),
    );
  }
}
