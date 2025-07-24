import { Command, container } from "@sapphire/framework";
import { defaultPrefix } from "config/Prefix";
import {
  ContainerBuilder,
  MessageFlags,
  SeparatorSpacingSize,
} from "discord.js";
import { ContainerFunctions } from "libs/Custom/Container";
import { findCommand, getCommands, mapCommands } from "libs/Utils/Command";
type CategoryOptions = { currentCategory: string; commands: Command[] };
export async function HelpMenuPayload(
  language: string,
  extra: {
    category?: string | null;
    arguments?: string | null;
    prefix?: string | null;
    includeAdmin?: boolean;
  },
) {
  const prefix = extra.prefix ?? defaultPrefix;
  const t = container.i18n.getT(language);
  let globalFilter = (cmd: Command) =>
    extra.includeAdmin
      ? !cmd.options.preconditions?.includes("AdminOnly")
      : true;
  let category: CategoryOptions | undefined;
  let command: Command | undefined;

  if (extra.arguments) {
    command = await findCommand(extra.arguments, language, globalFilter);
  }
  if ((!command && extra.arguments) || extra.category) {
    const filteredCmds = await getCommands(
      extra.arguments ?? extra.category ?? undefined,
      globalFilter,
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
    displayName: { enabled: false, splitText: false },
    text: "commands/help:title",
  });
  if (command) {
  } else await generateCategoryPage(contain, language, category, prefix);

  return {
    flags: MessageFlags.IsComponentsV2 as const,
    components: [contain],
  };
}
export async function generateCommandPage(
  cont: ContainerBuilder,
  language: string,
  command: Command,
  prefix: string,
) {
  ContainerFunctions.addText(cont, {
    language,
    text: "defaults/container:texts.comingSoon",
  });
  return cont;
} //TODO DETAILED COMMAND INFO

export async function generateCategoryPage(
  cont: ContainerBuilder,
  language: string,
  category: CategoryOptions,
  prefix: string,
) {
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
    text: "defaults/commands:" + currentCategory,
    emoji: container.getEmoji(emoji) ? emoji : "dot",
    displayName: { enabled: false, splitText: false },
  });
  const filteredCommands = await Promise.all(
    await mapCommands(category?.commands ?? [], language),
  );
  cont.addTextDisplayComponents((td) =>
    td.setContent(
      `${filteredCommands.map((c) => "> " + t("defaults/commands:list", { prefix, commandId: c.id?.values().find((x) => x), commandName: c.name, commandDescription: c.description, context: c.id?.size ? "slash" : "" })).join("\n")}`,
    ),
  );
  return cont;
}
