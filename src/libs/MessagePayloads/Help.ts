import { Command, container } from "@sapphire/framework";
import { defaultLng } from "config/LanguageConfig";
import { defaultPrefix } from "config/Prefix";
import {
  ActionRowBuilder,
  ContainerBuilder,
  MessageFlags,
  SeparatorSpacingSize,
  StringSelectMenuBuilder,
} from "discord.js";
import { ContainerFunctions } from "libs/Custom/Container";
import {
  findCommand,
  getCommandAliases,
  getCommandCategories,
  getCommands,
  mapCommands,
  translateCommand,
} from "libs/Utils/Command";
type CategoryOptions = { currentCategory: string; commands: Command[] };
export async function HelpMenuPayload(
  language: string,
  extra: {
    category?: string | null;
    arguments?: string | null;
    prefix?: string | null;
    includeAdmin?: boolean;
  },
  userid: string
) {
  const prefix = extra.prefix ?? defaultPrefix;
  const t = container.i18n.getT(language);
  let globalFilter = (cmd: Command) =>
    extra.includeAdmin
      ? !cmd.options.preconditions?.includes("AdminOnly") &&
        !cmd.options.fullCategory?.includes("admin")
      : true;
  let category: CategoryOptions | undefined;
  let command: Command | undefined;

  if (extra.arguments) {
    command = await findCommand(extra.arguments, language, globalFilter);
  }
  if ((!command && extra.arguments) || extra.category) {
    const filteredCmds = await getCommands(
      extra.arguments ?? extra.category ?? undefined,
      globalFilter
    );
    if (filteredCmds.length)
      category = {
        currentCategory: extra.arguments ?? extra.category ?? "",
        commands: filteredCmds,
      };
  }

  if (!category) {
    category = {
      currentCategory: "Recommended",
      commands: await getCommands("Recommended", globalFilter),
    };
  }
  const contain = new ContainerBuilder();
  ContainerFunctions.addTitle(contain, {
    language,
    displayName: { enabled: true, splitText: true },
    text: "commands/help:title",
  });
  if (command) await generateCommandPage(contain, language, command, prefix);
  else await generateCategoryPage(contain, language, category, prefix, userid);

  return {
    flags: MessageFlags.IsComponentsV2 as const,
    components: [contain],
  };
}

export async function generateCommandPage(
  cont: ContainerBuilder,
  language: string,
  command: Command,
  prefix: string
) {
  cont.addSeparatorComponents((s) => s.setSpacing(SeparatorSpacingSize.Large));
  const translatedCommand = await translateCommand(command, language);

  const t = container.i18n.getT(language);
  const defT = language !== defaultLng ? container.i18n.getT(defaultLng) : null;
  const aliases = command.messageRun
    ? Array.from(getCommandAliases(command, t, defT))
    : [];
  ContainerFunctions.addTexts(cont, {
    language,
    text: "defaults/commands:commandUsage",
  });
  cont.addSeparatorComponents((s) => s);

  ContainerFunctions.addTexts(cont, {
    language,
    text: "defaults/commands:commandArgs",
    translateOptions: {
      cmdName: translatedCommand.name,
      cmdDesc: translatedCommand.description,
      cmdId: translatedCommand.id?.values().find((x) => x),
      prefix,
      context: translatedCommand.id?.size ? "slash" : "",
    },
    multi: true,
  });

  if (aliases.length) {
    ContainerFunctions.addText(cont, {
      language,
      text: "defaults/commands:commandAliasesText",
      translateOptions: {
        cmdAliases: `\`${aliases.join("`, `")}\``,
      },
    });
  }
  cont.addSeparatorComponents((s) => s);

  return cont;
} //TODO DETAILED COMMAND INFO

export async function generateCategoryPage(
  cont: ContainerBuilder,
  language: string,
  category: CategoryOptions,
  prefix: string,
  userid: string
) {
  cont.addSeparatorComponents((s) => s.setDivider(false));

  const t = container.i18n.getT(language);

  const currentCategory = category.currentCategory;
  ContainerFunctions.addTexts(cont, {
    text: "commands/help:categoryDescription",
    language,
    dot: true,
    translateOptions: {
      prefix,
    },
  });
  cont.addSeparatorComponents((s) => s.setSpacing(SeparatorSpacingSize.Large));
  const emoji = `menus.help.categories.${currentCategory.toLowerCase()}`;
  ContainerFunctions.addTitle(cont, {
    language,
    text: "defaults/commands:text",
    emoji: container.getEmoji(emoji) ? emoji : "dot",
    displayName: { enabled: false, splitText: false },
    translateOptions: {
      type: t("defaults/commands:" + currentCategory),
    },
  });
  const filteredCommands = await Promise.all(
    await mapCommands(category?.commands ?? [], language)
  );
  if (filteredCommands.length)
    cont.addTextDisplayComponents((td) =>
      td.setContent(
        `${filteredCommands.map((c) => "> " + t("defaults/commands:list", { prefix, commandId: c.id?.values().find((x) => x), commandName: c.name, commandDescription: c.description, context: c.id?.size ? "slash" : "" })).join("\n")}`
      )
    );
  cont.addSeparatorComponents((c) => c);
  await generateCategoriesMenu(cont, language, category, userid);

  return cont;
}
export async function generateCategoriesMenu(
  cont: ContainerBuilder,
  language: string,
  category: CategoryOptions,
  userid: string
) {
  const t = container.i18n.getT(language);
  const categories = await getCommandCategories(
    (command) => command !== "admin"
  );
  const row = new ActionRowBuilder<StringSelectMenuBuilder>();
  const str = new StringSelectMenuBuilder();

  str.setCustomId(`panel.help.${userid}`);
  str.addOptions(
    categories.map((ccategory) => {
      const emoji = container.getEmojiId(`menus.help.categories.${ccategory}`);
      return {
        label: t("defaults/commands:text", {
          type: t("defaults/commands:" + ccategory),
        }),
        value: ccategory,
        emoji: emoji ? { id: emoji ?? "" } : undefined,
        default: category.currentCategory == ccategory,
      };
    })
  );
  row.addComponents(str);
  cont.addActionRowComponents(row);
  return cont;
}
