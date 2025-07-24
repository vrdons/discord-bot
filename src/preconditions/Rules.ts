import {
  AllFlowsPrecondition,
  ChatInputCommand,
  ContextMenuCommand,
  MessageCommand,
} from "@sapphire/framework";
import { sleep } from "@sapphire/utilities";
import {
  CommandInteraction,
  ContextMenuCommandInteraction,
  Message,
  ComponentType,
  Interaction,
  ContainerBuilder,
} from "discord.js";
import { ContainerFunctions } from "libs/Custom/Container";
import { deleteMessage, fetchLocale } from "libs/discord";
import { RulesPayload } from "libs/MessagePayloads/Rules";
import { Randomizer } from "libs/random";
import { User } from "models/User";

export class RulesPrecontidion extends AllFlowsPrecondition {
  public constructor(context: AllFlowsPrecondition.LoaderContext) {
    super(context, {
      name: "RulesOnly",
      position: 15, //before cooldown
    });
  }

  public override async messageRun(message: Message, command: MessageCommand) {
    if (command.options.rulesDisabled) return this.ok();
    return this.checkRules(message.author.id, message);
  }

  public override async chatInputRun(
    interaction: CommandInteraction,
    command: ChatInputCommand,
  ) {
    if (command.options.rulesDisabled) return this.ok();

    return this.checkRules(interaction.user.id, interaction);
  }

  public override async contextMenuRun(
    interaction: ContextMenuCommandInteraction,
    command: ContextMenuCommand,
  ) {
    if (command.options.rulesDisabled) return this.ok();

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
    const r = RulesPayload(locale, await User.totalAccepted);

    const response =
      source instanceof Message ? await source.reply(r) : await source.reply(r);

    try {
      const confirmation = await response.awaitMessageComponent({
        componentType: ComponentType.Button,
        time: 120_000,
        filter: (i) => i.user.id === userId,
      });

      if (confirmation.customId === "accept_rules") {
        const cont = new ContainerBuilder();
        ContainerFunctions.addTitle(cont, {
          displayName: { enabled: true, splitText: true },
          language: locale,
          text: "commands/rules:title",
        });
        ContainerFunctions.addText(cont, {
          language: locale,
          text: "commands/rules:accepted",
          translateOptions: {
            context: source instanceof Message ? "message" : "",
          },
        });
        await user.acceptRules();
        await confirmation.message
          .edit({
            components: [cont],
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
}

declare module "@sapphire/framework" {
  interface Preconditions {
    RulesOnly: never;
  }
  interface CommandOptions {
    rulesDisabled?: boolean;
  }
}
