import type { Message } from "discord.js";
import {
  Command,
  Events,
  Listener,
  UnknownMessageCommandPayload,
} from "@sapphire/framework";
import { defaultLng } from "config/LanguageConfig";
import { findCommand } from "libs/Utils/Command";
import { ExtraEvents } from "typing";

type MessageCommand = Command & Required<Pick<Command, "messageRun">>;

export class CommandAlias extends Listener<
  typeof ExtraEvents.FindCommandAliases
> {
  public constructor(context: Listener.LoaderContext) {
    super(context, { event: ExtraEvents.FindCommandAliases });
  }

  public async run(payload: UnknownMessageCommandPayload) {
    const prefix = payload.prefix;
    const commandPrefix = payload.commandPrefix;
    const message = payload.message;
    const { client } = this.container;
    const prefixLess = message.content.slice(commandPrefix.length).trim();
    const spaceIndex = prefixLess.indexOf(" ");
    const commandName =
      spaceIndex === -1 ? prefixLess : prefixLess.slice(0, spaceIndex);

    const lng = await this.resolveLanguage(message);
    const command = await findCommand(commandName.toLowerCase(), lng);

    if (!command) {
      client.emit(Events.UnknownMessageCommand, {
        message,
        prefix,
        commandName,
        commandPrefix,
      });
      return;
    }

    if (!command.messageRun) {
      client.emit(Events.CommandDoesNotHaveMessageCommandHandler, {
        message,
        prefix,
        commandPrefix,
        command,
      });
      return;
    }

    const parameters =
      spaceIndex === -1 ? "" : prefixLess.substring(spaceIndex + 1).trim();

    client.emit(Events.PreMessageCommandRun, {
      message,
      command: command as MessageCommand,
      parameters,
      context: { commandName, commandPrefix, prefix, note: "fromAlias" },
    });
  }

  private async resolveLanguage(message: Message): Promise<string> {
    const lng = await this.container.i18n.fetchLanguage({
      user: message.author,
      guild: message.guild,
      channel: message.channel,
    });
    return lng || defaultLng;
  }
}
