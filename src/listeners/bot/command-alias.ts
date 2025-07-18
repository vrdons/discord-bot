import type { Message } from "discord.js";
import { Command, Events, Listener } from "@sapphire/framework";
import { defaultLng } from "config/LanguageConfig";
import { ensureArray } from "libs/utils";

type MessageCommand = Command & Required<Pick<Command, "messageRun">>;

export class CoreListener extends Listener<typeof Events.PrefixedMessage> {
  private readonly commandCache = new Map<string, Set<string>>();
  private lastCacheUpdate = 0;
  private readonly CACHE_TTL = 60000;

  public constructor(context: Listener.LoaderContext) {
    super(context, { event: Events.PrefixedMessage });
  }

  public async run(message: Message, prefix: string | RegExp) {
    const { client } = this.container;
    const commandPrefix =
      typeof prefix === "string" ? prefix : prefix.exec(message.content)![0];
    const prefixLess = message.content.slice(commandPrefix.length).trim();
    const spaceIndex = prefixLess.indexOf(" ");
    const commandName =
      spaceIndex === -1 ? prefixLess : prefixLess.slice(0, spaceIndex);

    if (!commandName) {
      client.emit(Events.UnknownMessageCommandName, {
        message,
        prefix,
        commandPrefix,
      });
      return;
    }

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
      context: { commandName, commandPrefix, prefix },
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
    if (Date.now() - this.lastCacheUpdate > this.CACHE_TTL) {
      this.commandCache.clear();
      this.lastCacheUpdate = Date.now();
    }

    const cacheKey = `${lng}:${commandName}`;
    const cachedCommand = this.commandCache.get(cacheKey);

    if (cachedCommand) {
      return this.container.stores.get("commands").get([...cachedCommand][0]);
    }

    const t = this.container.i18n.getT(lng);
    const defT =
      lng !== defaultLng ? this.container.i18n.getT(defaultLng) : null;

    for (const command of this.container.stores.get("commands").values()) {
      if (!command.name.startsWith("-")) continue;

      const aliases = this.getCommandAliases(command, t, defT);

      if (aliases.has(commandName)) {
        if (!this.commandCache.has(cacheKey)) {
          this.commandCache.set(cacheKey, new Set());
        }
        this.commandCache.get(cacheKey)!.add(command.name);
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
