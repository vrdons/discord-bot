import { ButtonBuilder } from "@discordjs/builders";
import { container } from "@sapphire/framework";
import { ButtonStyle, ContainerBuilder, MessageFlags } from "discord.js";
import { ContainerFunctions } from "libs/Custom/Container";

export function RulesPayload(
  lang: string,
  totalAccept: number,
  acceptedRules: boolean = false,
) {
  const t = container.i18n.getT(lang);
  const comp = new ContainerBuilder();
  ContainerFunctions.addTitle(comp, {
    language: lang,
    text: "commands/rules:title",
    displayName: { enabled: true, splitText: true },
  });
  comp.addSeparatorComponents((sep) => sep);
  ContainerFunctions.addTexts(comp, {
    multi: false,
    language: lang,
    dot: true,
    text: "commands/rules:botDescription",
  });
  comp.addSeparatorComponents((sep) => sep);
  ContainerFunctions.addTexts(comp, {
    multi: false,
    language: lang,
    dot: false,
    text: "commands/rules:extraInformation",
  });
  comp.addSeparatorComponents((sep) => sep);

  comp.addActionRowComponents((act) =>
    act.addComponents(
      new ButtonBuilder()
        .setCustomId("accept_rules")
        .setLabel(
          t("commands/rules:buttons.accept" + (acceptedRules ? "ed" : "")),
        )
        .setStyle(ButtonStyle.Primary)
        .setDisabled(acceptedRules),
    ),
  );
  ContainerFunctions.addFooter(comp, {
    language: lang,
    text: "commands/rules:footer",
    translateOptions: { totalAccept },
  });

  return { flags: MessageFlags.IsComponentsV2 as const, components: [comp] };
}
