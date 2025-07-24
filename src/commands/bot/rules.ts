import { ApplyOptions } from "@sapphire/decorators";
import { Command } from "@sapphire/framework";
import { applyLocalizedBuilder, fetchLanguage } from "@sapphire/plugin-i18next";
import { Message } from "discord.js";
import { User } from "models/User";
import { RulesPayload } from "libs/MessagePayloads/Rules";

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
  ) {
    const lang = await fetchLanguage(interaction);
    await interaction.reply(RulesPayload(lang, await User.totalAccepted, true));
  }

  public override async messageRun(message: Message) {
    const lang = await fetchLanguage(message);
    await message.reply(RulesPayload(lang, await User.totalAccepted, true));
  }
}
