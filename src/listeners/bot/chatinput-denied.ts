import {
  Events,
  Identifiers,
  Listener,
  type ChatInputCommandDeniedPayload,
  type UserError,
} from "@sapphire/framework";
import { deleteMessage, fetchLocale } from "libs/discord";
import { CooldownContext } from "typing";

export class ChatInputCommandDenied extends Listener<
  typeof Events.ChatInputCommandDenied
> {
  public constructor(
    context: Listener.LoaderContext,
    options: Listener.Options,
  ) {
    super(context, {
      ...options,
      once: true,
      event: Events.ChatInputCommandDenied,
    });
  }

  public async run(
    error: UserError,
    { interaction }: ChatInputCommandDeniedPayload,
  ) {
    if (error.identifier === Identifiers.PreconditionCooldown) {
      const context = error.context as CooldownContext;
      const remaining = context.remaining as number;
      const t = this.container.i18n.getT(await fetchLocale(interaction));
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
