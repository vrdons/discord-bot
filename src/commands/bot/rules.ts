import { ApplyOptions } from "@sapphire/decorators";
import { Command } from "@sapphire/framework";
import { applyLocalizedBuilder, fetchLanguage } from "@sapphire/plugin-i18next";
import { Message } from "discord.js";
import { RulesPrecontidion } from "preconditions/Rules";
import { User } from "models/User";

@ApplyOptions<Command.Options>({
  name: "-rules",
  cooldownDelay: 5000,
  fullCategory: ["General"],
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
    const t = this.container.i18n.getT(lang);
    await interaction.reply(
      RulesPrecontidion.generateRules(lang, t, await User.totalAccepted, false),
    );
  }

  public override async messageRun(message: Message) {
    const lang = await fetchLanguage(message);
    const t = this.container.i18n.getT(lang);
    await message.reply(
      RulesPrecontidion.generateRules(lang, t, await User.totalAccepted, false),
    );
  }
}
