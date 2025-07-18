import {
  ContextMenuCommandDeniedPayload,
  Events,
  Identifiers,
  Listener,
  type UserError,
} from "@sapphire/framework";
import { Interaction } from "discord.js";
import { deleteMessage, fetchLocale } from "libs/discord";
import { CooldownContext } from "typing";

export class MessageCommandDenied extends Listener<
  typeof Events.ContextMenuCommandDenied
> {
  public constructor(
    context: Listener.LoaderContext,
    options: Listener.Options,
  ) {
    super(context, {
      ...options,
      once: true,
      event: Events.ContextMenuCommandDenied,
    });
  }
  public async run(
    error: UserError,
    { interaction }: ContextMenuCommandDeniedPayload,
  ) {
    if (error.identifier === Identifiers.PreconditionCooldown) {
      const context = error.context as CooldownContext;
      const remaining = context.remaining as number;
      const t = this.container.i18n.getT(
        await fetchLocale(interaction as Interaction),
      );
      return interaction
        .reply(
          t("defaults/error:onCooldown", {
            time: Date.now() + remaining,
            context: remaining ? "time" : undefined,
          }),
        )
        .then((m) => deleteMessage(m, remaining));
    }
    return;
  }
}
