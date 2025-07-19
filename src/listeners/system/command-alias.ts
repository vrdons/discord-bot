import type { Message } from "discord.js";
import {
  Command,
  Events,
  Listener,
  UnknownMessageCommandPayload,
} from "@sapphire/framework";
import { defaultLng } from "config/LanguageConfig";
import { ensureArray } from "libs/utils";

type MessageCommand = Command & Required<Pick<Command, "messageRun">>;

export class CoreListener extends Listener<
  typeof Events.UnknownMessageCommand
> {
  public constructor(context: Listener.LoaderContext) {
    super(context, { event: Events.UnknownMessageCommand });
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
    const command = await this.findCommand(commandName.toLowerCase(), lng);

    if (!command) return;

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

  private async findCommand(
    commandName: string,
    lng: string,
  ): Promise<Command | undefined> {
    const t = this.container.i18n.getT(lng);
    const defT =
      lng !== defaultLng ? this.container.i18n.getT(defaultLng) : null;

    for (const command of this.container.stores.get("commands").values()) {
      if (!command.name.startsWith("-")) continue;

      const aliases = this.getCommandAliases(command, t, defT);
      if (aliases.has(commandName)) {
        return command;
      }
    }

    return undefined;
  }

  private getCommandAliases(
    command: Command,
    t: Function,
    defT: Function | null,
  ): Set<string> {
    const baseKey = `commands/${command.name.slice(1)}:`;
    const aliases = new Set<string>();

    const primaryAliases = ensureArray(
      t(baseKey + "Aliases", {
        returnObjects: true,
        defaultValue: [],
      }),
    );
    primaryAliases.forEach((alias) => aliases.add(alias.toLowerCase()));
    aliases.add(t(baseKey + "Name").toLowerCase());

    if (defT) {
      aliases.add(defT(baseKey + "Name").toLowerCase());
      const defaultAliases = ensureArray(
        defT(baseKey + "Aliases", {
          returnObjects: true,
          defaultValue: [],
        }),
      );
      defaultAliases.forEach((alias) => aliases.add(alias.toLowerCase()));
    }

    return aliases;
  }
}
