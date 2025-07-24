import {
  ApplicationCommandRegistries,
  Command,
  container,
} from "@sapphire/framework";
import { defaultLng } from "config/LanguageConfig";
import { ensureArray } from "./Other";
export async function getCommandId(command: Command) {
  const cmdName = command.applicationCommandRegistry.commandName;
  return ApplicationCommandRegistries.acquire(cmdName)
    .globalChatInputCommandIds;
}
export async function mapCommands(commands: Command[], locale: string) {
  const t = container.i18n.getT(locale);
  return commands.map(async (cmd) => {
    const id = await getCommandId(cmd);
    if (cmd.name.startsWith("-")) {
      const trName = cmd.name.slice(1);
      const name = t(`commands/${trName}:Name`);
      const description = t(`commands/${trName}:Description`);
      return { name, description, id };
    } else {
      return { name: cmd.name, description: cmd.description, id };
    }
  });
}
export async function getCommands(
  category: string | undefined,
  filter: (cmd: Command) => boolean = () => true,
) {
  const command = container.stores.get("commands").values().filter(filter);
  return category
    ? command
        .filter((cmd) =>
          cmd.fullCategory
            .map((x) => x.toLowerCase())
            .includes(category.toLowerCase()),
        )
        .toArray()
    : command.toArray();
}
export async function findCommand(
  commandName: string,
  lng: string,
  filter: (cmd: Command) => boolean = () => true,
): Promise<Command | undefined> {
  const t = container.i18n.getT(lng);
  const defT = lng !== defaultLng ? container.i18n.getT(defaultLng) : null;
  const commands = container.stores.get("commands").values();
  for (const command of commands.filter(filter)) {
    if (!command.name.startsWith("-")) continue;

    const aliases = getCommandAliases(command, t, defT);
    if (aliases.has(commandName)) {
      return command;
    }
  }

  return undefined;
}

export function getCommandAliases(
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
