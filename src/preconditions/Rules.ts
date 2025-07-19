import { AllFlowsPrecondition, Result, UserError } from "@sapphire/framework";
import { sleep } from "@sapphire/utilities";
import {
  CommandInteraction,
  ContextMenuCommandInteraction,
  Message,
  ButtonBuilder,
  ButtonStyle,
  ComponentType,
  Interaction,
  MessageFlags,
} from "discord.js";
import { TFunction } from "i18next";
import { CustomContainer } from "libs/Custom/Container";
import { deleteMessage, fetchLocale } from "libs/discord";
import { Randomizer } from "libs/random";
import { User } from "models/User";

export class RulesPrecontidion extends AllFlowsPrecondition {
  public constructor(context: AllFlowsPrecondition.LoaderContext) {
    super(context, {
      name: "RulesOnly",
      position: 15, //before cooldown
    });
  }

  public override async messageRun(message: Message) {
    return this.checkRules(message.author.id, message);
  }

  public override async chatInputRun(interaction: CommandInteraction) {
    return this.checkRules(interaction.user.id, interaction);
  }

  public override async contextMenuRun(
    interaction: ContextMenuCommandInteraction,
  ): Promise<Result<unknown, UserError>> {
    return this.checkRules(interaction.user.id, interaction);
  }

  private async checkRules(
    userId: string,
    source: Message | CommandInteraction | ContextMenuCommandInteraction,
  ) {
    const user = await User.getUserById(userId);

    if (user.acceptedRules) {
      return this.ok();
    }
    const locale = await fetchLocale(source as Interaction);

    const t = this.container.i18n.getT(locale);
    const r = RulesPrecontidion.generateRules(
      locale,
      t,
      await User.totalAccepted,
    );

    const response =
      source instanceof Message ? await source.reply(r) : await source.reply(r);

    try {
      const confirmation = await response.awaitMessageComponent({
        componentType: ComponentType.Button,
        time: 120_000,
        filter: (i) => i.user.id === userId,
      });

      if (confirmation.customId === "accept_rules") {
        await user.acceptRules();
        await confirmation.message
          .edit({
            components: [
              new CustomContainer(locale)
                .addTitle(undefined, true, "defaults/container:rules.title")
                .addText(false, "defaults/container:rules.accepted", {
                  context: source instanceof Message ? "message" : "",
                }),
            ],
          })
          .catch(console.log);
        await sleep(
          Randomizer.getRandom(
            source instanceof Message ? 1000 : 1100,
            source instanceof Message ? 1100 : 2000,
          ),
        );
        deleteMessage(confirmation.message, 0);
        return source instanceof Message ? this.ok() : this.error();
      }

      deleteMessage(confirmation.message, 0);
      return this.error();
    } catch {
      deleteMessage(response, 0);
      return this.error();
    }
  }
  static generateRules(
    lang: string,
    t: TFunction,
    totalAccept: any,
    generateActionRow: boolean = true,
  ) {
    const comp = new CustomContainer(lang);
    comp.addTitle(undefined, true, "commands/rules:title");
    comp.addSeperator();
    comp.addTexts(true, "commands/rules:botDescription");
    comp.addSeperator();
    comp.addTexts(false, "commands/rules:extraInformation");
    if (generateActionRow)
      comp.addActionRowComponents((act) =>
        act.addComponents(
          new ButtonBuilder()
            .setCustomId("accept_rules")
            .setLabel(t("commands/rules:buttons.accept"))
            .setStyle(ButtonStyle.Primary),
          new ButtonBuilder()
            .setCustomId("decline_rules")
            .setLabel(t("commands/rules:buttons.decline"))
            .setStyle(ButtonStyle.Danger),
        ),
      );
    comp.addFooter(undefined, "commands/rules:footer", {
      totalAccept,
    });
    return { flags: MessageFlags.IsComponentsV2 as const, components: [comp] };
  }
}

declare module "@sapphire/framework" {
  interface Preconditions {
    RulesOnly: never;
  }
}
